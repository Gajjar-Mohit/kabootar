import 'dart:async';
import 'package:bloc/bloc.dart';
import 'package:flutter/material.dart';
import 'package:kabootar/config/date_formater.dart';
import 'package:kabootar/screens/chat/models/chat_model.dart';
import 'package:kabootar/services/api.service.dart';
import 'package:kabootar/services/models/send_messate.dart';
import 'package:kabootar/services/ws.service.dart';

part 'chat_event.dart';
part 'chat_state.dart';

class ChatBloc extends Bloc<ChatEvent, ChatState> {
  final ApiService _apiService = ApiService();
  final WebSocketService _webSocketService = WebSocketService();

  List<Chat> chats = [];
  StreamSubscription? _messageStreamSubscription;

  String? _currentUserId;
  String? _otherPersonId;

  ChatBloc() : super(ChatInitial()) {
    _registerEventHandlers();
  }

  void _registerEventHandlers() {
    on<LoadMessages>(_onLoadMessages);
    on<ListernToMessages>(_onListenToMessages);
    on<SendMessage>(_onSendMessage);
  }

  Future<void> _onLoadMessages(
    LoadMessages event,
    Emitter<ChatState> emit,
  ) async {
    try {
      emit(LoadingMessages());

      _currentUserId = event.currentUserId;
      _otherPersonId = event.otherPersonId;

      final result = await _apiService.getChatMessages(
        event.currentUserId,
        event.otherPersonId,
      );

      result.fold(
        (failure) => emit(MessagesLoadingError(message: failure.message)),
        (success) {
          _populateChatsFromApiResponse(success.data);
          emit(MessagesLoaded(chats: List.from(chats)));
        },
      );
    } catch (e) {
      emit(
        MessagesLoadingError(
          message: 'Failed to load messages: ${e.toString()}',
        ),
      );
    }
  }

  Future<void> _onListenToMessages(
    ListernToMessages event,
    Emitter<ChatState> emit,
  ) async {
    try {
      await _messageStreamSubscription?.cancel();

      final response = await _webSocketService.listenToMessages();

      response.fold(
        (failure) => emit(ListerningToMessageError(message: failure.message)),
        (messageStream) {
          _messageStreamSubscription = messageStream.listen(
            (newMessage) => _handleIncomingMessage(newMessage),
            onError: (error) => add(ListernToMessages()),
          );
        },
      );
    } catch (e) {
      emit(
        ListerningToMessageError(
          message: 'Failed to listen to messages: ${e.toString()}',
        ),
      );
    }
  }

  Future<void> _onSendMessage(
    SendMessage event,
    Emitter<ChatState> emit,
  ) async {
    try {
      emit(SendingMessage());

      final response = await _webSocketService.sendMessage(
        SendMessageRequest(
          sender: event.currentUserId,
          text: event.message,
          recipient: event.otherPersonId,
          messageType: "text",
        ),
      );

      response.fold(
        (failure) => emit(SendMessageError(message: failure.message)),
        (success) {
          _addSentMessageToChats(event);
          emit(MessageSent(chats: List.from(chats)));
        },
      );
    } catch (e) {
      emit(
        SendMessageError(message: 'Failed to send message: ${e.toString()}'),
      );
    }
  }

