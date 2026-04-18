"use client"

import * as React from "react"
import { cn } from "../../lib/utils"
import { Avatar, AvatarFallback, AvatarBadge } from "./avatar"

export interface NotificationItemProps {
  avatar?: React.ReactNode
  badgeIcon?: React.ReactNode
  title: string
  time?: string
  description?: string
  read?: boolean
  className?: string
  onClick?: () => void
}

function NotificationItem({
  avatar,
  badgeIcon,
  title,
  time,
  description,
  read = false,
  className,
  onClick,
}: NotificationItemProps) {
  return (
    <div
      data-slot="notification-item"
      data-read={read}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onClick?.()
        }
      }}
      className={cn(
        "flex gap-3 p-4 hover:bg-accent/50 transition-colors cursor-pointer tracking-[-0.14px] border-b border-border/30 last:border-b-0 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
        className
      )}
    >
      <div className="relative shrink-0">
        <Avatar className="size-10" data-slot="notification-item-avatar">
          <AvatarFallback className="bg-muted">
            {avatar}
          </AvatarFallback>
        </Avatar>
        {badgeIcon && (
          <AvatarBadge
            data-slot="notification-item-badge"
            className="size-[18px] border-[1.5px] border-popover bg-primary text-primary-foreground"
          >
            {badgeIcon}
          </AvatarBadge>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-foreground truncate">{title}</p>
          <div className="flex shrink-0 items-center gap-1.5">
            {time && (
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {time}
              </span>
            )}
            {!read && (
              <span
                data-slot="notification-item-unread"
                className="size-2 rounded-full bg-primary shrink-0"
              />
            )}
          </div>
        </div>
        {description && (
          <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
            {description}
          </p>
        )}
      </div>
    </div>
  )
}

export { NotificationItem }
