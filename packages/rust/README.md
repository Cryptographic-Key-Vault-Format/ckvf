# CKVF Rust SDK

This crate is the only reference SDK. Browser support is a WASM build of the same crate (`cargo build --features wasm --target wasm32-unknown-unknown`). Discovery HTTP and the identity OPRF are not part of CKVF.

JSON canonicalization and unpadded base64url are implemented and exported as `scomm_vault_jcs`, `scomm_vault_b64_encode`, and `scomm_vault_b64_decode`. The same functions are available from a WASM build (`--features wasm`). Container create, encrypt, decrypt, and merge are not implemented. Do not treat a build as a conforming vault.

Cryptographic Key Vault Format (CKVF) **SComm.AI Draft 0.1**. This is **not** an IETF standard.

SComm.AI maintains this format. This SDK MUST NOT import Discovery HTTP or hosted vault APIs.

## Contract

- Consumes the same **specification**, **schemas**, **registries**, and **test-vectors** as every other CKVF implementation.
- **MUST NOT** silently redefine CKVF behavior to match Rust conventions or a vendor product.
- Pin **test-vector `VERSION`** (or a matching git tag), **not** `main`.
- This crate uses **SemVer**. Specification labels (`draft-0.1`) and container versions (`"1.0"`) are versioned separately.
- MUST expose `can_read_version`, `can_write_version`, `supported_algorithms`, `supported_key_encodings`, and `supported_unlock_methods`.
- MUST **never** silently rewrite a vault to a newer container version on open. Upgrade is an explicit write.
- Interoperability: JS → `vault.ckvf` → Dart (same container version).

Intended public API (see `src/lib.rs`): parse, validate, create, encrypt, decrypt, merge, and identifiers (`identity_id`, `msk_id`, `absolute_key_id`, Short Key ID).

## Status

The codec and C ABI are implemented. Container operations return an error. Do not treat a green CI badge as conformance until real tests pin a test-vector `VERSION`.

## License

[Apache-2.0](LICENSE)
