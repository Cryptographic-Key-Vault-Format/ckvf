# AEAD algorithms

Community registry of AEAD identifiers used in `crypto.aead` and unlock-slot `wrap.alg`. SPEC.md Sections 4.1, 4.2, 6.1, and 6.3.

| Value | Role in v1.0 | Notes |
| --- | --- | --- |
| `A256GCM` | Vault payload AEAD and VEK wrap | AES-256-GCM. IV 96 bits (12 octets). Tag 128 bits (16 octets). |

Container `version` `"1.0"` MUST use `"A256GCM"` for `crypto.aead` and for `wrap.alg`.

The Vault Encryption Key (VEK) is 256 bits, uniformly random, and MUST NOT be derived directly from a password. Ciphertext is GCM ciphertext **excluding** the tag.
