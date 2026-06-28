import 'package:freezed_annotation/freezed_annotation.dart';

part 'user.freezed.dart';
part 'user.g.dart';

enum UserRole {
  @JsonValue('DIRECTOR')
  director,
  @JsonValue('TEACHER')
  teacher,
  @JsonValue('PARENT')
  parent,
  @JsonValue('STUDENT')
  student,
  @JsonValue('ACCOUNTANT')
  accountant,
  @JsonValue('CASHIER')
  cashier,
  @JsonValue('EDUCATOR')
  educator,
  @JsonValue('BACKOFFICE')
  backoffice,
}

@freezed
class User with _$User {
  const factory User({
    required int id,
    String? email,
    String? phone,
    String? name,
    String? avatarUrl,
    @Default(UserRole.student) UserRole role,
    List<UserRole>? roles,
    int? schoolId,
    List<int>? schoolIds,
    int? primarySchoolId,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) = _User;

  factory User.fromJson(Map<String, dynamic> json) => _$UserFromJson(json);
}

@freezed
class AuthResponse with _$AuthResponse {
  const factory AuthResponse({
    required bool success,
    required AuthData data,
  }) = _AuthResponse;

  factory AuthResponse.fromJson(Map<String, dynamic> json) => _$AuthResponseFromJson(json);
}

@freezed
class AuthData with _$AuthData {
  const factory AuthData({
    required String accessToken,
    required String refreshToken,
    required User user,
  }) = _AuthData;

  factory AuthData.fromJson(Map<String, dynamic> json) => _$AuthDataFromJson(json);
}
