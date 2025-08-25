import 'package:bloc/bloc.dart';
import 'package:kabootar/screens/home/models/conversation.model.dart';
import 'package:kabootar/services/api.service.dart';
import 'package:meta/meta.dart';

part 'home_event.dart';
part 'home_state.dart';

class HomeBloc extends Bloc<HomeEvent, HomeState> {
  final ApiService _apiService = ApiService();
  HomeBloc() : super(HomeInitial()) {
    on<HomeEvent>((event, emit) {});
    on<LoadChats>((event, emit) async {
      emit(LoadingChats());

      final result = await _apiService.getConversations(event.userId);

      result.fold(
        (left) {
          emit(ChatLoadingError(message: left.message));
        },
        (right) {
          List<ConversationModel> conversations = [];
          for (var element in right.data) {
            conversations.add(
              ConversationModel(
                name: element.user.name,
                email: element.user.email,
                imageUrl:
                    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQFg12tH1Ck5xZa9DAnjIpVmHy8SiMVP1bvSHnnFJ1XNEFOCE1TEgYUuXom8a8gJXjceAGfvEvS-BlIATARArWiBw",
                lastMessage: element.lastMessage.text,
                lastMessageTime: element.lastMessage.createdAt.toLocal(),
              ),
            );
          }
          emit(ChatsLoaded(conversations: conversations));
        },
      );
    });
  }
}
