export interface CkvfCrypto {
  randomBytes(n: number): Uint8Array;
  sha256(data: Uint8Array): Promise<Uint8Array>;
  aes256gcmEncrypt(
    key: Uint8Array,
    iv: Uint8Array,
    plaintext: Uint8Array,
    aad: Uint8Array,
  ): Promise<{ ciphertext: Uint8Array; tag: Uint8Array }>;
  aes256gcmDecrypt(
    key: Uint8Array,
    iv: Uint8Array,
    ciphertext: Uint8Array,
    tag: Uint8Array,
    aad: Uint8Array,
  ): Promise<Uint8Array>;
  argon2id(params: {
    password: Uint8Array;
    salt: Uint8Array;
    m: number;
    t: number;
    p: number;
    keyLength: number;
  }): Promise<Uint8Array>;
  ed25519Generate(): Promise<{ publicKey: Uint8Array; privateKey: Uint8Array }>;
  ed25519PublicFromSeed(seed: Uint8Array): Promise<Uint8Array>;
  ed25519Sign(seed: Uint8Array, message: Uint8Array): Promise<Uint8Array>;
  ed25519Verify(publicKey: Uint8Array, message: Uint8Array, signature: Uint8Array): Promise<boolean>;
}

export function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i]! ^ b[i]!;
  return diff === 0;
}
