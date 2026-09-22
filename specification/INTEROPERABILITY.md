# CKVF interoperability

SComm.AI Draft 0.1. Interoperability means two codebases that implement this SComm.AI-maintained specification can unlock, mutate, sync, and merge the same vault.

SComm and `pubkey.scomm.ai` are **not** a conformance requirement. See [REFERENCE-IMPLEMENTATIONS.md](REFERENCE-IMPLEMENTATIONS.md) and [profiles/scomm-pubkey-migration.md](profiles/scomm-pubkey-migration.md).

## 1. Conformance targets

An implementation MAY claim one or more of:

| Target | Meaning |
| --- | --- |
| **CKVF Container v1.0 reader** | `canReadVersion("1.0")`; decrypt; reject illegal files |
| **CKVF Container v1.0 writer** | `canWriteVersion("1.0")`; emit SPEC.md data model exactly |
| **CKVF Operations v1.0** | Produce/verify signed envelopes (`protocol` `"CKVF"`, `protocol_version` `"1.0"`) |
| **Profile email-otp** | [profiles/email-otp.md](profiles/email-otp.md) |
| **Profile dns-01** | [profiles/dns-01.md](profiles/dns-01.md) |
| **Sync client** | Generation chain + merge semantics |

Claiming “CKVF compatible” without a target SHOULD be avoided. A reader-only tool (backup inspector) need not implement email-otp.

## 2. Exact data model

Interoperable implementations MUST use the field names, types, and encodings in SPEC.md Section 4–6. In particular:

- Unpadded base64url (RFC 4648 §5).
- RFC 8785 JCS for AAD, `generation_hash` input, `payload_hash`, wrap AAD, and signature input.
- AAD members exactly as listed (no `ciphertext`, `tag`, or `generation_hash`).
- `generation_hash` over the container **with `generation_hash` omitted**.
- Wrap AAD = JCS of `{method, slot_id, vault_id}`.
- `identity_id`, `msk_id`, `absolute_key_id` as specified hashes of **bytes**, not of base64 strings.
- Short Key IDs as hints only.

A “friendly” JSON pretty-printer is allowed on disk only if hashes are computed on JCS.

## 3. Version negotiation

```
canReadVersion(version) -> bool
canWriteVersion(version) -> bool
```

- MUST NOT silently rewrite a vault to a newer container version on open.
- Writers default to the newest **stable** version they can write (`"1.0"` for this draft).
- Unknown `version` → `ERR_VERSION`.
- Community-draft labels (`draft-0.1`) are document versions, not container versions.

## 4. Cryptographic ecosystem coexistence

A single vault MUST be able to hold `family` `"openpgp"` and `"smime"` records together. Implementations that only support one family:

- MUST still preserve the other family’s key records through unmodified read/write of the payload (if they decrypt and re-encrypt, they MUST NOT drop unknown **non-critical** extensions or other-family keys);
- MUST NOT rewrite `encoding` or re-canonicalize native blobs except as required (OpenPGP tag 5 → tag 6 for `public_key` / Absolute Key ID).

PQC keys MUST use `algorithm` / `algorithm_suite` under `openpgp` or `smime`, never a third family. OpenPGP PQC keys follow RFC 9980 inside `openpgp-tsk` bytes; CKVF does not redefine those combiners.

## 5. Native format boundaries

| CKVF does | CKVF does not |
| --- | --- |
| Store TSK / PKCS #8 / PKCS #12 bytes | Define OpenPGP messages |
| Hash a canonical public packet / SPKI | Replace RFC 9580 fingerprints for OpenPGP UI (those remain family-native) |
| Track status `retired` vs delete | Perform S/MIME path validation |
| Publish a directory of current public keys (profile) | Implement KMIP |

Interoperability with OpenPGP or S/MIME **peers** is unchanged: they never need to speak CKVF. Only vault implementations do.

## 6. Unlock methods

Interoperable password unlocking REQUIRES `"password-argon2id"` as specified. Device slots MAY use `"device-wrap-a256gcm"` with in-file wrap bytes; the KEK storage API is not interoperable by design. A vault that has only a vendor-specific slot and no password slot MAY be unreadable on another vendor’s device — writers SHOULD keep a password slot for portability ([SPEC.md](SPEC.md) Section 10.5).

## 7. Sync interoperability

Two sync clients interoperate if they:

1. Identify state by `vault_id` + `generation` + hashes;
2. Detect stale generations and forks;
3. Apply Section 12 merge rules (or refuse with `ERR_MERGE_*` rather than guessing);
4. Treat the service as optional. Offline file copy of the container MUST suffice.

A server may implement the [reference-key-service profile](profiles/reference-key-service.md) or something else. The file format MUST remain valid without that server.

## 8. Identity profiles

Implementations MAY support only `email` or only `dns` Identities. They MUST reject the other type cleanly (`ERR_IDENTITY_CANON` / unsupported type) rather than mis-canonicalize. Cross-implementation tests SHOULD include:

- email NFC, last `@`, ASCII local-part lowercasing, IDNA domain;
- DNS trailing-dot stripping and IDNA.

OTP **transport** is not interoperable (no vendor API). Only the **security properties** are.

## 9. Extensions

Unknown non-critical extensions MUST be preserved by writers that round-trip a vault. Unknown critical extensions MUST block security-sensitive processing. Using `priv:` extensions for required behavior breaks interoperability; required behavior belongs in `std:` after community review.

## 10. Testability

Until `test-vectors/` is published, implementations SHOULD exchange fixtures for:

- AAD JCS strings in SPEC.md Section 19.4–19.5;
- identity_id values in Section 19.1;
- merge conflicts (preferred keys, MSK, tombstones).

Do not treat repeating-byte documentation keys as cryptographic test vectors.

## 11. Independent implementation checklist

- [ ] Opens a vault produced by another implementation with the same password.
- [ ] Password change does not re-encrypt key records.
- [ ] Device slot add recomputes GCM tag without changing ciphertext.
- [ ] Short Key ID collision does not cause mis-merge.
- [ ] Works with no network and no SComm.
- [ ] Refuses PQ-as-family.
- [ ] `canReadVersion` / `canWriteVersion` documented.
