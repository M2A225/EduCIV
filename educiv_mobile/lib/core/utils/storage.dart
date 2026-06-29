import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../constants/app_constants.dart';

class SecureStorage {
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  Future<String?> read(String key) async {
    return await _storage.read(key: key);
  }

  Future<void> write(String key, String value) async {
    await _storage.write(key: key, value: value);
  }

  Future<void> delete(String key) async {
    await _storage.delete(key: key);
  }

  Future<void> deleteAll() async {
    await _storage.deleteAll();
  }
}

class LocalStorage {
  final SharedPreferences _prefs;
  final SecureStorage _secureStorage;

  LocalStorage(this._prefs, this._secureStorage);

  static Future<LocalStorage> init() async {
    final prefs = await SharedPreferences.getInstance();
    return LocalStorage(prefs, SecureStorage());
  }

  Future<void> saveToken(String token) async {
    await _secureStorage.write(AppConstants.tokenKey, token);
  }

  String? getToken() {
    return _prefs.getString(AppConstants.tokenKey);
  }

  Future<void> saveRefreshToken(String token) async {
    await _secureStorage.write(AppConstants.refreshTokenKey, token);
  }

  String? getRefreshToken() {
    return _prefs.getString(AppConstants.refreshTokenKey);
  }

  Future<void> clearAll() async {
    await _secureStorage.deleteAll();
    await _prefs.clear();
  }
}

final localStorageProvider = FutureProvider<LocalStorage>((ref) async {
  return await LocalStorage.init();
});
