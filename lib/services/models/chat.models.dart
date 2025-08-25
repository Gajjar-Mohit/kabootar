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
        messages: json["messages"]?? "",
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
  final String messagerId;
  final String text;
  final bool read;
  final DateTime time;
  final bool delivered;

  Datum({
    required this.id,
    required this.messagerId,
    required this.text,
    required this.read,
    required this.time,
    required this.delivered,
  });

  factory Datum.fromJson(Map<String, dynamic> json) => Datum(
    id: json["id"],
    messagerId: json["messagerId"],
    text: json["text"],
    read: json["read"],
    time: DateTime.parse(json["time"]),
    delivered: json["delivered"],
  );

  Map<String, dynamic> toJson() => {
    "id": id,
    "messagerId": messagerId,
    "text": text,
    "read": read,
    "time": time.toIso8601String(),
    "delivered": delivered,
  };
}
