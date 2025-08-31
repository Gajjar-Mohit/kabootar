import { ChatMessage } from "@/types/types";
import { Avatar, AvatarFallback } from "@radix-ui/react-avatar";

export const ChatMessageTile = (
  message: ChatMessage,
  currentUserId: string
) => {
  const isCurrentUser = message.messagerId === currentUserId;

  // Format timestamp
  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  // Get user initials for avatar (using messagerId as fallback)
  const getUserInitials = (userId: string) => {
    return userId.slice(0, 2).toUpperCase();
  };

  if (isCurrentUser) {
    return (
      <div key={message.id} className="flex justify-end mb-4">
        <div className="flex gap-2 max-w-xs lg:max-w-md">
          <div>
            <div className="bg-purple-500 text-white rounded-2xl rounded-br-md px-4 py-2 shadow-sm">
              <p className="text-sm break-words">{message.text}</p>
            </div>
            <p className="text-xs text-gray-500 mt-1 mr-2 text-right">
              {formatTime(message.time)}{" "}
              {message.delivered && `~ ${message.delivered}`}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div key={message.id} className="flex justify-start mb-4">
      <div className="flex gap-2 max-w-xs lg:max-w-md">
       
        <div className="min-w-0 flex-1">
          <div className="bg-white rounded-2xl rounded-bl-md px-4 py-2 shadow-sm border">
            <p className="text-sm text-gray-900 break-words">{message.text}</p>
          </div>
          <p className="text-xs text-gray-500 mt-1 ml-2">
            {formatTime(message.time)}
          </p>
        </div>
      </div>
    </div>
  );
};
