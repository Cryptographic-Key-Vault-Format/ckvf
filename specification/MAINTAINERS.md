# Maintainers

CKVF is the SComm.AI-maintained portable vault format. SComm.AI editors of [scomm-public/ckvf](https://github.com/scomm-public/ckvf) own the specification. See [GOVERNANCE.md](GOVERNANCE.md).

## Roles

| Role | Responsibility |
| --- | --- |
| Spec editor | Normative text in `SPEC.md` and CKVF registries |
| Security editor | `SECURITY-CONSIDERATIONS.md`, `THREAT-MODEL.md`, `SECURITY.md` |
| Profile editor | Documents under `profiles/` |
| Implementation liaison | [REFERENCE-IMPLEMENTATIONS.md](REFERENCE-IMPLEMENTATIONS.md) listings |

A person MAY hold multiple roles. At least two spec editors SHOULD be able to publish a draft revision.

## Current maintainers

SComm.AI Draft 0.1 is published by **SComm.AI CKVF Editors**.

| Name | Role | Contact |
| --- | --- | --- |
| SComm.AI CKVF Editors | Spec editors | GitHub maintainers of [scomm-public/ckvf](https://github.com/scomm-public/ckvf) |

Conduct reports: maintainers of this repository, per [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).  
Vulnerability reports: [SECURITY.md](SECURITY.md).

## Adding or removing maintainers

Maintainers are added or removed by the process in [GOVERNANCE.md](GOVERNANCE.md). Listing a product in [REFERENCE-IMPLEMENTATIONS.md](REFERENCE-IMPLEMENTATIONS.md) does **not** grant maintainership.

## Reference service vs specification

Operators of `pubkey.scomm.ai` MAY contribute, but specification changes that exist only to match one deployment MUST be rejected. Adapters absorb product differences ([profiles/scomm-pubkey-migration.md](profiles/scomm-pubkey-migration.md)).
