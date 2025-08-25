class ChatModel {
  final String name;
  final String email;
  final String profileUrl;
  final List<Chat> chats;

  ChatModel({
    required this.name,
    required this.email,
    required this.profileUrl,
    required this.chats,
  });
}

class Chat {
  String id;
  String messagerId;
  String time;
  String text;
  bool read;
  bool delivered;

  Chat({
    required this.id,
    required this.messagerId,
    required this.time,
    required this.text,
    required this.read,
    required this.delivered,
  });
}
