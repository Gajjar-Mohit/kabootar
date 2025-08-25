import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
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

  @override
  Widget build(BuildContext context) {
    return BlocConsumer<HomeBloc, HomeState>(
      listener: (context, state) {

      },
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
