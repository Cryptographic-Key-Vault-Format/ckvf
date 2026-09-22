# Profile: dns-01

**Status:** SComm.AI Draft 0.1 profile  
**Normative for implementations that claim this profile**  
**Not an IETF standard**  
**Not ACME**

This profile proves control of a `dns` Identity by placing a TXT record at a fixed label, **inspired by** ACME DNS-01 ([RFC 8555](https://www.rfc-editor.org/rfc/rfc8555.html)) and **not claiming to be ACME**. It does not issue certificates and does not use ACME account keys, order objects, or ACME directory URLs.

Core data model remains in [SPEC.md](SPEC.md).

## 1. Applicability

- Identity `type` MUST be `"dns"`.
- Canonicalization and `identity_id` MUST follow SPEC.md Section 7.3–7.1.
- Verification method identifier: `"dns-01"`.

## 2. TXT location

Let `canonical-domain` be the Identity `value` after SPEC.md DNS canonicalization (no trailing dot).

The presenter MUST publish a TXT record at:

```
_ckvf-challenge.<canonical-domain>
```

Example: Identity `example.com` → `_ckvf-challenge.example.com`.

Implementations MUST NOT look up a CNAME-walked name in place of the Identity’s canonical domain except as required to resolve the TXT at that FQDN through normal DNS. The **owner name** is `_ckvf-challenge.<canonical-domain>`.

## 3. Challenge object

The challenge input is UTF-8 JCS of a JSON object with **exactly** these members (RFC 8785 key order will sort them):

```json
{
  "expires_at": "<RFC 3339 UTC>",
  "identity_type": "dns",
  "identity_value": "<canonical-domain>",
  "issued_at": "<RFC 3339 UTC>",
  "msk_public_key": "<base64url 32-byte Ed25519 public key>",
  "nonce": "<base64url 32 bytes>",
  "operation": "REPLACE_MSK",
  "protocol": "CKVF",
  "protocol_version": "1.0",
  "verification_method": "dns-01"
}
```

Field rules:

| Field | Requirement |
| --- | --- |
| `protocol` | `"CKVF"` |
| `protocol_version` | `"1.0"` |
| `verification_method` | `"dns-01"` |
| `identity_type` | `"dns"` |
| `identity_value` | Canonical domain |
| `operation` | Bound operation (`ESTABLISH_MSK`, `REPLACE_MSK`, …) |
| `msk_public_key` | Unpadded base64url of the 32-byte public key |
| `nonce` | Unpadded base64url of **256-bit** CSPRNG nonce |
| `issued_at` / `expires_at` | RFC 3339 UTC; `expires_at` MUST be after `issued_at` |

## 4. TXT rdata

```
challenge = base64url(SHA-256(UTF-8 JCS(challenge_object)))
```

The TXT record MUST contain that unpadded base64url string (and MAY be the only TXT string at that owner name during the proof). Verifiers MUST reject padding and MUST reject a digest that does not recompute.

## 5. Validation algorithm

A verifier MUST:

1. Recanonicalize the claimed Identity; compute `identity_id`; reject on failure.
2. Confirm `expires_at` is in the future at verification time. Expiry is REQUIRED. A default lifetime of 1 hour is RECOMMENDED; longer than 24 hours is NOT RECOMMENDED.
3. Confirm `nonce` is 32 decoded bytes and has not been used in the verifier’s replay window (`ERR_REPLAY`).
4. Query **authoritative** DNS for TXT at `_ckvf-challenge.<canonical-domain>`. Stub-resolver-only lookups that an attacker can poison are NOT RECOMMENDED; verifiers SHOULD query the Identity’s authoritative name servers or a resolver with DNSSEC validation when DNSSEC is present.
5. Compare the TXT value to `challenge`. On match, consume the nonce (single-use) and authorize the bound `operation` for that `msk_public_key` only.
6. MUST NOT store the challenge object or nonce in the vault.

## 6. Replay and reuse

- A nonce MUST NOT authorize a second operation.
- A TXT left published after success MUST NOT be accepted later with a new verifier session unless the JCS object (including nonce and expiry) is still valid and the nonce is unused — verifiers SHOULD still consume immediately and SHOULD instruct users to delete the TXT.
- Binding includes `operation` and `msk_public_key`, so a TXT for `ESTABLISH_MSK` MUST NOT satisfy `REPLACE_MSK`.

## 7. REPLACE_MSK

`REPLACE_MSK` REQUIRES a fresh dns-01 proof unless a future recovery profile says otherwise. `ESTABLISH_MSK` MUST fail if a current MSK already exists.

## 8. What this profile does not do

- It is not ACME DNS-01; record names, hashes, and account models differ.
- It does not require DNSSEC, but DNSSEC is RECOMMENDED as an environmental control ([THREAT-MODEL.md](../THREAT-MODEL.md)).
- It does not define HTTP-01 or TLS-ALPN-01 equivalents in v1.0.
- It does not require SComm.

## 9. Privacy

The TXT value is a hash, not the MSK private key. Passive observers may infer that a CKVF ownership proof is in progress for that domain. Users SHOULD remove the TXT after validation.
