# @ckvf/browser

Browser CKVF implementation.

- AES-256-GCM, SHA-256, and Ed25519 use WebCrypto.
- Argon2id uses `hash-wasm` behind a small adapter so the dependency can be replaced.
- No handwritten AES, SHA-256, or Ed25519.
- Private-key material is not logged.

API: `createVault`, `openVault`, `lockVault`, `importPrivateKey`, `exportPrivateKey`, `addKey` (via import), `retireKey`, `getKey`, `findKeysByShortId`, `mergeVaults`, `changePassword`, `addUnlockSlot`, `removeUnlockSlot`, `signOperation`, `verifyOperation`.

Apache-2.0
