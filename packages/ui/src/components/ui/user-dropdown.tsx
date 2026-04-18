"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "./dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "./avatar"
import { User, Settings, HelpCircle, LogOut } from "lucide-react"

interface UserDropdownProps {
  name: string
  email?: string
  avatarUrl?: string
  onProfile?: () => void
  onSettings?: () => void
  onHelp?: () => void
  onSignOut?: () => void
  /** Extra menu items before sign out */
  extraItems?: { label: string; icon?: React.ElementType; onClick?: () => void }[]
  className?: string
  children?: React.ReactNode
}

function UserDropdown({
  name, email, avatarUrl, onProfile, onSettings, onHelp, onSignOut,
  extraItems, className, children,
}: UserDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {children || (
          <button
            data-slot="user-dropdown-trigger"
            className={cn(
              "flex items-center gap-2 rounded-[var(--radius-button)] px-2 py-1.5 hover:bg-accent/50 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
              className
            )}
          >
            <Avatar className="size-7">
              {avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
              <AvatarFallback className="text-xs">{name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="text-sm text-foreground tracking-[-0.14px] truncate max-w-[120px]">{name}</span>
          </button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent data-slot="user-dropdown" align="end" className="w-[220px]">
        {/* User info header */}
        <div className="px-3 py-2.5">
          <p className="text-sm font-medium text-foreground tracking-[-0.14px]">{name}</p>
          {email && <p className="text-xs text-muted-foreground/60 truncate">{email}</p>}
        </div>
        <DropdownMenuSeparator />

        {onProfile && (
          <DropdownMenuItem onClick={onProfile} className="gap-2.5">
            <User className="size-4 text-muted-foreground" /> Profile
          </DropdownMenuItem>
        )}
        {onSettings && (
          <DropdownMenuItem onClick={onSettings} className="gap-2.5">
            <Settings className="size-4 text-muted-foreground" /> Settings
          </DropdownMenuItem>
        )}
        {onHelp && (
          <DropdownMenuItem onClick={onHelp} className="gap-2.5">
            <HelpCircle className="size-4 text-muted-foreground" /> Help
          </DropdownMenuItem>
        )}

        {extraItems && extraItems.length > 0 && (
          <>
            <DropdownMenuSeparator />
            {extraItems.map(item => {
              const Icon = item.icon
              return (
                <DropdownMenuItem key={item.label} onClick={item.onClick} className="gap-2.5">
                  {Icon && <Icon className="size-4 text-muted-foreground" />}
                  {item.label}
                </DropdownMenuItem>
              )
            })}
          </>
        )}

        {onSignOut && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onSignOut} className="gap-2.5 text-destructive focus:text-destructive">
              <LogOut className="size-4" /> Sign out
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { UserDropdown }
export type { UserDropdownProps }
