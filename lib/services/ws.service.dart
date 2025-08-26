import 'dart:async';

import 'package:dartz/dartz.dart';
import 'package:kabootar/config/urls.dart';
import 'package:kabootar/exceptions/custom_exceptions.dart';
import 'package:kabootar/services/models/message_response.model.dart';
import 'package:kabootar/services/models/send_messate.dart';
import 'package:web_socket_channel/web_socket_channel.dart';

class WebSocketService {
  WebSocketChannel? _channel;
  StreamController<MessageResponse>? _messageController;
  bool _isConnected = false;

  // Getter to check connection status
  bool get isConnected => _isConnected;
  WebSocketService() {
    connect();
  }
  // Initialize connection
  connect() async {
    try {
      _channel = WebSocketChannel.connect(
        Uri.parse("${AppUrls.wsUrl}/68ab02c71ec000db1390fac3"),
      );

      await _channel!.ready;
      _isConnected = true;
      // _channel!.stream.listen((event) {
      //   print(event);
      // });
      print("Connected to server");
    } on Exception catch (e) {
      print(e.toString());
    }
  }

  // Listen to incoming messages
  Future<Either<CustomException, Stream<MessageResponse>>>
  listenToMessages() async {
    print("Listerning function");
    try {
      await _channel!.ready;

      _messageController = StreamController<MessageResponse>.broadcast();

      _channel!.stream.listen(
        (message) {
          // print(message);

          final messageResponse = messageResponseFromJson(message);

          _messageController!.add(messageResponse);
        },
        onError: (error) {
          print(error);
          _messageController!.addError(
            CustomException(message: 'WebSocket error: ${error.toString()}'),
          );
        },
        onDone: () {
          _isConnected = false;
          _messageController!.close();
        },
      );

      return right(_messageController!.stream);
    } on Exception catch (e) {
      print(e);
      return left(
        CustomException(
          message: 'Failed to listen to messages: ${e.toString()}',
        ),
      );
    }
  }

  // Send message
  Future<Either<CustomException, bool>> sendMessage(
    SendMessageRequest data,
  ) async {
    try {
      if (_channel == null || !_isConnected) {
        return left(CustomException(message: 'WebSocket not connected'));
      }

      await _channel!.ready;
      _channel!.sink.add(sendMessageRequestToJson(data));

      return right(true);
    } on Exception catch (e) {
      return left(
        CustomException(message: 'Failed to send message: ${e.toString()}'),
      );
    }
  }
}
