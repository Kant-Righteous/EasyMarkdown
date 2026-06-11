#[derive(serde::Serialize)]
struct WriteFileResult {
    path: String,
    content: String,
}

#[tauri::command]
fn read_file(path: String) -> Result<String, String> {
    std::fs::read_to_string(path).map_err(|error| error.to_string())
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
    let confirmed_path = canonical_path.to_string_lossy();
    let confirmed_path = confirmed_path
        .strip_prefix(r"\\?\UNC\")
        .map(|path| format!(r"\\{path}"))
        .or_else(|| {
            confirmed_path
                .strip_prefix(r"\\?\")
                .map(ToOwned::to_owned)
        })
        .unwrap_or_else(|| confirmed_path.into_owned());

    Ok(WriteFileResult {
        path: confirmed_path,
        content: saved_content,
    })
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
        Microsoft::Web::WebView2::Win32::{
            ICoreWebView2Environment6, ICoreWebView2_7,
        },
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

                    let callback = PrintToPdfCompletedHandler::create(Box::new(
                        move |error, succeeded| {
                            let result = error
                                .map_err(|error| error.to_string())
                                .and_then(|_| {
                                    succeeded
                                        .then_some(())
                                        .ok_or_else(|| "WebView2 未能生成 PDF".to_string())
                                });
                            let _ = callback_sender.send(result);
                            Ok(())
                        },
                    ));
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
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            read_file,
            write_file,
            take_installer_language,
            print_to_pdf
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[cfg(test)]
mod tests {
    use super::write_file;

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

        assert_eq!(
            std::path::Path::new(&result.path),
            path,
        );
        assert_eq!(result.content, "new modified content");
        assert_eq!(
            std::fs::read_to_string(path).expect("read saved content"),
            "new modified content",
        );
    }
}
