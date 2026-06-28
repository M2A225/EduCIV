import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import '../datasources/api_client.dart';
import '../models/user.dart';
import '../repositories/auth_repository.dart';
import '../../core/utils/storage.dart';

enum AuthState { initial, authenticated, unauthenticated, loading }

class AuthNotifier extends StateNotifier<AuthState> {
  final AuthRepository _authRepository;
  final LocalStorage _localStorage;

  AuthNotifier(this._authRepository, this._localStorage) : super(AuthState.initial);

  User? _user;
  User? get user => _user;

  Future<void> init() async {
    try {
      final token = _localStorage.getToken();
      if (token != null) {
        _user = await _authRepository.getMe();
        state = AuthState.authenticated;
      } else {
        state = AuthState.unauthenticated;
      }
    } catch (e) {
      state = AuthState.unauthenticated;
    }
  }

  Future<void> login(String email, String password) async {
    state = AuthState.loading;
    try {
      final authData = await _authRepository.login(email, password);
      await _localStorage.saveToken(authData.accessToken);
      await _localStorage.saveRefreshToken(authData.refreshToken);
      _user = authData.user;
      state = AuthState.authenticated;
    } catch (e) {
      state = AuthState.unauthenticated;
      rethrow;
    }
  }

  Future<void> logout() async {
    try {
      await _authRepository.logout();
    } finally {
      await _localStorage.clearAll();
      _user = null;
      state = AuthState.unauthenticated;
    }
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  final dio = ref.watch(dioProvider);
  final localStorage = ref.watch(localStorageProvider.future);
  return AuthNotifier(AuthRepository(dio), localStorage as LocalStorage);
});

final currentUserProvider = Provider<User?>((ref) {
  final auth = ref.watch(authProvider.notifier);
  return auth.user;
});
