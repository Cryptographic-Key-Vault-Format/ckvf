use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn jcs(json: &str) -> Result<String, JsValue> {
    crate::canonicalize_json(json).map_err(|e| JsValue::from_str(&e.0))
}

#[wasm_bindgen]
pub fn base64url_encode(bytes: &[u8]) -> String {
    crate::base64url_encode(bytes)
}

#[wasm_bindgen]
pub fn base64url_decode(text: &str) -> Result<Vec<u8>, JsValue> {
    crate::base64url_decode(text).map_err(|e| JsValue::from_str(&e.0))
}
