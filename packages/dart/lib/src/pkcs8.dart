import 'dart:typed_data';

import 'errors.dart';

Uint8List buildPkcs8Ed25519(List<int> seed, [List<int>? publicKey]) {
  if (seed.length != 32) fail('ERR_ENCODING', 'Ed25519 seed must be 32 bytes');
  final out = Uint8List(48);
  out.setAll(0, const [
    0x30, 0x2e, 0x02, 0x01, 0x00, 0x30, 0x05, 0x06,
    0x03, 0x2b, 0x65, 0x70, 0x04, 0x22, 0x04, 0x20,
  ]);
  out.setRange(16, 48, seed);
  return out;
}

Uint8List buildSpkiEd25519(List<int> publicKey) {
  if (publicKey.length != 32) {
    fail('ERR_ENCODING', 'Ed25519 public key must be 32 bytes');
  }
  final out = Uint8List(44);
  out.setAll(0, const [
    0x30, 0x2a, 0x30, 0x05, 0x06, 0x03, 0x2b, 0x65, 0x70, 0x03, 0x21, 0x00,
  ]);
  out.setRange(12, 44, publicKey);
  return out;
}

Uint8List spkiFromPkcs8(List<int> pkcs8) {
  if (pkcs8.length == 48 && pkcs8[0] == 0x30 && pkcs8[8] == 0x2b) {
    fail('ERR_ENCODING', 'PKCS#8 lacks publicKey; supply canonical SPKI');
  }
  fail('ERR_ENCODING', 'unsupported PKCS#8');
}
