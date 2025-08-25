// ignore_for_file: deprecated_member_use

import 'package:flutter/material.dart';
import 'package:kabootar/screens/chat/models/chat_model.dart';

class ChatScreen extends StatefulWidget {
  final ChatModel model;
  const ChatScreen({super.key, required this.model});

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  List<Chat> _messages = [];

  @override
  void initState() {
    super.initState();
    _messages = List.from(widget.model.chats);
    // Auto scroll to bottom when messages load
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _scrollToBottom();
    });
  }

  @override
  void dispose() {
    _messageController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    if (_scrollController.hasClients) {
      _scrollController.animateTo(
        _scrollController.position.maxScrollExtent,
        duration: Duration(milliseconds: 300),
        curve: Curves.easeOut,
      );
    }
  }

  void _sendMessage() {
    if (_messageController.text.trim().isNotEmpty) {
      setState(() {
        _messages.add(
          Chat(
            messagerId: "user_123",
            time: _formatCurrentTime(),
            text: _messageController.text.trim(),
            read: true,
            delivered: true,
          ),
        );
      });

      _messageController.clear();

      // Scroll to bottom after sending message
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _scrollToBottom();
      });
    }
  }

  String _formatCurrentTime() {
    final now = DateTime.now();
    final hour = now.hour > 12 ? now.hour - 12 : now.hour;
    final period = now.hour >= 12 ? 'PM' : 'AM';
    final displayHour = hour == 0 ? 12 : hour;
    return '$displayHour:${now.minute.toString().padLeft(2, '0')} $period';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        elevation: 1,
        backgroundColor: Colors.white,
        centerTitle: false,
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: Colors.black),
          onPressed: () => Navigator.pop(context),
        ),
        title: Row(
          children: [
            CircleAvatar(
              radius: 20,
              backgroundImage: NetworkImage(widget.model.profileUrl),
            ),
            SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    widget.model.name,
                    style: TextStyle(
                      color: Colors.black,
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  Text(
                    "Online",
                    style: TextStyle(
                      color: Colors.green,
                      fontSize: 12,
                      fontWeight: FontWeight.w400,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
      body: Column(
        children: [
          // Messages List
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              padding: EdgeInsets.symmetric(vertical: 8),
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                return ChatTile(
                  messagerId: _messages[index].messagerId,
                  text: _messages[index].text,
                  time: _messages[index].time,
                  currentUserId: "user_123",
                  read: _messages[index].read,
                  delivered: _messages[index].delivered,
                );
              },
            ),
          ),

          // Message Input Section
          Container(
            padding: EdgeInsets.symmetric(horizontal: 8, vertical: 8),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.grey.withOpacity(0.1),
                  spreadRadius: 1,
                  blurRadius: 3,
                  offset: Offset(0, -1),
                ),
              ],
            ),
            child: SafeArea(
              child: Row(
                children: [
                  // Attach button
                  IconButton(
                    icon: Icon(Icons.add, color: Colors.grey[600]),
                    onPressed: () {
                      // Handle attachment
                    },
                  ),

                  // Text input field
                  Expanded(
                    child: Container(
                      decoration: BoxDecoration(
                        color: Colors.grey[100],
                        borderRadius: BorderRadius.circular(25),
                      ),
                      child: Row(
                        children: [
                          Expanded(
                            child: TextField(
                              controller: _messageController,
                              decoration: InputDecoration(
                                hintText: "Type a message...",
                                hintStyle: TextStyle(color: Colors.grey[500]),
                                border: InputBorder.none,
                                contentPadding: EdgeInsets.symmetric(
                                  horizontal: 16,
                                  vertical: 10,
                                ),
                              ),
                              maxLines: null,
                              textCapitalization: TextCapitalization.sentences,
                            ),
                          ),
                          IconButton(
                            icon: Icon(
                              Icons.emoji_emotions,
                              color: Colors.grey[600],
                            ),
                            onPressed: () {
                              // Handle emoji picker
                            },
                          ),
                        ],
                      ),
                    ),
                  ),

                  SizedBox(width: 8),

                  // Send button
                  Container(
                    decoration: BoxDecoration(
                      color: Colors.blue,
                      shape: BoxShape.circle,
                    ),
                    child: IconButton(
                      icon: Icon(Icons.send, color: Colors.white),
                      onPressed: _sendMessage,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class ChatTile extends StatelessWidget {
  final String text, time, messagerId, currentUserId;
  final bool read, delivered;

  const ChatTile({
    super.key,
    required this.text,
    required this.time,
    required this.messagerId,
    required this.currentUserId,
    required this.read,
    required this.delivered,
  });

  @override
  Widget build(BuildContext context) {
    bool isCurrentUser = currentUserId == messagerId;

    return Align(
      alignment: isCurrentUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: EdgeInsets.symmetric(vertical: 2, horizontal: 12),
        child: Column(
          crossAxisAlignment: isCurrentUser
              ? CrossAxisAlignment.end
              : CrossAxisAlignment.start,
          children: [
            IntrinsicWidth(
              child: Container(
                constraints: BoxConstraints(
                  maxWidth: MediaQuery.of(context).size.width * 0.75,
                ),
                decoration: BoxDecoration(
                  color: isCurrentUser ? Colors.blue : Colors.white,
                  borderRadius: BorderRadius.only(
                    topLeft: Radius.circular(16),
                    topRight: Radius.circular(16),
                    bottomLeft: Radius.circular(isCurrentUser ? 16 : 4),
                    bottomRight: Radius.circular(isCurrentUser ? 4 : 16),
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.grey.withOpacity(0.1),
                      spreadRadius: 1,
                      blurRadius: 2,
                      offset: Offset(0, 1),
                    ),
                  ],
                ),
                child: Padding(
                  padding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        text,
                        style: TextStyle(
                          color: isCurrentUser ? Colors.white : Colors.black87,
                          fontSize: 15,
                          fontWeight: FontWeight.w400,
                        ),
                      ),
                      SizedBox(height: 2),
                      Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            time,
                            style: TextStyle(
                              color: isCurrentUser
                                  ? Colors.white70
                                  : Colors.grey[500],
                              fontSize: 11,
                            ),
                          ),
                          if (isCurrentUser) ...[
                            SizedBox(width: 4),
                            Icon(
                              delivered
                                  ? (read ? Icons.done_all : Icons.done_all)
                                  : Icons.done,
                              size: 14,
                              color: read ? Colors.blue[200] : Colors.white70,
                            ),
                          ],
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),
            SizedBox(height: 4),
          ],
        ),
      ),
    );
  }
}
