// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'notification.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_AppNotification _$AppNotificationFromJson(Map<String, dynamic> json) =>
    _AppNotification(
      id: (json['id'] as num).toInt(),
      userId: (json['userId'] as num).toInt(),
      schoolId: (json['schoolId'] as num).toInt(),
      title: json['title'] as String,
      body: json['body'] as String,
      type: json['type'] as String? ?? 'info',
      readAt: json['readAt'] == null
          ? null
          : DateTime.parse(json['readAt'] as String),
      link: json['link'] as String?,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );

Map<String, dynamic> _$AppNotificationToJson(_AppNotification instance) =>
    <String, dynamic>{
      'id': instance.id,
      'userId': instance.userId,
      'schoolId': instance.schoolId,
      'title': instance.title,
      'body': instance.body,
      'type': instance.type,
      'readAt': instance.readAt?.toIso8601String(),
      'link': instance.link,
      'createdAt': instance.createdAt.toIso8601String(),
    };
