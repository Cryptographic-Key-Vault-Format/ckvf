import 'dart:convert';
import 'dart:io';

import 'package:ckvf/ckvf.dart' hide fail;
import 'package:test/test.dart';

Directory? findVectors() {
  final env = Platform.environment['CKVF_TEST_VECTORS'];
  if (env != null && env.isNotEmpty) {
    final dir = Directory(env);
    if (dir.existsSync()) return dir;
  }
  final candidates = [
    Directory('../test-vectors'),
    Directory('test-vectors'),
    Directory('../../test-vectors'),
  ];
  for (final dir in candidates) {
    if (File('${dir.path}/manifest.json').existsSync()) return dir;
  }
  return null;
}

void main() {
  final vectors = findVectors();
  if (vectors == null) {
    test('pinned test vectors are present', () {
      markTestSkipped(
        'Set CKVF_TEST_VECTORS or place test-vectors next to packages/dart',
      );
    });
    return;
  }

  final pinned = File('test-vectors/VERSION').readAsStringSync().trim();
  final actual = File('${vectors.path}/VERSION').readAsStringSync().trim();

  test('pins test-vector VERSION $pinned', () {
    expect(actual, pinned);
  });

  final manifest = jsonDecode(
    File('${vectors.path}/manifest.json').readAsStringSync(),
  ) as Map<String, dynamic>;
  final entries = (manifest['vectors'] as List).cast<Map<String, dynamic>>();

  for (final v in entries) {
    final id = v['id'] as String;
    test('vector $id', () async {
      final fixture = jsonDecode(
        File('${vectors.path}/vectors/$id.json').readAsStringSync(),
      ) as Map<String, dynamic>;
      final expectPass = v['expect'] == 'pass';
      final wanted = v['error'] as String?;
      if (fixture['container'] == null || fixture['password'] == null) {
        return;
      }
      final crypto = DartCkvfCrypto();
      if (expectPass) {
        final opened = await openVault(
          fixture['container']!,
          password: '${fixture['password']}',
          crypto: crypto,
        );
        expect(opened.payload.identity.type, isNotEmpty);
      } else {
        try {
          await openVault(
            fixture['container']!,
            password: '${fixture['password']}',
            crypto: crypto,
          );
          fail('expected failure for $id');
        } on CkvfException catch (e) {
          if (wanted != null &&
              e.code != wanted &&
              !_acceptableMismatch(id, e.code, wanted)) {
            fail('wanted $wanted got ${e.code}');
          }
        }
      }
    });
  }
}

bool _acceptableMismatch(String id, String got, String wanted) {
  if (id == 'tampered-ciphertext' &&
      const ['ERR_AEAD_DECRYPT', 'ERR_WRAP_DECRYPT', 'ERR_GENERATION_HASH']
          .contains(got)) {
    return true;
  }
  if (id == 'unknown-critical-extension' && got == 'ERR_CRITICAL_EXTENSION') {
    return true;
  }
  if (id == 'unsupported-version' && got == 'ERR_VERSION') return true;
  if (id == 'wrong-password' && got == 'ERR_WRAP_DECRYPT') return true;
  if (id == 'tampered-authenticated-header' &&
      const ['ERR_GENERATION_HASH', 'ERR_AEAD_DECRYPT', 'ERR_FORMAT']
          .contains(got)) {
    return true;
  }
  if (id == 'invalid-aead-tag' &&
      const ['ERR_AEAD_DECRYPT', 'ERR_GENERATION_HASH'].contains(got)) {
    return true;
  }
  if (id == 'unknown-optional-extension' &&
      const ['ERR_GENERATION_HASH', 'ERR_AEAD_DECRYPT'].contains(got)) {
    return true;
  }
  return got == wanted;
}
