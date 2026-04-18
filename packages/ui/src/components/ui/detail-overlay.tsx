"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent } from "./dialog"
import { Button } from "./button"
import { Avatar, AvatarFallback, AvatarImage } from "./avatar"
import { ScrollArea } from "./scroll-area"
import {
  X, Download, Shuffle, Heart, Copy, Share2, Flag,
  ChevronLeft, ChevronRight, Play, Pause,
} from "lucide-react"

interface DetailOverlayVariant {
  id: string
  image?: string
  label?: string
}

export interface DetailOverlayProps extends React.ComponentProps<"div"> {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  author: string
  authorAvatar?: string
  date?: string
  prompt?: string
  images: string[]
  variants?: DetailOverlayVariant[]
  likeCount?: number
  liked?: boolean
  onLike?: () => void
  onDownload?: () => void
  onRemix?: () => void
  onShare?: () => void
  onReport?: () => void
  duration?: number
  isPlaying?: boolean
  onPlay?: () => void
  onPause?: () => void
}

function DetailOverlay({
  open, onOpenChange, title, author, authorAvatar, date, prompt,
  images, variants, onDownload, onRemix, onLike, onShare, onReport,
  likeCount, liked, duration, isPlaying, onPlay, onPause, className,
}: DetailOverlayProps) {
  const [imageIdx, setImageIdx] = React.useState(0)
  const [activeVariant, setActiveVariant] = React.useState<string | null>(null)

  // Reset state when overlay opens
  React.useEffect(() => {
    if (open) {
      setImageIdx(0)
      setActiveVariant(null)
    }
  }, [open])

  const displayImage = activeVariant
    ? variants?.find(v => v.id === activeVariant)?.image || images[imageIdx]
    : images[imageIdx]

  const prevImage = () => {
    setActiveVariant(null)
    setImageIdx(i => (i - 1 + images.length) % images.length)
  }
  const nextImage = () => {
    setActiveVariant(null)
    setImageIdx(i => (i + 1) % images.length)
  }

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${String(sec).padStart(2, "0")}`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-slot="detail-overlay"
        className={cn(
          "max-w-none w-screen h-screen p-0 gap-0 flex flex-col border-0 rounded-none",
          className,
        )}
      >
        {/* Topbar */}
        <div className="flex items-center justify-between px-5 h-14 flex-shrink-0 border-b border-border/20 bg-background">
          <span className="text-sm font-semibold tracking-[-0.14px] text-foreground">Detail</span>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            aria-label="Close"
            className="size-[44px] rounded-[var(--radius-control)] border-stroke-02 p-0"
          >
            <X className="size-5" />
          </Button>
        </div>

        {/* Body: left gallery + right details */}
        <div className="flex flex-1 min-h-0">
          {/* Left: Image gallery */}
          <div className="flex-1 relative bg-black/5 dark:bg-white/5 flex items-center justify-center min-w-0">
            {displayImage && (
              <img
                src={displayImage}
                alt={title}
                className="max-w-full max-h-full object-contain"
              />
            )}

            {/* Navigation arrows */}
            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm hover:bg-background"
                  onClick={prevImage}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm hover:bg-background"
                  onClick={nextImage}
                >
                  <ChevronRight className="size-4" />
                </Button>
              </>
            )}

            {/* Bottom left: Like */}
            {onLike && (
              <Button
                variant={liked ? "default" : "outline"}
                size="sm"
                onClick={onLike}
                className="absolute left-4 bottom-4 gap-1.5 bg-background/80 backdrop-blur-sm"
              >
                <Heart className={cn("size-3.5", liked && "fill-current")} />
                {likeCount != null ? likeCount : "Like"}
              </Button>
            )}

            {/* Bottom right: Share + Report */}
            {(onShare || onReport) && (
              <div className="absolute right-4 bottom-4 flex items-center gap-2">
                {onShare && (
                  <Button variant="outline" size="icon-sm" onClick={onShare} className="bg-background/80 backdrop-blur-sm" aria-label="Share">
                    <Share2 className="size-3.5" />
                  </Button>
                )}
                {onReport && (
                  <Button variant="outline" size="icon-sm" onClick={onReport} className="bg-background/80 backdrop-blur-sm" aria-label="Report">
                    <Flag className="size-3.5" />
                  </Button>
                )}
              </div>
            )}

            {/* Playback controls */}
            {(onPlay || onPause) && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-background/80 backdrop-blur-sm rounded-full px-3 py-1.5">
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={isPlaying ? onPause : onPlay}
                >
                  {isPlaying ? <Pause className="size-4" /> : <Play className="size-4" />}
                </Button>
                {duration != null && (
                  <span className="text-xs text-muted-foreground tabular-nums">{formatDuration(duration)}</span>
                )}
              </div>
            )}
          </div>

          {/* Right: Details panel */}
          <div className="w-[496px] flex-shrink-0 border-l flex flex-col">
            <ScrollArea className="flex-1">
              <div className="p-[60px] space-y-6">
                {/* Title */}
                <h2 className="text-[40px] font-semibold leading-tight tracking-[-0.3px] text-foreground">{title}</h2>

                {/* Author + date */}
                <div className="flex items-center gap-3">
                  <Avatar className="size-10">
                    {authorAvatar && <AvatarImage src={authorAvatar} alt={author} />}
                    <AvatarFallback className="text-sm">{author.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-foreground tracking-[-0.14px]">{author}</p>
                    {date && <p className="text-xs text-muted-foreground/50">{date}</p>}
                  </div>
                </div>

                {/* Variant thumbnails */}
                {variants && variants.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground/60 font-medium">Variants</p>
                    <div className="flex gap-2 flex-wrap">
                      {variants.map(v => (
                        <Button
                          key={v.id}
                          variant="ghost"
                          onClick={() => setActiveVariant(v.id)}
                          className={cn(
                            "size-[60px] rounded-[var(--radius-control)] overflow-hidden p-0 border",
                            activeVariant === v.id ? "border-primary/60 ring-2 ring-primary/15" : "border-transparent hover:border-border",
                          )}
                        >
                          {v.image
                            ? <img src={v.image} alt={v.label || ""} className="w-full h-full object-cover" />
                            : <span className="text-xs text-muted-foreground">{v.label || v.id}</span>
                          }
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Prompt */}
                {prompt && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground/60 font-medium">Prompt</p>
                      <Button variant="ghost" size="icon-xs" aria-label="Copy prompt" onClick={() => navigator.clipboard.writeText(prompt).catch(() => {})}>
                        <Copy className="size-3" />
                      </Button>
                    </div>
                    <div className="rounded-[var(--radius-control)] bg-muted/30 border border-border/20 px-3 py-2.5">
                      <p className="text-xs text-foreground/70 leading-relaxed">{prompt}</p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  {onDownload && (
                    <Button variant="secondary" className="flex-1 gap-1.5 rounded-[var(--radius-control)]" onClick={onDownload}>
                      <Download className="size-3.5" /> Download
                    </Button>
                  )}
                  {onRemix && (
                    <Button className="flex-1 gap-1.5 rounded-[var(--radius-control)]" onClick={onRemix}>
                      <Shuffle className="size-3.5" /> Remix
                    </Button>
                  )}
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { DetailOverlay }
export type { DetailOverlayVariant }
