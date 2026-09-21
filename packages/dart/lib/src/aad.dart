import 'dart:typed_data';

import 'jcs.dart';
import 'types.dart';

Map<String, dynamic> aadObject(VaultContainer container) {
  return {
    'critical_extensions':
        container.criticalExtensions.map((e) => e.toJson()).toList(),
    'crypto': {'aead': container.crypto.aead, 'iv': container.crypto.iv},
    'extensions': container.extensions.map((e) => e.toJson()).toList(),
    'format': container.format,
    'generation': container.generation,
    'previous_generation_hash': container.previousGenerationHash,
    'unlock_slots': container.unlockSlots.map((s) => s.toJson()).toList(),
    'vault_id': container.vaultId,
    'version': container.version,
  };
}

Uint8List vaultAad(VaultContainer container) => utf8Encode(jcs(aadObject(container)));

Uint8List wrapAad(String method, String slotId, String vaultId) {
  return utf8Encode(
    jcs({
      'method': method,
      'slot_id': slotId,
      'vault_id': vaultId,
    }),
  );
}

Map<String, dynamic> containerWithoutGenerationHash(VaultContainer container) {
  final json = container.toJson();
  json.remove('generation_hash');
  return json;
}

String slotFingerprint(UnlockSlot slot) => jcs(slot.toJson());
