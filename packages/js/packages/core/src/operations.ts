import { bytesToBase64url, base64urlToBytes } from "./base64url.js";
import type { CkvfCrypto } from "./crypto-provider.js";
import { fail } from "./errors.js";
import { jcsBytes } from "./jcs.js";
import {
  CKVF_PROTOCOL,
  CKVF_PROTOCOL_VERSION,
  type OperationName,
  type SignedBody,
  type SignedOperation,
  type VaultPayload,
} from "./types.js";
import { isRfc3339Z } from "./validate.js";

export async function constructOperation(
  crypto: CkvfCrypto,
  input: {
    operation: OperationName;
    identity_id: string;
    vault_id: string;
    generation: number;
    timestamp: string;
    payload: Record<string, unknown>;
    mskPrivateSeed: Uint8Array;
    mskId: string;
    nonce?: Uint8Array;
  },
): Promise<SignedOperation> {
  if (!isRfc3339Z(input.timestamp)) fail("ERR_FORMAT", "timestamp");
  const nonce = input.nonce ?? crypto.randomBytes(32);
  if (nonce.length !== 32) fail("ERR_FORMAT", "nonce must be 32 bytes");
  const payload_hash = bytesToBase64url(await crypto.sha256(jcsBytes(input.payload)));
  const body: SignedBody = {
    protocol: CKVF_PROTOCOL,
    protocol_version: CKVF_PROTOCOL_VERSION,
    operation: input.operation,
    identity_id: input.identity_id,
    vault_id: input.vault_id,
    generation: input.generation,
    nonce: bytesToBase64url(nonce),
    timestamp: input.timestamp,
    payload_hash,
  };
  const sig = await crypto.ed25519Sign(input.mskPrivateSeed, jcsBytes(body));
  return {
    body,
    payload: input.payload,
    signature: {
      algorithm: "Ed25519",
      msk_id: input.mskId,
      value: bytesToBase64url(sig),
    },
  };
}

export async function verifyOperation(
  crypto: CkvfCrypto,
  envelope: SignedOperation,
  publicKey: Uint8Array,
  expectedMskId: string,
  replay?: { seen: Set<string> },
): Promise<void> {
  const { body, payload, signature } = envelope;
  if (body.protocol !== CKVF_PROTOCOL) fail("ERR_OPERATION", "protocol");
  if (body.protocol_version !== CKVF_PROTOCOL_VERSION) fail("ERR_VERSION", "protocol_version");
  const payloadHash = bytesToBase64url(await crypto.sha256(jcsBytes(payload)));
  if (payloadHash !== body.payload_hash) fail("ERR_PAYLOAD_HASH");
  if (signature.algorithm !== "Ed25519") fail("ERR_SIGNATURE", "algorithm");
  const recover = body.operation === "REPLACE_MSK" || body.operation === "ESTABLISH_MSK";
  if (!recover && signature.msk_id !== expectedMskId) fail("ERR_SIGNATURE", "msk_id");
  if (replay) {
    if (replay.seen.has(body.nonce)) fail("ERR_REPLAY");
    replay.seen.add(body.nonce);
  }
  const ok = await crypto.ed25519Verify(publicKey, jcsBytes(body), base64urlToBytes(signature.value, 64));
  if (!ok) fail("ERR_SIGNATURE");
}

export function applyOperation(payload: VaultPayload, envelope: SignedOperation, now: string): VaultPayload {
  const op = envelope.body.operation;
  const p = envelope.payload;
  switch (op) {
    case "RETIRE_KEY":
    case "REVOKE_KEY": {
      const id = String(p.absolute_key_id);
      const status = op === "RETIRE_KEY" ? "retired" : "revoked";
      return {
        ...payload,
        keys: payload.keys.map((k) => (k.absolute_key_id === id ? { ...k, status } : k)),
        metadata: { ...payload.metadata, updated_at: now },
      };
    }
    case "SET_PREFERRED_KEY": {
      const family = p.family as "openpgp" | "smime";
      const purpose = p.purpose as "sign" | "encrypt" | "auth";
      const preferred = { ...payload.preferred_keys, [family]: { ...(payload.preferred_keys[family] ?? {}) } };
      if (p.absolute_key_id === null) delete preferred[family]![purpose];
      else preferred[family]![purpose] = String(p.absolute_key_id);
      return { ...payload, preferred_keys: preferred, metadata: { ...payload.metadata, updated_at: now } };
    }
    case "DELETE_PRIVATE_KEY": {
      const id = String(p.absolute_key_id);
      return {
        ...payload,
        keys: payload.keys.map((k) => (k.absolute_key_id === id ? { ...k, private_key: null } : k)),
        tombstones: [
          ...payload.tombstones,
          {
            absolute_key_id: id,
            deleted_at: now,
            nonce: envelope.body.nonce,
            reason: (p.reason as "user-requested") ?? "user-requested",
          },
        ],
        metadata: { ...payload.metadata, updated_at: now },
      };
    }
    case "ADD_KEY": {
      const key = p.key as VaultPayload["keys"][number];
      if (payload.keys.some((k) => k.absolute_key_id === key.absolute_key_id)) fail("ERR_KEY_ID", "duplicate key");
      return { ...payload, keys: [...payload.keys, key], metadata: { ...payload.metadata, updated_at: now } };
    }
    case "UPDATE_METADATA":
      return { ...payload, metadata: { ...payload.metadata, updated_at: String(p.updated_at ?? now) } };
    default:
      return { ...payload, metadata: { ...payload.metadata, updated_at: now } };
  }
}
