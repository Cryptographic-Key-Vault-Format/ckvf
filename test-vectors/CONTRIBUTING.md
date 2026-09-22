# Contributing to CKVF test vectors

Thank you for helping independent implementations interoperate.

Please follow the organization CODE_OF_CONDUCT.md and GOVERNANCE.md.

## Scope

This repository holds versioned fixtures. Cryptographic bytes are **generated**, not hand-edited, once the generator exists.

Until vectors are published, you MAY add ids to [manifest.json](manifest.json) with `"status": "pending"` if a conformance profile needs them. Do not invent wire-format fields that SPEC.md does not define.

## Rules

1. Pin discussion to a `VERSION`. Never treat `main` as a stable byte source.
2. Every private key in `keys/` MUST remain a **TEST KEY — NEVER USE IN PRODUCTION**.
3. Do not include production vaults, live passwords, or real identity proofs.
4. Negative tests MUST document the expected SPEC.md error code.
5. Vectors MUST round-trip across implementations: JS → `vault.ckvf` → Dart (same container version).
6. No SComm or `pubkey.scomm.ai` dependency.

## License

Contributions are offered under the [BSD 2-Clause License](LICENSE).
