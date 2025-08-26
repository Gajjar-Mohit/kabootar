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
  Future<Either<CustomException, CreateUserResponse>> registerUser(
    CreateUserRequest user,
  ) async {
    try {
      var response = await http.post(
        Uri.parse('${AppUrls.baseUrl}/user/create'),
        body: createUserRequestToJson(user),
        headers: headers,
      );

      if (response.statusCode == 200) {
        var data = jsonDecode(response.body);
        CreateUserResponse res = createUserResponseFromJson(data);
        return right(res);
      } else {
        return left(CustomException(message: response.reasonPhrase.toString()));
      }
    } on CustomException catch (e) {
      return left(CustomException(message: e.message));
    }
  }

  Future<Either<CustomException, GetUserChatMessagesResponse>> getChatMessages(
    String currentUserId,
    String recepientId,
  ) async {
    try {
      var response = await http.post(
        Uri.parse("${AppUrls.baseUrl}/chat/messages"),
        headers: headers,
        body: json.encode({
          "currentUserId": currentUserId,
          "recipientId": recepientId,
        }),
      );
      // print(response.body);
      if (response.statusCode == 200 || response.statusCode == 201) {
        GetUserChatMessagesResponse chats = getUserChatMessagesResponseFromJson(
          response.body,
        );
        return right(chats);
      } else {
        return left(CustomException(message: response.reasonPhrase.toString()));
      }
    } on CustomException catch (e) {
      return left(CustomException(message: e.message));
    }
  }

  Future<Either<CustomException, GetUserConversationsResponse>>
  getConversations(String userId) async {
    try {
      var response = await http.get(
        Uri.parse("${AppUrls.baseUrl}/chat/conversations/$userId"),
        headers: headers,
      );
      if (response.statusCode == 200 || response.statusCode == 201) {
        GetUserConversationsResponse conversations =
            getUserConversationsResponseFromJson(response.body);
        return right(conversations);
      } else {
        return left(CustomException(message: response.reasonPhrase.toString()));
      }
    } on CustomException catch (e) {
      return left(CustomException(message: e.message));
    }
  }
}
