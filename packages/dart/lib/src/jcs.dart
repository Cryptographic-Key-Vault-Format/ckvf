import 'dart:convert';
import 'dart:typed_data';

import 'errors.dart';

/// RFC 8785 JSON Canonicalization Scheme for CKVF JSON values.
String jcs(Object? value) {
  try {
    return _serialize(value, 0);
  } on CkvfException {
    rethrow;
  } catch (e) {
    fail('ERR_JCS', e.toString());
  }
}

String _serialize(Object? value, int depth) {
  if (depth > 64) fail('ERR_PARSER_LIMIT', 'JCS nesting');
  if (value == null) return 'null';
  if (value is bool) return value ? 'true' : 'false';
  if (value is num) {
    if (value is double && (value.isNaN || value.isInfinite)) {
      fail('ERR_JCS', 'non-finite number');
    }
    if (value is int || (value is double && value == value.truncateToDouble())) {
      if (value is double && value.isNegative && value == 0) return '0';
      return value.toInt().toString();
    }
    return jsonEncode(value);
  }
  if (value is String) return jsonEncode(value);
  if (value is List) {
    return '[${value.map((v) => _serialize(v, depth + 1)).join(',')}]';
  }
  if (value is Map) {
    final keys = value.keys.map((k) => k.toString()).toList()..sort();
    final body = keys
        .map((k) => '${jsonEncode(k)}:${_serialize(value[k], depth + 1)}')
        .join(',');
    return '{$body}';
  }
  fail('ERR_JCS', 'unsupported type ${value.runtimeType}');
}

Uint8List utf8Encode(String s) => Uint8List.fromList(utf8.encode(s));

String utf8Decode(List<int> bytes) => utf8.decode(bytes, allowMalformed: false);

Uint8List jcsBytes(Object? value) => utf8Encode(jcs(value));
