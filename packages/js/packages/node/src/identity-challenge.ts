import { createHash, randomBytes } from "node:crypto";
import { jcs, bytesToBase64url, utf8Encode } from "@ckvf/core";

export function generateEmailOtpToken(): string {
  return bytesToBase64url(new Uint8Array(randomBytes(16)));
}

export function dns01ChallengeValue(input: {
  identity_value: string;
  operation: "ESTABLISH_MSK" | "REPLACE_MSK";
  msk_public_key: string;
  nonce: string;
  issued_at: string;
  expires_at: string;
}): { name: string; value: string } {
  const body = {
    protocol: "CKVF",
    protocol_version: "1.0",
    verification_method: "dns-01",
    identity_type: "dns",
    identity_value: input.identity_value,
    operation: input.operation,
    msk_public_key: input.msk_public_key,
    nonce: input.nonce,
    issued_at: input.issued_at,
    expires_at: input.expires_at,
  };
  const digest = createHash("sha256").update(utf8Encode(jcs(body))).digest();
  return {
    name: `_ckvf-challenge.${input.identity_value}`,
    value: bytesToBase64url(new Uint8Array(digest)),
  };
}
