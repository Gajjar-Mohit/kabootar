// ignore_for_file: deprecated_member_use

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:kabootar/screens/chat/bloc/chat_bloc.dart';
import 'package:kabootar/screens/chat/models/chat_model.dart';

class ChatScreen extends StatelessWidget {
  final String recipientId, name, profileUrl;

  const ChatScreen({
    super.key,
    required this.recipientId,
    required this.name,
    required this.profileUrl,
  });

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) => ChatBloc()
        ..add(
          LoadMessages(
            currentUserId: "68ab02c71ec000db1390fac3",
            otherPersonId: recipientId,
          ),
        )
        ..add(ListernToMessages()), // Initialize WebSocket listener
      child: ChatScreenContent(
        recipientId: recipientId,
        name: name,
        profileUrl: profileUrl,
      ),
    );
  }
}

class ChatScreenContent extends StatefulWidget {
  final String recipientId, name, profileUrl;

  const ChatScreenContent({
    super.key,
    required this.recipientId,
    required this.name,
    required this.profileUrl,
  });

  @override
  State<ChatScreenContent> createState() => _ChatScreenContentState();
}

class _ChatScreenContentState extends State<ChatScreenContent> {
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  static const String _currentUserId = "68ab02c71ec000db1390fac3";

  // Track if we need to scroll after build
  bool _shouldScrollToBottom = false;

  @override
  void initState() {
    super.initState();
    // Listen to scroll controller attachment
    _scrollController.addListener(() {});
  }

