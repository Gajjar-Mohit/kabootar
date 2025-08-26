part of 'chat_bloc.dart';

@immutable
sealed class ChatEvent {}


class LoadMessages extends ChatEvent {
  final String currentUserId;
  final String otherPersonId;

  LoadMessages({required this.currentUserId, required this.otherPersonId});
}

class SendMessage extends ChatEvent {
  final String currentUserId;
  final String otherPersonId;
  final String message;

  SendMessage({
    required this.currentUserId,
    required this.otherPersonId,
    required this.message,
  });
}

class MessageReceived extends ChatEvent {
  final Chat message;

  MessageReceived({required this.message});
}

class MessageStatusUpdated extends ChatEvent {
  final String messageId;
  final bool delivered;
  final bool read;

  MessageStatusUpdated({
    required this.messageId,
    required this.delivered,
    required this.read,
  });
}

class ListernToMessages extends ChatEvent{
  
}