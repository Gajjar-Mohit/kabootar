// To parse this JSON data, do
//
//     final createUserRequest = createUserRequestFromJson(jsonString);

import 'dart:convert';

CreateUserRequest createUserRequestFromJson(String str) =>
    CreateUserRequest.fromJson(json.decode(str));

String createUserRequestToJson(CreateUserRequest data) =>
    json.encode(data.toJson());

class CreateUserRequest {
  final String name;
  final String phone;
  final String email;
  final String publickey;

  CreateUserRequest({
    required this.name,
    required this.phone,
    required this.email,
    required this.publickey,
  });

  factory CreateUserRequest.fromJson(Map<String, dynamic> json) =>
      CreateUserRequest(
        name: json["name"],
        phone: json["phone"],
        email: json["email"],
        publickey: json["publickey"],
      );

  Map<String, dynamic> toJson() => {
    "name": name,
    "phone": phone,
    "email": email,
    "publickey": publickey,
  };
}

// To parse this JSON data, do
//
//     final createUserResponse = createUserResponseFromJson(jsonString);


CreateUserResponse createUserResponseFromJson(String str) => CreateUserResponse.fromJson(json.decode(str));

String createUserResponseToJson(CreateUserResponse data) => json.encode(data.toJson());

class CreateUserResponse {
    final bool success;
    final String message;
    final Data data;

    CreateUserResponse({
        required this.success,
        required this.message,
        required this.data,
    });

    factory CreateUserResponse.fromJson(Map<String, dynamic> json) => CreateUserResponse(
        success: json["success"],
        message: json["message"],
        data: Data.fromJson(json["data"]),
    );

    Map<String, dynamic> toJson() => {
        "success": success,
        "message": message,
        "data": data.toJson(),
    };
}

class Data {
    final String name;
    final String email;
    final String phone;
    final String profileUrl;
    final String bio;
    final bool online;
    final String publickey;
    final String id;
    final DateTime createdAt;
    final DateTime updatedAt;

    Data({
        required this.name,
        required this.email,
        required this.phone,
        required this.profileUrl,
        required this.bio,
        required this.online,
        required this.publickey,
        required this.id,
        required this.createdAt,
        required this.updatedAt,
    });

    factory Data.fromJson(Map<String, dynamic> json) => Data(
        name: json["name"],
        email: json["email"],
        phone: json["phone"],
        profileUrl: json["profileUrl"],
        bio: json["bio"],
        online: json["online"],
        publickey: json["publickey"],
        id: json["_id"],
        createdAt: DateTime.parse(json["createdAt"]),
        updatedAt: DateTime.parse(json["updatedAt"]),
    );

    Map<String, dynamic> toJson() => {
        "name": name,
        "email": email,
        "phone": phone,
        "profileUrl": profileUrl,
        "bio": bio,
        "online": online,
        "publickey": publickey,
        "_id": id,
        "createdAt": createdAt.toIso8601String(),
        "updatedAt": updatedAt.toIso8601String(),
    };
}
