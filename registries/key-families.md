# Key families

Community registry of `family` values on key records. SPEC.md Sections 9.1 and Appendix A.2.

| Value | Notes |
| --- | --- |
| `openpgp` | RFC 9580 ecosystem. Native encoding `openpgp-tsk`. |
| `smime` | S/MIME / CMS / PKIX ecosystem. Native encodings `pkcs8` or `pkcs12`. |

v1.0 `family` values are `openpgp` and `smime` **only**.

## PQC is not a family

Post-quantum cryptography MUST NOT be introduced as a peer key family. A post-quantum OpenPGP key uses `family` `"openpgp"` with an `algorithm` and/or `algorithm_suite` identifying the PQC or hybrid construction ([RFC 9980](https://www.rfc-editor.org/rfc/rfc9980.html)). A post-quantum S/MIME key uses `family` `"smime"` similarly.

Reserved and MUST be rejected in v1.0 (`ERR_FAMILY`):

| Rejected `family` |
| --- |
| `pq` |
| `pqc` |
| `post-quantum` |
| `hybrid` |

Implementations MUST NOT infer family from algorithm. Both `family` and `algorithm` are required (`algorithm_suite` MAY be JSON `null`).
