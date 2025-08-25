part of 'home_bloc.dart';

@immutable
sealed class HomeEvent {}

class LoadChats extends HomeEvent {
  final String userId;
  LoadChats({required this.userId});
}
