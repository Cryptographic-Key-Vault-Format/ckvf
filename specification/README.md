# Cryptographic Key Vault Format (CKVF)

**Community Draft 0.1** — this is **not** an IETF standard, Internet-Draft, or RFC.

CKVF is a lightweight, portable, user-controlled format for an independently encrypted vault of current and historical private keys bound to a verified Identity, authorized by a Master Signing Key (MSK), and synchronizable across devices without giving a hosting service access to plaintext keys.

The originating use case is Secure Communications (SComm) and `pubkey.scomm.ai`. They are the **initial non-normative reference service only**. A compliant implementation **MUST** work without SComm.

## Normative document

- **[SPEC.md](SPEC.md)** — Community Draft 0.1 specification (data model, cryptography, identity, MSK, merge, versioning)

Read SPEC.md first. Companion documents do not override SPEC.md unless they are explicitly marked normative profiles.

## Document map

| Path | Purpose |
| --- | --- |
| [SPEC.md](SPEC.md) | Normative specification |
| [SECURITY-CONSIDERATIONS.md](SECURITY-CONSIDERATIONS.md) | Protocol security discussion |
| [PRIVACY-CONSIDERATIONS.md](PRIVACY-CONSIDERATIONS.md) | Protocol privacy discussion |
| [THREAT-MODEL.md](THREAT-MODEL.md) | Threats, mitigations, responsibility split |
| [INTEROPERABILITY.md](INTEROPERABILITY.md) | Independent implementations, profiles, version negotiation |
| [docs/prior-art.md](docs/prior-art.md) | What existing standards solve, what CKVF reuses, remaining gap |
| [profiles/email-otp.md](profiles/email-otp.md) | Email ownership profile (no vendor OTP API) |
| [profiles/dns-01.md](profiles/dns-01.md) | DNS ownership profile (not ACME) |
| [profiles/reference-key-service.md](profiles/reference-key-service.md) | Non-normative reference key service |
| [profiles/scomm-pubkey-migration.md](profiles/scomm-pubkey-migration.md) | Adapter notes for pubkey.scomm.ai |
| [REFERENCE-IMPLEMENTATIONS.md](REFERENCE-IMPLEMENTATIONS.md) | Known implementations |
| [ietf/README.md](ietf/README.md) | Future IETF packaging notes |
| [ietf/draft-ckvf-community-00.md](ietf/draft-ckvf-community-00.md) | kramdown-rfc Community Draft |
| [CONTRIBUTING.md](CONTRIBUTING.md) | How to change the spec |
| [GOVERNANCE.md](GOVERNANCE.md) | Editors, consensus, independence |
| [CHANGELOG.md](CHANGELOG.md) | Spec version history |
| [SECURITY.md](SECURITY.md) | Vulnerability reporting |
| [MAINTAINERS.md](MAINTAINERS.md) | Maintainers |
| [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) | Contributor Covenant 2.1 |
| [LICENSE](LICENSE) | BSD-2-Clause |

## Conceptual model

```
Identity
  +-- Identity Verification Method
  +-- Master Signing Key (MSK)
  +-- Vault
        +-- Private Key / Historical Private Key (any registered family)
```

Post-quantum cryptography is **not** a peer key family. PQC is an `algorithm` / `algorithm_suite` under `openpgp` or `smime`.

## Conformance snapshot

A v1.0 container is JSON with `"format": "CKVF"` and `"version": "1.0"`. The payload is AES-256-GCM under a random Vault Encryption Key (VEK). Passwords wrap the VEK with Argon2id; they never encrypt keys directly. Signed operations use Ed25519 over RFC 8785 JCS. Short Key IDs are hints, not unique identifiers.

SDKs version independently (SemVer). Implementations MUST expose `canReadVersion` / `canWriteVersion` and MUST NOT silently rewrite a vault to a newer format on open.

## What CKVF does not redefine

OpenPGP messages, S/MIME, CMS, certificate-chain validation, email MIME, encryption/signature algorithms, and PQC algorithm specifications remain in their own standards (RFC 9580, RFC 9980 PQC in OpenPGP, 8551, 5652, 5280, 5958, 7292, 7517, 7638, 8785, 9106, OASIS KMIP, and related work). CKVF is the missing portable vault layer around them.

## License

Specification text is licensed under the [BSD 2-Clause License](LICENSE). Do not copy text from IETF RFCs into this repository; cite the original RFC documents.

## Status

Community Draft 0.1. Wire format version `"1.0"` is frozen for interoperability experiments. The specification label `draft-0.1` will increment independently until a community 1.0 is declared under [GOVERNANCE.md](GOVERNANCE.md).

## Related paths

This specification lives in the [`ckvf`](https://github.com/Cryptographic-Key-Vault-Format/ckvf) monorepo.

| Path | Role |
| --- | --- |
| [SPEC.md](SPEC.md) | This directory (normative text) |
| [../schemas](../schemas) | JSON Schemas |
| [../registries](../registries) | Community registries |
| [../test-vectors](../test-vectors) | Pinned interoperability fixtures |
| [../conformance](../conformance) | Conformance profiles |
| [../packages/js](../packages/js) | JavaScript/TypeScript SDK |
| [../packages/dart](../packages/dart) | Dart SDK |
| [../packages/rust](../packages/rust) | Rust SDK template |
| [../packages/swift](../packages/swift) | Swift SDK template |
| [../packages/kotlin](../packages/kotlin) | Kotlin SDK template |
| [../packages/dotnet](../packages/dotnet) | .NET SDK template |
| [../packages/go](../packages/go) | Go SDK template |
