import { fail } from "./errors.js";
import { bytesToBase64url, base64urlToBytes } from "./base64url.js";
import type { CkvfCrypto } from "./crypto-provider.js";
import type { KeyEncoding } from "./types.js";
import { canonicalOpenPgpPublicKey } from "./openpgp.js";
import { spkiFromPkcs8 } from "./pkcs8.js";

const HEX = "0123456789ABCDEF";

export async function absoluteKeyId(canonicalPublicKey: Uint8Array, crypto: CkvfCrypto): Promise<string> {
  const digest = await crypto.sha256(canonicalPublicKey);
  return bytesToBase64url(digest);
}

/**
 * Short Key IDs are lookup hints and are not unique identifiers.
 * Applications MUST tolerate collisions. absolute_key_id is authoritative.
 */
export function shortKeyIdFromDigest(digest: Uint8Array): string {
  if (digest.length < 4) fail("ERR_SHORT_KEY_ID", "digest too short");
  const hex = [...digest.subarray(0, 4)].map((b) => HEX[(b >> 4) & 15]! + HEX[b & 15]!).join("");
  return `${hex.slice(0, 4)}-${hex.slice(4, 8)}`;
}

export async function shortKeyId(canonicalPublicKey: Uint8Array, crypto: CkvfCrypto): Promise<string> {
  const digest = await crypto.sha256(canonicalPublicKey);
  return shortKeyIdFromDigest(digest);
}

export async function keyIds(
  canonicalPublicKey: Uint8Array,
  crypto: CkvfCrypto,
): Promise<{ absolute_key_id: string; short_key_id: string }> {
  const digest = await crypto.sha256(canonicalPublicKey);
  return {
    absolute_key_id: bytesToBase64url(digest),
    short_key_id: shortKeyIdFromDigest(digest),
  };
}

export function canonicalPublicKeyBytes(encoding: KeyEncoding, publicKeyB64: string, privateKeyB64?: string | null): Uint8Array {
  const pub = base64urlToBytes(publicKeyB64);
  if (encoding === "openpgp-tsk") {
    return canonicalOpenPgpPublicKey(pub, privateKeyB64 ? base64urlToBytes(privateKeyB64) : undefined);
  }
  if (encoding === "pkcs8" || encoding === "pkcs12") {
    if (looksLikeSpki(pub)) return pub;
    if (privateKeyB64) {
      try {
        return encoding === "pkcs8" ? spkiFromPkcs8(base64urlToBytes(privateKeyB64)) : pub;
      } catch {
        return pub;
      }
    }
    return pub;
  }
  fail("ERR_ENCODING", `unsupported encoding ${encoding}`);
}

function looksLikeSpki(bytes: Uint8Array): boolean {
  return bytes.length >= 2 && bytes[0] === 0x30;
}
