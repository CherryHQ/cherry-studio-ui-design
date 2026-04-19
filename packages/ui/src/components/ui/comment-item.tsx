"use client"

import * as React from "react"
import { cn } from "../../lib/utils"
import { Avatar } from './avatar'

export interface CommentItemProps {
  avatar?: React.ReactNode
  author: string
  time?: string
  content: string
  children?: React.ReactNode
  className?: string
}

function CommentItem({
  avatar,
  author,
  time,
  content,
  children,
  className,
}: CommentItemProps) {
  return (
    <div
      data-slot="comment-item"
      className={cn("flex gap-3 py-4 border-t first:border-t-0", className)}
    >
      {avatar && (
        <Avatar
          data-slot="comment-item-avatar"
          className="size-8 flex-shrink-0"
        >
          {avatar}
        </Avatar>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            data-slot="comment-item-author"
            className="text-xs font-medium"
          >
            {author}
          </span>
          {time && (
            <span
              data-slot="comment-item-time"
              className="text-xs text-muted-foreground"
            >
              {time}
            </span>
          )}
        </div>
        <p
          data-slot="comment-item-content"
          className="text-sm tracking-[-0.14px] mt-1"
        >
          {content}
        </p>
        {children && (
          <div data-slot="comment-item-replies" className="mt-2">
            {children}
          </div>
        )}
      </div>
    </div>
  )
}

export { CommentItem }
