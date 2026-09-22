package org.ckvf

/**
 * Cryptographic Key Vault Format (CKVF) Kotlin SDK.
 *
 * **Not implemented in the first pass.** This library MUST consume the same
 * specification, schemas, registries, and test-vectors as other SDKs. It MUST
 * NOT silently redefine CKVF behavior, MUST NOT import Discovery HTTP, and MUST NOT
 * rewrite a vault to a newer container version on open.
 *
 * Intended public API: parse, validate, create, encrypt, decrypt, merge, and
 * identifiers (`identityId`, `mskId`, `absoluteKeyId`, `shortKeyId`), plus
 * capability queries.
 */
object Ckvf {
    private const val NYI =
        "CKVF Kotlin SDK is a template; not implemented in the first pass."

    /** Whether this build can read the given container `version`. */
    fun canReadVersion(version: String): Boolean = throw UnsupportedOperationException(NYI)

    /** Whether this build can write the given container `version`. */
    fun canWriteVersion(version: String): Boolean = throw UnsupportedOperationException(NYI)

    /** Registered AEAD / algorithm identifiers this build implements. */
    fun supportedAlgorithms(): List<String> = throw UnsupportedOperationException(NYI)

    /** Registered key encodings this build implements (for example `openpgp-tsk`, `pkcs8`). */
    fun supportedKeyEncodings(): List<String> = throw UnsupportedOperationException(NYI)

    /** Registered unlock methods this build implements (for example `password-argon2id`). */
    fun supportedUnlockMethods(): List<String> = throw UnsupportedOperationException(NYI)

    /** Parse outer container JSON without decrypting. */
    fun parse(source: String): Any = throw UnsupportedOperationException(NYI)

    /** Validate container structure, encodings, and `generation_hash` (fail closed). */
    fun validate(container: Any): Unit = throw UnsupportedOperationException(NYI)

    /** Create a new empty vault bound to an Identity (does not encrypt yet). */
    fun create(identity: Any): Any = throw UnsupportedOperationException(NYI)

    /** Encrypt a payload under the VEK (AES-256-GCM). Passwords wrap the VEK only. */
    fun encrypt(payload: Any, vek: ByteArray, container: Any): Any =
        throw UnsupportedOperationException(NYI)

    /** Decrypt a container (password or unwrapped VEK). MUST NOT rewrite on open. */
    fun decrypt(container: Any, vek: ByteArray? = null, password: String? = null): Any =
        throw UnsupportedOperationException(NYI)

    /** Deterministic merge of two unlocked vaults (no last-writer-wins). */
    fun merge(a: Any, b: Any): Any = throw UnsupportedOperationException(NYI)

    /** `identity_id` = unpadded base64url(SHA-256(canonical identity bytes)). */
    fun identityId(type: String, value: String): String =
        throw UnsupportedOperationException(NYI)

    /** `msk_id` from MSK public key bytes as specified. */
    fun mskId(publicKey: ByteArray): String = throw UnsupportedOperationException(NYI)

    /** `absolute_key_id` = unpadded base64url(SHA-256(canonical public key bytes)). */
    fun absoluteKeyId(canonicalPublicKeyBytes: ByteArray): String =
        throw UnsupportedOperationException(NYI)

    /** Short Key ID hint (not unique; collisions MUST be tolerated). */
    fun shortKeyId(absoluteKeyId: String): String = throw UnsupportedOperationException(NYI)
}
