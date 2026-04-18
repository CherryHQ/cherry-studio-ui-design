"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarImage, AvatarFallback } from "./avatar"

interface ContactsCardProps extends React.ComponentProps<"div"> {
  name: string
  role?: string
  avatarUrl?: string
  avatarFallback?: string
  status?: "online" | "offline" | "busy" | "away"
  onClick?: () => void
}

const statusColors = {
  online: "bg-success",
  offline: "bg-muted-foreground/30",
  busy: "bg-destructive",
  away: "bg-warning",
}

function ContactsCard({
  name, role, avatarUrl, avatarFallback, status, onClick, className, ...props
}: ContactsCardProps) {
  return (
    <div
      data-slot="contacts-card"
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick() } } : undefined}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-button)] border bg-card transition-colors",
        onClick && "cursor-pointer hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
        className
      )}
      {...props}
    >
      <div className="relative flex-shrink-0">
        <Avatar className="size-9">
          {avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
          <AvatarFallback className="text-xs">{avatarFallback || name.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        {status && (
          <span className={cn(
            "absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-card",
            statusColors[status]
          )} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate tracking-[-0.14px]">{name}</p>
        {role && <p className="text-xs text-muted-foreground/60 truncate tracking-[-0.12px]">{role}</p>}
      </div>
    </div>
  )
}

export { ContactsCard }
export type { ContactsCardProps }
