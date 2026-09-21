import { CkvfError } from "./errors.js";

/**
 * RFC 8785 JSON Canonicalization Scheme for CKVF JSON values.
 * Implementations MUST NOT invent a custom canonicalization algorithm.
 */
export function jcs(value: unknown): string {
  try {
    return serialize(value, 0);
  } catch (e) {
    if (e instanceof CkvfError) throw e;
    throw new CkvfError("ERR_JCS", e instanceof Error ? e.message : "canonicalization failed");
  }
}

function serialize(value: unknown, depth: number): string {
  if (depth > 64) throw new CkvfError("ERR_PARSER_LIMIT", "JCS nesting");
  if (value === null) return "null";
  if (value === true) return "true";
  if (value === false) return "false";
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new CkvfError("ERR_JCS", "non-finite number");
    if (Object.is(value, -0)) return "0";
    if (Number.isInteger(value)) return String(value);
    return JSON.stringify(value);
  }
  if (typeof value === "string") return JSON.stringify(value);
  if (Array.isArray(value)) {
    return `[${value.map((v) => serialize(v, depth + 1)).join(",")}]`;
  }
  if (typeof value === "object") {
    const keys = Object.keys(value as object).sort(compareUtf16);
    const body = keys
      .map((k) => `${JSON.stringify(k)}:${serialize((value as Record<string, unknown>)[k], depth + 1)}`)
      .join(",");
    return `{${body}}`;
  }
  throw new CkvfError("ERR_JCS", `unsupported type ${typeof value}`);
}

function compareUtf16(a: string, b: string): number {
  if (a === b) return 0;
  return a < b ? -1 : 1;
}

export function utf8Encode(s: string): Uint8Array {
  return new TextEncoder().encode(s);
}

export function utf8Decode(bytes: Uint8Array): string {
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}

export function jcsBytes(value: unknown): Uint8Array {
  return utf8Encode(jcs(value));
}
