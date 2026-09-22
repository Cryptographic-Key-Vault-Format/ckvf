# Governance

CKVF is the SComm.AI-maintained portable vault format. This document describes how the draft evolves. It is not an IETF process.

## Principles

1. **SComm.AI maintains the format.** Spec changes are made by SComm.AI maintainers of [scomm-public/ckvf](https://github.com/scomm-public/ckvf).
2. **Normative text is SPEC.md.** Profiles and adapters cannot silently override the core data model.
3. **No IETF claim.** Drafts MUST NOT be described as RFCs, Internet-Drafts of the IETF, or IETF consensus documents until a later, explicit submission occurs under IETF rules.
4. **Do not copy RFC text.** Cite RFCs. The specification license is intended to remain compatible with potential future IETF contribution ([LICENSE](LICENSE)).
5. **Fail closed.** Security-sensitive ambiguity is resolved toward rejection.
6. **Historical keys matter.** Retire is not delete. Merge MUST NOT invent last-writer-wins.

## Documents and authority

| Document | Authority |
| --- | --- |
| [SPEC.md](SPEC.md) | Normative core |
| Registries in SPEC Appendix A | Normative for Draft 0.1 |
| `profiles/email-otp.md`, `profiles/dns-01.md` | Normative *profiles* when an implementation claims that profile |
| `profiles/reference-key-service.md` | Non-normative |
| `profiles/scomm-pubkey-migration.md` | Non-normative adapter guidance |
| [ietf/draft-ckvf-community-00.md](ietf/draft-ckvf-community-00.md) | Rendering of this draft; SPEC.md wins on conflict until an IETF submission exists |

## Editors

Editors are listed in [MAINTAINERS.md](MAINTAINERS.md). Editors:

- merge specification pull requests;
- increment the draft label in [CHANGELOG.md](CHANGELOG.md);
- MUST NOT treat a hosted service as a source of truth over SPEC.md.

## Consensus

SComm.AI maintainers accept or reject changes:

1. Propose a change via pull request ([CONTRIBUTING.md](CONTRIBUTING.md)).
2. Allow a reasonable review window for normative changes.
3. Editors record the decision in the changelog.

Wire-format incompatible changes MUST bump a container `version` or a clearly versioned field; they MUST NOT reuse `"1.0"` with a different meaning.

## Layering vs hosted Discovery

Discovery HTTP and hosted vault sync are SComm products that **use** CKVF. They MUST NOT be merged into this specification. If `pubkey.scomm.ai` differs from CKVF container rules, the **adapter** changes ([profiles/scomm-pubkey-migration.md](profiles/scomm-pubkey-migration.md)).

## Future IETF path

SComm.AI MAY later publish `draft-<authors>-ckvf` (or a working-group document). Until then:

- IANA is not requested ([SPEC.md](SPEC.md) Section 18);
- registries stay in-repo;
- `ietf/` holds kramdown-rfc source that MUST continue to state that this is **not** an IETF standard.

IETF submission would follow IETF intellectual-property and process rules at that time. This file does not pre-assign a working group.

## Code of Conduct

Participation is governed by [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) (Contributor Covenant 2.1).
