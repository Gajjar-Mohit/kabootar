class ConversationModel {
  final String name;
  final String email;
  final String imageUrl;
  String lastMessage;
  final DateTime lastMessageTime;

  ConversationModel({
    required this.name,
    required this.email,
    required this.imageUrl,
    required this.lastMessage,
    required this.lastMessageTime,
  });
}
