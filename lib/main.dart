import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:kabootar/screens/chat/bloc/chat_bloc.dart';
import 'package:kabootar/screens/home/home_bloc.dart';
import 'package:kabootar/screens/home/UI/home.dart';

void main() {
  runApp(const MyApp());
  WidgetsFlutterBinding.ensureInitialized();
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Kabootar',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        textTheme: GoogleFonts.montserratTextTheme(Theme.of(context).textTheme),
      ),

      home: MultiBlocProvider(
        providers: [
          BlocProvider<ChatBloc>(create: (context) => ChatBloc()),
          BlocProvider<HomeBloc>(create: (context) => HomeBloc()),
        ],
        child: HomePage(),
      ),
    );
  }
}
