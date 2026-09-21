# Key encodings

Community registry of `encoding` values on key records. SPEC.md Sections 9.2, 9.4, and Appendix A.5.

| Value | Typical `family` | Native private-key bytes | v1.0 |
| --- | --- | --- | --- |
| `openpgp-tsk` | `openpgp` | OpenPGP Transferable Secret Key (RFC 9580) | Required |
| `pkcs8` | `smime` | PKCS #8 / RFC 5958 OneAsymmetricKey DER | Required |
| `pkcs12` | `smime` | PKCS #12 PFX DER (RFC 7292) | Required |
| `jwk` | — | JSON Web Key (RFC 7517); Absolute Key ID would use RFC 7638 thumbprint JSON | **Reserved** |

`openpgp-tsk` MUST NOT be used with `family` `"smime"`. `pkcs8` and `pkcs12` MUST NOT be used with `family` `"openpgp"` in v1.0.

`jwk` is **not** required in version `"1.0"` and MUST be rejected by v1.0 parsers (`ERR_ENCODING`) unless a negotiated later version is in use.

Canonical public key bytes (hashed for `absolute_key_id`, stored in `public_key`):

- `openpgp-tsk`: a single OpenPGP Public-Key packet (tag 6), RFC 9580 new-format definite-length, public fields only (primary key).
- `pkcs8` / `pkcs12`: DER-encoded `SubjectPublicKeyInfo` (RFC 5280). For PKCS #12, the leaf (end-entity) SPKI, not the entire PFX.
- Future `jwk`: `base64url(SHA-256(UTF-8 JCS(RFC 7638 thumbprint JSON)))`.
