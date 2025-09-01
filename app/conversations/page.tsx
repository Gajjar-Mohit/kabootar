"use client";
import Image from "next/image";
import {
  MagnifyingGlassIcon,
  PaperAirplaneIcon,
  UserIcon,
  ArrowLeftIcon,
  Bars3Icon,
} from "@heroicons/react/24/outline";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProfilePanel } from "@/components/profile-panel";
import { useState, useEffect, useRef } from "react";
import axios from "axios";

import { WebSocketClient } from "@/lib/websocket";
import { ChatMessageTile } from "@/components/chat-message-component";
import { ChatMessage } from "@/types/types";
interface User {
  _id: string;
  name: string;
  email: string;
  profileUrl: string;
  bio: string;
}

export interface Conversation {
  userId: string;
  user: User;
  lastMessage: {
    text: string;
    createdAt: string;
  };
}

type MobileView = "conversations" | "chat" | "profile";

export default function MessagingApp() {
  const [showProfile, setShowProfile] = useState(false);
  const [mobileView, setMobileView] = useState<MobileView>("conversations");
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentUserId] = useState("68ab028330d714be38f3942f");
  const [isConnected, setIsConnected] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const wsClient = useRef<WebSocketClient | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize WebSocket connection
    wsClient.current = new WebSocketClient(
      `ws://localhost:8001/${currentUserId}`
    );

    const connect = async () => {
      try {
        await wsClient.current?.connect();
        setIsConnected(true);

        // Listen for incoming messages
        wsClient.current?.onMessage((data: string) => {
          console.log("Message received:", data);

          try {
            const messageData = JSON.parse(data);

            if (messageData.data) {
              const newMessage: any = {
                id: messageData.data.id,
                text: messageData.data.text,
                sender: messageData.data.sender,
                recipient: messageData.data.recipient,
                messageType: messageData.data.messageType as "text",
              };

              // Add message to current conversation if it matches
              setMessages((prev) => {
                // Avoid duplicate messages
                if (prev.some((msg) => msg.id === newMessage._id)) {
                  return prev;
                }
                return [...prev, newMessage];
              });

              // Update conversations list with latest message
              setConversations((prev) =>
                prev.map((conv) => {
                  if (
                    conv.userId === messageData.data.sender ||
                    conv.userId === messageData.data.recipient
                  ) {
                    return {
                      ...conv,
                      lastMessage: {
                        text: messageData.data.text,
                        createdAt: messageData.timestamp,
                      },
                    };
                  }
                  return conv;
                })
              );
            }
          } catch (error) {
            console.error("Error parsing incoming message:", error);
          }
        });

        wsClient.current?.onConnect(() => {
          console.log("WebSocket connected");
          setIsConnected(true);
        });

        wsClient.current?.onDisconnect(() => {
          console.log("WebSocket disconnected");
          setIsConnected(false);
        });

        wsClient.current?.onError((error: any) => {
          console.error("WebSocket error:", error);
          setIsConnected(false);
        });
      } catch (error) {
        console.error("Failed to connect:", error);
        setIsConnected(false);
      }
    };

    connect();

    // Cleanup on unmount
    return () => {
      if (wsClient.current && "disconnect" in wsClient.current) {
        (wsClient.current as any).disconnect();
      }
    };
  }, [currentUserId]);

  const handleSendMessage = async () => {
    if (
      !messageText.trim() ||
      !selectedConversation ||
      isSending ||
      !isConnected
    ) {
      return;
    }

    setIsSending(true);

    try {
      const messagePayload = {
        sender: currentUserId,
        text: messageText.trim(),
        recipient: selectedConversation.userId,
        messageType: "text" as const,
      };

      // Create temporary message for immediate UI update
      const tempMessage: any = {
        text: messageText.trim(),
        sender: currentUserId,
        recipient: selectedConversation.userId,
        messageType: "text" as const,
      };

      // Add message to UI immediately
      setMessages((prev) => [...prev, tempMessage]);

      // Clear input
      setMessageText("");

      // Send via WebSocket
      wsClient.current?.send(JSON.stringify(messagePayload));

      // Update conversations list
      setConversations((prev) =>
        prev.map((conv) => {
          if (conv.userId === selectedConversation.userId) {
            return {
              ...conv,
              lastMessage: {
                text: messageText.trim(),
                createdAt: new Date().toISOString(),
              },
            };
          }
          return conv;
        })
      );
    } catch (error) {
      console.error("Error sending message:", error);
      // Remove the temporary message on error
      setMessages((prev) => prev.filter((msg) => !msg.id.startsWith("temp-")));
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:8000/api/v1/chat/conversations/${currentUserId}`
      );

      if (response.data?.success) {
        setConversations(response.data.data);
      } else {
        console.error("Failed to fetch conversations:", response.data);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const getConversationMessages = async (recipientId: string) => {
    setMessagesLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:8000/api/v1/chat/messages",
        {
          currentUserId: currentUserId,
          recipientId: recipientId,
        }
      );

      if (response.data?.success) {
        console.log("Messages:", response.data.data);
        // Transform the response data to match our ChatMessage interface
        const transformedMessages: ChatMessage[] = (
          response.data.data || []
        ).map((msg: any) => ({
          _id: msg._id,
          text: msg.text,
          sender: typeof msg.sender === "object" ? msg.sender._id : msg.sender,
          recipient:
            typeof msg.recipient === "object"
              ? msg.recipient._id
              : msg.recipient,
          messageType: msg.messageType || "text",
          createdAt: msg.createdAt,
          updatedAt: msg.updatedAt,
        }));
        setMessages(transformedMessages);
      } else {
        console.error("Failed to fetch messages:", response.data);
        setMessages([]);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      setMessages([]);
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    // Clear message input when switching conversations
    setMessageText("");
    // Fetch messages for this conversation
    getConversationMessages(conversation.user._id);

    if (isMobile) {
      setMobileView("chat");
    }
  };

  const handleBackToConversations = () => {
    setMobileView("conversations");
    setSelectedConversation(null);
    setMessages([]);
    setMessageText("");
  };

  const handleShowProfile = () => {
    if (isMobile) {
      setMobileView("profile");
    } else {
      setShowProfile(!showProfile);
    }
  };

  const handleBackFromProfile = () => {
    setMobileView("chat");
  };

  // Format timestamp helper
  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        weekday: "short",
      });
    } catch {
      return "Invalid time";
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600 items-center justify-center">
          Loading conversations...
        </p>
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="h-[calc(100vh-4rem)]">
        {/* Desktop Layout */}
        <div
          className={`hidden h-full md:flex ${
            showProfile
              ? "md:grid-cols-[320px_1fr_300px]"
              : "md:grid-cols-[320px_1fr]"
          }`}
        >
          {/* Desktop Sidebar */}
          <div className="w-80 border-r border-gray-200 bg-white flex flex-col">
            {/* Sidebar Header */}
            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search"
                  className="pl-10 bg-gray-50 border-0 focus-visible:ring-1 focus-visible:ring-purple-500"
                />
              </div>
            </div>

            {/* Connection Status */}
            <div className="px-4 py-2 text-xs">
              <span
                className={`inline-flex items-center gap-1 ${
                  isConnected ? "text-green-600" : "text-red-600"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    isConnected ? "bg-green-500" : "bg-red-500"
                  }`}
                ></div>
                {isConnected ? "Connected" : "Disconnected"}
              </span>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No conversations found
                </div>
              ) : (
                conversations.map((conversation) => (
                  <div
                    key={conversation.userId}
                    onClick={() => handleConversationSelect(conversation)}
                    className={`flex items-center gap-3 p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                      selectedConversation?.userId === conversation.userId
                        ? "bg-purple-50 border-r-2 border-purple-500"
                        : ""
                    }`}
                  >
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        {conversation.user.profileUrl ? (
                          <Image
                            width={48}
                            height={48}
                            src={conversation.user.profileUrl}
                            alt={conversation.user.name}
                          />
                        ) : (
                          <AvatarFallback className="bg-purple-100 text-purple-700 font-medium">
                            {conversation.user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900 truncate">
                          {conversation.user.name}
                        </h3>
                        <span className="text-xs text-gray-500 ml-2">
                          {formatTime(conversation.lastMessage.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 truncate mt-0.5">
                        {conversation.lastMessage.text}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Desktop Chat Area */}
          <div className="flex-1 flex flex-col bg-white">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      {selectedConversation.user.profileUrl ? (
                        <Image
                          width={40}
                          height={40}
                          src={selectedConversation.user.profileUrl}
                          alt={selectedConversation.user.name}
                        />
                      ) : (
                        <AvatarFallback className="bg-purple-100 text-purple-700 font-medium">
                          {selectedConversation.user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {selectedConversation.user.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Last seen 10 min ago
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleShowProfile}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <UserIcon className="h-5 w-5" />
                  </Button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                  {messagesLoading ? (
                    <div className="flex justify-center items-center h-32">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex justify-center items-center h-32 text-gray-500">
                      No messages yet. Start the conversation!
                    </div>
                  ) : (
                    <>
                      {/* Date Separator */}
                      <div className="flex items-center gap-4">
                        <div className="h-px flex-1 bg-gray-200"></div>
                        <span className="text-xs text-gray-500 bg-white px-3 py-1 rounded-full">
                          Today
                        </span>
                        <div className="h-px flex-1 bg-gray-200"></div>
                      </div>

                      {messages.map((message) =>
                        ChatMessageTile(message, currentUserId)
                      )}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-100 bg-white">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 relative">
                      <Input
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type a message"
                        disabled={!isConnected || isSending}
                        className="pr-12 rounded-full border-gray-200 focus-visible:ring-purple-500 focus-visible:border-purple-500"
                      />
                    </div>
                    <Button
                      onClick={handleSendMessage}
                      disabled={
                        !messageText.trim() || !isConnected || isSending
                      }
                      size="icon"
                      className="h-10 w-10 rounded-full bg-purple-500 hover:bg-purple-600 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSending ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <PaperAirplaneIcon className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                Select a conversation to start chatting
              </div>
            )}
          </div>

          {/* Desktop Profile Panel */}
          {showProfile && (
            <div className="w-80 border-l border-gray-200 bg-white">
              <ProfilePanel
                email={selectedConversation?.user.email ?? ""}
                profileImage={selectedConversation?.user.profileUrl ?? ""}
                fullName={selectedConversation?.user.name ?? ""}
                bio={selectedConversation?.user.bio ?? ""}
              />
            </div>
          )}
        </div>

        {/* Mobile Layout */}
        <div className="h-full md:hidden">
          {/* Mobile Conversations View */}
          {mobileView === "conversations" && (
            <div className="flex h-full flex-col bg-white">
              {/* Mobile Header */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-xl font-semibold text-gray-900">
                    Messages
                  </h1>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 text-xs ${
                        isConnected ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${
                          isConnected ? "bg-green-500" : "bg-red-500"
                        }`}
                      ></div>
                      {isConnected ? "Online" : "Offline"}
                    </span>
                    <Button variant="ghost" size="icon">
                      <Bars3Icon className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search conversations"
                    className="pl-10 bg-gray-50 border-0 focus-visible:ring-1 focus-visible:ring-purple-500"
                  />
                </div>
              </div>

              {/* Mobile Conversations List */}
              <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    No conversations found
                  </div>
                ) : (
                  conversations.map((conversation) => (
                    <div
                      key={conversation.userId}
                      onClick={() => handleConversationSelect(conversation)}
                      className="flex items-center gap-3 p-4 border-b border-gray-50 cursor-pointer transition-colors active:bg-gray-50 hover:bg-gray-25"
                    >
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          {conversation.user.profileUrl ? (
                            <Image
                              width={48}
                              height={48}
                              src={conversation.user.profileUrl}
                              alt={conversation.user.name}
                            />
                          ) : (
                            <AvatarFallback className="bg-purple-100 text-purple-700 font-medium">
                              {conversation.user.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-gray-900 truncate text-sm">
                            {conversation.user.name}
                          </h3>
                          <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                            {formatTime(conversation.lastMessage.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 truncate mt-0.5">
                          {conversation.lastMessage.text}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Mobile Chat View */}
          {mobileView === "chat" && selectedConversation && (
            <div className="flex h-full flex-col bg-white">
              {/* Mobile Chat Header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-white">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBackToConversations}
                  className="h-8 w-8"
                >
                  <ArrowLeftIcon className="h-5 w-5" />
                </Button>
                <Avatar className="h-10 w-10">
                  {selectedConversation.user.profileUrl ? (
                    <Image
                      width={40}
                      height={40}
                      src={selectedConversation.user.profileUrl}
                      alt={selectedConversation.user.name}
                    />
                  ) : (
                    <AvatarFallback className="bg-purple-100 text-purple-700 font-medium">
                      {selectedConversation.user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm truncate">
                    {selectedConversation.user.name}
                  </h3>
                  <p className="text-xs text-gray-500">Last seen 10 min ago</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleShowProfile}
                  className="h-8 w-8"
                >
                  <UserIcon className="h-5 w-5" />
                </Button>
              </div>

              {/* Mobile Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30">
                {messagesLoading ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex justify-center items-center h-32 text-gray-500">
                    No messages yet. Start the conversation!
                  </div>
                ) : (
                  <>
                    {/* Date Separator */}
                    <div className="flex items-center gap-4">
                      <div className="h-px flex-1 bg-gray-200"></div>
                      <span className="text-xs text-gray-500 bg-white px-3 py-1 rounded-full">
                        Today
                      </span>
                      <div className="h-px flex-1 bg-gray-200"></div>
                    </div>

                    {messages.map((message) =>
                      ChatMessageTile(message, currentUserId)
                    )}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Mobile Message Input */}
              <div className="p-4 border-t border-gray-100 bg-white">
                <div className="flex items-center gap-3">
                  <div className="flex-1 relative">
                    <Input
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type a message"
                      disabled={!isConnected || isSending}
                      className="rounded-full border-gray-200 focus-visible:ring-purple-500 focus-visible:border-purple-500 text-sm"
                    />
                  </div>
                  <Button
                    size="icon"
                    onClick={handleSendMessage}
                    disabled={!messageText.trim() || !isConnected || isSending}
                    className="h-10 w-10 rounded-full bg-purple-500 hover:bg-purple-600 shadow-md flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSending ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <PaperAirplaneIcon className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Mobile Profile View */}
          {mobileView === "profile" && (
            <div className="flex h-full flex-col bg-white">
              <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBackFromProfile}
                  className="h-8 w-8"
                >
                  <ArrowLeftIcon className="h-5 w-5" />
                </Button>
                <h2 className="font-semibold text-gray-900">Profile</h2>
              </div>
              <div className="flex-1 overflow-y-auto">
                <ProfilePanel
                  profileImage={selectedConversation?.user.profileUrl ?? ""}
                  email={selectedConversation?.user.email ?? ""}
                  fullName={selectedConversation?.user.name ?? ""}
                  bio={selectedConversation?.user.bio ?? ""}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
