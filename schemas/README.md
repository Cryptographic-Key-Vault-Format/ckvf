# CKVF JSON Schemas

**Community Draft 0.1** — container version `"1.0"`.

These JSON Schemas (draft 2020-12) are a **machine-readable aid** for CKVF Community Draft 0.1. They encode the objects, field names, types, and encodings in [specification/SPEC.md](../specification/SPEC.md).

**These schemas do not replace the normative prose.** On any conflict, SPEC.md wins. Cryptographic processing (AAD membership, JCS, generation_hash omission, wrap AAD, Argon2id, Ed25519 over `body` only), identity canonicalization, merge rules, and fail-closed error handling remain specified only in prose.

This document is **not** an IETF standard, Internet-Draft, or RFC.

## Files

| Schema | SPEC object |
| --- | --- |
| [vault-container.schema.json](vault-container.schema.json) | Outer vault container (Section 4.1) |
| [unlock-slot.schema.json](unlock-slot.schema.json) | Unlock slot (Section 4.2) |
| [vault-payload.schema.json](vault-payload.schema.json) | Encrypted payload, MSK, tombstones (Sections 4.3, 4.5, 8) |
| [identity.schema.json](identity.schema.json) | Identity (Sections 4.3, 7) |
| [key-record.schema.json](key-record.schema.json) | Key record (Sections 4.4, 9) |
| [extension.schema.json](extension.schema.json) | Extension object (Sections 4.6, 13) |
| [signed-operation.schema.json](signed-operation.schema.json) | Signed envelope and Appendix B payloads (Section 4.7) |

Community registry *values* live in [../registries](../registries). Schemas constrain types and v1.0 closed sets (`format`, families, encodings, operations). Registry strings such as `algorithm` remain open strings so newly registered identifiers validate.

## Conventions

- Draft **2020-12**.
- `additionalProperties: false` on every core object.
- Binary fields: unpadded base64url, pattern `^[A-Za-z0-9_-]+$` (RFC 4648 Section 5). Padded base64url and standard base64 are rejected.
- Exact decoded sizes are encoded as character lengths (16 bytes → 22 chars, 12 bytes → 16 chars, 32 bytes → 43 chars, 64 bytes → 86 chars).
- Timestamps: RFC 3339 UTC with a `Z` suffix. Numeric offsets are rejected.
- Unknown core JSON keys MUST be rejected. Extensions are the only forward-compatible channel (`std:` / `exp:` / `priv:`).
- PQC is **not** a key family. `family` is `openpgp` or `smime` only.
- Encoding `jwk` is reserved and rejected in v1.0.
- Parser-limit maxima from SPEC Appendix C are included where JSON Schema can express them (array sizes, KDF bounds). Nested JSON depth and UTF-8 byte size of the whole document are not fully expressible here; implementations MUST still enforce Appendix C.

## What schemas cannot check

Implementations MUST still enforce, among other SPEC rules:

- Recompute `identity_id`, `msk_id`, `absolute_key_id`, `short_key_id`, `generation_hash`, and `payload_hash`.
- AEAD AAD membership and wrap AAD (Section 6).
- RFC 8785 JCS before hashing or signing.
- `previous_generation_hash` linkage across a generation chain (the schema only encodes null iff `generation` is 1).
- `body.generation` equals `payload.generation` for `COMMIT_VAULT_GENERATION`.
- Duplicate `slot_id` values (`ERR_SLOT_ID`).
- Preferred-key references exist in `keys` and are not tombstoned.

## Validate

```bash
npm ci
npm test
```

Requires Node.js 18+. The script compiles every schema with Ajv and checks structural fixtures (not cryptographic test vectors).

## License

[BSD-2-Clause](LICENSE). Do not copy text from IETF RFCs into this repository; cite the original RFC documents.
