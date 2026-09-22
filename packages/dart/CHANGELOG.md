# Changelog

## Unreleased

- `algorithm_suite` on content keys is `rsa` | `ecc` | `pqc` (or null). Family remains `openpgp` | `smime`; `pq` / `pqc` stay forbidden as families. Hybrids classify as `pqc`.

## 0.1.0

- Initial CKVF SComm.AI Draft 0.1 implementation (container `"1.0"`).
- Parse, validate, create, encrypt, decrypt, merge, and identifiers.
- Software `DartCkvfCrypto` (AES-256-GCM, Argon2id, Ed25519, SHA-256).
- Pinned test-vector set `0.1.0`.
