# CKVF Dart SDK

Cryptographic Key Vault Format (CKVF) **Community Draft 0.1**. This is **not** an IETF standard.

Package [`ckvf`](https://pub.dev/packages/ckvf) `0.1.0` reads and writes CKVF container `"1.0"`. Specification labels (`draft-0.1`) and container versions (`"1.0"`) are versioned separately from this SDK's SemVer.

SComm and `pubkey.scomm.ai` are the originating use case and initial non-normative reference only. This SDK **MUST NOT** depend on SComm.

## Contract

- Consumes the same **specification**, **schemas**, **registries**, and **test-vectors** as every other CKVF implementation.
- **MUST NOT** silently redefine CKVF behavior to match Dart conventions or a vendor product.
- Pin **test-vector `VERSION`** (currently `0.1.0`), **not** `main`.
- MUST expose `canReadVersion`, `canWriteVersion`, `supportedAlgorithms`, `supportedKeyEncodings`, and `supportedUnlockMethods`.
- MUST **never** silently rewrite a vault to a newer container version on open. Upgrade is an explicit write.
- Interoperability: Vendor A JS → `vault.ckvf` → Vendor B Dart → Vendor C Rust.

## Install

```yaml
dependencies:
  ckvf: ^0.1.0
```

Until the package is on pub.dev, depend on git:

```yaml
dependencies:
  ckvf:
    git:
      url: https://github.com/Cryptographic-Key-Vault-Format/ckvf.git
      path: packages/dart
      ref: v0.1.0
```

## Quick start

```dart
import 'package:ckvf/ckvf.dart';

final unlocked = await Ckvf.create(
  identity: {'type': 'email', 'value': 'alice@example.com'},
  password: 'correct horse battery staple',
);
final json = serializeContainer(unlocked.container);
final opened = await Ckvf.decrypt(container: json, password: 'correct horse battery staple');
```

Opening a vault never silently rewrites it to a newer format.

## Tests

```bash
dart test
```

Conformance tests load fixtures from `CKVF_TEST_VECTORS` or the repository-root `test-vectors/` directory, pinned to `packages/dart/test-vectors/VERSION`.

## License

[Apache-2.0](LICENSE)
