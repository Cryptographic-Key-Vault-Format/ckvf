# CKVF privacy considerations

This document expands [SPEC.md](SPEC.md) Section 17. It is part of Community Draft 0.1 and is not an IETF RFC.

CKVF’s primary privacy goal is that **private keys and Identity details inside the payload remain confidential** from sync services, public directories, and anyone who obtains the vault file without an unlock factor. Outer-container metadata is not encrypted.

## 1. Data stored in the encrypted payload

The AEAD plaintext contains:

- canonical Identity (`type`, `value`, `identity_id`);
- current MSK public and private key;
- historical MSK **public** keys;
- family public and private keys (unless deleted);
- preferred-key map;
- timestamps, tombstones, payload extensions.

Anyone who unlocks the VEK sees this. Implementations SHOULD clear plaintext from memory when locking. Implementations MAY omit storing a plaintext Identity **outside** the vault (SPEC.md Section 4.3).

## 2. Data stored in the outer container (unencrypted)

The following are visible to a sync service, backup operator, or file copier:

| Field | Privacy note |
| --- | --- |
| `vault_id` | Stable 128-bit random correlator across backups and devices |
| `generation` / hashes | Reveals update frequency and fork structure |
| `crypto.aead` / `iv` | Algorithm agility; IV is not secret |
| `unlock_slots` | Method names, Argon2 parameters, salts, wrap ciphertexts, `created_at` |
| `extensions` IDs | May reveal software vendor (`priv:` reverse-DNS) |
| `ciphertext` / `tag` | Encrypted; still uniquely identifying as a blob |

Applications SHOULD NOT put names, email addresses, or device serials in slot fields or non-encrypted extensions. Salts and wrap ciphertexts MUST be treated as potentially identifying (they distinguish vaults and slots).

## 3. Identity

`identity_id` is a SHA-256 of `type:value` and is **not** a privacy-preserving identifier: anyone who can guess the Identity (for example, a known email) can recompute it. It exists for integrity and merge, not anonymity.

Public directories publish current public keys for an Identity. That is inherent to using email or DNS as an identifier. CKVF MUST NOT be marketed as an anonymity system.

Canonicalization (NFC, IDNA, lowercase local-part) reduces accidental duplicate Identities; it also means `User@Example.COM` and `user@example.com` are the same vault Identity in v1.0.

## 4. Public directory versus vault

| Publish | MUST NOT publish |
| --- | --- |
| Current family public keys | Any private key |
| Current MSK public key | Historical private keys |
| Identity (if the user opted into a directory) | MSK private key, VEK, passwords |

Historical public keys MAY be published if the user intends verification of old signatures; historical **private** keys MUST NOT.

## 5. Identity verification methods

Email-otp and dns-01 proofs MUST NOT be stored in the vault. OTP values, challenge nonces, and raw proof secrets are short-lived. Logs at a verification server MAY contain the Identity and `proof_id`; operators SHOULD retain them only as needed for rate limiting and abuse response ([PRIVACY of the service] is an application duty).

DNS-01 places a hash in a TXT record. The hashed object includes Identity, operation, MSK public key, and timestamps. Passive DNS observers may infer that a CKVF operation is in progress. The profile uses SHA-256 of JCS so the TXT value is not the raw MSK private key.

## 6. Synchronization and correlation

A service that stores opaque vaults can correlate:

- the same `vault_id` across IP addresses and devices;
- generation timing;
- number and types of unlock slots (password vs device).

Clients MAY add padding via a non-critical extension only if they accept that unknown clients will preserve but not interpret it; padding is not specified in v1.0 core. Applications MAY store vaults under an account identifier that is not the canonical Identity, as long as merge still uses `identity_id` inside the payload.

## 7. Short Key IDs and metadata

Short Key IDs are public hints derived from public key bytes; they are not additional personal data beyond the public key. Key `metadata` in v1.0 is empty of unregistered fields; do not smuggle display names into core metadata — use payload extensions with awareness they sit *inside* the encrypted payload (good) or container extensions (visible).

## 8. Deletion and tombstones

`DELETE_PRIVATE_KEY` sets `private_key` to `null` and records a tombstone. Copies of old generations, backups, and stale devices MAY still hold the private key. CKVF merge prefers **not** to destroy newer material from a stale delete. True erasure is an operational problem (backup rotation, secure delete) outside the format.

MSK replacement securely drops the old MSK private key from the current payload; old generations still contain it.

## 9. Multi-ecosystem keys

A vault may contain both OpenPGP and S/MIME material for one Identity. Correspondents who see only one public directory entry do not automatically learn the other family keys unless those public keys are published. Applications SHOULD let users choose what the directory shows.

## 10. Reference service

The non-normative [reference-key-service profile](profiles/reference-key-service.md) stores ciphertext and current public keys. Operators of such a service are data processors of:

- account or request metadata (IP, timing);
- public keys the user chose to publish;
- encrypted blobs.

They MUST NOT require plaintext private keys. `pubkey.scomm.ai` as the initial reference implementation SHOULD document its own privacy policy; that policy is not part of CKVF conformance.

## 11. Legal and jurisdictional notes

CKVF does not implement exceptional access. There is no specification-defined escrow. Applications that add escrow MUST use an explicit unlock slot or extension so users can see it in `unlock_slots`. Hidden escrow inside ciphertext without a slot would be an implementation betrayal, not a CKVF feature.
