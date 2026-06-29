import 'package:flutter_test/flutter_test.dart';
import 'package:educiv_mobile/data/models/notification.dart';

void main() {
  group('AppNotification', () {
    test('should create with required fields', () {
      final notification = AppNotification(
        id: 1,
        userId: 10,
        schoolId: 1,
        title: 'Test',
        body: 'Body content',
        createdAt: DateTime.now(),
      );
      expect(notification.id, 1);
      expect(notification.title, 'Test');
      expect(notification.body, 'Body content');
      expect(notification.isRead, false);
    });

    test('should serialize to JSON', () {
      final now = DateTime(2024, 1, 15, 10, 30);
      final notification = AppNotification(
        id: 1,
        userId: 10,
        schoolId: 1,
        title: 'Test',
        body: 'Body',
        createdAt: now,
        readAt: now,
      );
      final json = notification.toJson();
      expect(json['id'], 1);
      expect(json['title'], 'Test');
      expect(json['readAt'], isNotNull);
    });

    test('should deserialize from JSON', () {
      final json = {
        'id': 2,
        'userId': 10,
        'schoolId': 1,
        'title': 'Alert',
        'body': 'Important message',
        'createdAt': '2024-01-15T10:30:00.000',
        'type': 'PAYMENT',
      };
      final notification = AppNotification.fromJson(json);
      expect(notification.id, 2);
      expect(notification.type, 'PAYMENT');
      expect(notification.isRead, false);
    });

    test('should support copyWith', () {
      final notification = AppNotification(
        id: 1,
        userId: 10,
        schoolId: 1,
        title: 'Test',
        body: 'Body',
        createdAt: DateTime.now(),
      );
      final updated = notification.copyWith(readAt: DateTime.now());
      expect(updated.isRead, true);
      expect(updated.id, 1);
    });

    test('should default type to info', () {
      final notification = AppNotification(
        id: 1,
        userId: 10,
        schoolId: 1,
        title: 'Test',
        body: 'Body',
        createdAt: DateTime.now(),
      );
      expect(notification.type, 'info');
    });
  });
}
