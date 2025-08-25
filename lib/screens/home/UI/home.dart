import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:kabootar/screens/chat/UI/chat_screen.dart';
import 'package:kabootar/screens/chat/models/chat_model.dart';
import 'package:kabootar/screens/home/home_bloc.dart';
import 'package:kabootar/services/api.service.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  late HomeBloc _homeBloc;
  @override
  void initState() {
    _homeBloc = BlocProvider.of<HomeBloc>(context);
    _homeBloc.add(LoadChats(userId: "68ab02c71ec000db1390fac3"));
    super.initState();
  }
ChatModel dummychats = ChatModel(
    name: "Jayneel",
    email: "jayneel@gmail.com",
    profileUrl:
        "https://images.unsplash.com/photo-1755845711249-32cfcdcabfeb?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    chats: [
      Chat(
        messagerId: "user_123",
        time: "10:30 AM",
        text: "Hey! How are you doing today?",
        read: true,
        delivered: true,
      ),
      Chat(
        messagerId: "user_456",
        time: "10:32 AM",
        text:
            "I'm good, thanks for asking! Just working on some Flutter projects.",
        read: true,
        delivered: true,
      ),
      Chat(
        messagerId: "user_123",
        time: "10:35 AM",
        text: "That sounds cool! What kind of app are you building?",
        read: true,
        delivered: true,
      ),
      Chat(
        messagerId: "user_456",
        time: "10:37 AM",
        text:
            "It's a chat application with real-time messaging. Still figuring out the UI design.",
        read: true,
        delivered: true,
      ),
      Chat(
        messagerId: "user_123",
        time: "10:40 AM",
        text: "Nice! Are you using any specific state management solution?",
        read: false,
        delivered: true,
      ),
      Chat(
        messagerId: "user_456",
        time: "10:42 AM",
        text:
            "I'm thinking about using Bloc or Provider. What do you recommend?",
        read: false,
        delivered: true,
      ),
      Chat(
        messagerId: "user_123",
        time: "10:45 AM",
        text:
            "Both are great! Bloc is more structured but Provider is simpler to start with.",
        read: false,
        delivered: false,
      ),
      Chat(
        messagerId: "user_456",
        time: "10:47 AM",
        text: "Thanks for the advice! I'll probably start with Provider then.",
        read: false,
        delivered: false,
      ),
      Chat(
        messagerId: "user_123",
        time: "10:50 AM",
        text:
            "Good choice! Let me know if you need any help with the implementation.",
        read: false,
        delivered: false,
      ),
      Chat(
        messagerId: "user_456",
        time: "10:52 AM",
        text: "Will do! Thanks again 😊",
        read: false,
        delivered: false,
      ),
    ],
  );
  @override
  Widget build(BuildContext context) {
    return BlocConsumer<HomeBloc, HomeState>(
      listener: (context, state) {},
      builder: (context, state) {
        if (state is LoadingChats) {
          return Scaffold(
            appBar: AppBar(title: const Text('Home')),
            body: Center(child: CircularProgressIndicator()),
          );
        } else if (state is ChatsLoaded) {
          final chats = state.conversations;
          return Scaffold(
            appBar: AppBar(title: const Text('Home')),
            body: ListView.builder(
              itemCount: chats.length,
              shrinkWrap: true,
              itemBuilder: (context, index) {
                return ListTile(
                  onTap: ()=> Navigator.push(context, MaterialPageRoute(builder: (context)=>ChatScreen(model: dummychats))),
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
