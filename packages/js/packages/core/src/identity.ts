import { fail } from "./errors.js";
import { bytesToBase64url } from "./base64url.js";
import { utf8Encode } from "./jcs.js";
import type { CkvfCrypto } from "./crypto-provider.js";
import type { Identity, IdentityType } from "./types.js";
import { DEFAULT_LIMITS } from "./limits.js";

const WHITE_SPACE = /[\s\u00A0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000]+/g;

export async function identityId(type: IdentityType, canonicalValue: string, crypto: CkvfCrypto): Promise<string> {
  const digest = await crypto.sha256(utf8Encode(`${type}:${canonicalValue}`));
  return bytesToBase64url(digest);
}

export function canonicalizeEmail(raw: string): string {
  const nfc = raw.normalize("NFC").replace(/^\s+|\s+$/g, "");
  const at = nfc.lastIndexOf("@");
  if (at <= 0 || at === nfc.length - 1) fail("ERR_IDENTITY_CANON", "email must contain a non-empty local-part and domain");
  const local = nfc.slice(0, at);
  let domain = nfc.slice(at + 1);
  if (/[^\x00-\x7F]/.test(local)) fail("ERR_IDENTITY_CANON", "v1.0 email local-part must be ASCII");
  if (utf8Encode(nfc).length > DEFAULT_LIMITS.maxIdentityBytes) fail("ERR_PARSER_LIMIT", "identity too long");
  const localLower = local.replace(/[A-Z]/g, (c) => c.toLowerCase());
  domain = canonicalizeDns(domain);
  return `${localLower}@${domain}`;
}

export function canonicalizeDns(raw: string): string {
  let s = raw.normalize("NFC").replace(/^\s+|\s+$/g, "");
  s = s.replace(/\.+$/g, "");
  if (!s) fail("ERR_IDENTITY_CANON", "empty DNS name");
  if (utf8Encode(s).length > DEFAULT_LIMITS.maxIdentityBytes) fail("ERR_PARSER_LIMIT", "identity too long");
  const labels = s.split(".");
  const ascii = labels
    .map((label) => {
      if (!label) fail("ERR_IDENTITY_CANON", "empty DNS label");
      if (/^[\x00-\x7F]+$/.test(label)) return label.toLowerCase();
      return "xn--" + punycodeEncode(label.normalize("NFC").toLowerCase());
    })
    .join(".");
  if (ascii.endsWith(".")) fail("ERR_IDENTITY_CANON", "trailing dot after IDNA");
  return ascii;
}

export async function makeIdentity(
  type: IdentityType,
  rawValue: string,
  crypto: CkvfCrypto,
): Promise<Identity> {
  const value = type === "email" ? canonicalizeEmail(rawValue) : canonicalizeDns(rawValue);
  const id = await identityId(type, value, crypto);
  return { type, value, identity_id: id };
}

export async function assertIdentity(identity: Identity, crypto: CkvfCrypto): Promise<void> {
  const expectedValue = identity.type === "email" ? canonicalizeEmail(identity.value) : canonicalizeDns(identity.value);
  if (expectedValue !== identity.value) fail("ERR_IDENTITY_CANON", "identity.value is not canonical");
  const expected = await identityId(identity.type, identity.value, crypto);
  if (expected !== identity.identity_id) fail("ERR_IDENTITY_ID", "identity_id mismatch");
}

// RFC 3492 Punycode encode (Bootstring) for IDNA labels.
function punycodeEncode(input: string): string {
  const n0 = 128;
  const bias0 = 72;
  const damp = 700;
  const tmin = 1;
  const tmax = 26;
  const skew = 38;
  const base = 36;
  const delimiter = "-";

  const output: string[] = [];
  const inputCPs = [...input].map((c) => c.codePointAt(0)!);
  const basic = inputCPs.filter((c) => c < 128);
  for (const c of basic) output.push(String.fromCharCode(c));
  let handled = basic.length;
  if (handled > 0) output.push(delimiter);
  let n = n0;
  let delta = 0;
  let bias = bias0;
  while (handled < inputCPs.length) {
    let m = Infinity;
    for (const c of inputCPs) if (c >= n && c < m) m = c;
    delta += (m - n) * (handled + 1);
    n = m;
    for (const c of inputCPs) {
      if (c < n) {
        delta++;
      } else if (c === n) {
        let q = delta;
        for (let k = base; ; k += base) {
          const t = k <= bias ? tmin : k >= bias + tmax ? tmax : k - bias;
          if (q < t) break;
          output.push(encodeDigit(t + ((q - t) % (base - t))));
          q = Math.floor((q - t) / (base - t));
        }
        output.push(encodeDigit(q));
        bias = adapt(delta, handled + 1, handled === basic.length);
        delta = 0;
        handled++;
      }
    }
    delta++;
    n++;
  }
  return output.join("");

  function encodeDigit(d: number): string {
    return String.fromCharCode(d + 22 + 75 * (d < 26 ? 1 : 0));
  }
  function adapt(deltaIn: number, numPoints: number, firstTime: boolean): number {
    let d = firstTime ? Math.floor(deltaIn / damp) : deltaIn >> 1;
    d += Math.floor(d / numPoints);
    let k = 0;
    while (d > ((base - tmin) * tmax) / 2) {
      d = Math.floor(d / (base - tmin));
      k += base;
    }
    return k + Math.floor(((base - tmin + 1) * d) / (d + skew));
  }
}

void WHITE_SPACE;
