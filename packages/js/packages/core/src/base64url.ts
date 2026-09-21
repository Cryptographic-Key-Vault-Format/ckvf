import { CkvfError } from "./errors.js";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

export function bytesToBase64url(bytes: Uint8Array): string {
  let out = "";
  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i]!;
    const b = i + 1 < bytes.length ? bytes[i + 1]! : 0;
    const c = i + 2 < bytes.length ? bytes[i + 2]! : 0;
    const triple = (a << 16) | (b << 8) | c;
    out += ALPHABET[(triple >> 18) & 63];
    out += ALPHABET[(triple >> 12) & 63];
    if (i + 1 < bytes.length) out += ALPHABET[(triple >> 6) & 63];
    if (i + 2 < bytes.length) out += ALPHABET[triple & 63];
  }
  return out;
}

export function base64urlToBytes(s: string, expectedLength?: number): Uint8Array {
  if (!/^[A-Za-z0-9_-]*$/.test(s) || s.includes("=")) {
    throw new CkvfError("ERR_BASE64", "padded or non-base64url encoding");
  }
  if (s.length % 4 === 1) {
    throw new CkvfError("ERR_BASE64", "invalid base64url length");
  }
  const pad = (4 - (s.length % 4)) % 4;
  const table = new Uint8Array(128).fill(255);
  for (let i = 0; i < ALPHABET.length; i++) table[ALPHABET.charCodeAt(i)] = i;
  const len = Math.floor((s.length * 3) / 4);
  const out = new Uint8Array(len);
  let o = 0;
  for (let i = 0; i < s.length; i += 4) {
    const c0 = table[s.charCodeAt(i)] ?? 255;
    const c1 = table[s.charCodeAt(i + 1)] ?? 255;
    const c2 = i + 2 < s.length ? (table[s.charCodeAt(i + 2)] ?? 255) : 0;
    const c3 = i + 3 < s.length ? (table[s.charCodeAt(i + 3)] ?? 255) : 0;
    if (c0 === 255 || c1 === 255 || (i + 2 < s.length && c2 === 255) || (i + 3 < s.length && c3 === 255)) {
      throw new CkvfError("ERR_BASE64", "invalid base64url character");
    }
    const triple = (c0 << 18) | (c1 << 12) | (c2 << 6) | c3;
    if (o < len) out[o++] = (triple >> 16) & 255;
    if (o < len && i + 2 < s.length) out[o++] = (triple >> 8) & 255;
    if (o < len && i + 3 < s.length) out[o++] = triple & 255;
  }
  void pad;
  if (expectedLength !== undefined && out.length !== expectedLength) {
    throw new CkvfError("ERR_BASE64", `expected ${expectedLength} bytes, got ${out.length}`);
  }
  return out;
}

export function assertBase64urlSize(s: string, n: number): Uint8Array {
  return base64urlToBytes(s, n);
}
