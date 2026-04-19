"use client"

import * as React from "react"
import { Heart } from "lucide-react"
import { cn } from "../../lib/utils"
import { Button } from "./button"

export interface LikeButtonProps
  extends Omit<React.ComponentProps<typeof Button>, "children"> {
  count?: number
  liked?: boolean
  onToggle?: () => void
}

function LikeButton({
  count = 0,
  liked = false,
  onToggle,
  className,
  ...props
}: LikeButtonProps) {
  return (
    <Button
      data-slot="like-button"
      variant="outline"
      onClick={onToggle}
      aria-label={liked ? "Unlike" : "Like"}
      aria-pressed={liked}
      className={cn(
        "rounded-[var(--radius-button)] p-3.5 gap-2 h-auto",
        liked && "text-destructive border-destructive/30 bg-destructive/5",
        className,
      )}
      {...props}
    >
      <Heart className={cn("size-4", liked && "fill-current")} />
      {count > 0 && (
        <span className="text-xs font-medium tracking-[-0.12px]">
          {count}
        </span>
      )}
    </Button>
  )
}

export { LikeButton }
