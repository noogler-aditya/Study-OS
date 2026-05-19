use rusqlite::{params, Connection};
use serde_json::Value;
use std::fs;
use std::path::PathBuf;
use std::sync::Mutex;
use tauri::{Manager, State};

struct AppDb {
    conn: Mutex<Connection>,
}

fn app_dir(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    let dir = app
        .path()
        .app_data_dir()
        .map_err(|error| format!("Unable to find app data directory: {error}"))?;
    fs::create_dir_all(&dir).map_err(|error| format!("Unable to create app data directory: {error}"))?;
    Ok(dir)
}

fn open_db(app: &tauri::AppHandle) -> Result<Connection, String> {
    let db_path = app_dir(app)?.join("study-os.sqlite3");
    let conn = Connection::open(db_path).map_err(|error| format!("Unable to open SQLite database: {error}"))?;
    conn.execute_batch(include_str!("../migrations/001_initial.sql"))
        .map_err(|error| format!("Unable to run migrations: {error}"))?;
    Ok(conn)
}

#[tauri::command]
fn load_study_os_data(db: State<'_, AppDb>) -> Result<Option<Value>, String> {
    let conn = db.conn.lock().map_err(|_| "Database lock poisoned".to_string())?;
    let mut stmt = conn
        .prepare("SELECT value FROM app_state WHERE key = 'study_os_data'")
        .map_err(|error| format!("Unable to prepare load query: {error}"))?;
    let result: Result<String, _> = stmt.query_row([], |row| row.get(0));
    match result {
        Ok(json) => serde_json::from_str(&json).map(Some).map_err(|error| format!("Unable to parse app state: {error}")),
        Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
        Err(error) => Err(format!("Unable to load app state: {error}")),
    }
}

#[tauri::command]
fn save_study_os_data(data: Value, db: State<'_, AppDb>) -> Result<(), String> {
    let conn = db.conn.lock().map_err(|_| "Database lock poisoned".to_string())?;
    conn.execute(
        "INSERT INTO app_state (key, value, updated_at) VALUES ('study_os_data', ?1, CURRENT_TIMESTAMP)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP",
        params![data.to_string()],
    )
    .map_err(|error| format!("Unable to save app state: {error}"))?;
    Ok(())
}

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            let conn = open_db(&app.handle())?;
            app.manage(AppDb { conn: Mutex::new(conn) });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![load_study_os_data, save_study_os_data])
        .run(tauri::generate_context!())
        .expect("error while running Study OS");
}
