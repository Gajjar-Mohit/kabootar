import 'package:bloc/bloc.dart';
import 'package:flutter/material.dart';
import 'package:kabootar/config/date_formater.dart';
import 'package:kabootar/screens/chat/models/chat_model.dart';
import 'package:kabootar/services/api.service.dart';

part 'chat_event.dart';
part 'chat_state.dart';

class ChatBloc extends Bloc<ChatEvent, ChatState> {
  final ApiService _apiService = ApiService();
  ChatBloc() : super(ChatInitial()) {
    on<ChatEvent>((event, emit) {});
    on<LoadMessages>((event, emit) async {
      emit(LoadingMessages());
      List<Chat> chats = [];
      final result = await _apiService.getChatMessages(
        event.currentUserId,
        event.otherPersonId,
      );
      result.fold(
        (left) {
          emit(MessagesLoadingError(message: left.message));
        },
        (right) {
          for (var element in right.data) {
            chats.add(
              Chat(
                id: element.id,
                messagerId: element.messagerId,
                time: DateFormater.formatCurrentTime(element.time),
                text: element.text,
                read: element.read,
                delivered: element.delivered,
              ),
            );
          }
          emit(MessagesLoaded(chats: chats));
        },
      );
    });
  }
}
