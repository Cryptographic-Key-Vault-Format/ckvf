---
title: "Cryptographic Key Vault Format (CKVF)"
abbrev: CKVF
docname: draft-ckvf-community-00
date: 2026-08-17
category: info
ipr: none
submissiontype: independent
keyword:
  - cryptography
  - key vault
  - OpenPGP
  - S/MIME
  - identity
stand_alone: true
pi:
  toc: yes
  sortrefs: yes
  symrefs: yes
author:
  -
    name: SComm.AI CKVF Editors
    organization: SComm.AI
    email: editors@scomm.ai
normative:
  RFC2119:
  RFC8174:
  RFC4648:
  RFC8259:
  RFC8785:
  RFC9106:
  RFC8032:
  RFC5116:
  RFC3339:
  RFC5891:
  RFC5280:
  RFC9580:
  RFC5958:
  RFC7292:
  RFC6234:
informative:
  RFC7517:
  RFC7638:
  RFC8551:
  RFC5652:
  RFC8555:
  RFC9980:
  CKVFSPEC:
    title: "Cryptographic Key Vault Format (CKVF) SComm.AI Draft 0.1"
    target: "https://github.com/scomm-public/ckvf/blob/main/specification/SPEC.md"
    date: 2026
    author:
      -
        org: SComm.AI
--- abstract

This document specifies the Cryptographic Key Vault Format (CKVF), a
lightweight, portable, user-controlled container in which private keys
belong to a verified Identity, an independently encrypted vault retains
current and historical keys across cryptographic ecosystems, a Master
Signing Key (MSK) authorizes lifecycle changes, and ownership of the
Identity can recover or replace that MSK. Multiple unlock mechanisms may
protect one vault. Devices may synchronize and merge vault state.
Public-key services may store the encrypted vault without gaining access
to its contents.

This document is CKVF SComm.AI Draft 0.1 rendered for kramdown-rfc. It is
not an IETF Internet-Draft, RFC, or IETF standard.

--- middle

# Introduction

## Draft Status

This document is **CKVF SComm.AI Draft 0.1**. It MUST NOT be cited as
an IETF standard. It MUST NOT be described as an RFC, as IETF consensus,
or as an IETF Internet-Draft. A future document named
`draft-<authors>-ckvf` MAY be submitted to the IETF; until that happens,
the specification in {{CKVFSPEC}} is authoritative if this
rendering disagrees with it.

CKVF is the SComm.AI-maintained portable vault format. Hosted Discovery
and `pubkey.scomm.ai` store opaque ciphertext; they are not required to
parse or unlock a local vault file.

## Why CKVF Exists

Existing standards provide excellent representations for individual
cryptographic keys, protocol-specific transferable secret keys,
certificate and key packages, JSON keys, and enterprise KMS protocols.

They do not collectively define a lightweight, portable, user-controlled
format in which:

* private keys belong to a verified Identity;
* one Identity may retain multiple current and historical private keys;
* different cryptographic ecosystems such as OpenPGP and S/MIME may
  coexist;
* an MSK authorizes lifecycle changes;
* ownership of the Identity can recover or replace that MSK;
* the vault is independently encrypted;
* multiple unlock mechanisms can protect one vault;
* devices can synchronize and merge vault state;
* historical keys remain available for old encrypted data;
* public-key services can synchronize the encrypted vault without
  gaining access to its contents.

CKVF standardizes this missing layer.

## What CKVF Does Not Redefine

