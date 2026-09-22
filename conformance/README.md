# CKVF conformance

Language-neutral **conformance profiles** and a **machine-readable result format** for Cryptographic Key Vault Format (CKVF) SComm.AI Draft 0.1.

This directory does **not** implement CKVF. The first-pass runner lives in [`packages/js/packages/conformance`](../packages/js/packages/conformance). Other language SDKs SHOULD emit the same result JSON so JS → `vault.ckvf` → Dart (and later languages) can be compared mechanically.

CKVF is the SComm.AI-maintained portable vault format and is **not** an IETF standard. Conformance MUST NOT require Discovery HTTP.

## Profiles

| File | Claim name |
| --- | --- |
| [profiles/core.json](profiles/core.json) | CKVF Core compliant |
| [profiles/openpgp.json](profiles/openpgp.json) | CKVF OpenPGP Profile compliant |
| [profiles/smime.json](profiles/smime.json) | CKVF S/MIME Profile compliant |
| [profiles/email-identity.json](profiles/email-identity.json) | CKVF Email Identity Proof compliant |
| [profiles/dns-identity.json](profiles/dns-identity.json) | CKVF DNS Identity Proof compliant |

Each profile lists required test-vector ids from `test-vectors/`. Vectors are generated later; ids are stable.

An implementation MAY claim a subset of profiles. Claiming “CKVF compatible” without a profile name SHOULD be avoided.

## Result format

Implementations SHOULD write JSON matching [results/schema.json](results/schema.json):

```json
{
  "implementation": "example-sdk 0.1.0",
  "ckvf_versions_read": ["1.0"],
  "ckvf_versions_write": ["1.0"],
  "timestamp": "2026-08-17T00:00:00Z",
  "profiles": {
    "CKVF Core compliant": {
      "result": "pass",
      "tests": []
    }
  }
}
```

`result` is `"pass"`, `"fail"`, or `"skip"`. Skip is for profiles the implementation does not claim.

## Pinning

Consumers MUST pin `test-vectors` by its `VERSION` file (or a matching git tag of this monorepo), not `main`. Conformance profile files SHOULD be tagged together with the vector set they describe.

## License

[Apache-2.0](LICENSE)
