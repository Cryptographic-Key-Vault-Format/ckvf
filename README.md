# Cryptographic Key Vault Format (CKVF)

**Community Draft 0.1** — this is **not** an IETF standard, Internet-Draft, RFC, or IETF consensus document.

CKVF is a lightweight, portable, user-controlled format for an independently encrypted vault of current and historical private keys bound to a verified Identity, authorized by a Master Signing Key (MSK), and synchronizable across devices without giving a hosting service plaintext keys.

SComm and [`pubkey.scomm.ai`](https://pubkey.scomm.ai) are the originating use case and the **initial non-normative reference service only**. A compliant implementation **MUST** work without SComm. This repository **MUST NOT** depend on SComm, Discovery Protocol HTTP, or `pubkey.scomm.ai`.

**Normative specification:** [specification/SPEC.md](specification/SPEC.md)

## Layout

| Path | Role | License |
| --- | --- | --- |
| [`specification/`](specification/) | Community Draft 0.1 (normative) | BSD-2-Clause |
| [`schemas/`](schemas/) | JSON Schemas | BSD-2-Clause |
| [`registries/`](registries/) | Community registries | BSD-2-Clause |
| [`test-vectors/`](test-vectors/) | Pinned interoperability fixtures (`VERSION`, not `main`) | BSD-2-Clause |
| [`conformance/`](conformance/) | Conformance profiles and result schema | Apache-2.0 |
| [`packages/js`](packages/js) | JavaScript / TypeScript (`@ckvf/core`, `@ckvf/node`, `@ckvf/browser`, `@ckvf/conformance`) | Apache-2.0 |
| [`packages/dart`](packages/dart) | Dart (`ckvf`) | Apache-2.0 |
| [`packages/go`](packages/go), [`rust`](packages/rust), [`dotnet`](packages/dotnet), [`kotlin`](packages/kotlin), [`swift`](packages/swift) | SDK templates | Apache-2.0 |

Content keys (OpenPGP TSK vs S/MIME PKCS#8/PKCS#12, `algorithm_suite`): [docs/content-keys.md](docs/content-keys.md).

Layering vs Discovery Protocol: [docs/layering.md](docs/layering.md).

## Packages

| Package | Language | Status |
| --- | --- | --- |
| [`packages/js`](packages/js) | JavaScript / TypeScript | Implemented (0.1.0) |
| [`packages/dart`](packages/dart) | Dart | Implemented (0.1.0) |
| [`packages/go`](packages/go) | Go | Template |
| [`packages/rust`](packages/rust) | Rust | Template |
| [`packages/dotnet`](packages/dotnet) | .NET | Template |
| [`packages/kotlin`](packages/kotlin) | Kotlin | Template |
| [`packages/swift`](packages/swift) | Swift | Template |

## Contract

Every package:

- Consumes the same **specification**, **schemas**, **registries**, and **test-vectors**.
- **MUST NOT** silently redefine CKVF behavior to match language conventions or a vendor product.
- Pins **test-vector `VERSION`**, **not** `main`.
- Exposes capability queries (`canReadVersion` / `canWriteVersion`, supported algorithms, key encodings, unlock methods).
- **MUST NEVER** silently rewrite a vault to a newer container version on open. Upgrade is an explicit write.

Interoperability: Vendor A JS → `vault.ckvf` → Vendor B Dart → Vendor C Rust.

## What does *not* belong here

| Concern | Belongs in |
| --- | --- |
| Discovery Document HTTP (`GET /v1/mailboxes/...`) | `discovery-protocol` + Discovery/Pubkey client SDKs (`sdk_pubkey`) |
| MSK enroll/replace, OTP challenges, operations | Pubkey client SDKs + `discovery.scomm.ai` |
| Hosted vault record sync (`vault_list` / `vault_put_record`) | Pubkey client SDKs (orchestration over CKVF ciphertext) |
| Merging Discovery into this repo | **Forbidden** — would violate “MUST NOT depend on SComm” |

SComm clients **depend on** these packages for portable vault files; they do not pull Discovery into CKVF.

## Develop

```bash
# Dart
cd packages/dart && dart pub get && dart analyze && dart test

# JavaScript
cd packages/js && npm ci && npm run build && npm test
```

Dart conformance loads `test-vectors/` from the repository root (or `CKVF_TEST_VECTORS`) and pins `packages/dart/test-vectors/VERSION`.

See each package's README for install and API details.

## License

| Material | License |
| --- | --- |
| Specification, schemas, registries, test vectors | [BSD-2-Clause](LICENSE-SPEC) |
| SDKs and conformance tooling | [Apache-2.0](LICENSE) |

Do not copy text from IETF RFCs into this repository; cite the original RFC documents.
