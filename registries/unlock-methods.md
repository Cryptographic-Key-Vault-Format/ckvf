# Unlock methods

Community registry of unlock-slot `method` values. SPEC.md Sections 4.2, 10, and Appendix A.1.

| Value | KDF | Wrap | Specification |
| --- | --- | --- | --- |
| `password-argon2id` | Argon2id (`kdf` REQUIRED) | `A256GCM` | This specification |
| `device-wrap-a256gcm` | none in-file (`kdf` omitted) | `A256GCM` | This specification (KEK storage out of scope) |

All slots MUST wrap the **same** current VEK. `slot_id` values MUST be unique within a container (`ERR_SLOT_ID`).

Passwords MUST NOT be stored. Implementations MUST NOT write a password, password hash, or password verifier into the container, payload, or extensions.

Device-oriented methods MAY omit `kdf` and obtain a KEK from platform secure storage. No vendor secure-storage API is normative. The wrap object remains in the file so the wrapped VEK is portable. `ADD_DEVICE` / `REMOVE_DEVICE` authorize slot-set changes.

Writers SHOULD persist at least one `"password-argon2id"` slot so the vault remains unlockable if a device is lost, unless a registered recovery profile provides an equivalent.
