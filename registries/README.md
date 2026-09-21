# CKVF community registries

**Community Draft 0.1** — container version `"1.0"`.

These tables are the Community Draft 0.1 source of truth for registered identifiers, shaped for later IANA migration. They are **not** IANA registries. This Community Draft does not request any IANA action ([SPEC.md](../specification/SPEC.md) Section 18).

Until IANA migration, this directory plus SPEC Appendix A is authoritative for Draft 0.1. On conflict, **SPEC.md wins**.

This document is **not** an IETF standard, Internet-Draft, or RFC.

## Files

| Registry | v1.0 values |
| --- | --- |
| [identity-types.md](identity-types.md) | `email`, `dns` |
| [verification-methods.md](verification-methods.md) | `email-otp`, `dns-01` |
| [key-families.md](key-families.md) | `openpgp`, `smime` (PQC is **not** a family) |
| [key-encodings.md](key-encodings.md) | `openpgp-tsk`, `pkcs8`, `pkcs12`; reserved `jwk` |
| [algorithms.md](algorithms.md) | Starting set, OpenPGP names, RFC 9980 as `algorithm` / `algorithm_suite` under `openpgp` |
| [aead-algorithms.md](aead-algorithms.md) | `A256GCM` |
| [kdfs.md](kdfs.md) | `Argon2id` |
| [unlock-methods.md](unlock-methods.md) | `password-argon2id`, `device-wrap-a256gcm` |
| [operations.md](operations.md) | Twelve signed operations |
| [extensions.md](extensions.md) | Empty table plus process (`std:` / `exp:` / `priv:`) |

Machine-readable JSON Schemas live in [../schemas](../schemas). Schemas do not replace SPEC.md.

## Namespaces

| Namespace | Where it appears | Meaning |
| --- | --- | --- |
| **Standard** | Unprefixed registry values; extension IDs `std:` | Assigned in this directory (or a future IANA registry). Required for v1.0 interoperability when listed as mandatory. |
| **Experimental** | Extension IDs `exp:`; designated experimental names | MUST NOT be required for interoperability of core features. |
| **Private / vendor** | Extension IDs `priv:` (collision-resistant, for example reverse-DNS after `priv:`) | No central uniqueness guarantee beyond the prefix rule. |

String-valued registries in this draft do not use numeric codes. Reserved **names** and **ranges** for a possible later numeric IANA mapping are listed in [CONTRIBUTING.md](CONTRIBUTING.md).

## PQC

Post-quantum algorithms MUST NOT be introduced as a peer key family. PQC appears only as `algorithm` and/or `algorithm_suite` under an existing family such as `openpgp` or `smime` ([RFC 9980](https://www.rfc-editor.org/rfc/rfc9980.html) for OpenPGP).

Reserved and MUST be rejected as `family` in v1.0: `pq`, `pqc`, `post-quantum`, `hybrid`.

## License

[BSD-2-Clause](LICENSE). Do not copy text from IETF RFCs into this repository; cite the original RFC documents.
