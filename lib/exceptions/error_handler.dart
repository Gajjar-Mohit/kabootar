import 'package:shared_preferences/shared_preferences.dart';

class UserPreferences {
  SharedPreferences? _preferences;

  UserPreferences() {
    init();
  }

  Future<void> init() async {
    _preferences = await SharedPreferences.getInstance();
  }

  Future<bool> setUppers(List<String> uppers) async {
    if (_preferences == null) await init();

    final String value = uppers.isEmpty ? '' : uppers.join(',');
    // print("Setting uppers: $value");
    return await _preferences?.setString('uppers', value) ?? false;
  }

  List<String> getUppers() {
    final String? uppers = _preferences?.getString('uppers');
    if (uppers == null || uppers.isEmpty) return [];
    return uppers.split(',');
  }

  Future<bool> setLowers(List<String> lowers) async {
    // print("Setting lowers: ${lowers.join(',')}");
    if (_preferences == null) await init();

    final String value = lowers.isEmpty ? '' : lowers.join(',');
    return await _preferences?.setString('lowers', value) ?? false;
  }

  List<String> getLowers() {
    final String? lowers = _preferences?.getString('lowers');
    if (lowers == null || lowers.isEmpty) return [];
    return lowers.split(',');
  }

  String? getUserId() {
    return getPreference('userId');
  }

  Future<bool> removeUserId() async {
    return await removePreference('userId');
  }

  Future<bool> setUserId(String userId) async {
    return await setPreference('userId', userId);
  }

  String? getPreference(String key) {
    return _preferences?.getString(key);
  }

  Future<bool> setPreference(String key, String value) async {
    if (_preferences == null) await init();
    return await _preferences?.setString(key, value) ?? false;
  }

  Future<bool> removePreference(String key) async {
    if (_preferences == null) await init();
    return await _preferences?.remove(key) ?? false;
  }
}
