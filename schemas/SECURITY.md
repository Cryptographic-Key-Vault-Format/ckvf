# Security policy

This document describes how to report vulnerabilities in the CKVF JSON Schemas. Protocol-level discussion lives in the specification repository ([SECURITY-CONSIDERATIONS.md](../specification/SECURITY-CONSIDERATIONS.md), [THREAT-MODEL.md](../specification/THREAT-MODEL.md)).

**These schemas do not replace the normative prose.** A schema bug that causes an implementation to accept invalid vaults, unlock slots, or signed operations is a specification-interoperability defect.

## Supported versions

| Version | Supported |
| --- | --- |
| SComm.AI Draft 0.1 (container `"1.0"`) | Yes |
| Unreleased editor branches | Best effort |

## Reporting a vulnerability

**Do not** open a public GitHub issue for defects that could cause key compromise, authentication bypass, or an interoperability split (for example, a schema that allows extra core fields, padded base64url, or `family` values such as `pqc`).

Report privately to the maintainers listed in [specification/MAINTAINERS.md](../specification/MAINTAINERS.md), using GitHub Security Advisories on this repository when available.

Include:

1. Schema file(s) and the SPEC.md section that should apply.
2. Whether the issue is a schema defect, a fixture error, or an implementation bug in a listed reference implementation.
3. Impact: accepting illegal documents, rejecting legal documents, or weakening fail-closed behavior.
4. A description sufficient to reproduce the *defect* without providing exploit code, malware, or attack scripts targeting third-party systems.

## What to expect

Maintainers SHOULD acknowledge a private report within 14 days and SHOULD provide a status update within 30 days. Schema fixes MUST remain consistent with SPEC.md.

## Non-goals

This policy does not authorize offensive security testing of third-party services. CKVF is a format.
