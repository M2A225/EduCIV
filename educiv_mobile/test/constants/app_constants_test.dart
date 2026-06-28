import 'package:flutter_test/flutter_test.dart';
import 'package:educiv_mobile/core/constants/app_constants.dart';

void main() {
  group('AppConstants', () {
    test('should have correct app name', () {
      expect(AppConstants.appName, 'EduCIV');
    });

    test('should have correct version', () {
      expect(AppConstants.appVersion, '1.0.0');
    });

    test('should have correct storage keys', () {
      expect(AppConstants.tokenKey, 'access_token');
      expect(AppConstants.refreshTokenKey, 'refresh_token');
      expect(AppConstants.userKey, 'user_data');
      expect(AppConstants.schoolIdKey, 'current_school_id');
      expect(AppConstants.roleKey, 'active_role');
    });

    test('should have all required keys', () {
      expect(AppConstants.tokenKey.isNotEmpty, true);
      expect(AppConstants.refreshTokenKey.isNotEmpty, true);
      expect(AppConstants.userKey.isNotEmpty, true);
    });
  });
}
