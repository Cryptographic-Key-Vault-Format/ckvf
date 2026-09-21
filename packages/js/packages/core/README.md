# @ckvf/core

Environment-independent Cryptographic Key Vault Format (CKVF) library.

This package contains types, RFC 8785 canonicalization, identity and key identifiers, merge logic, version negotiation, registries, serialization, and operation construction.

It does **not** include filesystem, DOM, or Node-specific APIs. Cryptographic primitives are supplied through a `CkvfCrypto` adapter implemented by `@ckvf/node` or `@ckvf/browser`.

CKVF specification: Community Draft 0.1 (container version `1.0`). This package is not an IETF standard.

## Capabilities

```ts
canReadVersion("1.0");  // true
canWriteVersion("1.0"); // true
supportedAlgorithms();
supportedKeyEncodings();
supportedUnlockMethods();
```

Opening a vault never silently rewrites it to a newer format.

## License

Apache-2.0
