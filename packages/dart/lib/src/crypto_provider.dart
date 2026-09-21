import 'dart:typed_data';

abstract class CkvfCrypto {
  Uint8List randomBytes(int n);

  Future<Uint8List> sha256(List<int> data);

  Future<({Uint8List ciphertext, Uint8List tag})> aes256gcmEncrypt(
    List<int> key,
    List<int> iv,
    List<int> plaintext,
    List<int> aad,
  );

  Future<Uint8List> aes256gcmDecrypt(
    List<int> key,
    List<int> iv,
    List<int> ciphertext,
    List<int> tag,
    List<int> aad,
  );

  Future<Uint8List> argon2id({
    required List<int> password,
    required List<int> salt,
    required int m,
    required int t,
    required int p,
    required int keyLength,
  });

  Future<({Uint8List publicKey, Uint8List privateKey})> ed25519Generate();

  Future<Uint8List> ed25519PublicFromSeed(List<int> seed);

  Future<Uint8List> ed25519Sign(List<int> seed, List<int> message);

  Future<bool> ed25519Verify(
    List<int> publicKey,
    List<int> message,
    List<int> signature,
  );
}

bool constantTimeEqual(List<int> a, List<int> b) {
  if (a.length != b.length) return false;
  var diff = 0;
  for (var i = 0; i < a.length; i++) {
    diff |= a[i] ^ b[i];
  }
  return diff == 0;
}
