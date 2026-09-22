# Contributing to the CKVF Dart SDK

Follow the monorepo [CONTRIBUTING.md](../../CONTRIBUTING.md).

1. Read `specification/SPEC.md`. Match the data model exactly.
2. Consume schemas, registries, and a **pinned** test-vector `VERSION` (not `main`). The pin lives in `test-vectors/VERSION`.
3. MUST NOT silently redefine CKVF behavior.
4. MUST NOT import Discovery HTTP or hosted vault APIs.
5. MUST NOT silently rewrite a vault on open.
6. Expose `canReadVersion`, `canWriteVersion`, `supportedAlgorithms`, `supportedKeyEncodings`, and `supportedUnlockMethods`.
7. Fail closed. Prefer SPEC.md error codes.

```bash
dart pub get
dart analyze
dart test
```

Conformance tests load fixtures from `CKVF_TEST_VECTORS` or the repository-root `test-vectors/` directory, pinned to `packages/dart/test-vectors/VERSION`.

Contributions are under [Apache-2.0](LICENSE). Follow the organization Code of Conduct.
