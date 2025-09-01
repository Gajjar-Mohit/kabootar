"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  MagnifyingGlassIcon,
  PaperAirplaneIcon,
  UserIcon,
  ArrowLeftIcon,
  Bars3Icon,
  PlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProfilePanel } from "@/components/profile-panel";
import { ChatMessageTile } from "@/components/chat-message-component";
import { WebSocketClient } from "@/lib/websocket";
import { useAuth, useUser } from "@clerk/nextjs";
import type { ChatMessage, Conversation, User } from "@/types/types";

// Define mobile view types
type MobileView = "conversations" | "chat" | "profile" | "search";

// Define component
export default function MessagingApp() {
  // State management
  const [showProfile, setShowProfile] = useState(false);
  const [mobileView, setMobileView] = useState<MobileView>("conversations");
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [conversations, setConversations] = useState<any[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showSearchPopup, setShowSearchPopup] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  const { user } = useUser();
  const wsClient = useRef<WebSocketClient | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch current user ID
  useEffect(() => {
    const getUserId = async () => {
      if (!user?.id) return;
      try {
        const response = await axios.get(
          `http://192.168.1.5:8000/api/v1/user/${user.id}`
        );
        if (response.data?.success) {
          setCurrentUserId(response.data.data._id);
        }
      } catch (error) {
        console.error("Failed to fetch current user ID:", error);
      }
    };
    getUserId();
  }, [user?.id]);

  // Auto-scroll on messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // WebSocket connection handling
  useEffect(() => {
    if (!currentUserId) return;

    wsClient.current = new WebSocketClient(
      `ws://192.168.1.5:8001/${currentUserId}`
    );

    const connect = async () => {
      try {
        await wsClient.current?.connect();
        setIsConnected(true);

        wsClient.current?.onMessage((data: string) => {
          try {
            const messageData = JSON.parse(data);
            if (messageData.data) {
              const newMessage: any = {
                id: messageData.data.id,
                text: messageData.data.text,
                sender: messageData.data.sender,
                recipient: messageData.data.recipient,
                messageType: messageData.data.messageType,
              };

              setMessages((prev) => {
                if (prev.some((msg) => msg.id === newMessage.id)) return prev;
                return [...prev, newMessage];
              });

              setConversations((prev) =>
                prev.map((conv) =>
                  conv.userId === messageData.data.sender ||
                  conv.userId === messageData.data.recipient
                    ? {
                        ...conv,
                        lastMessage: {
                          text: messageData.data.text,
                          createdAt: messageData.timestamp,
                        },
                      }
                    : conv
                )
              );
            }
          } catch (error) {
            console.error("Error parsing incoming message:", error);
          }
        });

        wsClient.current?.onConnect(() => setIsConnected(true));
        wsClient.current?.onDisconnect(() => setIsConnected(false));
        wsClient.current?.onError((error) => {
          console.error("WebSocket error:", error);
          setIsConnected(false);
        });
      } catch (error) {
        console.error("Failed to connect:", error);
        setIsConnected(false);
      }
    };

    connect();

    return () => {
      wsClient.current?.disconnect?.();
    };
  }, [currentUserId]);

  // Handle sending messages
  const handleSendMessage = async () => {
    if (
      !messageText.trim() ||
      !selectedConversation ||
      isSending ||
      !isConnected
    )
      return;

    setIsSending(true);
    try {
      const messagePayload: any = {
        sender: currentUserId,
        text: messageText.trim(),
        recipient: selectedConversation?.userId,
        messageType: "text",
      };

      setMessages((prev) => [
        ...prev,
        { ...messagePayload, id: `temp-${Date.now()}` },
      ]);
      setMessageText("");

      wsClient.current?.send(JSON.stringify(messagePayload));

      setConversations((prev) =>
        prev.map((conv) =>
          conv.userId === selectedConversation.userId
            ? {
                ...conv,
                lastMessage: {
                  text: messageText.trim(),
                  createdAt: new Date().toISOString(),
                },
              }
            : conv
        )
      );
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => prev.filter((msg) => !msg.id?.startsWith("temp-")));
    } finally {
      setIsSending(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Search users
  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setSearchError("");
    try {
      const response = await axios.post(
        `http://192.168.1.5:8000/api/v1/user/search?q=${query}&exclude=${currentUserId}`
      );
      console.log(response.data);
      setSearchResults(response.data?.success ? response.data.data : []);
      setSearchError(response.data?.success ? "" : "Failed to search users");
    } catch (error) {
      console.error("Error searching users:", error);
      setSearchError("Error occurred while searching");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Create new conversation
  const createConversation = async (user: User) => {
    try {
      const existingConv = conversations.find(
        (conv) => conv.userId === user._id
      );
      if (existingConv) {
        setSelectedConversation(existingConv);
        getConversationMessages(user._id);
        setShowSearchPopup(false);
        setSearchQuery("");
        setSearchResults([]);
        if (isMobile) setMobileView("chat");
        return;
      }

      const newConversation: any = {
        userId: user._id,
        user,
        lastMessage: {
          text: "Start a conversation...",
          createdAt: new Date().toISOString(),
        },
      };

      setConversations((prev) => [newConversation, ...prev]);
      setSelectedConversation(newConversation);
      setMessages([]);
      setShowSearchPopup(false);
      setSearchQuery("");
      setSearchResults([]);
      if (isMobile) setMobileView("chat");
    } catch (error) {
      console.error("Error creating conversation:", error);
    }
  };

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) searchUsers(searchQuery);
      else setSearchResults([]);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Handle mobile view detection
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      if (!currentUserId) return;
      setLoading(true);
      try {
        const response = await axios.get(
          `http://192.168.1.5:8000/api/v1/chat/conversations/${currentUserId}`
        );
        if (response.data?.success) {
          setConversations(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching conversations:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, [currentUserId]);

  // Fetch conversation messages
  const getConversationMessages = async (recipientId: string) => {
    setMessagesLoading(true);
    try {
      const response = await axios.post(
        "http://192.168.1.5:8000/api/v1/chat/messages",
        {
          currentUserId,
          recipientId,
        }
      );

      if (response.data?.success) {
        const transformedMessages: ChatMessage[] = (
          response.data.data || []
        ).map((msg: any) => ({
          id: msg._id,
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
        setMessages([]);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      setMessages([]);
    } finally {
      setMessagesLoading(false);
    }
  };

  // Navigation handlers
  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setMessageText("");
    getConversationMessages(conversation.user._id);
    if (isMobile) setMobileView("chat");
  };

  const handleBackToConversations = () => {
    setMobileView("conversations");
    setSelectedConversation(null);
    setMessages([]);
    setMessageText("");
  };

  const handleShowProfile = () => {
    if (isMobile) setMobileView("profile");
    else setShowProfile(!showProfile);
  };

  const handleBackFromProfile = () => {
    setMobileView("chat");
  };

  const openSearchPopup = () => {
    setShowSearchPopup(true);
    setSearchQuery("");
    setSearchResults([]);
    setSearchError("");
    if (isMobile) setMobileView("search");
  };

  const closeSearchPopup = () => {
    setShowSearchPopup(false);
    setSearchQuery("");
    setSearchResults([]);
    setSearchError("");
    if (isMobile) setMobileView("conversations");
  };

  // Format timestamp
  const formatTime = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        weekday: "short",
      });
    } catch {
      return "Invalid time";
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Loading conversations...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 pt-16">
      <div className="h-[calc(100vh-4rem)]">
        {/* Search Popup - Desktop */}
        {showSearchPopup && !isMobile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="mx-4 flex max-h-[80vh] w-full max-w-md flex-col rounded-lg bg-white">
              <div className="flex items-center justify-between border-b border-gray-200 p-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Find Users
                </h2>
                <Button variant="ghost" size="icon" onClick={closeSearchPopup}>
                  <XMarkIcon className="h-5 w-5" />
                </Button>
              </div>
              <div className="border-b border-gray-100 p-4">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search users by name..."
                    className="pl-10 focus-visible:ring-purple-500"
                    autoFocus
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                {isSearching ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-purple-600"></div>
                  </div>
                ) : searchError ? (
                  <div className="py-8 text-center text-red-500">
                    {searchError}
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="space-y-1">
                    {searchResults.map((user) => (
                      <div
                        key={user._id}
                        onClick={() => createConversation(user)}
                        className="flex cursor-pointer items-center gap-3 p-3 hover:bg-gray-50"
                      >
                        <Avatar className="h-10 w-10">
                          {user.profileUrl ? (
                            <Image
                              width={40}
                              height={40}
                              src={user.profileUrl}
                              alt={user.name}
                            />
                          ) : (
                            <AvatarFallback className="bg-purple-100 text-purple-700 font-medium">
                              {user.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate font-medium text-gray-900">
                            {user.name}
                          </h3>
                          <p className="truncate text-sm text-gray-500">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : searchQuery.trim() ? (
                  <div className="py-8 text-center text-gray-500">
                    No users found for "{searchQuery}"
                  </div>
                ) : (
                  <div className="py-8 text-center text-gray-500">
                    Start typing to search for users
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Mobile Layout */}
        <div className="h-full md:hidden">
          {mobileView === "conversations" && (
            <div className="flex h-full flex-col bg-white">
              <div className="border-b border-gray-100 p-4">
                <div className="mb-4 flex items-center justify-between">
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
                        className={`h-2 w-2 rounded-full ${
                          isConnected ? "bg-green-500" : "bg-red-500"
                        }`}
                      ></div>
                      {isConnected ? "Online" : "Offline"}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={openSearchPopup}
                    >
                      <PlusIcon className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Bars3Icon className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search conversations"
                    className="border-0 bg-gray-50 pl-10 focus-visible:ring-1 focus-visible:ring-purple-500"
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    <p>No conversations yet</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={openSearchPopup}
                      className="mt-2 border-purple-200 text-purple-600 hover:bg-purple-50"
                    >
                      <PlusIcon className="mr-1 h-4 w-4" />
                      Start chatting
                    </Button>
                  </div>
                ) : (
                  conversations.map((conversation) => (
                    <div
                      key={conversation.userId}
                      onClick={() => handleConversationSelect(conversation)}
                      className="flex cursor-pointer items-center gap-3 border-b border-gray-50 p-4 transition-colors hover:bg-gray-25 active:bg-gray-50"
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
                                .map((n: any) => n[0])
                                .join("")
                                .toUpperCase()}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-green-500"></div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="truncate text-sm font-medium text-gray-900">
                            {conversation.user.name}
                          </h3>
                          <span className="ml-2 flex-shrink-0 text-xs text-gray-500">
                            {formatTime(conversation.lastMessage.createdAt)}
                          </span>
                        </div>
                        <p className="mt-0.5 truncate text-sm text-gray-500">
                          {conversation.lastMessage.text}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {mobileView === "search" && (
            <div className="flex h-full flex-col bg-white">
              <div className="flex items-center gap-3 border-b border-gray-100 bg-white px-4 py-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileView("conversations")}
                >
                  <ArrowLeftIcon className="h-5 w-5" />
                </Button>
                <h2 className="text-lg font-semibold text-gray-900">
                  Find Users
                </h2>
              </div>
              <div className="border-b border-gray-100 p-4">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search users by name..."
                    className="pl-10 focus-visible:ring-purple-500"
                    autoFocus
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                {isSearching ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-purple-600"></div>
                  </div>
                ) : searchError ? (
                  <div className="px-4 py-8 text-center text-red-500">
                    {searchError}
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="space-y-1">
                    {searchResults.map((user) => (
                      <div
                        key={user._id}
                        onClick={() => createConversation(user)}
                        className="flex cursor-pointer items-center gap-3 border-b border-gray-50 p-4 transition-colors active:bg-gray-50"
                      >
                        <Avatar className="h-12 w-12">
                          {user.profileUrl ? (
                            <Image
                              width={48}
                              height={48}
                              src={user.profileUrl}
                              alt={user.name}
                            />
                          ) : (
                            <AvatarFallback className="bg-purple-100 text-purple-700 font-medium">
                              {user.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-sm font-medium text-gray-900">
                            {user.name}
                          </h3>
                          <p className="mt-0.5 truncate text-sm text-gray-500">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : searchQuery.trim() ? (
                  <div className="px-4 py-8 text-center text-gray-500">
                    No users found for "{searchQuery}"
                  </div>
                ) : (
                  <div className="px-4 py-8 text-center text-gray-500">
                    Start typing to search for users
                  </div>
                )}
              </div>
            </div>
          )}

          {mobileView === "chat" && selectedConversation && (
            <div className="flex h-full flex-col bg-white">
              <div className="flex items-center gap-3 border-b border-gray-100 bg-white px-4 py-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBackToConversations}
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
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-semibold text-gray-900">
                    {selectedConversation.user.name}
                  </h3>
                  <p className="text-xs text-gray-500">Last seen 10 min ago</p>
                </div>
                <Button variant="ghost" size="icon" onClick={handleShowProfile}>
                  <UserIcon className="h-5 w-5" />
                </Button>
              </div>
              <div className="flex-1 space-y-4 overflow-y-auto bg-gray-50/30 p-4">
                {messagesLoading ? (
                  <div className="flex h-32 items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-purple-600"></div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex h-32 items-center justify-center text-gray-500">
                    No messages yet. Start the conversation!
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-4">
                      <div className="h-px flex-1 bg-gray-200"></div>
                      <span className="rounded-full bg-white px-3 py-1 text-xs text-gray-500">
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
              <div className="border-t border-gray-100 bg-white p-4">
                <div className="flex items-center gap-3">
                  <Input
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message"
                    disabled={!isConnected || isSending}
                    className="rounded-full border-gray-200 text-sm focus-visible:ring-purple-500"
                  />
                  <Button
                    size="icon"
                    onClick={handleSendMessage}
                    disabled={!messageText.trim() || !isConnected || isSending}
                    className="h-10 w-10 rounded-full bg-purple-500 shadow-md hover:bg-purple-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSending ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                    ) : (
                      <PaperAirplaneIcon className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {mobileView === "profile" && selectedConversation && (
            <div className="flex h-full flex-col bg-white">
              <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBackFromProfile}
                >
                  <ArrowLeftIcon className="h-5 w-5" />
                </Button>
                <h2 className="font-semibold text-gray-900">Profile</h2>
              </div>
              <div className="flex-1 overflow-y-auto">
                <ProfilePanel
                  profileImage={selectedConversation.user.profileUrl ?? ""}
                  email={selectedConversation.user.email ?? ""}
                  fullName={selectedConversation.user.name ?? ""}
                  bio={selectedConversation.user.bio ?? ""}
                />
              </div>
            </div>
          )}
        </div>

        {/* Desktop Layout */}
        <div
          className={`hidden h-full md:flex ${
            showProfile
              ? "md:grid-cols-[320px_1fr_300px]"
              : "md:grid-cols-[320px_1fr]"
          }`}
        >
          <div className="flex w-80 flex-col border-r border-gray-200 bg-white">
            <div className="border-b border-gray-100 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Messages
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={openSearchPopup}
                  className="hover:bg-purple-100 hover:text-purple-700"
                  title="Start new conversation"
                >
                  <PlusIcon className="h-5 w-5" />
                </Button>
              </div>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search conversations"
                  className="border-0 bg-gray-50 pl-10 focus-visible:ring-1 focus-visible:ring-purple-500"
                />
              </div>
            </div>
            <div className="px-4 py-2 text-xs">
              <span
                className={`inline-flex items-center gap-1 ${
                  isConnected ? "text-green-600" : "text-red-600"
                }`}
              >
                <div
                  className={`h-2 w-2 rounded-full ${
                    isConnected ? "bg-green-500" : "bg-red-500"
                  }`}
                ></div>
                {isConnected ? "Connected" : "Disconnected"}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <p>No conversations yet</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={openSearchPopup}
                    className="mt-2 border-purple-200 text-purple-600 hover:bg-purple-50"
                  >
                    <PlusIcon className="mr-1 h-4 w-4" />
                    Start chatting
                  </Button>
                </div>
              ) : (
                conversations.map((conversation) => (
                  <div
                    key={conversation.userId}
                    onClick={() => handleConversationSelect(conversation)}
                    className={`flex cursor-pointer items-center gap-3 p-4 transition-colors hover:bg-gray-50 ${
                      selectedConversation?.userId === conversation.userId
                        ? "border-r-2 border-purple-500 bg-purple-50"
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
                              .map((n: any[]) => n[0])
                              .join("")
                              .toUpperCase()}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-green-500"></div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="truncate font-medium text-gray-900">
                          {conversation.user.name}
                        </h3>
                        <span className="ml-2 text-xs text-gray-500">
                          {formatTime(conversation.lastMessage.createdAt)}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-sm text-gray-500">
                        {conversation.lastMessage.text}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex flex-1 flex-col bg-white">
            {selectedConversation ? (
              <>
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
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
                <div className="flex-1 space-y-4 overflow-y-auto bg-gray-50/50 p-4">
                  {messagesLoading ? (
                    <div className="flex h-32 items-center justify-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-purple-600"></div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex h-32 items-center justify-center text-gray-500">
                      No messages yet. Start the conversation!
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-4">
                        <div className="h-px flex-1 bg-gray-200"></div>
                        <span className="rounded-full bg-white px-3 py-1 text-xs text-gray-500">
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
                <div className="border-t border-gray-100 bg-white p-4">
                  <div className="flex items-center gap-3">
                    <Input
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type a message"
                      disabled={!isConnected || isSending}
                      className="rounded-full border-gray-200 focus-visible:ring-purple-500"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={
                        !messageText.trim() || !isConnected || isSending
                      }
                      size="icon"
                      className="h-10 w-10 rounded-full bg-purple-500 shadow-md hover:bg-purple-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isSending ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                      ) : (
                        <PaperAirplaneIcon className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center text-gray-500">
                <div className="text-center">
                  <h3 className="mb-2 text-lg font-medium text-gray-900">
                    Welcome to Messages
                  </h3>
                  <p className="mb-4 text-gray-500">
                    Select a conversation to start chatting
                  </p>
                  <Button
                    onClick={openSearchPopup}
                    className="bg-purple-500 hover:bg-purple-600"
                  >
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Start New Conversation
                  </Button>
                </div>
              </div>
            )}
          </div>

          {showProfile && selectedConversation && (
            <div className="w-80 border-l border-gray-200 bg-white">
              <ProfilePanel
                email={selectedConversation.user.email ?? ""}
                profileImage={selectedConversation.user.profileUrl ?? ""}
                fullName={selectedConversation.user.name ?? ""}
                bio={selectedConversation.user.bio ?? ""}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
