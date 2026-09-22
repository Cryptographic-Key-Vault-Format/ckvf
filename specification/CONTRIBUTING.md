# Contributing to CKVF

Thank you for helping specify a portable cryptographic key vault format. This directory holds protocol text, profiles, and IETF packaging notes. Implementation code belongs under `packages/`, not here.

Please read [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) and [GOVERNANCE.md](GOVERNANCE.md) first.

## What this project is

- SComm.AI Draft 0.1 of the Cryptographic Key Vault Format.
- **Not** an IETF standard.
- **Maintained by SComm.AI** at [scomm-public/ckvf](https://github.com/scomm-public/ckvf).

Do not add Discovery HTTP or hosted vault APIs to this specification.

## Before you write

1. Read [SPEC.md](SPEC.md). Match the **exact** data model (field names, encodings, AAD, hashes).
2. Read [docs/prior-art.md](docs/prior-art.md). Do not redefine OpenPGP, S/MIME, CMS, JWK, KMIP, or PQC algorithms.
3. Do not copy text from IETF RFCs. Cite them.
4. Use RFC 2119 / RFC 8174 keywords **only** in all capitals, and only as those RFCs define them.

## Change types

| Type | Where | Notes |
| --- | --- | --- |
| Normative core | `SPEC.md` | Requires changelog bump of the draft label if behavior changes |
| Registry values | SPEC Appendix A | New families are a major decision; PQC MUST NOT be added as a family |
| Profiles | `profiles/` | email-otp and dns-01 are security-property profiles, not vendor APIs |
| Security/privacy/threats | companion markdown files | Keep SPEC.md highlights in sync |
| IETF rendering | `ietf/draft-ckvf-community-00.md` | Must remain a non-IETF draft; SPEC.md wins on conflict |
| Editorial | any | Typos, cross-links, examples labeled non-vectors |

## Normative language

- MUST / SHOULD / MAY (and the other RFC 2119 words) appear only in all capitals.
- Do not use “must” in running prose when you mean a requirement; use MUST or rewrite the sentence.
- Do not invent cryptographic primitives. New AEAD, KDF, or signature algorithms require a registry change pointing at an existing standard.

## Data model stability

Schemas and SDKs are expected to match SPEC.md **exactly**:

- Outer container fields, AAD membership, `generation_hash` omission rule.
- Unpadded base64url (RFC 4648 §5).
- RFC 8785 JCS for hashes, AAD, and signatures — no custom canonicalization.
- Short Key IDs are hints; `absolute_key_id` is authoritative.
- `retired` ≠ delete; deletion is `DELETE_PRIVATE_KEY` plus a tombstone.

If you need a new field, prefer an extension (`std:` / `exp:` / `priv:`) over adding a core JSON property.

## Pull requests

1. Fork or branch; keep unrelated edits out.
2. Update [CHANGELOG.md](CHANGELOG.md) for user-visible spec changes.
3. If you change a hash/AAD/example JCS string, say so explicitly.
4. Do not include secrets, live private keys, or production vault files.
5. Examples MUST be labeled illustrative unless they are in a future `test-vectors/` directory.

## Issues

Open issues for ambiguities independent implementations could split on. If the issue is a vulnerability, follow [SECURITY.md](SECURITY.md) instead.

## License

Contributions are offered under the [BSD 2-Clause License](LICENSE).
