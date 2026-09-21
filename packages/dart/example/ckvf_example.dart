import 'package:ckvf/ckvf.dart';

Future<void> main() async {
  final unlocked = await Ckvf.create(
    identity: {'type': 'email', 'value': 'alice@example.com'},
    password: 'CKVF-TEST-PASSWORD',
  );
  if (unlocked.container.format != 'CKVF') {
    throw StateError('expected CKVF container');
  }
}

