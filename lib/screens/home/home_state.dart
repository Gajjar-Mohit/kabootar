part of 'home_bloc.dart';

@immutable
sealed class HomeState {}

final class HomeInitial extends HomeState {}

class ConversationsLoaded extends HomeState {
  final List<ConversationModel> conversations;
  ConversationsLoaded({required this.conversations});
}

class ChatLoadingError extends HomeState {
  final String message;
  ChatLoadingError({required this.message});
}

class LoadingConversations extends HomeState {}
