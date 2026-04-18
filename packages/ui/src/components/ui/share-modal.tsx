"use client"

import * as React from "react"
import { cn } from "../../lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./dialog"
import { Button } from "./button"
import { Avatar, AvatarFallback } from "./avatar"
import { Badge } from "./badge"

export interface ShareModalMember {
  name: string
  email?: string
  role?: string
  avatar?: React.ReactNode
}

export interface ShareModalProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  title?: string
  shareUrl?: string
  members?: ShareModalMember[]
  onCopyLink?: () => void
  className?: string
}

function ShareModal({
  open,
  onOpenChange,
  title = "Share",
  shareUrl,
  members,
  onCopyLink,
  className,
}: ShareModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-slot="share-modal"
        className={cn("rounded-[var(--radius-window)] shadow-popover sm:max-w-md tracking-[-0.14px]", className)}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {shareUrl && (
          <div
            data-slot="share-modal-link"
            className="flex items-center gap-2 rounded-[var(--radius-button)] border bg-muted/50 p-2"
          >
            <span className="flex-1 truncate text-sm text-muted-foreground px-1">
              {shareUrl}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={onCopyLink}
              className="px-3 text-xs"
            >
              Copy link
            </Button>
          </div>
        )}

        {members && members.length > 0 && (
          <div data-slot="share-modal-members" className="mt-2 space-y-1">
            {members.map((member) => (
              <div
                key={member.email ?? member.name}
                className="flex items-center gap-3 rounded-[var(--radius-button)] px-2 py-2 hover:bg-accent transition-colors"
              >
                {member.avatar && (
                  <Avatar className="size-8 flex-shrink-0">
                    <AvatarFallback>{member.avatar}</AvatarFallback>
                  </Avatar>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">
                    {member.name}
                  </p>
                  {member.email && (
                    <p className="text-xs text-muted-foreground truncate">
                      {member.email}
                    </p>
                  )}
                </div>
                {member.role && (
                  <Badge variant="secondary">{member.role}</Badge>
                )}
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export { ShareModal }
