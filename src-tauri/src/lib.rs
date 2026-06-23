#[derive(serde::Serialize)]
struct WriteFileResult {
    path: String,
    content: String,
}

#[tauri::command]
fn read_file(path: String) -> Result<String, String> {
    std::fs::read_to_string(path).map_err(|error| error.to_string())
}

fn display_path(path: &std::path::Path) -> String {
    let path = path.to_string_lossy();
    path.strip_prefix(r"\\?\UNC\")
        .map(|path| format!(r"\\{path}"))
        .or_else(|| path.strip_prefix(r"\\?\").map(ToOwned::to_owned))
        .unwrap_or_else(|| path.into_owned())
}

#[tauri::command]
fn rename_file(path: String, new_name: String) -> Result<String, String> {
    let new_name = new_name.trim();
    if new_name.is_empty()
        || new_name.ends_with(['.', ' '])
        || new_name.chars().any(|character| {
            matches!(
                character,
                '<' | '>' | ':' | '"' | '/' | '\\' | '|' | '?' | '*'
            ) || character.is_control()
        })
    {
        return Err("The file name is invalid.".to_string());
    }

    let source = std::path::Path::new(&path);
    if !std::fs::metadata(source)
        .map_err(|error| error.to_string())?
        .is_file()
    {
        return Err("The selected path is not a regular file.".to_string());
    }
    if std::path::Path::new(new_name)
        .file_name()
        .and_then(|name| name.to_str())
        != Some(new_name)
    {
        return Err("The file name must not contain a directory path.".to_string());
    }

    let parent = source
        .parent()
        .ok_or_else(|| "The selected file has no parent directory.".to_string())?;
    let target = parent.join(new_name);
    if target.exists() {
        let source_canonical = std::fs::canonicalize(source).map_err(|error| error.to_string())?;
        let target_canonical = std::fs::canonicalize(&target).map_err(|error| error.to_string())?;
        if source_canonical != target_canonical {
            return Err("A file with that name already exists.".to_string());
        }
    }

    std::fs::rename(source, &target).map_err(|error| error.to_string())?;
    let confirmed = std::fs::canonicalize(&target).map_err(|error| error.to_string())?;
    Ok(display_path(&confirmed))
}

#[tauri::command]
fn delete_file(path: String) -> Result<(), String> {
    let metadata = std::fs::metadata(&path).map_err(|error| error.to_string())?;
    if !metadata.is_file() {
        return Err("The selected path is not a regular file.".to_string());
    }
    std::fs::remove_file(path).map_err(|error| error.to_string())
}

#[tauri::command]
fn write_file(path: String, content: String) -> Result<WriteFileResult, String> {
    use std::io::Write;

    let mut file = std::fs::OpenOptions::new()
        .create(true)
        .write(true)
        .truncate(true)
        .open(&path)
        .map_err(|error| error.to_string())?;
    file.write_all(content.as_bytes())
        .map_err(|error| error.to_string())?;
    file.sync_all().map_err(|error| error.to_string())?;
    drop(file);

    let saved_content = std::fs::read_to_string(&path).map_err(|error| error.to_string())?;
    if saved_content != content {
        return Err("保存后读回的文件内容不一致".to_string());
    }

    let canonical_path = std::fs::canonicalize(&path).map_err(|error| error.to_string())?;
    let confirmed_path = display_path(&canonical_path);

    Ok(WriteFileResult {
        path: confirmed_path,
        content: saved_content,
    })
}

fn escape_pdf_text(text: &str) -> String {
    text.chars()
        .map(|character| match character {
            '\\' => "\\\\".to_string(),
            '(' => "\\(".to_string(),
            ')' => "\\)".to_string(),
            '\t' => "    ".to_string(),
            character if character.is_control() => " ".to_string(),
            character => character.to_string(),
        })
        .collect::<String>()
}

fn wrap_pdf_line(line: &str, max_chars: usize) -> Vec<String> {
    let mut wrapped = Vec::new();
    let mut current = String::new();
    for character in line.chars() {
        current.push(character);
        if current.chars().count() >= max_chars {
            wrapped.push(current);
            current = String::new();
        }
    }
    if !current.is_empty() || wrapped.is_empty() {
        wrapped.push(current);
    }
    wrapped
}

fn build_plain_text_pdf(title: &str, content: &str) -> Vec<u8> {
    const LINES_PER_PAGE: usize = 42;
    const MAX_LINE_CHARS: usize = 78;

    let mut lines = vec![title.trim().to_string(), String::new()];
    for line in content.lines() {
        lines.extend(wrap_pdf_line(line, MAX_LINE_CHARS));
    }
    if lines.len() <= 2 {
        lines.push(String::new());
    }

    let pages = lines
        .chunks(LINES_PER_PAGE)
        .map(|chunk| chunk.to_vec())
        .collect::<Vec<_>>();
    let font_object_id = 3 + pages.len() * 2;
    let mut objects: Vec<Vec<u8>> = Vec::new();
    let kids = (0..pages.len())
        .map(|index| format!("{} 0 R", 3 + index * 2))
        .collect::<Vec<_>>()
        .join(" ");

    objects.push(b"<< /Type /Catalog /Pages 2 0 R >>".to_vec());
    objects.push(
        format!("<< /Type /Pages /Kids [{kids}] /Count {} >>", pages.len()).into_bytes(),
    );

    for (index, page_lines) in pages.iter().enumerate() {
        let page_object_id = 3 + index * 2;
        let content_object_id = page_object_id + 1;
        objects.push(
            format!(
                "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 {font_object_id} 0 R >> >> /Contents {content_object_id} 0 R >>"
            )
            .into_bytes(),
        );

        let mut stream = String::from("BT\n/F1 11 Tf\n50 800 Td\n");
        for (line_index, line) in page_lines.iter().enumerate() {
            if line_index > 0 {
                stream.push_str("0 -17 Td\n");
            }
            stream.push_str(&format!("({}) Tj\n", escape_pdf_text(line)));
        }
        stream.push_str("ET\n");
        objects.push(
            format!(
                "<< /Length {} >>\nstream\n{}endstream",
                stream.as_bytes().len(),
                stream
            )
            .into_bytes(),
        );
    }

    objects.push(b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>".to_vec());

    let mut pdf = b"%PDF-1.4\n%\xE2\xE3\xCF\xD3\n".to_vec();
    let mut offsets = vec![0usize];
    for (index, object) in objects.iter().enumerate() {
        offsets.push(pdf.len());
        pdf.extend_from_slice(format!("{} 0 obj\n", index + 1).as_bytes());
        pdf.extend_from_slice(object);
        pdf.extend_from_slice(b"\nendobj\n");
    }
    let xref_offset = pdf.len();
    pdf.extend_from_slice(format!("xref\n0 {}\n", objects.len() + 1).as_bytes());
    pdf.extend_from_slice(b"0000000000 65535 f \n");
    for offset in offsets.iter().skip(1) {
        pdf.extend_from_slice(format!("{offset:010} 00000 n \n").as_bytes());
    }
    pdf.extend_from_slice(
        format!(
            "trailer\n<< /Size {} /Root 1 0 R >>\nstartxref\n{}\n%%EOF\n",
            objects.len() + 1,
            xref_offset
        )
        .as_bytes(),
    );
    pdf
}

#[tauri::command]
fn export_markdown_pdf(path: String, title: String, content: String) -> Result<(), String> {
    let title = if title.trim().is_empty() {
        "EasyMarkdown"
    } else {
        title.trim()
    };
    let pdf = build_plain_text_pdf(title, &content);
    std::fs::write(path, pdf).map_err(|error| error.to_string())
}

#[tauri::command]
fn open_devtools(webview: tauri::WebviewWindow) {
    webview.open_devtools();
}

#[cfg(target_os = "windows")]
#[tauri::command]
fn open_emoji_picker() -> Result<(), String> {
    use std::mem::size_of;
    use windows::Win32::UI::Input::KeyboardAndMouse::{
        SendInput, INPUT, INPUT_0, INPUT_KEYBOARD, KEYBDINPUT, KEYEVENTF_KEYUP, VK_LWIN,
        VK_OEM_PERIOD,
    };

    let key = |virtual_key, flags| INPUT {
        r#type: INPUT_KEYBOARD,
        Anonymous: INPUT_0 {
            ki: KEYBDINPUT {
                wVk: virtual_key,
                wScan: 0,
                dwFlags: flags,
                time: 0,
                dwExtraInfo: 0,
            },
        },
    };
    let inputs = [
        key(VK_LWIN, Default::default()),
        key(VK_OEM_PERIOD, Default::default()),
        key(VK_OEM_PERIOD, KEYEVENTF_KEYUP),
        key(VK_LWIN, KEYEVENTF_KEYUP),
    ];
    let sent = unsafe { SendInput(&inputs, size_of::<INPUT>() as i32) };
    if sent != inputs.len() as u32 {
        return Err("Could not open the Windows emoji picker.".to_string());
    }
    Ok(())
}

#[cfg(not(target_os = "windows"))]
#[tauri::command]
fn open_emoji_picker() -> Result<(), String> {
    Err("The emoji picker is only available on Windows.".to_string())
}

#[cfg(target_os = "windows")]
#[tauri::command]
fn take_installer_language() -> Option<String> {
    use winreg::enums::{HKEY_CURRENT_USER, KEY_READ, KEY_WRITE};
    use winreg::RegKey;

    let current_user = RegKey::predef(HKEY_CURRENT_USER);
    let key = current_user
        .open_subkey_with_flags("Software\\EasyMarkdown", KEY_READ | KEY_WRITE)
        .ok()?;
    let language: String = key.get_value("InstallerLanguage").ok()?;
    let _ = key.delete_value("InstallerLanguage");

    match language.as_str() {
        "zh-CN" | "fr" | "en" => Some(language),
        _ => None,
    }
}

#[cfg(not(target_os = "windows"))]
#[tauri::command]
fn take_installer_language() -> Option<String> {
    None
}

#[cfg(target_os = "windows")]
#[tauri::command]
async fn print_to_pdf(webview: tauri::WebviewWindow, path: String) -> Result<(), String> {
    use std::iter::once;
    use std::os::windows::ffi::OsStrExt;
    use std::sync::mpsc;
    use webview2_com::{
        Microsoft::Web::WebView2::Win32::{ICoreWebView2Environment6, ICoreWebView2_7},
        PrintToPdfCompletedHandler,
    };
    use windows::core::{Interface, PCWSTR};

    let (sender, receiver) = mpsc::channel::<Result<(), String>>();
    webview
        .with_webview(move |platform_webview| {
            let callback_sender = sender.clone();
            let result = (|| -> Result<(), String> {
                unsafe {
                    let core_webview = platform_webview
                        .controller()
                        .CoreWebView2()
                        .map_err(|error| error.to_string())?
                        .cast::<ICoreWebView2_7>()
                        .map_err(|error| error.to_string())?;
                    let environment = platform_webview
                        .environment()
                        .cast::<ICoreWebView2Environment6>()
                        .map_err(|error| error.to_string())?;
                    let settings = environment
                        .CreatePrintSettings()
                        .map_err(|error| error.to_string())?;

                    settings
                        .SetShouldPrintBackgrounds(true)
                        .map_err(|error| error.to_string())?;
                    settings
                        .SetShouldPrintHeaderAndFooter(false)
                        .map_err(|error| error.to_string())?;
                    settings
                        .SetMarginTop(0.0)
                        .map_err(|error| error.to_string())?;
                    settings
                        .SetMarginBottom(0.0)
                        .map_err(|error| error.to_string())?;
                    settings
                        .SetMarginLeft(0.0)
                        .map_err(|error| error.to_string())?;
                    settings
                        .SetMarginRight(0.0)
                        .map_err(|error| error.to_string())?;

                    let callback =
                        PrintToPdfCompletedHandler::create(Box::new(move |error, succeeded| {
                            let result = error.map_err(|error| error.to_string()).and_then(|_| {
                                succeeded
                                    .then_some(())
                                    .ok_or_else(|| "WebView2 未能生成 PDF".to_string())
                            });
                            let _ = callback_sender.send(result);
                            Ok(())
                        }));
                    let wide_path = std::ffi::OsStr::new(&path)
                        .encode_wide()
                        .chain(once(0))
                        .collect::<Vec<_>>();

                    core_webview
                        .PrintToPdf(PCWSTR(wide_path.as_ptr()), &settings, &callback)
                        .map_err(|error| error.to_string())?;
                }
                Ok(())
            })();

            if let Err(error) = result {
                let _ = sender.send(Err(error));
            }
        })
        .map_err(|error| error.to_string())?;

    tauri::async_runtime::spawn_blocking(move || {
        receiver
            .recv()
            .map_err(|error| format!("等待 PDF 导出结果失败：{error}"))?
    })
    .await
    .map_err(|error| error.to_string())?
}

#[cfg(not(target_os = "windows"))]
#[tauri::command]
fn print_to_pdf(_webview: tauri::WebviewWindow, _path: String) -> Result<(), String> {
    Err("当前平台暂不支持直接导出 PDF".to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            read_file,
            rename_file,
            delete_file,
            write_file,
            export_markdown_pdf,
            take_installer_language,
            print_to_pdf,
            open_devtools,
            open_emoji_picker
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[cfg(test)]
mod tests {
    use super::{delete_file, export_markdown_pdf, write_file};

    #[test]
    fn write_file_overwrites_existing_content() {
        let path = std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
            .join("target")
            .join("save-write-test.md");
        std::fs::create_dir_all(path.parent().expect("test path has a parent"))
            .expect("create test output directory");
        std::fs::write(&path, "old content").expect("seed test file");

        let result = write_file(
            path.to_string_lossy().into_owned(),
            "new modified content".to_string(),
        )
        .expect("write modified content");

        assert_eq!(std::path::Path::new(&result.path), path,);
        assert_eq!(result.content, "new modified content");
        assert_eq!(
            std::fs::read_to_string(path).expect("read saved content"),
            "new modified content",
        );
    }

    #[test]
    fn delete_file_removes_one_regular_file() {
        let path = std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
            .join("target")
            .join("delete-file-test.md");
        std::fs::create_dir_all(path.parent().expect("test path has a parent"))
            .expect("create test output directory");
        std::fs::write(&path, "temporary").expect("seed test file");

        delete_file(path.to_string_lossy().into_owned()).expect("delete test file");

        assert!(!path.exists());
    }

    #[test]
    fn delete_file_rejects_directories() {
        let path = std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
            .join("target")
            .join("delete-directory-test");
        std::fs::create_dir_all(&path).expect("create test directory");

        let error = delete_file(path.to_string_lossy().into_owned()).expect_err("reject directory");

        assert!(error.contains("regular file"));
        assert!(path.is_dir());
    }

    #[test]
    fn export_markdown_pdf_writes_pdf_header() {
        let path = std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
            .join("target")
            .join("export-markdown-test.pdf");

        export_markdown_pdf(
            path.to_string_lossy().into_owned(),
            "Test.md".to_string(),
            "# Title\n\nBody".to_string(),
        )
        .expect("export pdf");

        let bytes = std::fs::read(&path).expect("read exported pdf");
        assert!(bytes.starts_with(b"%PDF-1.4"));
        assert!(bytes.ends_with(b"%%EOF\n"));
    }
}
