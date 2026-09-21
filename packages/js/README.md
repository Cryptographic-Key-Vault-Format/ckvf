# CKVF JavaScript SDK

Monorepo for the Cryptographic Key Vault Format JavaScript/TypeScript ecosystem.

| Package | Role |
| --- | --- |
| [`@ckvf/core`](packages/core) | Environment-independent types, JCS, identifiers, merge, operations |
| [`@ckvf/node`](packages/node) | Node.js crypto adapter and server APIs |
| [`@ckvf/browser`](packages/browser) | WebCrypto + isolated Argon2id (hash-wasm) |
| [`@ckvf/conformance`](packages/conformance) | Conformance runner |

Specification versions are independent of SDK versions. This SDK 0.1.0 reads and writes CKVF container `1.0` (Community Draft 0.1).

Opening a vault never silently rewrites it to a newer format.

A compliant implementation does **not** require SComm or `pubkey.scomm.ai`.

## Develop

```bash
npm install
npm run build
npm test
npm run generate-vectors
```

Test vectors are pinned by `test-vectors/VERSION`, not `main`.

## License

Apache-2.0