  void _populateChatsFromApiResponse(List<dynamic> apiData) {
    chats.clear();

    List<Map<String, dynamic>> tempChats = [];

    for (var element in apiData) {
      tempChats.add({
        'chat': Chat(
          id: element.id,
          messagerId: element.messagerId,
          time: DateFormater.formatCurrentTime(element.time),
          text: element.text,
          read: element.read,
          delivered: element.delivered,
        ),
        'timestamp': element.time,
      });
    }

    tempChats.sort((a, b) {
      try {
        DateTime timeA, timeB;

        if (a['timestamp'] is DateTime) {
          timeA = a['timestamp'];
        } else if (a['timestamp'] is String) {
          timeA = DateTime.parse(a['timestamp']);
        } else if (a['timestamp'] is int) {
          timeA = DateTime.fromMillisecondsSinceEpoch(a['timestamp']);
        } else {
          return 0;
        }

        if (b['timestamp'] is DateTime) {
          timeB = b['timestamp'];
        } else if (b['timestamp'] is String) {
          timeB = DateTime.parse(b['timestamp']);
        } else if (b['timestamp'] is int) {
          timeB = DateTime.fromMillisecondsSinceEpoch(b['timestamp']);
        } else {
          return 0;
        }

        return timeA.compareTo(timeB);
      } catch (e) {
        debugPrint('Error sorting messages: ${e.toString()}');
        return 0;
      }
    });

    chats = tempChats.map((item) => item['chat'] as Chat).toList();
  }

  void _handleIncomingMessage(dynamic messageData) {
    try {
      final messageId = messageData.data.id;

      final existingMessageIndex = chats.indexWhere(
        (chat) => chat.id == messageId,
      );

      if (existingMessageIndex == -1) {
        final newChat = Chat(
          id: messageData.data.id,
          messagerId: messageData.data.sender,
          time: DateFormater.formatCurrentTime(messageData.timestamp),
          text: messageData.data.text,
          read: false,
          delivered: true,
        );

        chats.add(newChat);

        emit(MessagesLoaded(chats: List.from(chats)));
      } else {
        chats[existingMessageIndex] = Chat(
          id: messageData.data.id,
          messagerId: messageData.data.messagerId,
          time: chats[existingMessageIndex].time,
          text: messageData.data.text,
          read: messageData.data.read ?? chats[existingMessageIndex].read,
          delivered:
              messageData.data.delivered ??
              chats[existingMessageIndex].delivered,
        );

        emit(MessagesLoaded(chats: List.from(chats)));
      }
    } catch (e) {
      debugPrint('Error handling incoming message: ${e.toString()}');
    }
  }

  void _addSentMessageToChats(SendMessage event) {
    final now = DateTime.now();
    final tempChat = Chat(
      id: now.millisecondsSinceEpoch.toString(),
      messagerId: event.currentUserId,
      time: DateFormater.formatCurrentTime(now),
      text: event.message,
      read: false,
      delivered: false,
    );

    chats.add(tempChat);
  }

  void _insertMessageInOrder(Chat newChat, dynamic timestamp) {
    try {
      DateTime newMessageTime;

      if (timestamp is DateTime) {
        newMessageTime = timestamp;
      } else if (timestamp is String) {
        newMessageTime = DateTime.parse(timestamp);
      } else if (timestamp is int) {
        newMessageTime = DateTime.fromMillisecondsSinceEpoch(timestamp);
      } else {
        chats.add(newChat);
        return;
      }

      int insertIndex = chats.length;
      for (int i = chats.length - 1; i >= 0; i--) {
        try {
          int existingChatTime = int.parse(chats[i].id);
          if (newMessageTime.millisecondsSinceEpoch >= existingChatTime) {
            insertIndex = i + 1;
            break;
          }
        } catch (e) {
          break;
        }
      }

      chats.insert(insertIndex, newChat);
    } catch (e) {
      debugPrint('Error inserting message in order: ${e.toString()}');

      chats.add(newChat);
    }
  }

  void _sortChatsByTime() {
    debugPrint(
      '_sortChatsByTime is deprecated - using timestamp-based sorting instead',
    );
  }

  Map<String, String?> get currentConversation => {
    'currentUserId': _currentUserId,
    'otherPersonId': _otherPersonId,
  };

  bool get isInConversation => _currentUserId != null && _otherPersonId != null;

  void clearChatData() {
    chats.clear();
    _currentUserId = null;
    _otherPersonId = null;
  }

  @override
  Future<void> close() {
    _messageStreamSubscription?.cancel();
    return super.close();
  }
}
