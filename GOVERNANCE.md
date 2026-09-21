# Governance

CKVF is an implementation-independent community specification and a set of independent implementations. This document describes how this repository evolves. It is not a corporate bylaw and not an IETF process.

Specification process details live in [specification/GOVERNANCE.md](specification/GOVERNANCE.md). If that file and this file disagree on spec procedure, **specification/GOVERNANCE.md** wins for specification text. This file wins for repository and SDK policy.

## Principles

1. **Format over product.** A compliant implementation MUST work without SComm, `pubkey.scomm.ai`, or any other named vendor.
2. **Normative text is SPEC.md.** Schemas, registries, SDKs, and adapters cannot silently override the core data model.
3. **No IETF claim.** Community Drafts MUST NOT be described as RFCs, Internet-Drafts of the IETF, or IETF consensus documents until a later, explicit submission occurs under IETF rules.
4. **Do not copy RFC text.** Cite RFCs.
5. **Fail closed.** Security-sensitive ambiguity is resolved toward rejection, not toward vendor convenience.
6. **Historical keys matter.** Retire is not delete. Merge MUST NOT invent last-writer-wins.
7. **One wire format.** Vendor A JS → `vault.ckvf` → Vendor B Dart → Vendor C Rust MUST interoperate.

## Authority

| Artifact | Authority |
| --- | --- |
| [specification/SPEC.md](specification/SPEC.md) | Normative core |
| [registries/](registries/) | Normative for Draft 0.1; must match SPEC Appendix A |
| [schemas/](schemas/) | Machine-checkable mirror of SPEC.md; SPEC.md wins on conflict |
| [test-vectors/](test-vectors/) | Interoperability fixtures; not a license to change SPEC.md |
| [conformance/](conformance/) | Claimable targets; they cannot add secret normative requirements |
| [packages/](packages/) | Independent SemVer implementations of SPEC.md |

Editors MUST NOT treat a reference implementation as a source of truth over SPEC.md. If `pubkey.scomm.ai` differs from CKVF, the adapter changes.

SComm and `pubkey.scomm.ai` / `discovery.scomm.ai` have no veto. A compliant SDK MUST work without them.

**MUST NOT** add Discovery Protocol HTTP clients, MSK signing, or SComm-hosted vault sync to this repository. Those belong in Discovery/Pubkey client SDKs that *depend on* CKVF. See [docs/layering.md](docs/layering.md).

Container `"1.0"` MUST NOT be reused with a different meaning.

## Editors and maintainers

Editors and maintainers are listed in [MAINTAINERS.md](MAINTAINERS.md). Spec editors merge specification pull requests. SDK maintainers merge that language’s implementation, provided it does not redefine the format.

At least two spec editors SHOULD be able to publish a draft revision.

## Consensus

Until a larger body exists, consensus is **rough consensus of the editors plus open review**:

1. Propose a change via pull request ([CONTRIBUTING.md](CONTRIBUTING.md)).
2. Allow a reasonable review window (SHOULD be at least seven days for normative changes).
3. A persistent technical objection from an independent implementer SHOULD block shipping a silent wire-format change.
4. Wire-format incompatible changes MUST bump a container `version` or a clearly versioned field; they MUST NOT reuse `"1.0"` with a different meaning.

SDK releases MAY ship bugs and later fix them under SemVer. They MUST NOT ship a “friendly” encoding that other implementations cannot read.

## Independence from the originating use case

SComm originated the problem statement. That does not grant SComm a veto. Core spec changes require a general interoperability reason.

## Future IETF path

The community MAY later publish `draft-<authors>-ckvf` (or a working-group document). Until then IANA is not requested, registries stay in-repo, and Community Draft status MUST remain explicit.

## Code of Conduct

Participation is governed by [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) (Contributor Covenant 2.1).
