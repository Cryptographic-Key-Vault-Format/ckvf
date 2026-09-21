import 'dart:typed_data';

import 'errors.dart';

const _alphabet =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

String bytesToBase64url(List<int> bytes) {
  final out = StringBuffer();
  for (var i = 0; i < bytes.length; i += 3) {
    final a = bytes[i];
    final b = i + 1 < bytes.length ? bytes[i + 1] : 0;
    final c = i + 2 < bytes.length ? bytes[i + 2] : 0;
    final triple = (a << 16) | (b << 8) | c;
    out.write(_alphabet[(triple >> 18) & 63]);
    out.write(_alphabet[(triple >> 12) & 63]);
    if (i + 1 < bytes.length) out.write(_alphabet[(triple >> 6) & 63]);
    if (i + 2 < bytes.length) out.write(_alphabet[triple & 63]);
  }
  return out.toString();
}

Uint8List base64urlToBytes(String s, [int? expectedLength]) {
  if (!RegExp(r'^[A-Za-z0-9_-]*$').hasMatch(s) || s.contains('=')) {
    fail('ERR_BASE64', 'padded or non-base64url encoding');
  }
  if (s.length % 4 == 1) {
    fail('ERR_BASE64', 'invalid base64url length');
  }
  final table = Uint8List(128)..fillRange(0, 128, 255);
  for (var i = 0; i < _alphabet.length; i++) {
    table[_alphabet.codeUnitAt(i)] = i;
  }
  final len = (s.length * 3) ~/ 4;
  final out = Uint8List(len);
  var o = 0;
  for (var i = 0; i < s.length; i += 4) {
    final c0 = i < s.length ? table[s.codeUnitAt(i)] : 255;
    final c1 = i + 1 < s.length ? table[s.codeUnitAt(i + 1)] : 255;
    final c2 = i + 2 < s.length ? table[s.codeUnitAt(i + 2)] : 0;
    final c3 = i + 3 < s.length ? table[s.codeUnitAt(i + 3)] : 0;
    if (c0 == 255 ||
        c1 == 255 ||
        (i + 2 < s.length && c2 == 255) ||
        (i + 3 < s.length && c3 == 255)) {
      fail('ERR_BASE64', 'invalid base64url character');
    }
    final triple = (c0 << 18) | (c1 << 12) | (c2 << 6) | c3;
    if (o < len) out[o++] = (triple >> 16) & 255;
    if (o < len && i + 2 < s.length) out[o++] = (triple >> 8) & 255;
    if (o < len && i + 3 < s.length) out[o++] = triple & 255;
  }
  if (expectedLength != null && out.length != expectedLength) {
    fail('ERR_BASE64', 'expected $expectedLength bytes, got ${out.length}');
  }
  return out;
}
