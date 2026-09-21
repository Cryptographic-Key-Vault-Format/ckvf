/** Minimal PKCS #8 / SPKI builders for Ed25519 test keys. TEST KEY — NEVER USE IN PRODUCTION. */

import { fail } from "./errors.js";

export function buildPkcs8Ed25519(seed: Uint8Array, _publicKey?: Uint8Array): Uint8Array {
  if (seed.length !== 32) fail("ERR_ENCODING", "Ed25519 seed must be 32 bytes");
  const out = new Uint8Array(48);
  out.set([0x30, 0x2e, 0x02, 0x01, 0x00, 0x30, 0x05, 0x06, 0x03, 0x2b, 0x65, 0x70, 0x04, 0x22, 0x04, 0x20]);
  out.set(seed, 16);
  return out;
}

export function buildSpkiEd25519(publicKey: Uint8Array): Uint8Array {
  if (publicKey.length !== 32) fail("ERR_ENCODING", "Ed25519 public key must be 32 bytes");
  const out = new Uint8Array(44);
  out.set([0x30, 0x2a, 0x30, 0x05, 0x06, 0x03, 0x2b, 0x65, 0x70, 0x03, 0x21, 0x00]);
  out.set(publicKey, 12);
  return out;
}

export function spkiFromPkcs8(pkcs8: Uint8Array): Uint8Array {
  if (pkcs8.length === 48 && pkcs8[0] === 0x30 && pkcs8[8] === 0x2b) {
    fail("ERR_ENCODING", "PKCS#8 lacks publicKey; supply canonical SPKI");
  }
  fail("ERR_ENCODING", "unsupported PKCS#8");
}
