import 'base64url.dart';
import 'crypto_provider.dart';
import 'errors.dart';
import 'jcs.dart';
import 'types.dart';
import 'validate.dart';

Future<SignedOperation> constructOperation(
  CkvfCrypto crypto, {
  required String operation,
  required String identityId,
  required String vaultId,
  required int generation,
  required String timestamp,
  required Map<String, dynamic> payload,
  required List<int> mskPrivateSeed,
  required String mskId,
  List<int>? nonce,
}) async {
  if (!isRfc3339Z(timestamp)) fail('ERR_FORMAT', 'timestamp');
  final n = nonce ?? crypto.randomBytes(32);
  if (n.length != 32) fail('ERR_FORMAT', 'nonce must be 32 bytes');
  final payloadHash = bytesToBase64url(await crypto.sha256(jcsBytes(payload)));
  final body = SignedBody(
    protocol: ckvfProtocol,
    protocolVersion: ckvfProtocolVersion,
    operation: operation,
    identityId: identityId,
    vaultId: vaultId,
    generation: generation,
    nonce: bytesToBase64url(n),
    timestamp: timestamp,
    payloadHash: payloadHash,
  );
  final sig = await crypto.ed25519Sign(mskPrivateSeed, jcsBytes(body.toJson()));
  return SignedOperation(
    body: body,
    payload: payload,
    signature: OperationSignature(
      algorithm: 'Ed25519',
      mskId: mskId,
      value: bytesToBase64url(sig),
    ),
  );
}

Future<void> verifyOperation(
  CkvfCrypto crypto,
  SignedOperation envelope,
  List<int> publicKey,
  String expectedMskId, {
  Set<String>? replaySeen,
}) async {
  final body = envelope.body;
  if (body.protocol != ckvfProtocol) fail('ERR_OPERATION', 'protocol');
  if (body.protocolVersion != ckvfProtocolVersion) {
    fail('ERR_VERSION', 'protocol_version');
  }
  final payloadHash =
      bytesToBase64url(await crypto.sha256(jcsBytes(envelope.payload)));
  if (payloadHash != body.payloadHash) fail('ERR_PAYLOAD_HASH');
  if (envelope.signature.algorithm != 'Ed25519') {
    fail('ERR_SIGNATURE', 'algorithm');
  }
  final recover =
      body.operation == 'REPLACE_MSK' || body.operation == 'ESTABLISH_MSK';
  if (!recover && envelope.signature.mskId != expectedMskId) {
    fail('ERR_SIGNATURE', 'msk_id');
  }
  if (replaySeen != null) {
    if (replaySeen.contains(body.nonce)) fail('ERR_REPLAY');
    replaySeen.add(body.nonce);
  }
  final ok = await crypto.ed25519Verify(
    publicKey,
    jcsBytes(body.toJson()),
    base64urlToBytes(envelope.signature.value, 64),
  );
  if (!ok) fail('ERR_SIGNATURE');
}

VaultPayload applyOperation(
  VaultPayload payload,
  SignedOperation envelope,
  String now,
) {
  final op = envelope.body.operation;
  final p = envelope.payload;
  switch (op) {
    case 'RETIRE_KEY':
    case 'REVOKE_KEY':
      final id = '${p['absolute_key_id']}';
      final status = op == 'RETIRE_KEY' ? 'retired' : 'revoked';
      return VaultPayload(
        identity: payload.identity,
        msk: payload.msk,
        keys: payload.keys
            .map(
              (k) => k.absoluteKeyId == id ? k.copyWith(status: status) : k,
            )
            .toList(),
        preferredKeys: payload.preferredKeys,
        metadata: VaultMetadata(
          createdAt: payload.metadata.createdAt,
          updatedAt: now,
        ),
        tombstones: payload.tombstones,
        extensions: payload.extensions,
        criticalExtensions: payload.criticalExtensions,
      );
    case 'SET_PREFERRED_KEY':
      final family = p['family'] as String;
      final purpose = p['purpose'] as String;
      final preferred = payload.preferredKeys.map(
        (k, v) => MapEntry(k, Map<String, String>.from(v)),
      );
      preferred.putIfAbsent(family, () => <String, String>{});
      if (p['absolute_key_id'] == null) {
        preferred[family]!.remove(purpose);
      } else {
        preferred[family]![purpose] = '${p['absolute_key_id']}';
      }
      return VaultPayload(
        identity: payload.identity,
        msk: payload.msk,
        keys: payload.keys,
        preferredKeys: preferred,
        metadata: VaultMetadata(
          createdAt: payload.metadata.createdAt,
          updatedAt: now,
        ),
        tombstones: payload.tombstones,
        extensions: payload.extensions,
        criticalExtensions: payload.criticalExtensions,
      );
    case 'DELETE_PRIVATE_KEY':
      final id = '${p['absolute_key_id']}';
      return VaultPayload(
        identity: payload.identity,
        msk: payload.msk,
        keys: payload.keys
            .map(
              (k) => k.absoluteKeyId == id
                  ? k.copyWith(clearPrivateKey: true)
                  : k,
            )
            .toList(),
        preferredKeys: payload.preferredKeys,
        metadata: VaultMetadata(
          createdAt: payload.metadata.createdAt,
          updatedAt: now,
        ),
        tombstones: [
          ...payload.tombstones,
          Tombstone(
            absoluteKeyId: id,
            deletedAt: now,
            nonce: envelope.body.nonce,
            reason: (p['reason'] as String?) ?? 'user-requested',
          ),
        ],
        extensions: payload.extensions,
        criticalExtensions: payload.criticalExtensions,
      );
    case 'ADD_KEY':
      final key = KeyRecord.fromJson(
        Map<String, dynamic>.from(p['key'] as Map),
      );
      if (payload.keys.any((k) => k.absoluteKeyId == key.absoluteKeyId)) {
        fail('ERR_KEY_ID', 'duplicate key');
      }
      return VaultPayload(
        identity: payload.identity,
        msk: payload.msk,
        keys: [...payload.keys, key],
        preferredKeys: payload.preferredKeys,
        metadata: VaultMetadata(
          createdAt: payload.metadata.createdAt,
          updatedAt: now,
        ),
        tombstones: payload.tombstones,
        extensions: payload.extensions,
        criticalExtensions: payload.criticalExtensions,
      );
    default:
      return VaultPayload(
        identity: payload.identity,
        msk: payload.msk,
        keys: payload.keys,
        preferredKeys: payload.preferredKeys,
        metadata: VaultMetadata(
          createdAt: payload.metadata.createdAt,
          updatedAt: now,
        ),
        tombstones: payload.tombstones,
        extensions: payload.extensions,
        criticalExtensions: payload.criticalExtensions,
      );
  }
}
