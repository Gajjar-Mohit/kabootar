// To parse this JSON data, do
//
//     final getUserConversationsResponse = getUserConversationsResponseFromJson(jsonString);

import 'dart:convert';

GetUserConversationsResponse getUserConversationsResponseFromJson(String str) =>
    GetUserConversationsResponse.fromJson(json.decode(str));

String getUserConversationsResponseToJson(GetUserConversationsResponse data) =>
    json.encode(data.toJson());

class GetUserConversationsResponse {
  final bool success;
  final String messages;
  final List<Datum> data;

  GetUserConversationsResponse({
    required this.success,
    required this.messages,
    required this.data,
  });

  factory GetUserConversationsResponse.fromJson(Map<String, dynamic> json) =>
      GetUserConversationsResponse(
        success: json["success"],
        messages: json["messages"],
        data: List<Datum>.from(json["data"].map((x) => Datum.fromJson(x))),
      );

  Map<String, dynamic> toJson() => {
    "success": success,
    "messages": messages,
    "data": List<dynamic>.from(data.map((x) => x.toJson())),
  };
}

class Datum {
  final String userId;
  final User user;
  final LastMessage lastMessage;

  Datum({required this.userId, required this.user, required this.lastMessage});

  factory Datum.fromJson(Map<String, dynamic> json) => Datum(
    userId: json["userId"] ?? "",
    user: User.fromJson(json["user"] ?? {}),
    lastMessage: LastMessage.fromJson(json["lastMessage"] ?? {}),
  );

  Map<String, dynamic> toJson() => {
    "userId": userId,
    "user": user.toJson(),
    "lastMessage": lastMessage.toJson(),
  };
}

class LastMessage {
  final String id;
  final String text;
  final User sender;
  final User recipient;
  final bool read;
  final bool delivered;
  final String messageType;
  final DateTime createdAt;
  final DateTime updatedAt;

  LastMessage({
    required this.id,
    required this.text,
    required this.sender,
    required this.recipient,
    required this.read,
    required this.delivered,
    required this.messageType,
    required this.createdAt,
    required this.updatedAt,
  });

  factory LastMessage.fromJson(Map<String, dynamic> json) => LastMessage(
    id: json["_id"] ?? "",
    text: json["text"] ?? "",
    sender: User.fromJson(json["sender"] ?? {}),
    recipient: User.fromJson(json["recipient"] ?? {}),
    read: json["read"] ?? false,
    delivered: json["delivered"] ?? false,
    messageType: json["messageType"] ?? "",
    createdAt: DateTime.parse(json["createdAt"] ?? ""),
    updatedAt: DateTime.parse(json["updatedAt"] ?? ""),
  );

  Map<String, dynamic> toJson() => {
    "_id": id,
    "text": text,
    "sender": sender.toJson(),
    "recipient": recipient.toJson(),
    "read": read,
    "delivered": delivered,
    "messageType": messageType,
    "createdAt": createdAt.toIso8601String(),
    "updatedAt": updatedAt.toIso8601String(),
  };
}

class User {
  final String id;
  final String name;
  final String email;
  final String profileUrl;
  final String bio;

  User({
    required this.id,
    required this.name,
    required this.email,
    required this.profileUrl,
    required this.bio,
  });

  factory User.fromJson(Map<String, dynamic> json) => User(
    id: json["_id"] ?? "",
    name: json["name"] ?? "",
    email: json["email"] ?? "",
    profileUrl: json["profileUrl"] ?? "",
    bio: json["bio"] ?? "",
  );

  Map<String, dynamic> toJson() => {
    "_id": id,
    "name": name,
    "email": email,
    "profileUrl": profileUrl,
    "bio": bio,
  };
}
