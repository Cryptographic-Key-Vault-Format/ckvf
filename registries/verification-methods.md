# Identity verification methods

Community registry of Identity Verification Method (IVM) identifiers. Used in `ESTABLISH_MSK` / `REPLACE_MSK` payload field `verification_method`. SPEC.md Sections 7.4, 8.3, 8.4, and Appendix B.9.

| Value | Profile | Notes |
| --- | --- | --- |
| `email-otp` | specification `profiles/email-otp.md` | Security-property profile. No vendor OTP API is normative. |
| `dns-01` | specification `profiles/dns-01.md` | Inspired by ACME DNS-01; **not** ACME. |

IVM artifacts (OTP values, challenge nonces, TXT records, ownership secrets) MUST NOT be stored in the vault. `proof_id` in a signed payload is an opaque handle of a consumed proof, not the secret.

`REPLACE_MSK` REQUIRES a fresh Identity ownership proof unless a future recovery profile, registered as an extension, explicitly says otherwise.
