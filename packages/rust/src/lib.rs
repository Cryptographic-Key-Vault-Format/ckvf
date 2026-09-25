//! Cryptographic Key Vault Format (CKVF) reference SDK.
//!
//! JSON canonicalization and unpadded base64url are implemented here and
//! exported as a C ABI (`scomm_vault_*`) plus an optional WASM build of the
//! same functions. Container create, encrypt, decrypt, and merge are not
//! implemented. This crate does not speak Discovery HTTP or the identity OPRF.

mod b64;
mod ffi;
mod jcs;

#[cfg(feature = "wasm")]
mod wasm_api;

pub use b64::{decode as base64url_decode, encode as base64url_encode, B64Error};
pub use jcs::{canonicalize_json, JcsError};

pub fn can_read_version(_version: &str) -> bool {
    false
}

pub fn can_write_version(_version: &str) -> bool {
    false
}

pub fn supported_algorithms() -> &'static [&'static str] {
    &[]
}

pub fn supported_key_encodings() -> &'static [&'static str] {
    &[]
}

pub fn supported_unlock_methods() -> &'static [&'static str] {
    &[]
}

pub fn parse(_source: &str) -> Result<(), &'static str> {
    Err("CKVF container parse is not implemented")
}

pub fn validate(_source: &str) -> Result<(), &'static str> {
    Err("CKVF container validate is not implemented")
}

pub fn create(_identity: &str) -> Result<(), &'static str> {
    Err("CKVF container create is not implemented")
}

pub fn encrypt(_payload: &str, _vek: &[u8], _container: &str) -> Result<(), &'static str> {
    Err("CKVF container encrypt is not implemented")
}

pub fn decrypt(
    _container: &str,
    _vek: Option<&[u8]>,
    _password: Option<&str>,
) -> Result<(), &'static str> {
    Err("CKVF container decrypt is not implemented")
}

pub fn merge(_a: &str, _b: &str) -> Result<(), &'static str> {
    Err("CKVF container merge is not implemented")
}
