# @ckvf/node

Node.js CKVF implementation. Uses `node:crypto` for AES-256-GCM, SHA-256, and Ed25519. Argon2id is provided by `hash-wasm` behind a small adapter so the dependency can be replaced; it is not implemented in TypeScript.

Does not implement cryptographic primitives in TypeScript. Does not log private-key material. Plaintext private keys are returned only from explicit APIs such as `exportPrivateKey`.

Supported CKVF container versions: read `1.0`, write `1.0`.

Apache-2.0
