import { StringToBoolean } from "class-variance-authority/types";

export interface Conversation {
  userId: string;
  user: User;
  lastMessage: Message;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  profileUrl: string;
  bio: string;
}

interface Message {
  _id: string;
  text: string;
  sender: User;
  recipient: User;
  read: boolean;
  delivered: boolean;
  messageType: "text";
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  messagerId: string;
  text: string;
  read: boolean;
  time: string;
  delivered: string;
}
