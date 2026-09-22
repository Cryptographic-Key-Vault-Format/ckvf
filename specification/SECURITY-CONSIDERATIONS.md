# CKVF security considerations

This document expands [SPEC.md](SPEC.md) Section 16. It is part of SComm.AI Draft 0.1 and is **not** an IETF RFC security-considerations section, though it is written so that a future Internet-Draft can reuse the structure.

Normative requirements remain those stated in SPEC.md. This file explains *why* they exist and which problems CKVF does not solve.

## 1. Trust boundaries

| Boundary | CKVF assumes |
| --- | --- |
| Vault file / ciphertext blob | Attacker may read, copy, roll back, and mix generations |
| Unlock password / device KEK | Attacker may guess offline if they have the file |
| Sync / directory service | Attacker-controlled or honest-but-curious; no VEK |
| Identity channel (email, DNS) | May be intercepted or taken over; profiles mitigate, not eliminate |
| Imported OpenPGP / S/MIME blobs | May be malformed or malicious |
| Application / browser | XSS, memory disclosure, and supply-chain issues are out of CKVF’s file format |

CKVF protects **confidentiality of payload keys at rest** under the VEK, **integrity of the ciphertext** under AES-256-GCM (with AAD binding metadata), **authorization of lifecycle operations** under the MSK, and **detection of generation forks**. It does not replace OS access control, secure UI, or family-native trust (web of trust, PKIX).

## 2. Vault Encryption Key

The VEK is 256-bit CSPRNG output. It MUST NOT be derived directly from a password. Password-derived material is only a KEK wrapping the VEK (Argon2id + AES-256-GCM). This allows:

- password change without re-encrypting every key;
- multiple unlock slots wrapping one VEK;
- device slots without changing payload ciphertext.

If the VEK is disclosed, all payload private keys for that vault generation chain that share the VEK are disclosed. VEK rotation is not a v1.0 core operation; implementations that need it SHOULD define a `std:` or `exp:` extension and rewrite all slots.

## 3. AES-256-GCM usage

CKVF uses 96-bit IVs and 128-bit tags. IVs MUST be unique per key. The vault IV and each wrap IV are in different key contexts (VEK vs per-slot KEK).

AAD for the vault **includes** `unlock_slots` and **excludes** `ciphertext`, `tag`, and `generation_hash`. Consequences:

- Slot addition/removal authenticates the new slot set (tag changes; ciphertext may not).
- An attacker who truncates slots without the VEK fails GCM verification after a legitimate client decrypts — clients MUST verify GCM.
- `generation_hash` covers ciphertext and tag so sync can detect bit-flips without decrypting.

Nonce reuse under the same VEK with different plaintext is catastrophic for GCM. Writers MUST use a CSPRNG IV per encryption. Keeping the IV when only AAD changes (password/device slot update without payload change) is the specified exception: plaintext is unchanged.

## 4. Passwords and Argon2id

Passwords are NEVER stored. Offline guessing is always possible given the ciphertext and slot parameters. CKVF mitigates by:

- memory-hard Argon2id with RECOMMENDED `m=65536` KiB, `t=3`, `p=4` (RFC 9106 second recommended option);
- rejecting unsafe parameters;
- parser caps (`m<=1048576` KiB, `t<=16`, `p<=16`) to limit DoS.

CKVF does not set password length or complexity policy. Applications SHOULD enforce strong passwords or use device slots plus a password slot for recovery.

## 5. Master Signing Key

The MSK authorizes operations; it is not the VEK. Compromise of the MSK without the VEK does not decrypt historical keys, but it may authorize destructive operations *once the attacker also unlocks or fools a client*. Compromise of the MSK **with** a live sync service that accepts signatures may allow `DELETE_PRIVATE_KEY` or preference changes on **future** accepted states; clients MUST still verify generation linkage.

Historical MSK **private** keys MUST NOT be stored. Historical **public** keys are retained so old signatures can be attributed.

`REPLACE_MSK` REQUIRES a fresh Identity ownership proof by default, so theft of the vault file alone does not replace the MSK.

`ESTABLISH_MSK` MUST fail if a current MSK already exists, preventing silent takeover during enrollment races.

## 6. Signed operations and replay

Signatures are Ed25519 over UTF-8 JCS(`body`). `payload_hash` binds `payload`. Implementations MUST NOT sign non-canonical JSON.

Replay uses `nonce` + `timestamp`. Clock-skew windows (for example ±5 minutes) are a **server policy**, not a file-format constant. Offline files SHOULD still record nonces they have processed.

## 7. Short Key IDs

Short Key IDs are the first 32 bits of `absolute_key_id`’s digest, formatted as `XXXX-XXXX`. Collisions are expected at scale. Applications that treat them as unique identifiers are vulnerable to mix-up. CKVF mitigates by making `absolute_key_id` authoritative and requiring collision tolerance. UI SHOULD display enough of the Absolute Key ID to disambiguate.

## 8. Imported keys and parser safety

CKVF stores native OpenPGP TSK, PKCS #8, or PKCS #12 bytes. A malicious import can:

- exhaust memory (parser limits: vault 16 MiB, key 1 MiB, nesting 32, keys 1024, extension 64 KiB);
- confuse fingerprinting if implementations hashed PEM/armor (forbidden: hash canonical bytes only);
- carry family-level malware-like certifications or huge certificate bags.

CKVF MUST reject oversize and malformed encodings. Family-native validation (self-signatures, certificate chains) is an **application** duty before publishing or using a key as `active`.

## 9. Sync service (malicious or compromised)

A service that never sees the VEK cannot read private keys. It can:

- withhold or roll back ciphertext (clients detect stale/forked generations);
- substitute a container with a different `vault_id` (clients MUST bind Identity and vault_id);
- refuse valid commits;
- learn outer metadata: `vault_id`, generation, slot methods, Argon2 parameters, extension IDs.

Clients MUST verify `generation_hash`, parent linkage, and AEAD after unlock. There is no silent last-writer-wins.

## 10. Rollback and stale devices

Rollback is a first-class threat. `previous_generation_hash` plus monotonically increasing `generation` detect it. Merge rules say a stale device MUST NOT delete newer keys; tombstones require authorized `DELETE_PRIVATE_KEY`. Preferred-key mismatches conflict rather than auto-resolve. MSK current mismatch is a hard conflict.

## 11. Identity takeover

Email and DNS takeover are **environment** threats. CKVF binds keys to `identity_id` and requires ownership proofs for MSK establish/replace. Profiles require randomness, expiry, single-use, operation binding, and rate limiting. They cannot survive a complete, persistent takeover of the email mailbox or DNS zone. Applications SHOULD notify the Identity of MSK replacement.

## 12. Supply chain and XSS

A compromised SDK or browser XSS can read the VEK after unlock. CKVF cannot fix that. Applications SHOULD minimize unlocked lifetime, avoid exposing vault APIs to untrusted script, and pin implementation versions. This specification MUST remain implementable in memory-safe languages; it does not require a particular language.

## 13. Cryptographic agility

v1.0 fixes `A256GCM`, Argon2id for passwords, and Ed25519 for the MSK. Agility is via container `version` and registries, not via attacker-controlled algorithm downgrade inside `"1.0"`. Unknown `crypto.aead` MUST be rejected. PQC is not a family; hybrid algorithms appear under OpenPGP or S/MIME so that CKVF does not invent PQC combiners.

## 14. Responsibility split

See [THREAT-MODEL.md](THREAT-MODEL.md) for a table mapping each threat to CKVF versus application/environment controls.
