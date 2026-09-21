# Changelog

This changelog records **specification** revisions (community-draft labels), not SDK SemVer. Container `version` is a separate string inside the JSON file; see [SPEC.md](SPEC.md) Section 14.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [draft-0.1] — 2026-08-17

### Added

- Initial CKVF Community Draft 0.1.
- Normative data model for outer container version `"1.0"`, unlock slots, encrypted payload, key records, tombstones, extensions, and signed operations.
- AES-256-GCM vault protection with random VEK; Argon2id password wrapping (RFC 9106 second recommended option); Ed25519 MSK operations over RFC 8785 JCS.
- Identity types `email` and `dns` with canonicalization and `identity_id`.
- Key families `openpgp` and `smime` only; PQC as algorithm/suite, not a family.
- Merge semantics without silent last-writer-wins.
- Email-otp and dns-01 profiles; non-normative reference key service; SComm adapter notes.
- Community registries structured for later IANA migration (no IANA request).
- kramdown-rfc Community Draft rendering under `ietf/`.

### Status

Not an IETF standard. Wire format `"1.0"` is intended for independent implementation experiments.
