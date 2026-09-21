import assert from "node:assert/strict";
import { test } from "node:test";
import {
  addTestOpenPgpKey,
  addTestPkcs8Key,
  CkvfError,
  changePassword,
  constructOperation,
  createVault,
  exportPrivateKey,
  findKeysByShortId,
  inspectPublicMetadata,
  mergeVaults,
  openVault,
  replaceMsk,
  retireKey,
  serializeContainer,
  TEST_ARGON2ID,
  verifyOperation,
} from "@ckvf/core";
import { createNodeCrypto } from "./crypto-node.js";
import { dns01ChallengeValue, generateEmailOtpToken } from "./identity-challenge.js";

const PASSWORD = "CKVF-TEST-PASSWORD";
const NOW = "2026-08-17T00:00:00Z";

test("create, inspect, open empty vault", async () => {
  const crypto = createNodeCrypto();
  const created = await createVault({
    identityType: "email",
    identityValue: "Alice@Example.COM",
    password: PASSWORD,
    crypto,
    now: NOW,
    kdf: TEST_ARGON2ID,
  });
  assert.equal(created.payload.identity.value, "alice@example.com");
  assert.equal(created.container.generation, 1);
  assert.equal(created.container.previous_generation_hash, null);
  const json = serializeContainer(created.container);
  const meta = inspectPublicMetadata(json);
  assert.equal(meta.format, "CKVF");
  assert.ok(!JSON.stringify(meta).includes("alice@example.com"));
  const opened = await openVault(json, { password: PASSWORD, crypto });
  assert.equal(opened.payload.keys.length, 0);
  assert.equal(opened.payload.identity.identity_id, created.payload.identity.identity_id);
});

test("wrong password fails closed", async () => {
  const crypto = createNodeCrypto();
  const created = await createVault({
    identityType: "email",
    identityValue: "alice@example.com",
    password: PASSWORD,
    crypto,
    now: NOW,
    kdf: TEST_ARGON2ID,
  });
  await assert.rejects(() => openVault(created.container, { password: "wrong", crypto }), (e: unknown) => {
    assert.equal((e as CkvfError).code, "ERR_WRAP_DECRYPT");
    return true;
  });
});

test("OpenPGP and PKCS#8 keys plus historical retire", async () => {
  const crypto = createNodeCrypto();
  let vault = await createVault({
    identityType: "email",
    identityValue: "alice@example.com",
    password: PASSWORD,
    crypto,
    now: NOW,
    kdf: TEST_ARGON2ID,
  });
  vault = await addTestOpenPgpKey(vault, crypto, NOW);
  vault = await addTestPkcs8Key(vault, crypto, NOW);
  assert.equal(vault.payload.keys.length, 2);
  const pgp = vault.payload.keys.find((k) => k.family === "openpgp")!;
  const smime = vault.payload.keys.find((k) => k.family === "smime")!;
  const pgpBytes = exportPrivateKey(vault, pgp.absolute_key_id);
  vault = await retireKey(vault, crypto, pgp.absolute_key_id, NOW);
  const reopened = await openVault(serializeContainer(vault.container), { password: PASSWORD, crypto });
  const retired = reopened.payload.keys.find((k) => k.absolute_key_id === pgp.absolute_key_id)!;
  assert.equal(retired.status, "retired");
  assert.ok(retired.private_key);
  assert.deepEqual(exportPrivateKey(reopened, pgp.absolute_key_id), pgpBytes);
  assert.equal(smime.status, "active");
});

test("password change does not drop keys", async () => {
  const crypto = createNodeCrypto();
  let vault = await createVault({
    identityType: "dns",
    identityValue: "Example.COM.",
    password: PASSWORD,
    crypto,
    now: NOW,
    kdf: TEST_ARGON2ID,
  });
  vault = await addTestOpenPgpKey(vault, crypto, NOW);
  const after = await changePassword(vault, crypto, PASSWORD, "CKVF-TEST-PASSWORD-2", NOW, TEST_ARGON2ID);
  await assert.rejects(() => openVault(after.container, { password: PASSWORD, crypto }));
  const opened = await openVault(after.container, { password: "CKVF-TEST-PASSWORD-2", crypto });
  assert.equal(opened.payload.keys.length, 1);
});

test("MSK sign and verify, invalid signature fails", async () => {
  const crypto = createNodeCrypto();
  const vault = await createVault({
    identityType: "email",
    identityValue: "alice@example.com",
    password: PASSWORD,
    crypto,
    now: NOW,
    kdf: TEST_ARGON2ID,
  });
  const seed = Buffer.from(vault.payload.msk.current.private_key, "base64url");
  const pub = Buffer.from(vault.payload.msk.current.public_key, "base64url");
  const op = await constructOperation(crypto, {
    operation: "COMMIT_VAULT_GENERATION",
    identity_id: vault.payload.identity.identity_id,
    vault_id: vault.container.vault_id,
    generation: vault.container.generation,
    timestamp: NOW,
    payload: {
      generation: vault.container.generation,
      previous_generation_hash: null,
      generation_hash: vault.container.generation_hash,
    },
    mskPrivateSeed: new Uint8Array(seed),
    mskId: vault.payload.msk.current.msk_id,
  });
  await verifyOperation(crypto, op, new Uint8Array(pub), vault.payload.msk.current.msk_id);
  const mutated = structuredClone(op);
  mutated.signature.value =
    mutated.signature.value.slice(0, -1) + (mutated.signature.value.endsWith("A") ? "B" : "A");
  await assert.rejects(() => verifyOperation(crypto, mutated, new Uint8Array(pub), vault.payload.msk.current.msk_id));
});

