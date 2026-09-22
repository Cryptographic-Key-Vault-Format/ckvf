# CKVF Rust SDK

**Placeholder — not implemented in the first pass.**

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

Functions currently `panic!` with a not-implemented message. Do not treat a future green CI badge as conformance until real tests pin a test-vector `VERSION`.

## License

[Apache-2.0](LICENSE)