  @override
  void dispose() {
    _messageController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollToBottom({bool animated = true}) {
    // Check if scroll controller is attached and has clients
    if (!_scrollController.hasClients) {
      // If not attached, mark that we need to scroll later
      _shouldScrollToBottom = true;
      return;
    }

    if (animated) {
      // Use post frame callback for animated scroll
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (_scrollController.hasClients) {
          _scrollController.animateTo(
            _scrollController.position.maxScrollExtent,
            duration: const Duration(milliseconds: 300),
            curve: Curves.easeOut,
          );
        }
      });
    } else {
      // Immediate scroll
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (_scrollController.hasClients) {
          _scrollController.jumpTo(_scrollController.position.maxScrollExtent);
        }
      });
    }
  }

  void _scrollToBottomIfNeeded() {
    if (_shouldScrollToBottom && _scrollController.hasClients) {
      _shouldScrollToBottom = false;
      _scrollToBottom(animated: false);
    }
  }

  void _sendMessage() {
    final message = _messageController.text.trim();
    if (message.isNotEmpty) {
      context.read<ChatBloc>().add(
        SendMessage(
          currentUserId: _currentUserId,
          otherPersonId: widget.recipientId,
          message: message,
        ),
      );
      _messageController.clear();
      _scrollToBottom();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: _buildAppBar(),
      body: BlocConsumer<ChatBloc, ChatState>(
        listener: (context, state) {
          if (state is MessagesLoaded || state is MessageSent) {
            _scrollToBottom();
          }
          if (state is MessagesLoadingError) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(state.message),
                backgroundColor: Colors.red,
              ),
            );
          }
          if (state is SendMessageError) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text('Failed to send message: ${state.message}'),
                backgroundColor: Colors.red,
              ),
            );
          }
          if (state is ListerningToMessageError) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text('Connection error: ${state.message}'),
                backgroundColor: Colors.orange,
              ),
            );
          }
        },
        builder: (context, state) {
          if (state is LoadingMessages) {
            return const Center(child: CircularProgressIndicator());
          }

          if (state is MessagesLoadingError) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.error_outline, size: 64, color: Colors.red[300]),
                  const SizedBox(height: 16),
                  Text(
                    'Failed to load messages',
                    style: TextStyle(fontSize: 18, color: Colors.grey[600]),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    state.message,
                    style: TextStyle(fontSize: 14, color: Colors.grey[500]),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () {
                      context.read<ChatBloc>().add(
                        LoadMessages(
                          currentUserId: _currentUserId,
                          otherPersonId: widget.recipientId,
                        ),
                      );
                    },
                    child: const Text('Retry'),
                  ),
                ],
              ),
            );
          }

          final messages = _getMessagesFromState(state);

          return Column(
            children: [
              // Messages List
              Expanded(
                child: messages.isEmpty
                    ? _buildEmptyState()
                    : NotificationListener<ScrollEndNotification>(
                        onNotification: (notification) {
                          // Check if we need to scroll after the list is built
                          WidgetsBinding.instance.addPostFrameCallback((_) {
                            _scrollToBottomIfNeeded();
                          });
                          return false;
                        },
                        child: ListView.builder(
                          controller: _scrollController,
                          padding: const EdgeInsets.symmetric(vertical: 8),
                          itemCount: messages.length,
                          itemBuilder: (context, index) {
                            // Scroll to bottom after the last item is built
                            if (index == messages.length - 1) {
                              WidgetsBinding.instance.addPostFrameCallback((_) {
                                _scrollToBottomIfNeeded();
                              });
                            }
                            return ChatTile(
                              chat: messages[index],
                              currentUserId: _currentUserId,
                            );
                          },
                        ),
                      ),
              ),
              // Message Input
              _buildMessageInput(),
            ],
          );
        },
      ),
    );
  }

  List<Chat> _getMessagesFromState(ChatState state) {
    if (state is MessagesLoaded) return state.chats;
    if (state is MessageSent) return state.chats;
    if (state is SendingMessage) {
      // If we're sending a message, try to get chats from ChatBloc directly
      final chatBloc = context.read<ChatBloc>();
      return chatBloc.chats;
    }
    return <Chat>[];
  }

  PreferredSizeWidget _buildAppBar() {
    return AppBar(
      elevation: 1,
      backgroundColor: Colors.white,
      centerTitle: false,
      leading: IconButton(
        icon: const Icon(Icons.arrow_back, color: Colors.black),
        onPressed: () => Navigator.pop(context),
      ),
      title: Row(
        children: [
          CircleAvatar(
            radius: 20,
            backgroundImage: NetworkImage(widget.profileUrl),
            onBackgroundImageError: (_, __) => const Icon(Icons.person),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  widget.name,
                  style: const TextStyle(
                    color: Colors.black,
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                BlocBuilder<ChatBloc, ChatState>(
                  builder: (context, state) {
                    String status = "Offline";
                    Color statusColor = Colors.grey;

                    // if (state is ListeningToMessages) {
                    //   status = "Online";
                    //   statusColor = Colors.green;
                    // }
                    if (state is ListerningToMessageError) {
                      status = "Connection lost";
                      statusColor = Colors.red;
                    }

                    return Text(
                      status,
                      style: TextStyle(
                        color: statusColor,
                        fontSize: 12,
                        fontWeight: FontWeight.w400,
                      ),
                    );
                  },
                ),
              ],
            ),
          ),
        ],
      ),
      actions: [
        IconButton(
          icon: const Icon(Icons.videocam, color: Colors.black),
          onPressed: () {
            // Handle video call
          },
        ),
        IconButton(
          icon: const Icon(Icons.call, color: Colors.black),
          onPressed: () {
            // Handle voice call
          },
        ),
        PopupMenuButton<String>(
          icon: const Icon(Icons.more_vert, color: Colors.black),
          onSelected: (value) {
            switch (value) {
              case 'reconnect':
                context.read<ChatBloc>().add(ListernToMessages());
                break;
              case 'refresh':
                context.read<ChatBloc>().add(
                  LoadMessages(
                    currentUserId: _currentUserId,
                    otherPersonId: widget.recipientId,
                  ),
                );
                break;
            }
          },
          itemBuilder: (context) => [
            const PopupMenuItem(
              value: 'reconnect',
              child: Row(
                children: [
                  Icon(Icons.refresh),
                  SizedBox(width: 8),
                  Text('Reconnect'),
                ],
              ),
            ),
            const PopupMenuItem(
              value: 'refresh',
              child: Row(
                children: [
                  Icon(Icons.sync),
                  SizedBox(width: 8),
                  Text('Refresh Messages'),
                ],
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.chat_bubble_outline, size: 64, color: Colors.grey[300]),
          const SizedBox(height: 16),
          Text(
            'Start a conversation',
            style: TextStyle(fontSize: 18, color: Colors.grey[500]),
          ),
          const SizedBox(height: 8),
          Text(
            'Send a message to ${widget.name}',
            style: TextStyle(fontSize: 14, color: Colors.grey[400]),
          ),
        ],
      ),
    );
  }

  Widget _buildMessageInput() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.1),
            spreadRadius: 1,
            blurRadius: 3,
            offset: const Offset(0, -1),
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
                _showAttachmentOptions();
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
                          contentPadding: const EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 10,
                          ),
                        ),
                        maxLines: null,
                        textCapitalization: TextCapitalization.sentences,
                        onSubmitted: (_) => _sendMessage(),
                      ),
                    ),
                    IconButton(
                      icon: Icon(Icons.emoji_emotions, color: Colors.grey[600]),
                      onPressed: () {
                        _showEmojiPicker();
                      },
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(width: 8),

            // Send button
            BlocBuilder<ChatBloc, ChatState>(
              builder: (context, state) {
                final isLoading = state is SendingMessage;

                return Container(
                  decoration: const BoxDecoration(
                    color: Colors.blue,
                    shape: BoxShape.circle,
                  ),
                  child: IconButton(
                    icon: isLoading
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              valueColor: AlwaysStoppedAnimation<Color>(
                                Colors.white,
                              ),
                            ),
                          )
                        : const Icon(Icons.send, color: Colors.white),
                    onPressed: isLoading ? null : _sendMessage,
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  void _showAttachmentOptions() {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => Container(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              'Share',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w600,
                color: Colors.grey[800],
              ),
            ),
            const SizedBox(height: 20),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                _attachmentOption(Icons.camera_alt, 'Camera', () {}),
                _attachmentOption(Icons.photo, 'Gallery', () {}),
                _attachmentOption(Icons.videocam, 'Video', () {}),
                _attachmentOption(Icons.attach_file, 'File', () {}),
              ],
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  Widget _attachmentOption(IconData icon, String label, VoidCallback onTap) {
    return GestureDetector(
      onTap: () {
        Navigator.pop(context);
        onTap();
      },
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.blue.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: Colors.blue, size: 30),
          ),
          const SizedBox(height: 8),
          Text(label, style: TextStyle(fontSize: 12, color: Colors.grey[600])),
        ],
      ),
    );
  }

  void _showEmojiPicker() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Emoji picker not implemented yet'),
        duration: Duration(seconds: 1),
      ),
    );
  }
}

