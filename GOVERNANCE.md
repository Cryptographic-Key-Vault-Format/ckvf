# Governance

CKVF is the **SComm.AI-maintained** portable vault format: a specification plus reference SDKs published at [scomm-public/ckvf](https://github.com/scomm-public/ckvf). This document describes how this repository evolves. It is not an IETF process.

Specification process details live in [specification/GOVERNANCE.md](specification/GOVERNANCE.md). If that file and this file disagree on spec procedure, **specification/GOVERNANCE.md** wins for specification text. This file wins for repository and SDK policy.

## Principles

1. **SComm.AI maintains the format.** Spec and SDK changes are made by SComm.AI maintainers of this repository. Third parties MAY implement the published format; they do not own the specification.
2. **Normative text is SPEC.md.** Schemas, registries, SDKs, and adapters cannot silently override the core data model.
3. **No IETF claim.** Drafts MUST NOT be described as RFCs, Internet-Drafts of the IETF, or IETF consensus documents until a later, explicit submission occurs under IETF rules.
4. **Do not copy RFC text.** Cite RFCs.
5. **Fail closed.** Security-sensitive ambiguity is resolved toward rejection.
6. **Historical keys matter.** Retire is not delete. Merge MUST NOT invent last-writer-wins.
7. **One wire format.** JS → `vault.ckvf` → Dart (and later languages) MUST interoperate on the same container version.

## Authority

| Artifact | Authority |
| --- | --- |
| [specification/SPEC.md](specification/SPEC.md) | Normative core |
| [registries/](registries/) | Normative for Draft 0.1; must match SPEC Appendix A |
| [schemas/](schemas/) | Machine-checkable mirror of SPEC.md; SPEC.md wins on conflict |
| [test-vectors/](test-vectors/) | Interoperability fixtures; not a license to change SPEC.md |
| [conformance/](conformance/) | Claimable targets; they cannot add secret normative requirements |
| [packages/](packages/) | SemVer implementations of SPEC.md |

**MUST NOT** add Discovery Protocol HTTP clients, MSK signing, or hosted vault sync to this repository. Those belong in Discovery/Pubkey client SDKs that *depend on* CKVF. See [docs/layering.md](docs/layering.md).

Container `"1.0"` MUST NOT be reused with a different meaning.

## Editors and maintainers

Editors and maintainers are listed in [MAINTAINERS.md](MAINTAINERS.md). Spec editors merge specification pull requests. SDK maintainers merge that language’s implementation, provided it does not redefine the format.

## Consensus

SComm.AI maintainers accept or reject changes:

1. Propose a change via pull request ([CONTRIBUTING.md](CONTRIBUTING.md)).
2. Allow a reasonable review window for normative changes.
3. Wire-format incompatible changes MUST bump a container `version` or a clearly versioned field; they MUST NOT reuse `"1.0"` with a different meaning.

SDK releases MAY ship bugs and later fix them under SemVer. They MUST NOT ship a “friendly” encoding that other implementations of this spec cannot read.

## Future IETF path

SComm.AI MAY later publish `draft-<authors>-ckvf` (or a working-group document). Until then IANA is not requested, registries stay in-repo, and draft status MUST remain explicit (not an IETF standard).

## Code of Conduct

Participation is governed by [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) (Contributor Covenant 2.1).
