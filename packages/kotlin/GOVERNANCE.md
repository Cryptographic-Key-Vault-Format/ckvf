# Governance

This SDK is a SemVer implementation of CKVF SComm.AI Draft 0.1.

- **SPEC.md is source of truth.** This package MUST NOT silently redefine CKVF behavior.
- Schemas, registries, and pinned test vectors are inputs, not a license to change the wire format.
- SComm.AI maintains the format at [scomm-public/ckvf](https://github.com/scomm-public/ckvf).
- Container `"1.0"` MUST NOT be reused with a different meaning.
- Organization process: see the repository-root `GOVERNANCE.md`.
- MUST NOT import Discovery HTTP or hosted vault APIs into this package.