class ChatTile extends StatelessWidget {
  final Chat chat;
  final String currentUserId;

  const ChatTile({super.key, required this.chat, required this.currentUserId});

  @override
  Widget build(BuildContext context) {
    final isCurrentUser = currentUserId == chat.messagerId;

    return Align(
      alignment: isCurrentUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 2, horizontal: 12),
        child: Column(
          crossAxisAlignment: isCurrentUser
              ? CrossAxisAlignment.end
              : CrossAxisAlignment.start,
          children: [
            Container(
              constraints: BoxConstraints(
                maxWidth: MediaQuery.of(context).size.width * 0.75,
              ),
              decoration: BoxDecoration(
                color: isCurrentUser ? Colors.blue : Colors.white,
                borderRadius: BorderRadius.only(
                  topLeft: const Radius.circular(16),
                  topRight: const Radius.circular(16),
                  bottomLeft: Radius.circular(isCurrentUser ? 16 : 4),
                  bottomRight: Radius.circular(isCurrentUser ? 4 : 16),
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.grey.withOpacity(0.1),
                    spreadRadius: 1,
                    blurRadius: 2,
                    offset: const Offset(0, 1),
                  ),
                ],
              ),
              child: Padding(
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 8,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      chat.text,
                      style: TextStyle(
                        color: isCurrentUser ? Colors.white : Colors.black87,
                        fontSize: 15,
                        fontWeight: FontWeight.w400,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          chat.time,
                          style: TextStyle(
                            color: isCurrentUser
                                ? Colors.white70
                                : Colors.grey[500],
                            fontSize: 11,
                          ),
                        ),
                        if (isCurrentUser) ...[
                          const SizedBox(width: 4),
                          Icon(
                            chat.read
                                ? Icons.done_all
                                : chat.delivered
                                ? Icons.done_all
                                : Icons.done,
                            size: 14,
                            color: chat.read
                                ? Colors.blue[200]
                                : Colors.white70,
                          ),
                        ],
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 4),
          ],
        ),
      ),
    );
  }
}