test("MSK replacement keeps historical public key only", async () => {
  const crypto = createNodeCrypto();
  const vault = await createVault({
    identityType: "email",
    identityValue: "alice@example.com",
    password: PASSWORD,
    crypto,
    now: NOW,
    kdf: TEST_ARGON2ID,
  });
  const oldId = vault.payload.msk.current.msk_id;
  const replaced = await replaceMsk(vault, crypto, NOW);
  assert.notEqual(replaced.payload.msk.current.msk_id, oldId);
  assert.equal(replaced.payload.msk.history[0]?.msk_id, oldId);
  assert.equal("private_key" in (replaced.payload.msk.history[0] ?? {}), false);
});

test("generation increment and tamper detection", async () => {
  const crypto = createNodeCrypto();
  let vault = await createVault({
    identityType: "email",
    identityValue: "alice@example.com",
    password: PASSWORD,
    crypto,
    now: NOW,
    kdf: TEST_ARGON2ID,
  });
  const gen1 = vault.container.generation_hash;
  vault = await addTestOpenPgpKey(vault, crypto, NOW);
  assert.equal(vault.container.generation, 2);
  assert.equal(vault.container.previous_generation_hash, gen1);
  const tampered = structuredClone(vault.container);
  tampered.ciphertext = tampered.ciphertext.slice(0, -2) + (tampered.ciphertext.endsWith("A") ? "B" : "A");
  await assert.rejects(() => openVault(tampered, { password: PASSWORD, crypto }));
});

test("merge divergent keys", async () => {
  const crypto = createNodeCrypto();
  const base = await createVault({
    identityType: "email",
    identityValue: "alice@example.com",
    password: PASSWORD,
    crypto,
    now: NOW,
    kdf: TEST_ARGON2ID,
  });
  const a = await addTestOpenPgpKey(base, crypto, NOW);
  const b = await addTestPkcs8Key(base, crypto, NOW);
  const merged = await mergeVaults(a, b, crypto, NOW);
  assert.equal(merged.payload.keys.length, 2);
});

test("short key id lookup", async () => {
  const crypto = createNodeCrypto();
  let vault = await createVault({
    identityType: "email",
    identityValue: "alice@example.com",
    password: PASSWORD,
    crypto,
    now: NOW,
    kdf: TEST_ARGON2ID,
  });
  vault = await addTestOpenPgpKey(vault, crypto, NOW);
  const short = vault.payload.keys[0]!.short_key_id;
  assert.match(short, /^[0-9A-F]{4}-[0-9A-F]{4}$/);
  assert.equal(findKeysByShortId(vault, short.toLowerCase()).length, 1);
});

test("identity challenge helpers", () => {
  const token = generateEmailOtpToken();
  assert.ok(token.length >= 22);
  const dns = dns01ChallengeValue({
    identity_value: "example.com",
    operation: "ESTABLISH_MSK",
    msk_public_key: "AA",
    nonce: "BB",
    issued_at: NOW,
    expires_at: "2026-08-17T00:10:00Z",
  });
  assert.equal(dns.name, "_ckvf-challenge.example.com");
  assert.ok(dns.value.length > 20);
});

test("browser crypto opens a Node-created vault and Node reopens a browser-modified vault", async () => {
  const { createBrowserCrypto } = await import("@ckvf/browser");
  const node = createNodeCrypto();
  const browser = createBrowserCrypto();
  let vault = await createVault({
    identityType: "email",
    identityValue: "alice@example.com",
    password: PASSWORD,
    crypto: node,
    now: NOW,
    kdf: TEST_ARGON2ID,
  });
  vault = await addTestOpenPgpKey(vault, node, NOW);
  const fromNode = await openVault(serializeContainer(vault.container), { password: PASSWORD, crypto: browser });
  assert.equal(fromNode.payload.keys.length, 1);
  const modified = await addTestOpenPgpKey(fromNode, browser, NOW);
  const fromBrowser = await openVault(serializeContainer(modified.container), { password: PASSWORD, crypto: node });
  assert.equal(fromBrowser.payload.keys.length, 2);
  const seed = Buffer.from(fromBrowser.payload.msk.current.private_key, "base64url");
  const pub = Buffer.from(fromBrowser.payload.msk.current.public_key, "base64url");
  const op = await constructOperation(browser, {
    operation: "UPDATE_METADATA",
    identity_id: fromBrowser.payload.identity.identity_id,
    vault_id: fromBrowser.container.vault_id,
    generation: fromBrowser.container.generation,
    timestamp: NOW,
    payload: { updated_at: NOW },
    mskPrivateSeed: new Uint8Array(seed),
    mskId: fromBrowser.payload.msk.current.msk_id,
  });
  await verifyOperation(node, op, new Uint8Array(pub), fromBrowser.payload.msk.current.msk_id);
});

test("invalid JSON and unsupported version fail closed", async () => {
  const crypto = createNodeCrypto();
  await assert.rejects(() => openVault("{", { password: PASSWORD, crypto }));
  await assert.rejects(() =>
    openVault(JSON.stringify({ format: "CKVF", version: "9.9" }), { password: PASSWORD, crypto }),
  );
});
