import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:kabootar/screens/chat/UI/chat_screen.dart';
import 'package:kabootar/screens/chat/bloc/chat_bloc.dart';

import 'package:kabootar/screens/home/home_bloc.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  late HomeBloc _homeBloc;
  late ChatBloc _chatBloc;
  @override
  void initState() {
    _homeBloc = BlocProvider.of<HomeBloc>(context);
    _chatBloc = BlocProvider.of<ChatBloc>(context);
    _homeBloc.add(LoadConversations(userId: "68ab02c71ec000db1390fac3"));
    _chatBloc.add(ListernToMessages());
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return BlocConsumer<HomeBloc, HomeState>(
      listener: (context, state) {},
      builder: (context, state) {
        if (state is LoadingConversations) {
          return Scaffold(
            appBar: AppBar(title: const Text('Home')),
            body: Center(child: CircularProgressIndicator()),
          );
        } else if (state is ConversationsLoaded) {
          final chats = state.conversations;
          return Scaffold(
            appBar: AppBar(title: const Text('Home')),
            body: ListView.builder(
              itemCount: chats.length,
              shrinkWrap: true,
              itemBuilder: (context, index) {
                return ListTile(
                  onTap: () => Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => ChatScreen(
                        name: chats[index].name,
                        profileUrl: chats[index].imageUrl,
                        recipientId: chats[index].id,
                      ),
                    ),
                  ),
                  leading: CircleAvatar(
                    backgroundImage: NetworkImage(chats[index].imageUrl),
                  ),
                  title: Text(chats[index].name),
                  subtitle: Text(chats[index].lastMessage),
                );
              },
            ),
          );
        } else {
          return Scaffold(
            appBar: AppBar(title: const Text('Home')),
            body: Center(child: Text("Nothing to show")),
          );
        }
      },
    );
  }
}
