import { argon2id as argon2idWasm } from "hash-wasm";
import type { CkvfCrypto } from "@ckvf/core";
import { CkvfError } from "@ckvf/core";

function toBuf(u: Uint8Array): Uint8Array<ArrayBuffer> {
  const out = new Uint8Array(u.length);
  out.set(u);
  return out;
}

export function createBrowserCrypto(subtle: SubtleCrypto = globalThis.crypto.subtle): CkvfCrypto {
  const web = globalThis.crypto;
  if (!subtle || !web?.getRandomValues) {
    throw new CkvfError("ERR_NOT_IMPLEMENTED", "WebCrypto is required");
  }
  return {
    randomBytes(n: number): Uint8Array {
      const out = new Uint8Array(n);
      web.getRandomValues(out);
      return out;
    },
    async sha256(data: Uint8Array): Promise<Uint8Array> {
      return new Uint8Array(await subtle.digest("SHA-256", toBuf(data)));
    },
    async aes256gcmEncrypt(key, iv, plaintext, aad) {
      const cryptoKey = await subtle.importKey("raw", toBuf(key), "AES-GCM", false, ["encrypt"]);
      const buf = new Uint8Array(
        await subtle.encrypt(
          { name: "AES-GCM", iv: toBuf(iv), additionalData: toBuf(aad), tagLength: 128 },
          cryptoKey,
          toBuf(plaintext),
        ),
      );
      return { ciphertext: buf.subarray(0, buf.length - 16), tag: buf.subarray(buf.length - 16) };
    },
    async aes256gcmDecrypt(key, iv, ciphertext, tag, aad) {
      try {
        const cryptoKey = await subtle.importKey("raw", toBuf(key), "AES-GCM", false, ["decrypt"]);
        const combined = new Uint8Array(ciphertext.length + tag.length);
        combined.set(ciphertext);
        combined.set(tag, ciphertext.length);
        return new Uint8Array(
          await subtle.decrypt(
            { name: "AES-GCM", iv: toBuf(iv), additionalData: toBuf(aad), tagLength: 128 },
            cryptoKey,
            combined,
          ),
        );
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
      const pair = (await subtle.generateKey({ name: "Ed25519" }, true, ["sign", "verify"])) as CryptoKeyPair;
      const pkcs8 = new Uint8Array(await subtle.exportKey("pkcs8", pair.privateKey));
      const publicKey = new Uint8Array(await subtle.exportKey("raw", pair.publicKey));
      return { publicKey, privateKey: pkcs8.subarray(pkcs8.length - 32) };
    },
    async ed25519PublicFromSeed(seed: Uint8Array) {
      const key = await importSeed(subtle, seed);
      return new Uint8Array(await subtle.exportKey("raw", key.publicKey));
    },
    async ed25519Sign(seed: Uint8Array, message: Uint8Array) {
      const key = await importSeed(subtle, seed);
      return new Uint8Array(await subtle.sign({ name: "Ed25519" }, key.privateKey, toBuf(message)));
    },
    async ed25519Verify(publicKey: Uint8Array, message: Uint8Array, signature: Uint8Array) {
      const key = await subtle.importKey("raw", toBuf(publicKey), { name: "Ed25519" }, true, ["verify"]);
      return subtle.verify({ name: "Ed25519" }, key, toBuf(signature), toBuf(message));
    },
  };
}

async function importSeed(subtle: SubtleCrypto, seed: Uint8Array): Promise<CryptoKeyPair> {
  const pkcs8 = new Uint8Array(48);
  pkcs8.set([0x30, 0x2e, 0x02, 0x01, 0x00, 0x30, 0x05, 0x06, 0x03, 0x2b, 0x65, 0x70, 0x04, 0x22, 0x04, 0x20]);
  pkcs8.set(seed, 16);
  const privateKey = await subtle.importKey("pkcs8", pkcs8, { name: "Ed25519" }, true, ["sign"]);
  const jwk = await subtle.exportKey("jwk", privateKey);
  const publicKey = await subtle.importKey(
    "jwk",
    { kty: "OKP", crv: "Ed25519", x: jwk.x },
    { name: "Ed25519" },
    true,
    ["verify"],
  );
  return { privateKey, publicKey };
}
