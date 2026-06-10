#[tauri::command]
fn read_file(path: String) -> Result<String, String> {
    std::fs::read_to_string(path).map_err(|error| error.to_string())
}

#[tauri::command]
fn write_file(path: String, content: String) -> Result<(), String> {
    std::fs::write(path, content).map_err(|error| error.to_string())
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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            read_file,
            write_file,
            take_installer_language
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
