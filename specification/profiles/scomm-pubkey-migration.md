# SComm / pubkey.scomm.ai migration notes

**Status:** SComm.AI Draft 0.1, **non-normative**  
**Not an IETF standard**  
**Not part of the CKVF conformance surface**

[pubkey.scomm.ai](https://pubkey.scomm.ai) is the SComm.AI hosted Discovery/Pubkey service. It stores **opaque** CKVF ciphertext. Hosted HTTP is not the container specification.

## 1. Rule

**SComm-specific behavior belongs in an adapter.**

If existing SComm or `pubkey.scomm.ai` behavior differs from [SPEC.md](../SPEC.md):

1. Change the **adapter** (field mapping, HTTP resources, extra product features).
2. Do **not** change the CKVF core data model to match one deployment.
3. Do **not** add SComm identifiers to community registries unless they are generally useful (`priv:` extensions MAY encode product data).

Editors MUST reject specification pull requests whose only motivation is “the SComm server already does X”.

## 2. Adapter responsibilities

An adapter MAY:

- map SComm account IDs to CKVF `identity_id` after canonicalization;
- translate product APIs to signed CKVF operations;
- store extra product metadata in `priv:` extensions;
- implement email-otp **transport** using whatever mail path SComm already has, while still meeting [email-otp.md](email-otp.md) security properties;
- implement dns-01 verification for domain Identities without calling it ACME.

An adapter MUST NOT:

- require the core parser to call `pubkey.scomm.ai`;
- treat Short Key IDs as unique because a product UI did;
- introduce a `family` value for PQC or for “scomm keys”;
- persist OTPs or MSK private keys on the server;
- silently last-writer-wins vault blobs.

## 3. Expected product vs format splits

| Concern | Lives in |
| --- | --- |
| JSON container, AAD, VEK, merge | CKVF SPEC |
| OpenPGP/S/MIME native bytes | Family RFCs + CKVF encodings |
| Hosted directory URL, rate limits, UX | SComm / adapter |
| “SComm user profile” fields | `priv:` extension or a side database, not core `metadata` |
| Historical private keys | CKVF vault, never the public directory |

## 4. Migration strategy (informative)

When aligning an existing SComm public-key service with CKVF:

1. Export current public keys into directory entries keyed by `absolute_key_id` (recomputed from canonical public-key bytes, not from legacy fingerprints unless they already match Section 9.4).
2. Wrap existing local secret storage into a CKVF payload under a new random VEK and at least one `"password-argon2id"` slot.
3. Establish an MSK with email-otp or dns-01; do not reuse an application session cookie as `ESTABLISH_MSK`.
4. Upload the **encrypted** container as an opaque blob.
5. Keep the adapter translating any legacy API until clients speak CKVF operations natively.

If a legacy identifier collides with CKVF Short Key IDs, the adapter MUST use Absolute Key IDs on the wire.

## 5. Independence test

The adapter is complete only if:

- a third-party CKVF library can unlock a vault file produced for SComm **offline**;
- a third-party library can ignore `pubkey.scomm.ai` entirely;
- removing SComm does not require a spec erratum.

## 6. Listings

`pubkey.scomm.ai` is listed in [REFERENCE-IMPLEMENTATIONS.md](../REFERENCE-IMPLEMENTATIONS.md) as the SComm.AI hosted service. Other implementations MAY be listed there.
