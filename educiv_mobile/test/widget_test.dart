import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:educiv_mobile/main.dart';
import 'package:educiv_mobile/data/repositories/auth_provider.dart';
import 'package:educiv_mobile/data/models/user.dart';

void main() {
  testWidgets('App should render', (WidgetTester tester) async {
    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          authProvider.overrideWith(() => _MockAuthNotifier()),
        ],
        child: const EduCIVApp(),
      ),
    );
    await tester.pump();
    expect(find.byType(MaterialApp), findsOneWidget);
  });
}

class _MockAuthNotifier extends Notifier<AuthState> implements AuthNotifier {
  @override
  AuthState build() => AuthState.unauthenticated;

  @override
  Future<void> login(String email, String password) async {}

  @override
  Future<void> logout() async {}

  @override
  Future<void> init() async {}

  @override
  User? get user => null;

  @override
  void setLocalStorage(dynamic localStorage) {}
}
