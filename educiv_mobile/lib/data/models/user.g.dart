// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'user.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_User _$UserFromJson(Map<String, dynamic> json) => _User(
  id: (json['id'] as num).toInt(),
  email: json['email'] as String?,
  phone: json['phone'] as String?,
  name: json['name'] as String?,
  avatarUrl: json['avatarUrl'] as String?,
  role:
      $enumDecodeNullable(_$UserRoleEnumMap, json['role']) ?? UserRole.student,
  roles: (json['roles'] as List<dynamic>?)
      ?.map((e) => $enumDecode(_$UserRoleEnumMap, e))
      .toList(),
  schoolId: (json['schoolId'] as num?)?.toInt(),
  schoolIds: (json['schoolIds'] as List<dynamic>?)
      ?.map((e) => (e as num).toInt())
      .toList(),
  primarySchoolId: (json['primarySchoolId'] as num?)?.toInt(),
  createdAt: json['createdAt'] == null
      ? null
      : DateTime.parse(json['createdAt'] as String),
  updatedAt: json['updatedAt'] == null
      ? null
      : DateTime.parse(json['updatedAt'] as String),
);

Map<String, dynamic> _$UserToJson(_User instance) => <String, dynamic>{
  'id': instance.id,
  'email': instance.email,
  'phone': instance.phone,
  'name': instance.name,
  'avatarUrl': instance.avatarUrl,
  'role': _$UserRoleEnumMap[instance.role]!,
  'roles': instance.roles?.map((e) => _$UserRoleEnumMap[e]!).toList(),
  'schoolId': instance.schoolId,
  'schoolIds': instance.schoolIds,
  'primarySchoolId': instance.primarySchoolId,
  'createdAt': instance.createdAt?.toIso8601String(),
  'updatedAt': instance.updatedAt?.toIso8601String(),
};

const _$UserRoleEnumMap = {
  UserRole.director: 'DIRECTOR',
  UserRole.teacher: 'TEACHER',
  UserRole.parent: 'PARENT',
  UserRole.student: 'STUDENT',
  UserRole.accountant: 'ACCOUNTANT',
  UserRole.cashier: 'CASHIER',
  UserRole.educator: 'EDUCATOR',
  UserRole.backoffice: 'BACKOFFICE',
};

_AuthResponse _$AuthResponseFromJson(Map<String, dynamic> json) =>
    _AuthResponse(
      success: json['success'] as bool,
      data: AuthData.fromJson(json['data'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$AuthResponseToJson(_AuthResponse instance) =>
    <String, dynamic>{'success': instance.success, 'data': instance.data};

_AuthData _$AuthDataFromJson(Map<String, dynamic> json) => _AuthData(
  accessToken: json['accessToken'] as String,
  refreshToken: json['refreshToken'] as String,
  user: User.fromJson(json['user'] as Map<String, dynamic>),
);

Map<String, dynamic> _$AuthDataToJson(_AuthData instance) => <String, dynamic>{
  'accessToken': instance.accessToken,
  'refreshToken': instance.refreshToken,
  'user': instance.user,
};
