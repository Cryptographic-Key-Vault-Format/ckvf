# Profile: reference key service (non-normative)

**Status:** SComm.AI Draft 0.1, **non-normative**  
**Not an IETF standard**  
**Not a required component of CKVF**

This profile describes a *typical* hosted service that enrolls Identities, publishes **current public keys**, and stores **encrypted** CKVF containers. It exists so independent implementers can build a compatible service if they want one. A CKVF implementation MUST work with no network service at all.

The initial deployment of this pattern is `pubkey.scomm.ai` ([REFERENCE-IMPLEMENTATIONS.md](../REFERENCE-IMPLEMENTATIONS.md)). That host is **not** the specification. SComm-specific details belong in [scomm-pubkey-migration.md](scomm-pubkey-migration.md).

## 1. Security invariant

The server MUST NOT need plaintext private keys, MSK private keys, the VEK, or passwords.

When the server does not need to inspect the container, it MUST treat the uploaded object as an **opaque blob**. When it does inspect, it MAY parse the **outer** JSON only: `format`, `version`, `vault_id`, `generation`, hashes, `crypto`, `unlock_slots` metadata, and extension IDs — never decrypt.

## 2. Roles

| Role | Holds |
| --- | --- |
| Client | Password / device KEK, VEK after unlock, MSK seed, family private keys |
| Service | Account or anonymous upload slot, public directory entries, opaque vault blob, consumed ownership-proof handles |

## 3. Identity enrollment

1. Client canonicalizes Identity (`email` or `dns`) locally.
2. Client proves ownership using [email-otp](email-otp.md) or [dns-01](dns-01.md). The service stores only `proof_id`, expiry, and consumption state — not OTPs in the vault (the vault is client-side).
3. Client generates MSK (Ed25519) locally and submits `ESTABLISH_MSK` (signed envelope). Service verifies proof binding and signature; rejects if an MSK already exists for that `identity_id`.
4. Service MAY record the **current MSK public key** in the public directory.

Enrollment MUST succeed conceptually even if the client never uploads a vault (public keys only). Vault upload is OPTIONAL.

## 4. Email OTP (service view)

If the service sends mail, it still MUST NOT turn this specification into a vendor OTP API: any mail transport that meets [email-otp.md](email-otp.md) is acceptable. The service:

- generates the OTP/token;
- rate-limits;
- expires and single-uses;
- binds operation + MSK public key;
- forgets the OTP after consumption or expiry.

## 5. DNS-01 (service view)

The service verifies TXT as in [dns-01.md](dns-01.md) using authoritative DNS. It does not publish the TXT on behalf of the user unless it is also the DNS operator (out of scope).

## 6. MSK register and replace

- **Register:** `ESTABLISH_MSK` + ownership proof.
- **Replace:** `REPLACE_MSK` + **fresh** ownership proof (default). Service updates directory current MSK public key. Service SHOULD retain prior MSK public keys in a directory history if it offers signature-attribution; it MUST NOT accept historical MSK private keys.

## 7. Signed mutations

The service MAY accept signed envelopes ([SPEC.md](../SPEC.md) Section 4.7) for mutations it cares about (`ADD_KEY` public parts, `SET_PREFERRED_KEY`, `COMMIT_VAULT_GENERATION`, …). It MUST:

- verify Ed25519 over JCS(`body`);
- verify `payload_hash`;
- reject nonce reuse in its replay window;
- apply optional clock-skew **as policy** (for example ±5 minutes), not as a CKVF constant;
- ignore or drop `private_key` fields if a client mistakenly sends them in a public mutation — the service MUST NOT persist private keys.

## 8. Public-key publication

The directory publishes **current** public keys and preferred-key pointers by `absolute_key_id`. It MUST NOT publish:

- private keys;
- historical private keys;
- VEK or wrap keys;
- email-otp / dns-01 secrets.

Historical **public** keys MAY be published if the user opted in.

## 9. Encrypted vault upload and download

- **Upload:** client sends the outer CKVF JSON (or a binary encoding of the same bytes). Service stores it keyed by `identity_id` and/or `vault_id`.
- **Download:** client receives the blob and decrypts locally.
- Service MUST NOT attempt password hashing or Argon2 on behalf of the client.

## 10. Generation conflict

On upload, the service MAY inspect `generation` and `previous_generation_hash`:

- If the stored head’s `generation_hash` equals the upload’s `previous_generation_hash` and `generation` is stored+1, accept.
- If the upload matches the stored head, treat as idempotent.
- Otherwise return a conflict (`ERR_GENERATION_CONFLICT`) including the stored outer container or its hashes so the client can merge **locally** and submit `MERGE_VAULT` + a new generation.

The service MUST NOT merge decrypted payloads. The service MUST NOT implement silent last-writer-wins.

## 11. Sync

Sync is pull blob → unlock → mutate → commit generation → push blob, with conflict as above. Multiple devices are expected. The service is not the source of truth for plaintext.

## 12. Device enrollment

`ADD_DEVICE` / `REMOVE_DEVICE` change unlock slots inside the container. The service sees slot metadata in the outer JSON (AAD includes slots) but MUST NOT hold device KEKs. Lost-device removal is a client-signed new generation.

## 13. Conformance

Implementing this profile is OPTIONAL. Implementing it incorrectly (server-side decryption, required SComm SDK, PQ-as-family) does not change CKVF; the service is simply non-compliant as a *reference service*.
