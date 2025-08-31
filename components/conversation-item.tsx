import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface ConversationItemProps {
  name: string
  last: string
  time: string
  avatarQuery: string
  active?: boolean
}

export function ConversationItem({ name, last, time, avatarQuery, active }: ConversationItemProps) {
  return (
    <button
      className={cn(
        "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50",
        active && "bg-green-50 border-r-2 border-green-500",
      )}
    >
      <Avatar className="h-10 w-10">
        <AvatarImage
          src={`/abstract-geometric-shapes.png?height=40&width=40&query=${encodeURIComponent(avatarQuery)}`}
          alt={name}
        />
        <AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <h4 className="truncate font-semibold text-gray-900">{name}</h4>
          <span className="text-xs text-gray-500">{time}</span>
        </div>
        <p className="truncate text-sm text-gray-600">{last}</p>
      </div>
    </button>
  )
}
