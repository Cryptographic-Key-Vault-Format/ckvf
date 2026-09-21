/**
 * Generate deterministic-enough CKVF test vectors.
 * All private keys are TEST KEY — NEVER USE IN PRODUCTION.
 */
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import {
  addTestOpenPgpKey,
  addTestPkcs8Key,
  CkvfError,
  canonicalizeDns,
  canonicalizeEmail,
  constructOperation,
  createVault,
  identityId,
  jcs,
  mergeVaults,
  openVault,
  replaceMsk,
  retireKey,
  serializeContainer,
  TEST_ARGON2ID,
  type VaultContainer,
} from "@ckvf/core";
import { createNodeCrypto } from "./crypto-node.js";
import { dns01ChallengeValue } from "./identity-challenge.js";

const PASSWORD = "CKVF-TEST-PASSWORD";
const NOW = "2026-08-17T00:00:00Z";
const BANNER = "TEST KEY — NEVER USE IN PRODUCTION";

function findTestVectors(start: string): string {
  let dir = start;
  for (let i = 0; i < 8; i++) {
    const candidate = path.join(dir, "test-vectors");
    if (existsSync(path.join(candidate, "VERSION"))) return candidate;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  throw new Error("test-vectors/ not found from " + start);
}

const here = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(findTestVectors(here), "vectors");

type Vector = {
  id: string;
  description: string;
  expect: "pass" | "fail";
  error?: string;
  banner: string;
  [k: string]: unknown;
};

async function main(): Promise<void> {
  await mkdir(outDir, { recursive: true });
  const crypto = createNodeCrypto();
  const vectors: Vector[] = [];

  const emailVault = await createVault({
    identityType: "email",
    identityValue: "alice@example.com",
    password: PASSWORD,
    crypto,
    now: NOW,
    kdf: TEST_ARGON2ID,
  });

  vectors.push({
    id: "empty-vault",
    description: "Empty encrypted vault for an email identity",
    expect: "pass",
    banner: BANNER,
    password: PASSWORD,
    container: emailVault.container,
    identity: emailVault.payload.identity,
  });

  vectors.push({
    id: "email-identity",
    description: "Email canonicalization and identity_id",
    expect: "pass",
    banner: BANNER,
    cases: [
      { input: "User@Example.COM", canonical: canonicalizeEmail("User@Example.COM") },
      { input: "  alice@EXAMPLE.com  ", canonical: canonicalizeEmail("  alice@EXAMPLE.com  ") },
    ],
    identity_id: await identityId("email", "user@example.com", crypto),
  });

  vectors.push({
    id: "dns-identity",
    description: "DNS canonicalization, identity_id, and dns-01 challenge name",
    expect: "pass",
    banner: BANNER,
    cases: [
      { input: "Example.COM.", canonical: canonicalizeDns("Example.COM.") },
      { input: "example.com...", canonical: canonicalizeDns("example.com...") },
    ],
    identity_id: await identityId("dns", "example.com", crypto),
    challenge: dns01ChallengeValue({
      identity_value: "example.com",
      operation: "ESTABLISH_MSK",
      msk_public_key: emailVault.payload.msk.current.public_key,
      nonce: emailVault.container.vault_id,
      issued_at: NOW,
      expires_at: "2026-08-17T00:10:00Z",
    }),
  });

  let onePgp = await addTestOpenPgpKey(emailVault, crypto, NOW);
  vectors.push({
    id: "single-openpgp-key",
    description: "Vault with one OpenPGP transferable secret key",
    expect: "pass",
    banner: BANNER,
    password: PASSWORD,
    container: onePgp.container,
    keys: onePgp.payload.keys,
  });

  let multiPgp = await addTestOpenPgpKey(onePgp, crypto, NOW);
  vectors.push({
    id: "multiple-openpgp-keys",
    description: "Vault with two OpenPGP keys",
    expect: "pass",
    banner: BANNER,
    password: PASSWORD,
    container: multiPgp.container,
    key_count: multiPgp.payload.keys.length,
  });

  const dnsVault = await createVault({
    identityType: "dns",
    identityValue: "example.com",
    password: PASSWORD,
    crypto,
    now: NOW,
    kdf: TEST_ARGON2ID,
  });
  const smimeVault = await addTestPkcs8Key(dnsVault, crypto, NOW);
  vectors.push({
    id: "smime-pkcs8-key",
    description: "S/MIME PKCS#8 private key stored losslessly",
    expect: "pass",
    banner: BANNER,
    password: PASSWORD,
    container: smimeVault.container,
    keys: smimeVault.payload.keys,
  });

  let mixed = await addTestPkcs8Key(onePgp, crypto, NOW);
  vectors.push({
    id: "mixed-openpgp-smime",
    description: "OpenPGP and S/MIME keys in one vault",
    expect: "pass",
    banner: BANNER,
    password: PASSWORD,
    container: mixed.container,
    families: mixed.payload.keys.map((k) => k.family),
  });

  const historical = await retireKey(mixed, crypto, mixed.payload.keys[0]!.absolute_key_id, NOW);
  vectors.push({
    id: "historical-private-keys",
    description: "Retired key still retains private_key for historical decryption",
    expect: "pass",
    banner: BANNER,
    password: PASSWORD,
    container: historical.container,
    statuses: historical.payload.keys.map((k) => ({ id: k.absolute_key_id, status: k.status, has_private: k.private_key !== null })),
  });

  vectors.push({
    id: "password-unlock",
    description: "Correct password unlocks the empty vault",
    expect: "pass",
    banner: BANNER,
    password: PASSWORD,
    container: emailVault.container,
  });

  vectors.push({
    id: "wrong-password",
    description: "Incorrect password fails closed",
    expect: "fail",
    error: "ERR_WRAP_DECRYPT",
    banner: BANNER,
    password: "not-the-password",
    container: emailVault.container,
  });

  const tamperedCt = structuredClone(emailVault.container) as VaultContainer;
  tamperedCt.ciphertext = flipLast(tamperedCt.ciphertext);
  vectors.push({
    id: "tampered-ciphertext",
    description: "Modified ciphertext must fail AEAD",
    expect: "fail",
    error: "ERR_AEAD_DECRYPT",
    banner: BANNER,
    password: PASSWORD,
    container: tamperedCt,
  });

  const tamperedHdr = structuredClone(emailVault.container) as VaultContainer;
  if (tamperedHdr.unlock_slots[0]) {
    tamperedHdr.unlock_slots[0] = { ...tamperedHdr.unlock_slots[0], created_at: "2026-08-17T00:00:01Z" };
  }
  vectors.push({
    id: "tampered-authenticated-header",
    description: "Modified AAD fields must fail generation hash or AEAD",
    expect: "fail",
    error: "ERR_GENERATION_HASH",
    banner: BANNER,
    password: PASSWORD,
    container: tamperedHdr,
  });

  const badTag = structuredClone(emailVault.container) as VaultContainer;
  badTag.tag = flipLast(badTag.tag);
  vectors.push({
    id: "invalid-aead-tag",
    description: "Invalid GCM tag fails closed",
    expect: "fail",
    error: "ERR_AEAD_DECRYPT",
    banner: BANNER,
    password: PASSWORD,
    container: badTag,
  });

  vectors.push({
    id: "invalid-json",
    description: "Malformed JSON fails closed",
    expect: "fail",
    error: "ERR_JSON",
    banner: BANNER,
    raw: "{not json",
  });

  vectors.push({
    id: "unsupported-version",
    description: "Unsupported container version fails closed",
    expect: "fail",
    error: "ERR_VERSION",
    banner: BANNER,
    container: { ...emailVault.container, version: "9.9" },
  });

  const optionalExt = structuredClone(emailVault.container) as VaultContainer;
  optionalExt.extensions = [{ id: "exp:unknown-optional", critical: false, data: { note: "ignore" } }];
  vectors.push({
    id: "unknown-optional-extension",
    description: "Unknown non-critical extension may be preserved; unlocking this vector's ciphertext still uses original AAD so open of a mutated header must fail unless resealed",
    expect: "fail",
    error: "ERR_GENERATION_HASH",
    banner: BANNER,
    password: PASSWORD,
    container: optionalExt,
    note: "Header mutation without reseal must fail closed. Implementations that understand they must preserve extensions do so on unlock/lock cycles they control.",
  });

  const criticalExt = structuredClone(emailVault.container) as VaultContainer;
  criticalExt.critical_extensions = [{ id: "exp:unknown-critical", critical: true, data: {} }];
  vectors.push({
    id: "unknown-critical-extension",
    description: "Unknown critical extension must reject security-sensitive processing",
    expect: "fail",
    error: "ERR_CRITICAL_EXTENSION",
    banner: BANNER,
    password: PASSWORD,
    container: criticalExt,
  });

  const collision = findShortIdCollision();
  vectors.push({
    id: "short-key-id-collision",
    description: "Short Key IDs are lookup hints and are not unique identifiers",
    expect: "pass",
    banner: BANNER,
    short_key_id: collision.short,
    keys: collision.keys,
    note: "Applications MUST try all matching compatible keys. absolute_key_id is authoritative.",
  });

  const op = await constructOperation(crypto, {
    operation: "COMMIT_VAULT_GENERATION",
    identity_id: emailVault.payload.identity.identity_id,
    vault_id: emailVault.container.vault_id,
    generation: 1,
    timestamp: NOW,
    payload: {
      generation: 1,
      previous_generation_hash: null,
      generation_hash: emailVault.container.generation_hash,
    },
    mskPrivateSeed: Buffer.from(emailVault.payload.msk.current.private_key, "base64url"),
    mskId: emailVault.payload.msk.current.msk_id,
  });
  vectors.push({
    id: "msk-signing",
    description: "Valid MSK signature over JCS(body)",
    expect: "pass",
    banner: BANNER,
    envelope: op,
    msk_public_key: emailVault.payload.msk.current.public_key,
    msk_id: emailVault.payload.msk.current.msk_id,
  });

  const badOp = structuredClone(op);
  badOp.signature.value = flipLast(badOp.signature.value);
  vectors.push({
    id: "invalid-msk-signature",
    description: "Invalid MSK signature fails closed",
    expect: "fail",
    error: "ERR_SIGNATURE",
    banner: BANNER,
    envelope: badOp,
    msk_public_key: emailVault.payload.msk.current.public_key,
    msk_id: emailVault.payload.msk.current.msk_id,
  });

  const replaced = await replaceMsk(emailVault, crypto, NOW);
  vectors.push({
    id: "msk-replacement",
    description: "MSK replacement retains historical public key and drops old private key",
    expect: "pass",
    banner: BANNER,
    password: PASSWORD,
    container: replaced.container,
    history: replaced.payload.msk.history,
    current_msk_id: replaced.payload.msk.current.msk_id,
  });

  vectors.push({
    id: "generation-increment",
    description: "Adding a key increments generation and links previous_generation_hash",
    expect: "pass",
    banner: BANNER,
    password: PASSWORD,
    parent: { generation: 1, generation_hash: emailVault.container.generation_hash },
    child: {
      generation: onePgp.container.generation,
      previous_generation_hash: onePgp.container.previous_generation_hash,
      generation_hash: onePgp.container.generation_hash,
    },
    container: onePgp.container,
  });

  vectors.push({
    id: "stale-generation",
    description: "A writer on generation 1 must not silently overwrite generation 2",
    expect: "fail",
    error: "ERR_STALE_GENERATION",
    banner: BANNER,
    head: { generation: onePgp.container.generation, generation_hash: onePgp.container.generation_hash },
    stale: { generation: emailVault.container.generation, generation_hash: emailVault.container.generation_hash },
  });

  const forkA = await addTestOpenPgpKey(emailVault, crypto, NOW);
  const forkB = await addTestPkcs8Key(emailVault, crypto, NOW);
  const merged = await mergeVaults(forkA, forkB, crypto, NOW);
  vectors.push({
    id: "merge",
    description: "Divergent key sets union on merge",
    expect: "pass",
    banner: BANNER,
    password: PASSWORD,
    container: merged.container,
    key_count: merged.payload.keys.length,
  });

  vectors.push({
    id: "merge-conflict",
    description: "Different current MSK is a hard merge conflict",
    expect: "fail",
    error: "ERR_MERGE_MSK",
    banner: BANNER,
    a_msk: emailVault.payload.msk.current.msk_id,
    b_msk: replaced.payload.msk.current.msk_id,
  });

  const corrupted = structuredClone(onePgp.container) as VaultContainer;
  vectors.push({
    id: "corrupted-private-key",
    description: "A payload whose private_key bytes are not a valid native encoding must be usable as opaque storage; applications SHOULD fail family-native parse",
    expect: "pass",
    banner: BANNER,
    password: PASSWORD,
    container: corrupted,
    note: "CKVF stores native encodings losslessly and does not re-validate OpenPGP self-signatures.",
  });

  for (const v of vectors) {
    await writeFile(path.join(outDir, `${v.id}.json`), `${JSON.stringify(v, null, 2)}\n`, "utf8");
  }

  const manifest = {
    version: "0.1.0",
    specification: "draft-0.1",
    banner: BANNER,
    kdf: TEST_ARGON2ID,
    vectors: vectors.map((v) => ({ id: v.id, expect: v.expect, error: v.error ?? null })),
  };
  await writeFile(path.resolve(outDir, "../manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

  // sanity: password unlock vector actually opens
  await openVault(emailVault.container, { password: PASSWORD, crypto });
  let failed = false;
  try {
    await openVault(emailVault.container, { password: "nope", crypto });
  } catch (e) {
    failed = e instanceof CkvfError;
  }
  if (!failed) throw new Error("wrong-password sanity failed");
  console.log(`wrote ${vectors.length} vectors to ${outDir}`);
}

function flipLast(s: string): string {
  if (s.length < 2) return s === "A" ? "B" : "A";
  const i = Math.min(4, s.length - 1);
  const ch = s[i]!;
  const next = ch === "A" ? "B" : "A";
  return s.slice(0, i) + next + s.slice(i + 1);
}

function findShortIdCollision(): { short: string; keys: { canonical_public_key_hex: string; absolute_key_id: string; short_key_id: string }[] } {
  const seen = new Map<string, Buffer>();
  for (let i = 0; i < 200_000; i++) {
    const canonical = Buffer.from(`CKVF-TEST-KEY-${i}`, "utf8");
    const digest = createHash("sha256").update(canonical).digest();
    const short = digest.subarray(0, 4).toString("hex").toUpperCase();
    const formatted = `${short.slice(0, 4)}-${short.slice(4)}`;
    const prev = seen.get(short);
    if (prev && !prev.equals(canonical)) {
      const abs = (buf: Buffer) => createHash("sha256").update(buf).digest("base64url");
      return {
        short: formatted,
        keys: [
          { canonical_public_key_hex: prev.toString("hex"), absolute_key_id: abs(prev), short_key_id: formatted },
          { canonical_public_key_hex: canonical.toString("hex"), absolute_key_id: abs(canonical), short_key_id: formatted },
        ],
      };
    }
    seen.set(short, canonical);
  }
  throw new Error("failed to find short key id collision");
}

await main();
