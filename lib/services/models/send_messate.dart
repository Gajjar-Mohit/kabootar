// To parse this JSON data, do
//
//     final sendMessageRequest = sendMessageRequestFromJson(jsonString);

import 'dart:convert';

SendMessageRequest sendMessageRequestFromJson(String str) =>
    SendMessageRequest.fromJson(json.decode(str));

String sendMessageRequestToJson(SendMessageRequest data) =>
    json.encode(data.toJson());

class SendMessageRequest {
  final String sender;
  final String text;
  final String recipient;
  final String messageType;

  SendMessageRequest({
    required this.sender,
    required this.text,
    required this.recipient,
    required this.messageType,
  });

  factory SendMessageRequest.fromJson(Map<String, dynamic> json) =>
      SendMessageRequest(
        sender: json["sender"],
        text: json["text"],
        recipient: json["recipient"],
        messageType: json["messageType"],
      );

  Map<String, dynamic> toJson() => {
    "sender": sender,
    "text": text,
    "recipient": recipient,
    "messageType": messageType,
  };
}
