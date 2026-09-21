# KDFs

Community registry of key-derivation identifiers used in unlock-slot `kdf.alg`. SPEC.md Sections 4.2, 6.4, 6.5, and Appendix C.

| Value | Used by method | Notes |
| --- | --- | --- |
| `Argon2id` | `password-argon2id` | RFC 9106. `tagLength` / `kdf.key_length` MUST be 32. |

For `"password-argon2id"`:

| Field | Requirement |
| --- | --- |
| `kdf.alg` | MUST be `Argon2id` |
| `kdf.salt` | MUST decode to at least 16 octets |
| `kdf.m` | Memory in KiB. MUST reject `m` < 16384. Appendix C maximum 1048576. RECOMMENDED 65536 |
| `kdf.t` | Iterations. MUST reject `t` < 2. Appendix C maximum 16. RECOMMENDED 3 |
| `kdf.p` | Parallelism. MUST reject `p` < 1. Appendix C maximum 16. RECOMMENDED 4 |
| `kdf.key_length` | MUST be 32 |

Implementations MUST NOT silently lower `m`, `t`, or `p`. Unsafe or oversize parameters produce `ERR_KDF` or `ERR_PARSER_LIMIT`.

`device-wrap-a256gcm` has no in-file KDF; `kdf` MUST be omitted.
