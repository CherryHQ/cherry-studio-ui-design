"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

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
        <div
          data-slot="comment-item-avatar"
          className="size-8 rounded-full flex-shrink-0 overflow-hidden"
        >
          {avatar}
        </div>
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
          className="text-[13px] tracking-tight mt-1"
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
