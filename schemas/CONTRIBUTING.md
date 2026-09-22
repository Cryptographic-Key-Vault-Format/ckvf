# Contributing to CKVF schemas

Thank you for helping keep the machine-readable schemas aligned with CKVF SComm.AI Draft 0.1.

**These schemas do not replace the normative prose.** [specification/SPEC.md](../specification/SPEC.md) is authoritative. If a schema would accept a document SPEC rejects, or reject a document SPEC requires, the schema is wrong.

## Before you change a schema

1. Read SPEC.md Sections 4, 5, 6, 9, 13, 15, Appendix A, Appendix B, and Appendix C.
2. Match **exact** field names, types, encodings, and closed enumerations.
3. Keep JSON Schema draft **2020-12**.
4. Keep `additionalProperties: false` on every core object.
5. Keep unpadded base64url as `^[A-Za-z0-9_-]+$`.
6. Do not copy text from IETF RFCs. Cite them.

## Change types

| Change | Rule |
| --- | --- |
| New core field | Not allowed here first. Propose it in SPEC.md (prefer an extension). |
| New registry string (`algorithm`, `method`, …) | Usually a registries PR; keep the schema field a string unless SPEC closed the set. |
| Closed v1.0 set (`format`, `family`, `encoding`, operations) | Must match SPEC exactly. |
| Parser limits | May encode Appendix C maxima; MUST NOT be weaker than SPEC. |
| Fixtures in `validate.mjs` | Structural only. Do not treat them as cryptographic test vectors. |

## Pull requests

1. Keep unrelated edits out.
2. Run `npm test`.
3. If SPEC and schema disagree, fix the schema or send a SPEC issue; do not invent a third behavior.
4. Do not include secrets, live private keys, or production vault files.

## License

Contributions are offered under the [BSD 2-Clause License](LICENSE).
