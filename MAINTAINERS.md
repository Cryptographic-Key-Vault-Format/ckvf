# Maintainers

CKVF is a community specification and a set of independent implementations. No single vendor owns the format. SComm and `pubkey.scomm.ai` are the originating use case and the initial non-normative reference service; they do not hold exclusive editor rights. See [GOVERNANCE.md](GOVERNANCE.md).

## Roles

| Role | Responsibility |
| --- | --- |
| Spec editor | Normative text in `specification/SPEC.md` and community registries |
| Security editor | Security policy, threat model, coordinated disclosure |
| Schema/registry editor | `schemas` and `registries` alignment with SPEC.md |
| Test-vector editor | Versioned fixtures in `test-vectors` |
| Conformance editor | Profiles and result schema in `conformance` |
| SDK maintainer | A language implementation (`packages/js`, `packages/dart`, `packages/rust`, …) |
| Implementation liaison | Listings in `specification/REFERENCE-IMPLEMENTATIONS.md` |

A person MAY hold multiple roles. At least two spec editors SHOULD be able to publish a draft revision.

## Current maintainers

Community Draft 0.1 is published by **CKVF Community Editors**. Named individuals will be added here as the GitHub organization fills the roles.

| Name | Role | Contact |
| --- | --- | --- |
| CKVF Community Editors | Spec editors (interim) | GitHub maintainers of [Cryptographic-Key-Vault-Format](https://github.com/Cryptographic-Key-Vault-Format) |

Conduct reports: maintainers listed here, per [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).  
Vulnerability reports: [SECURITY.md](SECURITY.md).

## Adding or removing maintainers

Maintainers are added or removed by the process in [GOVERNANCE.md](GOVERNANCE.md). Listing a product as a reference implementation does **not** grant maintainership. Publishing an SDK does not grant spec-editor rights.

## Reference service vs specification

Operators of `pubkey.scomm.ai` MAY contribute, but specification changes that exist only to match one deployment MUST be rejected. Adapters absorb product differences.
