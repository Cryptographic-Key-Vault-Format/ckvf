import 'package:unorm_dart/unorm_dart.dart' as unorm;

import 'base64url.dart';
import 'crypto_provider.dart';
import 'errors.dart';
import 'jcs.dart';
import 'limits.dart';
import 'types.dart';

Future<String> identityId(
  IdentityType type,
  String canonicalValue,
  CkvfCrypto crypto,
) async {
  final digest = await crypto.sha256(utf8Encode('$type:$canonicalValue'));
  return bytesToBase64url(digest);
}

String canonicalizeEmail(String raw) {
  final nfc = unorm.nfc(raw).trim();
  final at = nfc.lastIndexOf('@');
  if (at <= 0 || at == nfc.length - 1) {
    fail(
      'ERR_IDENTITY_CANON',
      'email must contain a non-empty local-part and domain',
    );
  }
  final local = nfc.substring(0, at);
  var domain = nfc.substring(at + 1);
  if (RegExp(r'[^\x00-\x7F]').hasMatch(local)) {
    fail('ERR_IDENTITY_CANON', 'v1.0 email local-part must be ASCII');
  }
  if (utf8Encode(nfc).length > defaultLimits.maxIdentityBytes) {
    fail('ERR_PARSER_LIMIT', 'identity too long');
  }
  final localLower = local.replaceAllMapped(
    RegExp('[A-Z]'),
    (m) => m[0]!.toLowerCase(),
  );
  domain = canonicalizeDns(domain);
  return '$localLower@$domain';
}

String canonicalizeDns(String raw) {
  var s = unorm.nfc(raw).trim();
  s = s.replaceAll(RegExp(r'\.+$'), '');
  if (s.isEmpty) fail('ERR_IDENTITY_CANON', 'empty DNS name');
  if (utf8Encode(s).length > defaultLimits.maxIdentityBytes) {
    fail('ERR_PARSER_LIMIT', 'identity too long');
  }
  final labels = s.split('.');
  final ascii = labels.map((label) {
    if (label.isEmpty) fail('ERR_IDENTITY_CANON', 'empty DNS label');
    if (RegExp(r'^[\x00-\x7F]+$').hasMatch(label)) {
      return label.toLowerCase();
    }
    return 'xn--${_punycodeEncode(unorm.nfc(label).toLowerCase())}';
  }).join('.');
  if (ascii.endsWith('.')) fail('ERR_IDENTITY_CANON', 'trailing dot after IDNA');
  return ascii;
}

Future<Identity> makeIdentity(
  IdentityType type,
  String rawValue,
  CkvfCrypto crypto,
) async {
  final value = type == 'email'
      ? canonicalizeEmail(rawValue)
      : canonicalizeDns(rawValue);
  final id = await identityId(type, value, crypto);
  return Identity(type: type, value: value, identityId: id);
}

Future<void> assertIdentity(Identity identity, CkvfCrypto crypto) async {
  final expectedValue = identity.type == 'email'
      ? canonicalizeEmail(identity.value)
      : canonicalizeDns(identity.value);
  if (expectedValue != identity.value) {
    fail('ERR_IDENTITY_CANON', 'identity.value is not canonical');
  }
  final expected = await identityId(identity.type, identity.value, crypto);
  if (expected != identity.identityId) {
    fail('ERR_IDENTITY_ID', 'identity_id mismatch');
  }
}

String _punycodeEncode(String input) {
  const n0 = 128;
  const bias0 = 72;
  const tmin = 1;
  const tmax = 26;
  const base = 36;
  const delimiter = '-';

  final output = <String>[];
  final inputCPs = input.runes.toList();
  final basic = inputCPs.where((c) => c < 128).toList();
  for (final c in basic) {
    output.add(String.fromCharCode(c));
  }
  var handled = basic.length;
  if (handled > 0) output.add(delimiter);
  var n = n0;
  var delta = 0;
  var bias = bias0;
  while (handled < inputCPs.length) {
    var m = 1 << 30;
    for (final c in inputCPs) {
      if (c >= n && c < m) m = c;
    }
    delta += (m - n) * (handled + 1);
    n = m;
    for (final c in inputCPs) {
      if (c < n) {
        delta++;
      } else if (c == n) {
        var q = delta;
        for (var k = base;; k += base) {
          final t = k <= bias
              ? tmin
              : k >= bias + tmax
                  ? tmax
                  : k - bias;
          if (q < t) {
            output.add(_encodeDigit(q));
            break;
          }
          output.add(_encodeDigit(t + ((q - t) % (base - t))));
          q = (q - t) ~/ (base - t);
        }
        bias = _adapt(delta, handled + 1, handled == basic.length);
        delta = 0;
        handled++;
      }
    }
    delta++;
    n++;
  }
  return output.join();
}

String _encodeDigit(int d) => String.fromCharCode(d + 22 + 75 * (d < 26 ? 1 : 0));

int _adapt(int deltaIn, int numPoints, bool firstTime) {
  var d = firstTime ? deltaIn ~/ 700 : deltaIn >> 1;
  d += d ~/ numPoints;
  var k = 0;
  const base = 36;
  const tmin = 1;
  const tmax = 26;
  const skew = 38;
  while (d > ((base - tmin) * tmax) / 2) {
    d = d ~/ (base - tmin);
    k += base;
  }
  return k + ((base - tmin + 1) * d) ~/ (d + skew);
}
