"use client"

import * as React from "react"
import { cn } from "../../lib/utils"
import { Avatar, AvatarFallback, AvatarBadge } from "./avatar"
import { Badge } from "./badge"

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
        "flex gap-3 p-4 hover:bg-accent/50 transition-colors cursor-pointer tracking-tight",
        className
      )}
    >
      <div className="relative shrink-0">
        <Avatar className="size-12" data-slot="notification-item-avatar">
          <AvatarFallback className="bg-muted">
            {avatar}
          </AvatarFallback>
        </Avatar>
        {badgeIcon && (
          <AvatarBadge
            data-slot="notification-item-badge"
            className="size-[18px] border-2 border-popover bg-primary text-primary-foreground"
          >
            {badgeIcon}
          </AvatarBadge>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[13px] font-medium text-foreground truncate">{title}</p>
          <div className="flex shrink-0 items-center gap-1.5">
            {time && (
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {time}
              </span>
            )}
            {!read && (
              <Badge
                data-slot="notification-item-unread"
                variant="default"
                className="size-2 min-w-0 p-0 rounded-full bg-accent-blue shrink-0"
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
