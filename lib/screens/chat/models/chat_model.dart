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
  final String messagerId;
  final String time;
  final String text;
  final bool read;
  final bool delivered;

  Chat({
    required this.messagerId,
    required this.time,
    required this.text,
    required this.read,
    required this.delivered,
  });
}
