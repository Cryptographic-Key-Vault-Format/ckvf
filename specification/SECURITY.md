# Security policy

This document describes how to **report vulnerabilities** in the CKVF specification, profiles, and associated documentation in this repository. Protocol-level discussion lives in [SECURITY-CONSIDERATIONS.md](SECURITY-CONSIDERATIONS.md) and [THREAT-MODEL.md](THREAT-MODEL.md).

## Supported versions

| Version | Supported |
| --- | --- |
| Community Draft 0.1 (`draft-0.1`, container `"1.0"`) | Yes |
| Unreleased editor branches | Best effort |
| Informal notes outside this repository | No |

## Reporting a vulnerability

**Do not** open a public GitHub issue for vulnerabilities that could cause key compromise, authentication bypass, or specification ambiguity that independent implementations would likely get wrong.

Report privately to the maintainers listed in [MAINTAINERS.md](MAINTAINERS.md), using GitHub Security Advisories on this repository when available.

Include:

1. Affected document(s) and section numbers.
2. Whether the issue is a specification defect, an example error, or an implementation bug in a listed reference implementation.
3. Impact: confidentiality of vault plaintext, authenticity of operations, availability/DoS, identity takeover, or interoperability split.
4. A description that is sufficient to reproduce the *ambiguity or defect* without providing exploit code, malware, or attack scripts targeting third-party systems.

Reports about `pubkey.scomm.ai` or SComm product behavior that are **not** CKVF specification defects should be sent to that product’s own security contact. See [profiles/scomm-pubkey-migration.md](profiles/scomm-pubkey-migration.md).

## What to expect

Maintainers SHOULD acknowledge a private report within 14 days and SHOULD provide a status update within 30 days. Fixes to the specification are published as a new community-draft revision under [CHANGELOG.md](CHANGELOG.md) and [GOVERNANCE.md](GOVERNANCE.md).

## Non-goals for this policy

This policy does not authorize offensive security testing of third-party services. CKVF is a format. Reference services MAY publish their own coordinated-disclosure process.

## Safe harbor (specification)

Good-faith reports that stay within private disclosure and do not include live attacks on production systems will not be treated as a Code of Conduct violation. Publishing exploit PoCs against running services is out of scope for this community.
