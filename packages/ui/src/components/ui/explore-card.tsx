"use client"

import * as React from "react"
import { cn } from "../../lib/utils"
import { Card } from "./card"
import { Button } from "./button"
import { Heart, MessageSquare, Bookmark } from "lucide-react"

/* ---------- Simple text card (original) ---------- */

export interface ExploreCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
  icon?: React.ReactNode
}

function ExploreCard({
  title,
  description,
  icon,
  className,
  onClick,
  ref,
  ...props
}: ExploreCardProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <Card
      ref={ref}
      data-slot="explore-card"
      className={cn(
        "gap-0 p-5 hover:border-border/80 transition-all cursor-pointer tracking-[-0.14px]",
        className
      )}
      onClick={onClick}
      {...props}
    >
      {icon && (
        <div className="mb-3 text-primary">{icon}</div>
      )}
      <h4 className="text-sm font-medium">{title}</h4>
      {description && (
        <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {description}
        </p>
      )}
    </Card>
  )
}

/* ---------- Figma gallery card (image + hover overlay) ---------- */

export interface ExploreGalleryCardProps extends React.HTMLAttributes<HTMLDivElement> {
  image: string
  title?: string
  author?: string
  onLike?: () => void
  onComment?: () => void
  onBookmark?: () => void
  aspectRatio?: "portrait" | "landscape" | "square"
}

const aspectClasses = {
  portrait: "aspect-[3/4]",
  landscape: "aspect-[4/3]",
  square: "aspect-square",
}

function ExploreGalleryCard({
  image,
  title,
  author,
  onLike,
  onComment,
  onBookmark,
  aspectRatio,
  className,
  ...props
}: ExploreGalleryCardProps) {
  return (
    <div
      data-slot="explore-gallery-card"
      className={cn(
        "group relative overflow-hidden rounded-[var(--radius-card)] cursor-pointer",
        aspectRatio && aspectClasses[aspectRatio],
        className,
      )}
      {...props}
    >
      {/* Image */}
      <img src={image} alt={title} className="w-full h-full object-cover" />

      {/* Hover overlay — Figma style */}
      <div className={cn(
        "absolute inset-0 flex flex-col justify-end",
        "opacity-0 group-hover:opacity-100 transition-opacity",
        "backdrop-blur-[6px]",
        "bg-gradient-to-b from-transparent to-foreground/25",
        "p-3",
      )}>
        <div className="flex items-center justify-between">
          {/* Author name */}
          {author && (
            <span className="text-xs font-semibold text-white/90 tracking-[-0.12px] rounded-[var(--radius-control)] p-2.5 truncate">
              {author}
            </span>
          )}
          {/* Action icons */}
          <div className="flex items-center gap-1 ml-auto">
            {onBookmark && (
              <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onBookmark() }}
                className="size-9 rounded-[var(--radius-control)] text-white/80 hover:text-white hover:bg-white/15"
              >
                <Bookmark className="size-4" />
              </Button>
            )}
            {onComment && (
              <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onComment() }}
                className="size-9 rounded-[var(--radius-control)] text-white/80 hover:text-white hover:bg-white/15"
              >
                <MessageSquare className="size-4" />
              </Button>
            )}
            {onLike && (
              <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onLike() }}
                className="size-9 rounded-[var(--radius-control)] text-white/80 hover:text-white bg-white/15 border border-white/25"
              >
                <Heart className="size-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export { ExploreCard, ExploreGalleryCard }
