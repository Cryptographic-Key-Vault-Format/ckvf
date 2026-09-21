# Contributing to CKVF

Thank you for helping specify and implement a portable cryptographic key vault format.

Please read [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) and [GOVERNANCE.md](GOVERNANCE.md) first.

## What this project is

- Community Draft 0.1 of an implementation-independent format.
- **Not** an IETF standard.
- **Not** a product of SComm. `pubkey.scomm.ai` is the initial non-normative reference service.

A proposal that only works if callers use SComm will be rejected.

## Where to send work

Open pull requests against this repository. Put the change in the directory that owns it:

| Change | Path |
| --- | --- |
| Normative data model, cryptography, merge, errors | [`specification/SPEC.md`](specification/SPEC.md) |
| JSON Schemas | [`schemas/`](schemas/) |
| Registry values | [`registries/`](registries/) (must stay aligned with SPEC Appendix A) |
| Interoperability fixtures | [`test-vectors/`](test-vectors/) |
| Conformance profiles / result schema | [`conformance/`](conformance/) |
| JavaScript/TypeScript implementation | [`packages/js`](packages/js) |
| Dart implementation | [`packages/dart`](packages/dart) |
| Other language SDKs | [`packages/go`](packages/go), [`rust`](packages/rust), [`swift`](packages/swift), [`kotlin`](packages/kotlin), [`dotnet`](packages/dotnet) |

SDKs MUST consume the specification, schemas, registries, and a **pinned** test-vector `VERSION`. They MUST NOT silently redefine CKVF behavior to match a local convenience or a vendor product.

Language-specific notes live under each package (`packages/*/CONTRIBUTING.md`).

## Before you write

1. Read [specification/SPEC.md](specification/SPEC.md). Match field names, encodings, AAD, and hashes exactly.
2. Do not redefine OpenPGP, S/MIME, CMS, JWK, KMIP, or PQC algorithms.
3. Do not copy text from IETF RFCs. Cite them.
4. Use RFC 2119 / RFC 8174 keywords **only** in all capitals, and only as those RFCs define them.
5. Fail closed on security-sensitive ambiguity.

## SDK rules

- Expose `canReadVersion`, `canWriteVersion`, `supportedAlgorithms`, `supportedKeyEncodings`, and `supportedUnlockMethods`.
- NEVER silently rewrite a vault to a newer container version on open.
- Pin test vectors by `VERSION` (or a matching git tag), not `main`.
- SDK SemVer is independent of the specification label and of container `"1.0"`.
- No SComm or `pubkey.scomm.ai` dependency in core libraries.

## Develop

```bash
# Dart
cd packages/dart && dart pub get && dart analyze && dart test

# JavaScript
cd packages/js && npm ci && npm run build && npm test
```

## Pull requests

1. Keep unrelated edits out of the same PR.
2. Update the relevant changelog when user-visible behavior or spec text changes.
3. Do not include secrets, live private keys, or production vault files.
4. Test-vector private keys MUST remain labeled **TEST KEY — NEVER USE IN PRODUCTION**.
5. If you change a hash, AAD member, or JCS input, say so explicitly.

## Issues

Open issues for ambiguities independent implementations could split on. If the issue is a vulnerability, follow [SECURITY.md](SECURITY.md) instead. Do not file public issues for exploitable defects.

## License

Specification, schema, registry, and test-vector contributions are offered under [BSD-2-Clause](LICENSE-SPEC). SDK and conformance-tooling contributions are offered under [Apache-2.0](LICENSE).
