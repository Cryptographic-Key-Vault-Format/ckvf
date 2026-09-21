/// Cryptographic Key Vault Format (CKVF) Swift SDK.
///
/// **Not implemented in the first pass.** This module MUST consume the same
/// specification, schemas, registries, and test-vectors as other SDKs. It MUST
/// NOT silently redefine CKVF behavior, MUST NOT depend on SComm, and MUST NOT
/// rewrite a vault to a newer container version on open.
///
/// Intended public API: parse, validate, create, encrypt, decrypt, merge, and
/// identifiers (`identityId`, `mskId`, `absoluteKeyId`, `shortKeyId`), plus
/// capability queries.
public enum CKVF {
    private static let nyi =
        "CKVF Swift SDK is a template; not implemented in the first pass."

    /// Whether this build can read the given container `version`.
    public static func canReadVersion(_ version: String) -> Bool {
        fatalError(nyi)
    }

    /// Whether this build can write the given container `version`.
    public static func canWriteVersion(_ version: String) -> Bool {
        fatalError(nyi)
    }

    /// Registered AEAD / algorithm identifiers this build implements.
    public static func supportedAlgorithms() -> [String] {
        fatalError(nyi)
    }

    /// Registered key encodings this build implements (for example `openpgp-tsk`, `pkcs8`).
    public static func supportedKeyEncodings() -> [String] {
        fatalError(nyi)
    }

    /// Registered unlock methods this build implements (for example `password-argon2id`).
    public static func supportedUnlockMethods() -> [String] {
        fatalError(nyi)
    }

    /// Parse outer container JSON without decrypting.
    public static func parse(_ source: String) -> Any {
        fatalError(nyi)
    }

    /// Validate container structure, encodings, and `generation_hash` (fail closed).
    public static func validate(_ container: Any) {
        fatalError(nyi)
    }

    /// Create a new empty vault bound to an Identity (does not encrypt yet).
    public static func create(identity: Any) -> Any {
        fatalError(nyi)
    }

    /// Encrypt a payload under the VEK (AES-256-GCM). Passwords wrap the VEK only.
    public static func encrypt(payload: Any, vek: [UInt8], container: Any) -> Any {
        fatalError(nyi)
    }

    /// Decrypt a container (password or unwrapped VEK). MUST NOT rewrite on open.
    public static func decrypt(container: Any, vek: [UInt8]?, password: String?) -> Any {
        fatalError(nyi)
    }

    /// Deterministic merge of two unlocked vaults (no last-writer-wins).
    public static func merge(_ a: Any, _ b: Any) -> Any {
        fatalError(nyi)
    }

    /// `identity_id` = unpadded base64url(SHA-256(canonical identity bytes)).
    public static func identityId(type: String, value: String) -> String {
        fatalError(nyi)
    }

    /// `msk_id` from MSK public key bytes as specified.
    public static func mskId(publicKey: [UInt8]) -> String {
        fatalError(nyi)
    }

    /// `absolute_key_id` = unpadded base64url(SHA-256(canonical public key bytes)).
    public static func absoluteKeyId(canonicalPublicKeyBytes: [UInt8]) -> String {
        fatalError(nyi)
    }

    /// Short Key ID hint (not unique; collisions MUST be tolerated).
    public static func shortKeyId(absoluteKeyId: String) -> String {
        fatalError(nyi)
    }
}