CKVF does not redefine OpenPGP messages {{RFC9580}}, S/MIME {{RFC8551}},
CMS {{RFC5652}}, certificate-chain validation {{RFC5280}}, email MIME,
encryption or signature algorithms, or post-quantum cryptography
algorithm specifications such as PQC in OpenPGP {{RFC9980}}. It stores
native encodings (OpenPGP transferable secret keys, PKCS #8 {{RFC5958}},
PKCS #12 {{RFC7292}}) inside an independently encrypted payload. JSON
Web Key {{RFC7517}} and JWK Thumbprint {{RFC7638}} are reserved as a
future encoding. JSON Canonicalization Scheme {{RFC8785}} and Argon2
{{RFC9106}} are reused as specified. ACME {{RFC8555}} inspires a DNS
ownership profile only; CKVF dns-01 is not ACME. OASIS KMIP remains the
enterprise KMS protocol.

Post-quantum algorithms MUST NOT be introduced as a peer key family. PQC
appears only as `algorithm` and/or `algorithm_suite` under `openpgp` or
`smime` (for OpenPGP PQC, {{RFC9980}}).

## Requirements Language

{::boilerplate bcp14-tagged}

# Terminology

Identity:
: A verified identifier of type `email` or `dns` in version `"1.0"`.

Identity Verification Method (IVM):
: A proof of current control of the Identity. Proof artifacts MUST NOT
  be stored in the vault.

Master Signing Key (MSK):
: The Ed25519 key pair that authorizes signed CKVF operations.

Vault Encryption Key (VEK):
: A 256-bit uniformly random key that AEAD-encrypts the payload. The VEK
  MUST NOT be derived directly from a password.

Absolute Key ID:
: `base64url(SHA-256(canonical public key bytes))`. Authoritative.

Short Key ID:
: A lookup hint from the first 32 bits of that digest. Short Key IDs
  are not unique identifiers. Applications MUST tolerate collisions.

JCS:
: JSON Canonicalization Scheme {{RFC8785}}. CKVF MUST NOT define a
  custom canonicalization.

# Architecture

The conceptual model is:

~~~~
Identity
  +-- Identity Verification Method
  +-- Master Signing Key (MSK)
  +-- Vault
        +-- Private Key / Historical Private Key (any registered family)
~~~~

A public directory publishes current public keys. The vault holds
current and historical private keys. Historical private keys MUST NOT be
published. A sync service MAY store ciphertext as an opaque blob and
MUST NOT require plaintext private keys.

# Data Model

The container `version` defined here is the string `"1.0"`. Binary
fields use base64url without padding {{RFC4648}} Section 5 unless a
native key encoding inside the encrypted payload requires those native
bytes (which are still carried as unpadded base64url).

Unknown properties on core objects MUST be rejected. Extensions are the
only forward-compatible channel.

## Outer Vault Container

~~~~ application/json
{
  "format": "CKVF",
  "version": "1.0",
  "vault_id": "<base64url, 16 random bytes>",
  "generation": 1,
  "previous_generation_hash": null,
  "generation_hash": "<base64url SHA-256>",
  "crypto": {
    "aead": "A256GCM",
    "iv": "<base64url, 12 bytes>"
  },
  "unlock_slots": [],
  "ciphertext": "<base64url>",
  "tag": "<base64url, 16 bytes>",
  "extensions": [],
  "critical_extensions": []
}
~~~~

`format` MUST be `"CKVF"`. `vault_id` MUST be 16 CSPRNG octets.
`generation` MUST be an integer greater than or equal to 1.
`previous_generation_hash` MUST be JSON `null` if and only if
`generation` is 1. `crypto.aead` MUST be `"A256GCM"` in version
`"1.0"`. `crypto.iv` MUST be 12 octets. `tag` MUST be 16 octets.

```
generation_hash = base64url(SHA-256(UTF-8 JCS(container with generation_hash omitted)))
```

## Unlock Slot

~~~~ application/json
{
  "slot_id": "<base64url 16 bytes>",
  "method": "password-argon2id",
  "created_at": "<RFC 3339 UTC>",
  "kdf": {
    "alg": "Argon2id",
    "salt": "<base64url >=16 bytes>",
    "m": 65536,
    "t": 3,
    "p": 4,
    "key_length": 32
  },
  "wrap": {
    "alg": "A256GCM",
    "iv": "<base64url 12 bytes>",
    "ciphertext": "<base64url 32-byte VEK>",
    "tag": "<base64url 16 bytes>"
  }
}
~~~~

The password is NEVER stored. Recommended Argon2id parameters are
`m=65536` KiB, `t=3`, `p=4` ({{RFC9106}} second recommended option).
Implementations MUST reject unsafe parameters. Default parser limits
include `m<=1048576` KiB, `t<=16`, `p<=16`, JSON nesting depth 32, vault
size 16 MiB, at most 1024 keys, native key size 1 MiB, and extension
data 64 KiB.

Wrap AAD is UTF-8 JCS of an object with exactly `method`, `slot_id`, and
`vault_id`.

Password change unwraps the VEK, wraps it with a new KEK, and recomputes
the outer GCM tag. Implementations MUST NOT re-encrypt payload keys
solely because the password changed. Device slots MAY be added without
changing ciphertext (recompute the GCM tag for the new AAD). This
document does not make any vendor secure-storage API normative.

## Encrypted Payload

~~~~ application/json
{
  "identity": {
    "type": "email",
    "value": "<canonical>",
    "identity_id": "<base64url SHA-256>"
  },
  "msk": {
    "current": {
      "msk_id": "<base64url SHA-256 of public_key bytes>",
      "algorithm": "Ed25519",
      "public_key": "<base64url 32 bytes>",
      "private_key": "<base64url 32-byte seed>",
      "activated_at": "<RFC 3339>"
    },
    "history": []
  },
  "keys": [],
  "preferred_keys": {},
  "metadata": { "created_at": "...", "updated_at": "..." },
  "tombstones": [],
  "extensions": [],
  "critical_extensions": []
}
~~~~

`identity.type` MUST be `"email"` or `"dns"`. Implementations MAY omit
storing plaintext Identity outside the encrypted vault.

```
identity_id = base64url(SHA-256(UTF-8(canonical_type + ":" + canonical_value)))
```

Email canonicalization (v1.0): NFC, trim, split on the last `@`,
local-part ASCII lowercase, domain IDNA ToASCII then lowercase, no
trailing dot. DNS canonicalization: NFC, trim, strip trailing dots, IDNA
ToASCII, lowercase, no trailing dot.

Historical MSK public keys are retained. Historical MSK private keys
MUST NOT be stored.

## Key Record

~~~~ application/json
{
  "absolute_key_id": "<base64url SHA-256(canonical public key bytes)>",
  "short_key_id": "ABCD-EF12",
  "family": "openpgp",
  "algorithm": "<registry>",
  "algorithm_suite": null,
  "encoding": "openpgp-tsk",
  "purpose": ["sign", "encrypt", "auth"],
  "public_key": "<base64url canonical public key>",
  "private_key": "<base64url native encoding or null if deleted>",
  "created_at": "<RFC 3339>",
  "status": "active",
  "metadata": {}
}
~~~~

`family` MUST be `"openpgp"` or `"smime"` in version `"1.0"`. `encoding`
MUST be `"openpgp-tsk"`, `"pkcs8"`, or `"pkcs12"`.

**Short Key IDs are lookup hints and are not unique identifiers.** They
are eight uppercase hex digits of the first 32 bits of the Absolute Key
ID digest, with a hyphen after the fourth digit. Applications MUST
tolerate collisions. `absolute_key_id` is authoritative.

Canonical public key bytes:

* `openpgp-tsk`: primary Public-Key packet (tag 6), {{RFC9580}}
  new-format definite-length, public fields only. Convert Secret-Key
  (tag 5) public portion to tag 6. Do not hash PEM or ASCII-armor.
* `pkcs8` / `pkcs12`: DER-encoded SubjectPublicKeyInfo {{RFC5280}}. Not
  PEM. For PKCS #12, extract the leaf public key as SPKI DER.
* Future `jwk`: SHA-256 of UTF-8 JCS of the {{RFC7638}} thumbprint JSON.
  Not required in `"1.0"`.

Statuses are `active`, `retired`, `revoked`, and `compromised`. Retired
does not delete the private key. Historical retention is a design
objective. Deletion is separate: a tombstone plus authorized
`DELETE_PRIVATE_KEY`. Implementations MUST NOT equate retire with
delete.

# Serialization

Objects are JSON {{RFC8259}}. Hashed or signed JSON MUST be
canonicalized with {{RFC8785}}. Timestamps MUST be RFC 3339 UTC with a
`Z` suffix {{RFC3339}}. Integers MUST be JSON integers in the ranges
this document defines.

# Cryptographic Processing

CKVF does not invent primitives. Version `"1.0"` uses AES-256-GCM
{{RFC5116}}, SHA-256 {{RFC6234}}, Argon2id {{RFC9106}}, and Ed25519
{{RFC8032}}.

## Vault AEAD

AES-256-GCM: 96-bit IV, 128-bit tag, 256-bit VEK. The VEK is random.

AAD is UTF-8 JCS of this object (keys sorted by {{RFC8785}}):

~~~~ application/json
{
  "critical_extensions": [],
  "crypto": { "aead": "A256GCM", "iv": "<iv>" },
  "extensions": [],
  "format": "CKVF",
  "generation": 1,
  "previous_generation_hash": null,
  "unlock_slots": [],
  "vault_id": "...",
  "version": "1.0"
}
~~~~

Implementations MUST NOT include `ciphertext`, `tag`, or
`generation_hash` in AAD.

## Signed Operations

The signed object (`body`) contains exactly: `protocol`,
`protocol_version`, `operation`, `identity_id`, `vault_id`,
`generation`, `nonce`, `timestamp`, `payload_hash`. `protocol` MUST be
`"CKVF"`. `protocol_version` MUST be `"1.0"`.

```
payload_hash = base64url(SHA-256(UTF-8 JCS(payload)))
```

The envelope is `{ "body": <signed object>, "payload": <object>,
"signature": { "algorithm": "Ed25519", "msk_id": "...", "value": "<64
bytes base64url>" } }`. The signature is Ed25519 over UTF-8 JCS(`body`).

Operations: `ADD_KEY`, `RETIRE_KEY`, `REVOKE_KEY`, `SET_PREFERRED_KEY`,
`ADD_DEVICE`, `REMOVE_DEVICE`, `COMMIT_VAULT_GENERATION`, `MERGE_VAULT`,
`UPDATE_METADATA`, `DELETE_PRIVATE_KEY`, `ESTABLISH_MSK`, `REPLACE_MSK`.

MSK replacement REQUIRES a fresh Identity ownership proof unless a
future recovery profile says otherwise.

Replay protection uses `nonce` (256-bit) plus `timestamp`. Servers MAY
use a clock-skew tolerance such as plus or minus 5 minutes; that
tolerance is not a file-format constant. Implementations MUST reject
nonce reuse in the replay window.

# Identity Model

Ownership profiles:

* email-otp: security properties only; no vendor OTP API. The OTP is
  random, expires, is single-use, is bound to the operation, is
  rate-limited, and is NEVER stored in the vault.
* dns-01: inspired by ACME DNS-01 {{RFC8555}}, not claiming to be ACME.
  TXT at `_ckvf-challenge.<canonical-domain>`. Challenge =
  `base64url(SHA-256(JCS({protocol, protocol_version,
  verification_method, identity_type, identity_value, operation,
  msk_public_key, nonce, issued_at, expires_at})))`. Nonce is 256-bit.
  Records expire. Lookups MUST use authoritative DNS. Replay protection
  applies.

# Synchronization and Merge

Sync identifiers are `vault_id`, `generation`,
`previous_generation_hash`, and `generation_hash`. There is no silent
last-writer-wins. Stale generation MUST be detected. Timestamps are not
the primary consistency mechanism.

Merge: keys are a set keyed by `absolute_key_id`. Union unless an
authorized destructive operation applies. Status severity:
`compromised` > `revoked` > `retired` > `active`. Private key material
is kept if either side has it. A stale device MUST NOT delete newer
keys. Conflicting `preferred_keys` are a conflict; implementations MUST
NOT silently pick. Current MSK mismatch is a hard conflict. Unlock slots
are unioned by `slot_id`; removal is conservative. Identity mismatch
MUST reject the merge.

# Extensibility

`extensions` and `critical_extensions` are arrays of
`{ "id": "std:..."|"exp:..."|"priv:...", "critical": bool, "data": ... }`.
Unknown non-critical extensions: preserve and ignore. Unknown critical
extensions: reject security-sensitive processing. Implementations MUST
NOT accept loose arbitrary JSON in the normative core.

# Versioning

Specification labels include `draft-0.1` through a future community
`1.0`. SDKs use Semantic Versioning independently. Implementations MUST
provide `canReadVersion` and `canWriteVersion`. They MUST NOT silently
rewrite a vault to a newer format on open. Writers default to the newest
stable container version they support (`"1.0"` in this draft).

# Error Handling

Implementations MUST fail closed on cryptographic and identity errors.
Recommended codes include `ERR_AEAD_DECRYPT`, `ERR_GENERATION_HASH`,
`ERR_GENERATION_CONFLICT`, `ERR_IDENTITY_MISMATCH`, `ERR_REPLAY`,
`ERR_CRITICAL_EXTENSION`, `ERR_MERGE_MSK`, `ERR_OWNERSHIP`, and
`ERR_PARSER_LIMIT`.

# Security Considerations

The VEK MUST be random and MUST NOT be a direct password hash. Passwords
MUST NOT be stored. Argon2id parameters MUST be checked. Short Key IDs
MUST NOT be used as unique identifiers. Unknown critical extensions MUST
fail closed. Stale devices MUST NOT delete newer keys. `REPLACE_MSK`
REQUIRES a fresh ownership proof by default. Historical MSK private keys
MUST NOT be retained. AES-GCM IVs MUST NOT be reused with the same key
and different plaintext except the specified same-plaintext AAD update.
CKVF does not authenticate semantic correctness of imported OpenPGP or
S/MIME keys. A sync service is untrusted with plaintext.

A stolen vault file enables offline password guessing. A malicious sync
service can roll back or withhold blobs; clients detect forks via the
generation chain. Email and DNS takeover can satisfy ownership proofs;
those channels are environmental. VEK extraction from an unlocked client
exposes the payload. See the community threat-model document in
{{CKVFSPEC}}.

# Privacy Considerations

Implementations MAY omit storing plaintext Identity outside the
encrypted vault. IVM secrets MUST NOT be stored in the vault. Unlock
slot metadata is unencrypted because it is part of AAD. `vault_id` may
correlate backups. Public directories MUST NOT publish historical
private keys.

# IANA Considerations

This draft does not request any IANA action. CKVF
registries (unlock methods, families, encodings, algorithms, operations,
identity types, extension prefixes) are maintained with {{CKVFSPEC}} and
are structured for later IANA migration.

--- back

# Acknowledgements

SComm.AI maintains CKVF and operates pubkey.scomm.ai as the hosted
Discovery/Pubkey service that stores opaque vault ciphertext.
