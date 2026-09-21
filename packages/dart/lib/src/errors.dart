const ckvfErrorCodes = <String>[
  'ERR_FORMAT',
  'ERR_VERSION',
  'ERR_JSON',
  'ERR_JCS',
  'ERR_BASE64',
  'ERR_PARSER_LIMIT',
  'ERR_AEAD_DECRYPT',
  'ERR_WRAP_DECRYPT',
  'ERR_KDF',
  'ERR_GENERATION_HASH',
  'ERR_GENERATION_CONFLICT',
  'ERR_STALE_GENERATION',
  'ERR_IDENTITY_ID',
  'ERR_IDENTITY_CANON',
  'ERR_IDENTITY_MISMATCH',
  'ERR_MSK',
  'ERR_MSK_EXISTS',
  'ERR_SIGNATURE',
  'ERR_PAYLOAD_HASH',
  'ERR_REPLAY',
  'ERR_OPERATION',
  'ERR_SHORT_KEY_ID',
  'ERR_KEY_ID',
  'ERR_FAMILY',
  'ERR_ENCODING',
  'ERR_STATUS',
  'ERR_SLOT_ID',
  'ERR_CRITICAL_EXTENSION',
  'ERR_EXTENSION',
  'ERR_MERGE_MSK',
  'ERR_MERGE_PREFERRED_KEY',
  'ERR_MERGE_SLOT',
  'ERR_MERGE_VEK',
  'ERR_MERGE_PRIVATE_KEY',
  'ERR_OWNERSHIP',
  'ERR_NOT_IMPLEMENTED',
  'ERR_UNLOCK',
  'ERR_INTERNAL',
];

typedef CkvfErrorCode = String;

class CkvfException implements Exception {
  CkvfException(this.code, [this.message, this.details]);

  final CkvfErrorCode code;
  final String? message;
  final Object? details;

  @override
  String toString() => 'CkvfException($code${message == null ? '' : ': $message'})';
}

Never fail(CkvfErrorCode code, [String? message, Object? details]) {
  throw CkvfException(code, message, details);
}
