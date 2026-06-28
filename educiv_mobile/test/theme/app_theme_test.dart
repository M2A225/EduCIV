import 'package:flutter_test/flutter_test.dart';
import 'package:educiv_mobile/core/theme/app_theme.dart';

void main() {
  group('AppTheme', () {
    test('should have light theme', () {
      expect(AppTheme.light, isNotNull);
    });

    test('should have dark theme', () {
      expect(AppTheme.dark, isNotNull);
    });

    test('light theme should use Material 3', () {
      expect(AppTheme.light.useMaterial3, true);
    });

    test('dark theme should use Material 3', () {
      expect(AppTheme.dark.useMaterial3, true);
    });

    test('themes should have different brightness', () {
      expect(AppTheme.light.brightness, Brightness.light);
      expect(AppTheme.dark.brightness, Brightness.dark);
    });
  });
}
