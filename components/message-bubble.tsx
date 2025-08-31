import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface MessageBubbleProps {
  side: "left" | "right"
  avatar: string
  message: string
  time: string
}

export function MessageBubble({ side, avatar, message, time }: MessageBubbleProps) {
  const isRight = side === "right"

  return (
    <div className={cn("flex items-end gap-2", isRight ? "justify-end" : "justify-start")}>
      {!isRight && (
        <Avatar className="h-8 w-8">
          <AvatarImage src={avatar || "/placeholder.svg"} alt="Avatar" />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
      )}

      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-4 py-2",
          isRight ? "bg-blue-50 text-gray-900" : "bg-gray-100 text-gray-900",
        )}
      >
        <p className="text-sm leading-relaxed text-balance">{message}</p>
        <div className="mt-1 text-right text-xs text-gray-500">{time}</div>
      </div>

      {isRight && (
        <Avatar className="h-8 w-8">
          <AvatarImage src={avatar || "/placeholder.svg"} alt="Avatar" />
          <AvatarFallback>M</AvatarFallback>
        </Avatar>
      )}
    </div>
  )
}
