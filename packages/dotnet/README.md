# CKVF .NET SDK

**Placeholder — not implemented in the first pass.**

Cryptographic Key Vault Format (CKVF) **SComm.AI Draft 0.1**. This is **not** an IETF standard.

SComm.AI maintains this format. This SDK MUST NOT import Discovery HTTP or hosted vault APIs.

## Contract

- Consumes the same **specification**, **schemas**, **registries**, and **test-vectors** as every other CKVF implementation.
- **MUST NOT** silently redefine CKVF behavior to match .NET conventions or a vendor product.
- Pin **test-vector `VERSION`** (or a matching git tag), **not** `main`.
- This package uses **SemVer**. Specification labels (`draft-0.1`) and container versions (`"1.0"`) are versioned separately.
- MUST expose `CanReadVersion`, `CanWriteVersion`, `SupportedAlgorithms`, `SupportedKeyEncodings`, and `SupportedUnlockMethods`.
- MUST **never** silently rewrite a vault to a newer container version on open. Upgrade is an explicit write.
- Interoperability: JS → `vault.ckvf` → Dart (same container version).

Intended public API (see `src/Ckvf/Ckvf.cs`): parse, validate, create, encrypt, decrypt, merge, and identifiers (`IdentityId`, `MskId`, `AbsoluteKeyId`, Short Key ID).

## Status

Calls currently throw `NotImplementedException`. Do not treat a future green CI badge as conformance until real tests pin a test-vector `VERSION`.

## License

[Apache-2.0](LICENSE)
