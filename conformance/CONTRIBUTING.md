# Contributing to CKVF conformance

Thank you for helping independent implementations claim the same profiles.

Please follow the organization [CODE_OF_CONDUCT.md](../CODE_OF_CONDUCT.md) and [GOVERNANCE.md](../GOVERNANCE.md).

## Scope

This directory holds:

- profile JSON (required vector ids and claim names);
- the machine-readable result schema.

It does **not** hold SDK code. The first runner is in `packages/js`. Do not add a second runner here unless editors explicitly ask for a language-neutral harness.

## Rules

1. Profile **names** in result JSON MUST match the claim names in the profile files exactly (including “compliant”).
2. New required vector ids MUST already be listed in `test-vectors/manifest.json` (even if `status` is `pending`).
3. Profiles MUST NOT add secret normative requirements that are absent from [specification/SPEC.md](../specification/SPEC.md).
4. Conformance MUST remain possible offline, with no SComm or `pubkey.scomm.ai` dependency.
5. Negative tests (wrong password, tampering, unsupported version) MUST expect fail-closed behavior, not a skip.

## Pull requests

Keep profile edits reviewable. If you rename a claim, update [results/schema.json](results/schema.json) enum values in the same change.

## License

Contributions are offered under the [Apache License 2.0](LICENSE).
