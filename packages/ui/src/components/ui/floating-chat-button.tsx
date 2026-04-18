"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "./button"
import { Badge } from "./badge"
import { MessageCircle } from "lucide-react"

interface FloatingChatButtonProps extends Omit<React.ComponentProps<typeof Button>, "children"> {
  onClick?: () => void
  unreadCount?: number
  position?: "bottom-right" | "bottom-left"
}

function FloatingChatButton({
  onClick, unreadCount, position = "bottom-right", className, ...props
}: FloatingChatButtonProps) {
  return (
    <Button
      data-slot="floating-chat-button"
      variant="ghost"
      onClick={onClick}
      aria-label="Open chat"
      className={cn(
        "fixed z-[var(--z-floating)] size-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 p-0 border-0",
        position === "bottom-right" ? "bottom-6 right-6" : "bottom-6 left-6",
        className
      )}
      {...props}
    >
      <MessageCircle className="size-6" />
      {unreadCount != null && unreadCount > 0 && (
        <Badge
          variant="destructive"
          className="absolute -top-1 -right-1 size-5 p-0 flex items-center justify-center text-xs font-medium rounded-full"
        >
          {unreadCount > 99 ? "99+" : unreadCount}
        </Badge>
      )}
    </Button>
  )
}

export { FloatingChatButton }
export type { FloatingChatButtonProps }
