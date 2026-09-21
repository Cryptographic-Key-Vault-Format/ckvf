// Package ckvf is the Cryptographic Key Vault Format (CKVF) Go SDK.
//
// Not implemented in the first pass. This package MUST consume the same
// specification, schemas, registries, and test-vectors as other SDKs. It MUST
// NOT silently redefine CKVF behavior, MUST NOT depend on SComm, and MUST NOT
// rewrite a vault to a newer container version on open.
//
// Intended public API: parse, validate, create, encrypt, decrypt, merge, and
// identifiers (IdentityID, MskID, AbsoluteKeyID, ShortKeyID), plus capability
// queries.
package ckvf

const nyi = "CKVF Go SDK is a template; not implemented in the first pass"

// Value is an opaque vault or container value. Concrete types will match SPEC.md exactly.
type Value struct{}

// CanReadVersion reports whether this build can read the given container version.
func CanReadVersion(version string) bool {
	panic(nyi)
}

// CanWriteVersion reports whether this build can write the given container version.
func CanWriteVersion(version string) bool {
	panic(nyi)
}

// SupportedAlgorithms returns registered AEAD / algorithm identifiers this build implements.
func SupportedAlgorithms() []string {
	panic(nyi)
}

// SupportedKeyEncodings returns registered key encodings this build implements
// (for example openpgp-tsk, pkcs8).
func SupportedKeyEncodings() []string {
	panic(nyi)
}

// SupportedUnlockMethods returns registered unlock methods this build implements
// (for example password-argon2id).
func SupportedUnlockMethods() []string {
	panic(nyi)
}

// Parse parses outer container JSON without decrypting.
func Parse(source string) Value {
	panic(nyi)
}

// Validate checks container structure, encodings, and generation_hash (fail closed).
func Validate(container Value) {
	panic(nyi)
}

// Create builds a new empty vault bound to an Identity (does not encrypt yet).
func Create(identity Value) Value {
	panic(nyi)
}

// Encrypt encrypts a payload under the VEK (AES-256-GCM). Passwords wrap the VEK only.
func Encrypt(payload Value, vek []byte, container Value) Value {
	panic(nyi)
}

// Decrypt decrypts a container (password or unwrapped VEK). MUST NOT rewrite on open.
func Decrypt(container Value, vek []byte, password string) Value {
	panic(nyi)
}

// Merge performs a deterministic merge of two unlocked vaults (no last-writer-wins).
func Merge(a, b Value) Value {
	panic(nyi)
}

// IdentityID returns identity_id = unpadded base64url(SHA-256(canonical identity bytes)).
func IdentityID(typ, value string) string {
	panic(nyi)
}

// MskID returns msk_id from MSK public key bytes as specified.
func MskID(publicKey []byte) string {
	panic(nyi)
}

// AbsoluteKeyID returns absolute_key_id = unpadded base64url(SHA-256(canonical public key bytes)).
func AbsoluteKeyID(canonicalPublicKeyBytes []byte) string {
	panic(nyi)
}

// ShortKeyID returns the Short Key ID hint (not unique; collisions MUST be tolerated).
func ShortKeyID(absoluteKeyID string) string {
	panic(nyi)
}
