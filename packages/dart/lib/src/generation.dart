import 'aad.dart';
import 'base64url.dart';
import 'crypto_provider.dart';
import 'errors.dart';
import 'jcs.dart';
import 'types.dart';

Future<String> computeGenerationHash(
  VaultContainer container,
  CkvfCrypto crypto,
) async {
  final digest =
      await crypto.sha256(jcsBytes(containerWithoutGenerationHash(container)));
  return bytesToBase64url(digest);
}

Future<void> assertGenerationHash(
  VaultContainer container,
  CkvfCrypto crypto,
) async {
  final expected = await computeGenerationHash(container, crypto);
  final actual = base64urlToBytes(container.generationHash, 32);
  final exp = base64urlToBytes(expected, 32);
  if (!constantTimeEqual(actual, exp)) {
    fail('ERR_GENERATION_HASH', 'generation_hash mismatch');
  }
}

void detectStaleGeneration(VaultContainer local, VaultContainer remoteHead) {
  if (local.vaultId != remoteHead.vaultId) {
    fail('ERR_FORMAT', 'vault_id mismatch');
  }
  if (local.generation < remoteHead.generation) {
    fail('ERR_STALE_GENERATION', 'local generation is behind head');
  }
}

void detectGenerationConflict(VaultContainer a, VaultContainer b) {
  if (a.vaultId != b.vaultId) fail('ERR_FORMAT', 'vault_id mismatch');
  if (a.generation == b.generation && a.generationHash != b.generationHash) {
    fail('ERR_GENERATION_CONFLICT', 'same generation, different generation_hash');
  }
}
