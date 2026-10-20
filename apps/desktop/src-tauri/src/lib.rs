use ieee754_core::{convert, ConversionResult, Precision};

#[tauri::command]
fn convert_decimal(input: String, precision: String) -> Result<ConversionResult, String> {
    let p = match precision.to_lowercase().as_str() {
        "double" | "64" | "binary64" => Precision::Double,
        _ => Precision::Single,
    };
    convert(&input, p)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![convert_decimal])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
