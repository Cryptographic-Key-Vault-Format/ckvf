# Maintainers

CKVF is a community specification. No single vendor owns the format. SComm and `pubkey.scomm.ai` are the originating use case and the initial non-normative reference service; they do not hold exclusive editor rights. See [GOVERNANCE.md](GOVERNANCE.md).

## Roles

| Role | Responsibility |
| --- | --- |
| Spec editor | Normative text in `SPEC.md` and community registries |
| Security editor | `SECURITY-CONSIDERATIONS.md`, `THREAT-MODEL.md`, `SECURITY.md` |
| Profile editor | Documents under `profiles/` |
| Implementation liaison | [REFERENCE-IMPLEMENTATIONS.md](REFERENCE-IMPLEMENTATIONS.md) listings |

A person MAY hold multiple roles. At least two spec editors SHOULD be able to publish a draft revision.

## Current maintainers

Community Draft 0.1 is published by **CKVF Community Editors**. Named individuals will be added here as the GitHub organization fills the roles.

| Name | Role | Contact |
| --- | --- | --- |
| CKVF Community Editors | Spec editors (interim) | GitHub maintainers of this repository |

Conduct reports: maintainers of this repository, per [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).  
Vulnerability reports: [SECURITY.md](SECURITY.md).

## Adding or removing maintainers

Maintainers are added or removed by the process in [GOVERNANCE.md](GOVERNANCE.md). Listing a product in [REFERENCE-IMPLEMENTATIONS.md](REFERENCE-IMPLEMENTATIONS.md) does **not** grant maintainership.

## Reference service vs specification

Operators of `pubkey.scomm.ai` MAY contribute, but specification changes that exist only to match one deployment MUST be rejected. Adapters absorb product differences ([profiles/scomm-pubkey-migration.md](profiles/scomm-pubkey-migration.md)).
