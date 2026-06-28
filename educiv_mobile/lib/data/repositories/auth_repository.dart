import 'package:dio/dio.dart';
import '../models/user.dart';

class AuthRepository {
  final Dio _dio;

  AuthRepository(this._dio);

  Future<AuthData> login(String email, String password) async {
    final response = await _dio.post('/auth/login', data: {
      'email': email,
      'password': password,
    });
    final data = response.data['data'];
    return AuthData.fromJson(data);
  }

  Future<void> logout() async {
    await _dio.post('/auth/logout');
  }

  Future<User> getMe() async {
    final response = await _dio.get('/auth/me');
    return User.fromJson(response.data['data']);
  }

  Future<void> refresh() async {
    await _dio.post('/auth/refresh');
  }
}
