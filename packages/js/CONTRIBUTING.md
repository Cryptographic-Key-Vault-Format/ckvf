# Contributing to @ckvf/*

Follow the monorepo [CONTRIBUTING.md](../../CONTRIBUTING.md).

- Specification versions (`draft-0.1`, container `"1.0"`) are independent of this SDK's SemVer.
- Pin `test-vectors/VERSION`. Do not float on `main`.
- Do not silently rewrite a vault to a newer format on open.
- Do not log private keys, passwords, or VEKs.
- Do not add an SComm or `pubkey.scomm.ai` dependency to `@ckvf/core`.
