# Reference implementations

CKVF is implementation-independent. Listing a product here does **not** make it normative. A compliant implementation MUST work without any service in this table.

This document is Community Draft 0.1 status: **not** an IETF standard.

## Initial reference service

| Name | Kind | CKVF role | Notes |
| --- | --- | --- | --- |
| [pubkey.scomm.ai](https://pubkey.scomm.ai) | Hosted public-key / vault sync service | **Initial CKVF Reference Service Implementation** (non-normative) | Originating use case: SComm. Behavior specific to SComm belongs in an **adapter**. If the service differs from CKVF, change the adapter, not [SPEC.md](SPEC.md). See [profiles/scomm-pubkey-migration.md](profiles/scomm-pubkey-migration.md) and [profiles/reference-key-service.md](profiles/reference-key-service.md). |

The initial reference service:

- SHOULD treat the CKVF container as an opaque encrypted blob when inspection is not required;
- MUST NOT require plaintext private keys to store or sync a vault;
- MUST NOT be the only way to unlock or parse a vault file.

## Independent implementations

Add rows as independent implementations appear. Prefer open-source libraries with a documented `canReadVersion` / `canWriteVersion` matrix.

| Implementation | Language / platform | Container | Operations | Profiles | License | Status |
| --- | --- | --- | --- | --- | --- | --- |
| *None registered besides the initial service* | — | `"1.0"` | — | — | — | Waiting on independent implementations |

Suggested columns for future rows: reader, writer, merge, email-otp, dns-01, offline-only.

## How to list an implementation

Open a pull request that adds a row and a link to:

1. Source or spec-compliance notes;
2. Which conformance targets from [INTEROPERABILITY.md](INTEROPERABILITY.md) are claimed;
3. Confirmation that the implementation functions without SComm.

Editors MAY list incomplete implementations as “experimental”. Editors MUST NOT refuse a listing solely because the implementation is not SComm.

## Test vectors

Cryptographic test vectors are not bundled in Draft 0.1 examples. When published, they will live in `test-vectors/` and will be the preferred interoperability check.
