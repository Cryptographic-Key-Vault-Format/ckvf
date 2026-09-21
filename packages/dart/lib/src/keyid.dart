import 'dart:typed_data';

import 'base64url.dart';
import 'crypto_provider.dart';
import 'errors.dart';
import 'openpgp.dart';
import 'pkcs8.dart';
import 'types.dart';

const _hex = '0123456789ABCDEF';

Future<String> absoluteKeyId(
  List<int> canonicalPublicKey,
  CkvfCrypto crypto,
) async {
  final digest = await crypto.sha256(canonicalPublicKey);
  return bytesToBase64url(digest);
}

/// Short Key IDs are lookup hints and are not unique identifiers.
String shortKeyIdFromDigest(List<int> digest) {
  if (digest.length < 4) fail('ERR_SHORT_KEY_ID', 'digest too short');
  final hex = StringBuffer();
  for (var i = 0; i < 4; i++) {
    final b = digest[i];
    hex.write(_hex[(b >> 4) & 15]);
    hex.write(_hex[b & 15]);
  }
  final s = hex.toString();
  return '${s.substring(0, 4)}-${s.substring(4, 8)}';
}

Future<String> shortKeyId(List<int> canonicalPublicKey, CkvfCrypto crypto) async {
  final digest = await crypto.sha256(canonicalPublicKey);
  return shortKeyIdFromDigest(digest);
}

Future<({String absoluteKeyId, String shortKeyId})> keyIds(
  List<int> canonicalPublicKey,
  CkvfCrypto crypto,
) async {
  final digest = await crypto.sha256(canonicalPublicKey);
  return (
    absoluteKeyId: bytesToBase64url(digest),
    shortKeyId: shortKeyIdFromDigest(digest),
  );
}

Uint8List canonicalPublicKeyBytes(
  KeyEncoding encoding,
  String publicKeyB64, [
  String? privateKeyB64,
]) {
  final pub = base64urlToBytes(publicKeyB64);
  if (encoding == 'openpgp-tsk') {
    return canonicalOpenPgpPublicKey(
      pub,
      privateKeyB64 == null ? null : base64urlToBytes(privateKeyB64),
    );
  }
  if (encoding == 'pkcs8' || encoding == 'pkcs12') {
    if (_looksLikeSpki(pub)) return pub;
    if (privateKeyB64 != null) {
      try {
        return encoding == 'pkcs8'
            ? spkiFromPkcs8(base64urlToBytes(privateKeyB64))
            : pub;
      } catch (_) {
        return pub;
      }
    }
    return pub;
  }
  fail('ERR_ENCODING', 'unsupported encoding $encoding');
}

bool _looksLikeSpki(List<int> bytes) => bytes.length >= 2 && bytes[0] == 0x30;
