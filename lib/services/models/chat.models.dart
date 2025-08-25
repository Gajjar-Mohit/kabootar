// To parse this JSON data, do
//
//     final getUserChatMessagesResponse = getUserChatMessagesResponseFromJson(jsonString);

import 'dart:convert';

GetUserChatMessagesResponse getUserChatMessagesResponseFromJson(String str) =>
    GetUserChatMessagesResponse.fromJson(json.decode(str));

String getUserChatMessagesResponseToJson(GetUserChatMessagesResponse data) =>
    json.encode(data.toJson());

class GetUserChatMessagesResponse {
  final bool success;
  final String messages;
  final List<Datum> data;

  GetUserChatMessagesResponse({
    required this.success,
    required this.messages,
    required this.data,
  });

  factory GetUserChatMessagesResponse.fromJson(Map<String, dynamic> json) =>
      GetUserChatMessagesResponse(
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
  final String id;
  final String text;
  final String sender;
  final String recipient;
  final bool read;
  final bool delivered;
  final String messageType;
  final DateTime createdAt;
  final DateTime updatedAt;

  Datum({
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

  factory Datum.fromJson(Map<String, dynamic> json) => Datum(
    id: json["_id"],
    text: json["text"],
    sender: json["sender"],
    recipient: json["recipient"],
    read: json["read"],
    delivered: json["delivered"],
    messageType: json["messageType"],
    createdAt: DateTime.parse(json["createdAt"]),
    updatedAt: DateTime.parse(json["updatedAt"]),
  );

  Map<String, dynamic> toJson() => {
    "_id": id,
    "text": text,
    "sender": sender,
    "recipient": recipient,
    "read": read,
    "delivered": delivered,
    "messageType": messageType,
    "createdAt": createdAt.toIso8601String(),
    "updatedAt": updatedAt.toIso8601String(),
  };
}


