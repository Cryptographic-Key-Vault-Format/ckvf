import { bytesToBase64url, base64urlToBytes } from "./base64url.js";
import { jcsBytes } from "./jcs.js";
import { containerWithoutGenerationHash } from "./aad.js";
import { fail } from "./errors.js";
import type { CkvfCrypto } from "./crypto-provider.js";
import { constantTimeEqual } from "./crypto-provider.js";
import type { VaultContainer } from "./types.js";

export async function computeGenerationHash(container: VaultContainer, crypto: CkvfCrypto): Promise<string> {
  const digest = await crypto.sha256(jcsBytes(containerWithoutGenerationHash(container)));
  return bytesToBase64url(digest);
}

export async function assertGenerationHash(container: VaultContainer, crypto: CkvfCrypto): Promise<void> {
  const expected = await computeGenerationHash(container, crypto);
  const actual = base64urlToBytes(container.generation_hash, 32);
  const exp = base64urlToBytes(expected, 32);
  if (!constantTimeEqual(actual, exp)) fail("ERR_GENERATION_HASH", "generation_hash mismatch");
}

export function detectStaleGeneration(local: VaultContainer, remoteHead: VaultContainer): void {
  if (local.vault_id !== remoteHead.vault_id) fail("ERR_FORMAT", "vault_id mismatch");
  if (local.generation < remoteHead.generation) fail("ERR_STALE_GENERATION", "local generation is behind head");
}

export function detectGenerationConflict(a: VaultContainer, b: VaultContainer): void {
  if (a.vault_id !== b.vault_id) fail("ERR_FORMAT", "vault_id mismatch");
  if (a.generation === b.generation && a.generation_hash !== b.generation_hash) {
    fail("ERR_GENERATION_CONFLICT", "same generation, different generation_hash");
  }
}
