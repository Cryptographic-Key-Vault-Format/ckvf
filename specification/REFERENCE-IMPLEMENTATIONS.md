# Reference implementations

CKVF is the SComm.AI-maintained portable vault format. Listing a product here does **not** make it a substitute for [SPEC.md](SPEC.md). This document is SComm.AI Draft 0.1 status: **not** an IETF standard.

## SComm.AI hosted service

| Name | Kind | CKVF role | Notes |
| --- | --- | --- | --- |
| [pubkey.scomm.ai](https://pubkey.scomm.ai) | Hosted public-key / vault sync service | Stores **opaque** CKVF ciphertext | SComm.AI product. Hosted HTTP is not the container spec. See [profiles/scomm-pubkey-migration.md](profiles/scomm-pubkey-migration.md) and [profiles/reference-key-service.md](profiles/reference-key-service.md). |

The hosted service:

- SHOULD treat the CKVF container as an opaque encrypted blob when inspection is not required;
- MUST NOT require plaintext private keys to store or sync a vault;
- MUST NOT be required to unlock or parse a local vault file.

## Other implementations

Add rows as implementations appear. Prefer open-source libraries with a documented `canReadVersion` / `canWriteVersion` matrix.

| Implementation | Language / platform | Container | Operations | Profiles | License | Status |
| --- | --- | --- | --- | --- | --- | --- |
| [`packages/js`](../packages/js), [`packages/dart`](../packages/dart) | JS / Dart | `"1.0"` | create/open | — | Apache-2.0 | SComm.AI reference SDKs |

Suggested columns for future rows: reader, writer, merge, email-otp, dns-01, offline-only.

## How to list an implementation

Open a pull request that adds a row and a link to:

1. Source or spec-compliance notes;
2. Which conformance targets from [INTEROPERABILITY.md](INTEROPERABILITY.md) are claimed.

Editors MAY list incomplete implementations as “experimental”.

## Test vectors

Cryptographic test vectors live in `test-vectors/` and are the preferred interoperability check.
