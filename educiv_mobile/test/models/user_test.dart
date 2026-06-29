import 'package:flutter_test/flutter_test.dart';
import 'package:educiv_mobile/data/models/user.dart';

void main() {
  group('User Model', () {
    test('should create User with required fields', () {
      const user = User(id: 1, name: 'Test User');
      expect(user.id, 1);
      expect(user.name, 'Test User');
    });

    test('should have default role as student', () {
      const user = User(id: 1);
      expect(user.role, UserRole.student);
    });

    test('should serialize to JSON', () {
      const user = User(id: 1, name: 'Test', email: 'test@test.com');
      final json = user.toJson();
      expect(json['id'], 1);
      expect(json['name'], 'Test');
      expect(json['email'], 'test@test.com');
    });

    test('should deserialize from JSON', () {
      final json = {
        'id': 1,
        'name': 'Test',
        'role': 'DIRECTOR',
        'email': 'test@test.com',
      };
      final user = User.fromJson(json);
      expect(user.id, 1);
      expect(user.role, UserRole.director);
    });

    test('should support copyWith', () {
      const user = User(id: 1, name: 'Original');
      final updated = user.copyWith(name: 'Updated');
      expect(updated.name, 'Updated');
      expect(updated.id, 1);
    });

    test('should handle null optional fields', () {
      const user = User(id: 1);
      expect(user.email, isNull);
      expect(user.phone, isNull);
      expect(user.schoolId, isNull);
      expect(user.roles, isNull);
    });
  });

  group('UserRole', () {
    test('should have all 8 roles', () {
      expect(UserRole.values.length, 8);
    });

    test('should include all expected roles', () {
      expect(UserRole.values, contains(UserRole.director));
      expect(UserRole.values, contains(UserRole.teacher));
      expect(UserRole.values, contains(UserRole.parent));
      expect(UserRole.values, contains(UserRole.student));
      expect(UserRole.values, contains(UserRole.accountant));
      expect(UserRole.values, contains(UserRole.cashier));
      expect(UserRole.values, contains(UserRole.educator));
      expect(UserRole.values, contains(UserRole.backoffice));
    });
  });

  group('AuthResponse', () {
    test('should serialize to JSON', () {
      final response = AuthResponse(
        success: true,
        data: const AuthData(
          accessToken: 'token',
          refreshToken: 'refresh',
          user: User(id: 1),
        ),
      );
      final json = response.toJson();
      expect(json['success'], true);
      expect(json['data']['accessToken'], 'token');
    });

    test('should deserialize from JSON', () {
      final json = {
        'success': true,
        'data': {
          'accessToken': 'token123',
          'refreshToken': 'refresh456',
          'user': {'id': 1, 'name': 'Test'},
        },
      };
      final response = AuthResponse.fromJson(json);
      expect(response.success, true);
      expect(response.data.accessToken, 'token123');
      expect(response.data.user.id, 1);
    });
  });
}
