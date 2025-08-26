abstract class AppException implements Exception {
  final String message;
  AppException({required this.message});
}

class CustomException extends AppException {
  CustomException({required super.message});
}
