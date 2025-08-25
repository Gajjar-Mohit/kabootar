part of 'home_bloc.dart';

@immutable
sealed class HomeState {}

final class HomeInitial extends HomeState {}

class ChatsLoaded extends HomeState {
  final List<ConversationModel> conversations;
  ChatsLoaded({required this.conversations});
}

class ChatLoadingError extends HomeState {
  final String message;
  ChatLoadingError({required this.message});
}

class LoadingChats extends HomeState {}
