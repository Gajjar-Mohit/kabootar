part of 'home_bloc.dart';

@immutable
sealed class HomeEvent {}

class LoadConversations extends HomeEvent {
  final String userId;
  LoadConversations({required this.userId});
}
