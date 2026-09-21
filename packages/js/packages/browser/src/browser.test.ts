import assert from "node:assert/strict";
import { test } from "node:test";
import {
  addTestOpenPgpKey,
  base64urlToBytes,
  constructOperation,
  createVault,
  openVault,
  serializeContainer,
  TEST_ARGON2ID,
  verifyOperation,
} from "@ckvf/core";
import { createBrowserCrypto } from "./crypto-browser.js";

const PASSWORD = "CKVF-TEST-PASSWORD";
const NOW = "2026-08-17T00:00:00Z";

test("browser create/open/modify vault", async () => {
  const crypto = createBrowserCrypto();
  let vault = await createVault({
    identityType: "email",
    identityValue: "alice@example.com",
    password: PASSWORD,
    crypto,
    now: NOW,
    kdf: TEST_ARGON2ID,
  });
  vault = await addTestOpenPgpKey(vault, crypto, NOW);
  const opened = await openVault(serializeContainer(vault.container), { password: PASSWORD, crypto });
  assert.equal(opened.payload.keys.length, 1);
  const seed = base64urlToBytes(opened.payload.msk.current.private_key);
  const pub = base64urlToBytes(opened.payload.msk.current.public_key);
  const op = await constructOperation(crypto, {
    operation: "UPDATE_METADATA",
    identity_id: opened.payload.identity.identity_id,
    vault_id: opened.container.vault_id,
    generation: opened.container.generation,
    timestamp: NOW,
    payload: { updated_at: NOW },
    mskPrivateSeed: seed,
    mskId: opened.payload.msk.current.msk_id,
  });
  await verifyOperation(crypto, op, pub, opened.payload.msk.current.msk_id);
});
