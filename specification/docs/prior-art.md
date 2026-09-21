# Prior art

Community Draft 0.1, informative. CKVF exists because excellent standards already represent **individual keys**, **protocol-specific secret-key packets**, **certificate bags**, **JSON keys**, and **enterprise KMS protocols**, but they do not collectively define the portable, identity-bound, multi-family, independently encrypted, multi-unlock, mergeable vault described in [SPEC.md](SPEC.md) Section 1.1.

This note records, for each related technology: what it solves, what CKVF reuses, what CKVF does **not** replace, and the remaining gap.

Do not copy RFC text into this repository; read the cited documents.

## OpenPGP (RFC 9580)

**Solves.** Messages, signatures, transferable public and secret keys, algorithm agility inside the OpenPGP ecosystem, including future PQC work in that ecosystem.

**CKVF reuses.** Transferable Secret Key bytes as `encoding` `"openpgp-tsk"`; a canonical primary Public-Key packet (tag 6, new-format definite-length) as the hash input for `absolute_key_id`.

**CKVF does not replace.** OpenPGP message format, ASCII-armor, OpenPGP fingerprints as used by OpenPGP UI, web-of-trust or other OpenPGP certification models, or OpenPGP PQC combiners ([RFC 9980](https://www.rfc-editor.org/rfc/rfc9980.html)).

**Gap.** A TSK is one key (with subkeys), not a vault of multiple current and historical keys across families, not independently wrapped for a sync service, not bound to a CKVF Identity + MSK lifecycle, and not mergeable across devices with CKVF generation hashes.

## PKCS #8 / asymmetric key packages (RFC 5958)

**Solves.** A standard ASN.1 encoding for a single private key, optionally encrypted at the PKCS #8 layer.

**CKVF reuses.** DER OneAsymmetricKey / PKCS #8 as `encoding` `"pkcs8"` inside the **already** AEAD-encrypted payload. Canonical public key is SPKI DER (RFC 5280), not PEM.

**CKVF does not replace.** PKCS #8 itself, algorithm identifiers, or encrypted-private-key wrapping inside PKCS #8 as a general mechanism.

**Gap.** PKCS #8 is not an identity-bound multi-key vault, has no MSK operations, no generation merge, and no portable multi-slot VEK wrapping as specified by CKVF.

## PKCS #12 (RFC 7292)

**Solves.** A bag of certificates and keys, often password-based, widely used for S/MIME and TLS client credentials.

**CKVF reuses.** PFX DER as `encoding` `"pkcs12"`; leaf public key extracted as SPKI DER for `absolute_key_id`.

**CKVF does not replace.** PKCS #12 integrity/privacy modes, Windows/macOS import UX, or certificate-chain packaging for S/MIME.

**Gap.** PKCS #12 is typically one credential bundle, not a historical multi-family vault; password-based encryption in PKCS #12 is not CKVF’s VEK+Argon2id slot model; merge/sync/MSK are absent. Nested password encryption inside a CKVF-stored PFX is redundant but allowed; CKVF still encrypts the payload independently.

## JSON Web Key (RFC 7517) and JWK Thumbprint (RFC 7638)

**Solves.** JSON representation of keys; stable thumbprints for JWKs.

**CKVF reuses.** Reserved future `encoding` `"jwk"`: Absolute Key ID would be SHA-256 of UTF-8 JCS of the RFC 7638 thumbprint JSON. Not required in container `"1.0"`.

**CKVF does not replace.** JWK/JWS/JWE for application protocols, JOSE algorithm registries, or COSE.

**Gap.** A JWK set is not a VEK-encrypted identity vault with unlock slots, MSK-authorized lifecycle, and conservative multi-device merge.

## JSON Canonicalization Scheme (RFC 8785)

**Solves.** Deterministic JSON for hashing and signing without a one-off canonicalization.

**CKVF reuses.** UTF-8 JCS for vault AAD, wrap AAD, `generation_hash` input, `payload_hash`, Ed25519 signed `body`, and dns-01 challenge input.

**CKVF does not replace.** JCS. Implementations MUST NOT invent a CKVF-specific canonicalizer.

**Gap.** None in scope — JCS is a building block, not a vault format.

## Argon2 (RFC 9106)

**Solves.** Memory-hard password hashing and KDF.

**CKVF reuses.** Argon2id for `"password-argon2id"` slots, with the second recommended option (`m=65536` KiB, `t=3`, `p=4`) as CKVF’s RECOMMENDED parameters.

**CKVF does not replace.** Argon2, or password-hashing for authentication databases.

**Gap.** Argon2 produces a KEK, not a vault. CKVF forbids using the password-derived key as the VEK.

## ACME DNS-01 (RFC 8555)

**Solves.** Automated certificate issuance with domain-control validation, including DNS-01 challenges.

**CKVF reuses.** The **concept** of placing a challenge in a DNS TXT record under a well-known label. CKVF dns-01 uses `_ckvf-challenge.<canonical-domain>` and a SHA-256 of a CKVF-specific JCS object.

**CKVF does not replace.** ACME, ACME servers, or certificate issuance. CKVF dns-01 **MUST NOT** be claimed to be ACME.

**Gap.** ACME issues certificates; it does not define a user-controlled private-key vault or MSK recovery for OpenPGP/S/MIME coexistence.

## KMIP (OASIS)

**Solves.** Enterprise key-management protocol: create, wrap, policy, HSM-backed objects, in a client–server setting.

**CKVF reuses.** Nothing on the wire. KMIP remains the right tool for enterprise KMS.

**CKVF does not replace.** KMIP objects, profiles, or HSM enforcement.

**Gap.** KMIP is not a portable user-owned file that an untrusted public-key directory can store without holding key material. CKVF targets user-controlled Identities (email/DNS), not enterprise partition objects.

## CMS / S/MIME (RFC 5652, RFC 8551) and PKIX (RFC 5280)

**Solves.** Signed and enveloped MIME, certificate path validation, SPKI.

**CKVF reuses.** SPKI DER as canonical public key for `pkcs8`/`pkcs12`; S/MIME as `family` `"smime"`.

**CKVF does not replace.** CMS, S/MIME message formats, MIME, or path validation.

**Gap.** S/MIME tells you how to use a credential in mail; it does not tell you how to retain decades of historical private keys next to OpenPGP keys, sync them encrypted, and recover an MSK via Identity ownership.

## age and minisign (informative)

**age (Filippo Valsorda / age-encryption.org).** File encryption with recipients (X25519, scrypt, SSH). Solves encrypting a blob to recipients. CKVF could *in principle* store an age identity as native bytes in a future encoding; v1.0 does not. CKVF does not replace age. Gap: age is not an identity-bound multi-key lifecycle vault with merge.

**minisign / signify.** Small Ed25519 signing tools and key files. CKVF’s MSK is Ed25519 but uses RFC 8785 JCS envelopes, not minisign’s comment/signature file format. CKVF does not replace minisign. Gap: a minisign key pair is not a multi-family historical vault.

## Post-quantum cryptography in OpenPGP (RFC 9980)

**Solves.** Composite and standalone post-quantum public-key algorithms for OpenPGP, extending RFC 9580 (including ML-KEM and ML-DSA composites with ECC, and SLH-DSA).

**CKVF reuses.** Native OpenPGP TSK bytes that already encode RFC 9980 algorithms. CKVF records them with `family` `"openpgp"` and `algorithm` / `algorithm_suite` taken from that ecosystem. PQC MUST NOT be a CKVF peer family.

**CKVF does not replace.** RFC 9980 combiners, packet formats, or algorithm IDs.

**Gap.** RFC 9980 extends OpenPGP keys and messages; it does not define an identity-bound, multi-family, independently encrypted, mergeable vault.

## OpenPGP Web Key Directory and similar directories

**Solves.** Publication of **current** OpenPGP public keys for an email address (WKD and related discovery such as OPENPGPKEY / DANE).

**CKVF reuses.** The directory-versus-vault split: directories publish current public keys; the vault holds private and historical material.

**CKVF does not replace.** WKD, OPENPGPKEY DANE, or S/MIME discovery.

**Gap.** WKD does not transport an encrypted private-key vault or authorize lifecycle with an MSK.

## Summary of the remaining gap

Across all of the above, the missing layer is a **lightweight, portable, user-controlled** object in which private keys belong to a verified Identity; multiple current and historical keys and multiple families coexist; an MSK authorizes changes; Identity ownership can replace the MSK; the vault is independently encrypted; multiple unlock mechanisms wrap one VEK; devices sync and merge without last-writer-wins; historical keys remain available; and a public-key service can store the ciphertext without reading it.

CKVF standardizes that layer and stops there.
