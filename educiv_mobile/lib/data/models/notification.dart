class AppNotification {
  final int id;
  final int userId;
  final int schoolId;
  final String title;
  final String body;
  final String type;
  final DateTime? readAt;
  final String? link;
  final DateTime createdAt;

  const AppNotification({
    required this.id,
    required this.userId,
    required this.schoolId,
    required this.title,
    required this.body,
    this.type = 'info',
    this.readAt,
    this.link,
    required this.createdAt,
  });

  bool get isRead => readAt != null;

  factory AppNotification.fromJson(Map<String, dynamic> json) {
    return AppNotification(
      id: json['id'] as int,
      userId: json['userId'] as int,
      schoolId: json['schoolId'] as int,
      title: json['title'] as String,
      body: json['body'] as String,
      type: (json['type'] as String?) ?? 'info',
      readAt: json['readAt'] != null ? DateTime.parse(json['readAt'] as String) : null,
      link: json['link'] as String?,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'schoolId': schoolId,
      'title': title,
      'body': body,
      'type': type,
      'readAt': readAt?.toIso8601String(),
      'link': link,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  AppNotification copyWith({
    int? id,
    int? userId,
    int? schoolId,
    String? title,
    String? body,
    String? type,
    DateTime? readAt,
    String? link,
    DateTime? createdAt,
  }) {
    return AppNotification(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      schoolId: schoolId ?? this.schoolId,
      title: title ?? this.title,
      body: body ?? this.body,
      type: type ?? this.type,
      readAt: readAt ?? this.readAt,
      link: link ?? this.link,
      createdAt: createdAt ?? this.createdAt,
    );
  }
}
