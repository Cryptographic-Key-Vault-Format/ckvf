# Contributing to the CKVF Rust SDK

This repository is a **template**. Implementation work is out of scope until editors open it.

When implemented:

1. Read `specification/SPEC.md`. Match the data model exactly.
2. Consume schemas, registries, and a **pinned** test-vector `VERSION` (not `main`).
3. MUST NOT silently redefine CKVF behavior.
4. MUST NOT depend on SComm or `pubkey.scomm.ai`.
5. MUST NOT silently rewrite a vault on open.
6. Expose `can_read_version`, `can_write_version`, `supported_algorithms`, `supported_key_encodings`, and `supported_unlock_methods`.
7. Fail closed. Prefer SPEC.md error codes.

Do not add fake passing tests without an implementation. Contributions are under [Apache-2.0](LICENSE). Follow the organization Code of Conduct.
