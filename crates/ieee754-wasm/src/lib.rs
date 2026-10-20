use wasm_bindgen::prelude::*;
use ieee754_core::{convert, Precision};

#[wasm_bindgen]
pub fn convert_ieee754(input: &str, precision_str: &str) -> Result<JsValue, JsValue> {
    let precision = match precision_str.to_lowercase().as_str() {
        "double" | "64" | "binary64" => Precision::Double,
        _ => Precision::Single,
    };

    match convert(input, precision) {
        Ok(result) => {
            serde_wasm_bindgen::to_value(&result)
                .map_err(|e| JsValue::from_str(&format!("Serialization error: {}", e)))
        }
        Err(err) => Err(JsValue::from_str(&err)),
    }
}
