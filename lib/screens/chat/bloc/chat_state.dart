part of 'chat_bloc.dart';

@immutable
sealed class ChatState {}

final class ChatInitial extends ChatState {}



class LoadingMessages extends ChatState {}

class MessagesLoaded extends ChatState {
  final List<Chat> chats;

  MessagesLoaded({required this.chats});
}

class SendingMessage extends ChatState {
  final List<Chat> chats;

  SendingMessage({required this.chats});
}

class MessageSent extends ChatState {
  final List<Chat> chats;

  MessageSent({required this.chats});
}

class MessagesLoadingError extends ChatState {
  final String message;

  MessagesLoadingError({required this.message});
}
