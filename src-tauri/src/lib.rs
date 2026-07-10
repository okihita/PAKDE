use std::fs;
use std::sync::Mutex;

use tauri::Emitter;
use tauri::Manager;

/// Path of a `.pkd` file the OS asked us to open (double-click / "Open With").
/// Stored so the frontend can pick it up on first mount, since the webview may
/// not be listening yet when the app is launched by opening a file.
struct PendingBackup(Mutex<Option<String>>);

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_sql::Builder::default().build())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .manage(PendingBackup(Default::default()))
        .build(tauri::generate_context!())
        .expect("error while building tauri application")
        .run(|app, event| {
            if let tauri::RunEvent::Opened { urls } = event {
                if let Some(url) = urls.first() {
                    if let Ok(path) = url.to_file_path() {
                        if let Ok(data_dir) = app.path().app_data_dir() {
                            let incoming = data_dir.join("_incoming");
                            let _ = fs::create_dir_all(&incoming);
                            // Copy into app data so the frontend can read it within the
                            // fs plugin scope (the original path may be anywhere on disk).
                            if let Some(name) = path.file_name() {
                                let dest = incoming.join(name);
                                if fs::copy(&path, &dest).is_ok() {
                                    let dest_str = dest.to_string_lossy().to_string();
                                    if let Some(state) = app.try_state::<PendingBackup>() {
                                        *state.0.lock().unwrap() = Some(dest_str.clone());
                                    }
                                    // Marker for the initial-launch case (webview not ready).
                                    let _ = fs::write(incoming.join("_pending.txt"), &dest_str);
                                    let _ = app.emit("pakde-backup-open", dest_str);
                                }
                            }
                        }
                    }
                }
            }
        });
}
