enum UserRole {
  director('DIRECTOR'),
  teacher('TEACHER'),
  parent('PARENT'),
  student('STUDENT'),
  accountant('ACCOUNTANT'),
  cashier('CASHIER'),
  educator('EDUCATOR'),
  backoffice('BACKOFFICE');

  const UserRole(this.value);
  final String value;

  factory UserRole.fromString(String value) {
    return UserRole.values.firstWhere(
      (e) => e.value == value,
      orElse: () => UserRole.student,
    );
  }
}

class User {
  final int id;
  final String? email;
  final String? phone;
  final String? name;
  final String? avatarUrl;
  final UserRole role;
  final List<UserRole>? roles;
  final int? schoolId;
  final List<int>? schoolIds;
  final int? primarySchoolId;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  const User({
    required this.id,
    this.email,
    this.phone,
    this.name,
    this.avatarUrl,
    this.role = UserRole.student,
    this.roles,
    this.schoolId,
    this.schoolIds,
    this.primarySchoolId,
    this.createdAt,
    this.updatedAt,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] as int,
      email: json['email'] as String?,
      phone: json['phone'] as String?,
      name: json['name'] as String?,
      avatarUrl: json['avatarUrl'] as String?,
      role: UserRole.fromString((json['role'] as String?) ?? 'STUDENT'),
      roles: json['roles'] != null
          ? (json['roles'] as List).map((e) => UserRole.fromString(e as String)).toList()
          : null,
      schoolId: json['schoolId'] as int?,
      schoolIds: json['schoolIds'] != null
          ? (json['schoolIds'] as List).map((e) => e as int).toList()
          : null,
      primarySchoolId: json['primarySchoolId'] as int?,
      createdAt: json['createdAt'] != null ? DateTime.parse(json['createdAt'] as String) : null,
      updatedAt: json['updatedAt'] != null ? DateTime.parse(json['updatedAt'] as String) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'phone': phone,
      'name': name,
      'avatarUrl': avatarUrl,
      'role': role.value,
      'roles': roles?.map((e) => e.value).toList(),
      'schoolId': schoolId,
      'schoolIds': schoolIds,
      'primarySchoolId': primarySchoolId,
      'createdAt': createdAt?.toIso8601String(),
      'updatedAt': updatedAt?.toIso8601String(),
    };
  }

  User copyWith({
    int? id,
    String? email,
    String? phone,
    String? name,
    String? avatarUrl,
    UserRole? role,
    List<UserRole>? roles,
    int? schoolId,
    List<int>? schoolIds,
    int? primarySchoolId,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return User(
      id: id ?? this.id,
      email: email ?? this.email,
      phone: phone ?? this.phone,
      name: name ?? this.name,
      avatarUrl: avatarUrl ?? this.avatarUrl,
      role: role ?? this.role,
      roles: roles ?? this.roles,
      schoolId: schoolId ?? this.schoolId,
      schoolIds: schoolIds ?? this.schoolIds,
      primarySchoolId: primarySchoolId ?? this.primarySchoolId,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}

class AuthData {
  final String accessToken;
  final String refreshToken;
  final User user;

  const AuthData({
    required this.accessToken,
    required this.refreshToken,
    required this.user,
  });

  factory AuthData.fromJson(Map<String, dynamic> json) {
    return AuthData(
      accessToken: json['accessToken'] as String,
      refreshToken: json['refreshToken'] as String,
      user: User.fromJson(json['user'] as Map<String, dynamic>),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'accessToken': accessToken,
      'refreshToken': refreshToken,
      'user': user.toJson(),
    };
  }
}

class AuthResponse {
  final bool success;
  final AuthData data;

  const AuthResponse({
    required this.success,
    required this.data,
  });

  factory AuthResponse.fromJson(Map<String, dynamic> json) {
    return AuthResponse(
      success: json['success'] as bool,
      data: AuthData.fromJson(json['data'] as Map<String, dynamic>),
    );
  }
}
