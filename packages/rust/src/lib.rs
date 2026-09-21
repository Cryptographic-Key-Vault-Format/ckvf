//! Cryptographic Key Vault Format (CKVF) Rust SDK.
//!
//! **Not implemented in the first pass.** This crate MUST consume the same
//! specification, schemas, registries, and test-vectors as other SDKs. It MUST
//! NOT silently redefine CKVF behavior, MUST NOT depend on SComm, and MUST NOT
//! rewrite a vault to a newer container version on open.
//!
//! Intended public API: parse, validate, create, encrypt, decrypt, merge, and
//! identifiers (`identity_id`, `msk_id`, `absolute_key_id`, short key id), plus
//! capability queries.

const NYI: &str = "CKVF Rust SDK is a template; not implemented in the first pass";

/// Opaque vault or container value. Concrete types will match SPEC.md exactly.
pub struct CkvfValue;

/// Whether this build can read the given container `version`.
pub fn can_read_version(_version: &str) -> bool {
    unimplemented!("{NYI}")
}

/// Whether this build can write the given container `version`.
pub fn can_write_version(_version: &str) -> bool {
    unimplemented!("{NYI}")
}

/// Registered AEAD / algorithm identifiers this build implements.
pub fn supported_algorithms() -> &'static [&'static str] {
    unimplemented!("{NYI}")
}

/// Registered key encodings this build implements (for example `openpgp-tsk`, `pkcs8`).
pub fn supported_key_encodings() -> &'static [&'static str] {
    unimplemented!("{NYI}")
}

/// Registered unlock methods this build implements (for example `password-argon2id`).
pub fn supported_unlock_methods() -> &'static [&'static str] {
    unimplemented!("{NYI}")
}

/// Parse outer container JSON without decrypting.
pub fn parse(_source: &str) -> CkvfValue {
    unimplemented!("{NYI}")
}

/// Validate container structure, encodings, and `generation_hash` (fail closed).
pub fn validate(_container: &CkvfValue) {
    unimplemented!("{NYI}")
}

/// Create a new empty vault bound to an Identity (does not encrypt yet).
pub fn create(_identity: &CkvfValue) -> CkvfValue {
    unimplemented!("{NYI}")
}

/// Encrypt a payload under the VEK (AES-256-GCM). Passwords wrap the VEK only.
pub fn encrypt(_payload: &CkvfValue, _vek: &[u8], _container: &CkvfValue) -> CkvfValue {
    unimplemented!("{NYI}")
}

/// Decrypt a container (password or unwrapped VEK). MUST NOT rewrite on open.
pub fn decrypt(_container: &CkvfValue, _vek: Option<&[u8]>, _password: Option<&str>) -> CkvfValue {
    unimplemented!("{NYI}")
}

/// Deterministic merge of two unlocked vaults (no last-writer-wins).
pub fn merge(_a: &CkvfValue, _b: &CkvfValue) -> CkvfValue {
    unimplemented!("{NYI}")
}

/// `identity_id` = unpadded base64url(SHA-256(canonical identity bytes)).
pub fn identity_id(_r#type: &str, _value: &str) -> String {
    unimplemented!("{NYI}")
}

/// `msk_id` from MSK public key bytes as specified.
pub fn msk_id(_public_key: &[u8]) -> String {
    unimplemented!("{NYI}")
}

/// `absolute_key_id` = unpadded base64url(SHA-256(canonical public key bytes)).
pub fn absolute_key_id(_canonical_public_key_bytes: &[u8]) -> String {
    unimplemented!("{NYI}")
}

/// Short Key ID hint (not unique; collisions MUST be tolerated).
pub fn short_key_id(_absolute_key_id: &str) -> String {
    unimplemented!("{NYI}")
}
