abstract class AppException implements Exception {
  final String message;
  AppException({required this.message});
}

class AuthException extends AppException {
  AuthException({required super.message});
}
 