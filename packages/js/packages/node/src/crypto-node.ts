import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createPrivateKey,
  createPublicKey,
  generateKeyPairSync,
  randomBytes,
  sign,
  verify,
} from "node:crypto";
import { argon2id as argon2idWasm } from "hash-wasm";
import type { CkvfCrypto } from "@ckvf/core";
import { CkvfError } from "@ckvf/core";

export function createNodeCrypto(): CkvfCrypto {
  return {
    randomBytes(n: number): Uint8Array {
      return new Uint8Array(randomBytes(n));
    },
    async sha256(data: Uint8Array): Promise<Uint8Array> {
      return new Uint8Array(createHash("sha256").update(data).digest());
    },
    async aes256gcmEncrypt(key, iv, plaintext, aad) {
      const cipher = createCipheriv("aes-256-gcm", key, iv);
      cipher.setAAD(aad);
      const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
      return { ciphertext: new Uint8Array(ciphertext), tag: new Uint8Array(cipher.getAuthTag()) };
    },
    async aes256gcmDecrypt(key, iv, ciphertext, tag, aad) {
      try {
        const decipher = createDecipheriv("aes-256-gcm", key, iv);
        decipher.setAAD(aad);
        decipher.setAuthTag(tag);
        const plain = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
        return new Uint8Array(plain);
      } catch {
        throw new CkvfError("ERR_AEAD_DECRYPT");
      }
    },
    async argon2id({ password, salt, m, t, p, keyLength }) {
      const hash = await argon2idWasm({
        password,
        salt,
        parallelism: p,
        iterations: t,
        memorySize: m,
        hashLength: keyLength,
        outputType: "binary",
      });
      return hash instanceof Uint8Array ? hash : new Uint8Array(hash);
    },
    async ed25519Generate() {
      const { publicKey, privateKey } = generateKeyPairSync("ed25519");
      const pubJwk = publicKey.export({ format: "jwk" });
      const privJwk = privateKey.export({ format: "jwk" });
      return {
        publicKey: b64urlToBytes(pubJwk.x!),
        privateKey: b64urlToBytes(privJwk.d!),
      };
    },
    async ed25519PublicFromSeed(seed: Uint8Array) {
      const { publicKey } = keysFromSeed(seed);
      const jwk = publicKey.export({ format: "jwk" });
      return b64urlToBytes(jwk.x!);
    },
    async ed25519Sign(seed: Uint8Array, message: Uint8Array) {
      const { privateKey } = keysFromSeed(seed);
      return new Uint8Array(sign(null, message, privateKey));
    },
    async ed25519Verify(publicKey: Uint8Array, message: Uint8Array, signature: Uint8Array) {
      const key = createPublicKey({
        key: { kty: "OKP", crv: "Ed25519", x: bytesToB64url(publicKey) },
        format: "jwk",
      });
      return verify(null, message, key, signature);
    },
  };
}

function keysFromSeed(seed: Uint8Array) {
  const pkcs8 = Buffer.concat([Buffer.from("302e020100300506032b657004220420", "hex"), Buffer.from(seed)]);
  const privateKey = createPrivateKey({ key: pkcs8, format: "der", type: "pkcs8" });
  const publicKey = createPublicKey(privateKey);
  return { privateKey, publicKey };
}

function bytesToB64url(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("base64url");
}

function b64urlToBytes(s: string): Uint8Array {
  return new Uint8Array(Buffer.from(s, "base64url"));
}
