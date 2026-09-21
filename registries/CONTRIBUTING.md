# Contributing to CKVF community registries

This is a lightweight registration process for Community Draft 0.1. These registries are **not** IANA registries. SPEC.md remains normative.

## Namespaces

| Namespace | Use | Collision control |
| --- | --- | --- |
| **Standard** | Values implementations MUST/SHOULD understand for v1.0, and `std:` extensions | Assigned by a merged PR in this directory |
| **Experimental** | Trials that MUST NOT be required for core interop; `exp:` extensions | First-come in this directory; names MAY be withdrawn |
| **Private / vendor** | `priv:` extensions only | MUST be collision-resistant (reverse-DNS after `priv:` is RECOMMENDED) |

Do not mint a new **key family** for a vendor or for PQC. New families are a major specification decision.

## Reserved names and ranges

Reserved **family** names (MUST be rejected in v1.0): `pq`, `pqc`, `post-quantum`, `hybrid`.

Reserved **encoding**: `jwk` (not required in v1.0; v1.0 parsers MUST reject it).

Reserved **extension prefixes**: `std:`, `exp:`, `priv:`. `name` after the colon MUST match `^[a-z0-9][a-z0-9._-]*$`.

If these tables later migrate to IANA with numeric codes, the intended ranges are:

| Range | Policy |
| --- | --- |
| 1–127 | Standard; specification required |
| 128–255 | Experimental; MUST NOT be required for core interop |
| 256–1023 | Private / vendor; no IETF/IANA uniqueness |
| 0, 1024–65535 | Reserved; do not assign in Community Draft 0.1 |

String registries stay strings on the wire. These ranges are reservation notes only.

## How to register a standard value

1. Confirm the identifier is not reserved and does not redefine OpenPGP, S/MIME, CMS, JWK, KMIP, or PQC as a CKVF family.
2. Open a pull request that adds one row to the relevant table (value, meaning, reference).
3. Cite the existing standard (RFC or equivalent). Do not copy RFC text.
4. Allow review (SHOULD be at least seven days for standard-namespace changes).
5. If the value changes the wire format, it belongs in SPEC.md first, with a versioning discussion.

## How to register an experimental value

Same as standard, but:

- Use `exp:` for extensions.
- Document that peers MAY ignore the value for non-critical processing.
- Experimental names MUST NOT be required to unlock, merge, or parse a v1.0 vault.

## Private / vendor values

`priv:` extension IDs do not require a row in [extensions.md](extensions.md). Listing one is OPTIONAL and does not make it standard. Vendors MUST NOT use `std:` or unprefixed family/encoding names for private features.

## Pull requests

Keep unrelated edits out. Do not include secrets. A proposal that only works if callers use a named vendor will be rejected.

## License

Contributions are offered under the [BSD 2-Clause License](LICENSE).
