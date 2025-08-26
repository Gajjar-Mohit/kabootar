// To parse this JSON data, do
//
//     final messageResponse = messageResponseFromJson(jsonString);

import 'dart:convert';

MessageResponse messageResponseFromJson(String str) =>
    MessageResponse.fromJson(json.decode(str));

String messageResponseToJson(MessageResponse data) =>
    json.encode(data.toJson());

class MessageResponse {
  final Data data;
  final DateTime timestamp;

  MessageResponse({required this.data, required this.timestamp});

  factory MessageResponse.fromJson(Map<String, dynamic> json) =>
      MessageResponse(
        data: Data.fromJson(json["data"] ??{}),
        timestamp: DateTime.parse(json["timestamp"] ?? ""),
      );

  Map<String, dynamic> toJson() => {
    "data": data.toJson(),
    "timestamp": timestamp.toIso8601String(),
  };
}

class Data {
  final String sender;
  final String text;
  final String recipient;
  final String messageType;
  final String id;

  Data({
    required this.sender,
    required this.text,
    required this.recipient,
    required this.messageType,
    required this.id,
  });

  factory Data.fromJson(Map<String, dynamic> json) => Data(
    sender: json["sender"] ?? "",
    text: json["text"] ?? "",
    recipient: json["recipient"] ?? "",
    messageType: json["messageType"] ?? "",
    id: json["id"] ?? "",
  );

  Map<String, dynamic> toJson() => {
    "sender": sender,
    "text": text,
    "recipient": recipient,
    "messageType": messageType,
    "id": id,
  };
}
