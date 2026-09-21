# Content keys (mail OpenPGP / S/MIME)

CKVF stores **private content keys**. It does not implement OpenPGP packets or CMS. SComm and `pubkey.scomm.ai` are a non-normative originating use case; this document is the vault contract only.

## Families

Allowed: `openpgp`, `smime`.  
Forbidden as families: `pq`, `pqc`, `post-quantum`, `hybrid`.

`algorithm_suite` on a content key is `rsa` | `ecc` | `pqc` (or null on old keys). Hybrids (ML-KEM+X25519, ML-DSA+Ed25519) are suite `pqc` inside family `openpgp` or `smime`.

Identity MSK stays `Ed25519`. It is not a mail content key.

## Encodings

| Family | Allowed encodings |
| --- | --- |
| `openpgp` | `openpgp-tsk` |
| `smime` | `pkcs8`, `pkcs12` |

`smime` MUST NOT use `openpgp-tsk`. CKVF MUST NOT parse CMS (`application/pkcs7-mime`) or OpenPGP ciphertext.

## S/MIME private keys

Classical RSA/ECDH S/MIME and PQC CMS private keys are PKCS#8 or PKCS#12 blobs. Locator remains family-native (cert id / SKI). Catalog algorithm *names* (`smime-mlkem768-x25519`, `pqc-mldsa65`, …) live in the directory, not as extra CKVF families.
