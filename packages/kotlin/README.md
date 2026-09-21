# CKVF Kotlin SDK

**Placeholder — not implemented in the first pass.**

Cryptographic Key Vault Format (CKVF) **Community Draft 0.1**. This is **not** an IETF standard.

SComm and `pubkey.scomm.ai` are the originating use case and initial non-normative reference only. This SDK **MUST NOT** depend on SComm.

## Contract

- Consumes the same **specification**, **schemas**, **registries**, and **test-vectors** as every other CKVF implementation.
- **MUST NOT** silently redefine CKVF behavior to match Kotlin conventions or a vendor product.
- Pin **test-vector `VERSION`** (or a matching git tag), **not** `main`.
- This package uses **SemVer**. Specification labels (`draft-0.1`) and container versions (`"1.0"`) are versioned separately.
- MUST expose `canReadVersion`, `canWriteVersion`, `supportedAlgorithms`, `supportedKeyEncodings`, and `supportedUnlockMethods`.
- MUST **never** silently rewrite a vault to a newer container version on open. Upgrade is an explicit write.
- Interoperability: Vendor A JS → `vault.ckvf` → Vendor B Dart → Vendor C Rust.

Intended public API (see `src/main/kotlin/org/ckvf/Ckvf.kt`): parse, validate, create, encrypt, decrypt, merge, and identifiers (`identityId`, `mskId`, `absoluteKeyId`, Short Key ID).

## Status

Calls currently throw `UnsupportedOperationException`. Do not treat a future green CI badge as conformance until real tests pin a test-vector `VERSION`.

## License

[Apache-2.0](LICENSE)
