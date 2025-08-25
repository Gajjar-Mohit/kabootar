import 'dart:convert';

import 'package:dartz/dartz.dart';
import 'package:http/http.dart' as http;
import 'package:kabootar/config/urls.dart';
import 'package:kabootar/exceptions/custom_exceptions.dart';
import 'package:kabootar/services/models/chat.models.dart';
import 'package:kabootar/services/models/get_conversations_response.dart';
import 'package:kabootar/services/models/user.models.dart';

class ApiService {
  var headers = {'Content-Type': 'application/json'};
  Future<Either<AuthException, CreateUserResponse>> registerUser(
    CreateUserRequest user,
  ) async {
    try {
      var response = await http.post(
        Uri.parse('${Urls.baseUrl}/user/create'),
        body: createUserRequestToJson(user),
        headers: headers,
      );

      if (response.statusCode == 200) {
        var data = jsonDecode(response.body);
        CreateUserResponse res = createUserResponseFromJson(data);
        return right(res);
      } else {
        print(response.reasonPhrase);
        return left(AuthException(message: response.reasonPhrase.toString()));
      }
    } on AuthException catch (e) {
      return left(AuthException(message: e.message));
    }
  }

  Future<Either<AuthException, GetUserChatMessagesResponse>> getChatMessages(
    String userId,
  ) async {
    try {
      var response = await http.get(
        Uri.parse("${Urls.baseUrl}/chat/$userId"),
        headers: headers,
      );
      if (response.statusCode == 200 || response.statusCode == 201) {
        GetUserChatMessagesResponse chats = getUserChatMessagesResponseFromJson(
          response.body,
        );
        return right(chats);
      } else {
        print(response.reasonPhrase);
        return left(AuthException(message: response.reasonPhrase.toString()));
      }
    } on AuthException catch (e) {
      return left(AuthException(message: e.message));
    }
  }

  Future<Either<AuthException, GetUserConversationsResponse>> getConversations(
    String userId,
  ) async {
    try {
      var response = await http.get(
        Uri.parse("${Urls.baseUrl}/chat/conversations/$userId"),
        headers: headers,
      );
      if (response.statusCode == 200 || response.statusCode == 201) {
        GetUserConversationsResponse conversations =
            getUserConversationsResponseFromJson(response.body);
        return right(conversations);
      } else {
        print(response.reasonPhrase);
        return left(AuthException(message: response.reasonPhrase.toString()));
      }
    } on AuthException catch (e) {
      return left(AuthException(message: e.message));
    }
  }
}
