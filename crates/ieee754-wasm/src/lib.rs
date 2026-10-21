use wasm_bindgen::prelude::*;
use serde::Serialize;
use ieee754_core::{convert, Precision};

#[wasm_bindgen]
pub fn convert_ieee754(input: &str, precision_str: &str) -> Result<JsValue, JsValue> {
    let precision = match precision_str.to_lowercase().as_str() {
        "double" | "64" | "binary64" => Precision::Double,
        _ => Precision::Single,
    };

    match convert(input, precision) {
        Ok(result) => {
            let serializer = serde_wasm_bindgen::Serializer::new()
                .serialize_large_number_types_as_bigints(true);
            result
                .serialize(&serializer)
                .map_err(|e| JsValue::from_str(&format!("Serialization error: {}", e)))
        }
        Err(err) => Err(JsValue::from_str(&err)),
    }
}
