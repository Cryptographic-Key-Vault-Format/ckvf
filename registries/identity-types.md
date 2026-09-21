# Identity types

Community registry of `identity.type` values. v1.0 closed set. SPEC.md Sections 7 and Appendix A.7.

| Value | Canonicalization | `identity_id` input |
| --- | --- | --- |
| `email` | SPEC Section 7.2 (NFC, trim, ASCII local-part lowercased, IDNA ToASCII domain) | `email:` + canonical `value` |
| `dns` | SPEC Section 7.3 (NFC, trim, strip trailing dots, IDNA ToASCII, lowercase) | `dns:` + canonical `value` |

```
identity_id = base64url(SHA-256(UTF-8(canonical_type + ":" + canonical_value)))
```

Implementations MUST recompute `identity_id` and MUST reject a mismatch (`ERR_IDENTITY_ID`). Changing Identity is not a v1.0 operation (`ERR_IDENTITY_MISMATCH`).

No other types are registered for container version `"1.0"`. Proof artifacts MUST NOT be stored in the vault; see [verification-methods.md](verification-methods.md).
