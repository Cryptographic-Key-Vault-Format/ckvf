namespace Ckvf;

/// <summary>
/// Cryptographic Key Vault Format (CKVF) .NET SDK.
/// <para>
/// <b>Not implemented in the first pass.</b> This library MUST consume the same
/// specification, schemas, registries, and test-vectors as other SDKs. It MUST
/// NOT silently redefine CKVF behavior, MUST NOT depend on SComm, and MUST NOT
/// rewrite a vault to a newer container version on open.
/// </para>
/// <para>
/// Intended public API: parse, validate, create, encrypt, decrypt, merge, and
/// identifiers (<c>IdentityId</c>, <c>MskId</c>, <c>AbsoluteKeyId</c>,
/// <c>ShortKeyId</c>), plus capability queries.
/// </para>
/// </summary>
public static class Ckvf
{
    private const string Nyi = "CKVF .NET SDK is a template; not implemented in the first pass.";

    /// <summary>Whether this build can read the given container <c>version</c>.</summary>
    public static bool CanReadVersion(string version) =>
        throw new NotImplementedException(Nyi);

    /// <summary>Whether this build can write the given container <c>version</c>.</summary>
    public static bool CanWriteVersion(string version) =>
        throw new NotImplementedException(Nyi);

    /// <summary>Registered AEAD / algorithm identifiers this build implements.</summary>
    public static IReadOnlyList<string> SupportedAlgorithms() =>
        throw new NotImplementedException(Nyi);

    /// <summary>Registered key encodings this build implements (for example <c>openpgp-tsk</c>, <c>pkcs8</c>).</summary>
    public static IReadOnlyList<string> SupportedKeyEncodings() =>
        throw new NotImplementedException(Nyi);

    /// <summary>Registered unlock methods this build implements (for example <c>password-argon2id</c>).</summary>
    public static IReadOnlyList<string> SupportedUnlockMethods() =>
        throw new NotImplementedException(Nyi);

    /// <summary>Parse outer container JSON without decrypting.</summary>
    public static object Parse(string source) =>
        throw new NotImplementedException(Nyi);

    /// <summary>Validate container structure, encodings, and <c>generation_hash</c> (fail closed).</summary>
    public static void Validate(object container) =>
        throw new NotImplementedException(Nyi);

    /// <summary>Create a new empty vault bound to an Identity (does not encrypt yet).</summary>
    public static object Create(object identity) =>
        throw new NotImplementedException(Nyi);

    /// <summary>Encrypt a payload under the VEK (AES-256-GCM). Passwords wrap the VEK only.</summary>
    public static object Encrypt(object payload, byte[] vek, object container) =>
        throw new NotImplementedException(Nyi);

    /// <summary>Decrypt a container (password or unwrapped VEK). MUST NOT rewrite on open.</summary>
    public static object Decrypt(object container, byte[]? vek = null, string? password = null) =>
        throw new NotImplementedException(Nyi);

    /// <summary>Deterministic merge of two unlocked vaults (no last-writer-wins).</summary>
    public static object Merge(object a, object b) =>
        throw new NotImplementedException(Nyi);

    /// <summary><c>identity_id</c> = unpadded base64url(SHA-256(canonical identity bytes)).</summary>
    public static string IdentityId(string type, string value) =>
        throw new NotImplementedException(Nyi);

    /// <summary><c>msk_id</c> from MSK public key bytes as specified.</summary>
    public static string MskId(byte[] publicKey) =>
        throw new NotImplementedException(Nyi);

    /// <summary><c>absolute_key_id</c> = unpadded base64url(SHA-256(canonical public key bytes)).</summary>
    public static string AbsoluteKeyId(byte[] canonicalPublicKeyBytes) =>
        throw new NotImplementedException(Nyi);

    /// <summary>Short Key ID hint (not unique; collisions MUST be tolerated).</summary>
    public static string ShortKeyId(string absoluteKeyId) =>
        throw new NotImplementedException(Nyi);
}
