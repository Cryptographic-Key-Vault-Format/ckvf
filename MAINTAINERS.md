# Maintainers

CKVF is the SComm.AI-maintained portable vault format. SComm.AI editors of [scomm-public/ckvf](https://github.com/scomm-public/ckvf) own the specification and reference SDKs. See [GOVERNANCE.md](GOVERNANCE.md).

## Roles

| Role | Responsibility |
| --- | --- |
| Spec editor | Normative text in `specification/SPEC.md` and CKVF registries |
| Security editor | Security policy, threat model, coordinated disclosure |
| Schema/registry editor | `schemas` and `registries` alignment with SPEC.md |
| Test-vector editor | Versioned fixtures in `test-vectors` |
| Conformance editor | Profiles and result schema in `conformance` |
| SDK maintainer | A language implementation (`packages/js`, `packages/dart`, `packages/rust`, …) |
| Implementation liaison | Listings in `specification/REFERENCE-IMPLEMENTATIONS.md` |

A person MAY hold multiple roles.

## Current maintainers

SComm.AI Draft 0.1 is published by **SComm.AI CKVF Editors**.

| Name | Role | Contact |
| --- | --- | --- |
| SComm.AI CKVF Editors | Spec editors | GitHub maintainers of [scomm-public/ckvf](https://github.com/scomm-public/ckvf) |

Conduct reports: maintainers listed here, per [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).  
Vulnerability reports: [SECURITY.md](SECURITY.md).

## Adding or removing maintainers

Maintainers are added or removed by the process in [GOVERNANCE.md](GOVERNANCE.md).

## Hosted service vs container spec

`pubkey.scomm.ai` / `discovery.scomm.ai` implement hosted Discovery and opaque vault-record sync. Container bytes and unlock rules are defined here. Hosted HTTP belongs in Discovery/Pubkey clients, not in this repository.
