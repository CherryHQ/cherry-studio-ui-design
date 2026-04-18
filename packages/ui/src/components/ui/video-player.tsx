"use client"

import * as React from "react"
import { Play, Pause } from "lucide-react"
import { cn } from "../../lib/utils"
import { Button } from "./button"
import { Slider } from "./slider"

export interface VideoPlayerProps extends React.ComponentProps<"div"> {
  duration?: number        // 总时长 (秒)
  currentTime?: number     // 当前时间 (秒)
  isPlaying?: boolean
  onPlay?: () => void
  onPause?: () => void
  onSeek?: (time: number) => void
  showRepeat?: boolean
}

function VideoPlayer({
  duration = 8,
  currentTime = 0,
  isPlaying = false,
  onPlay,
  onPause,
  onSeek,
  className,
  ...props
}: VideoPlayerProps) {
  const formatTime = (s: number) => `${Math.floor(s)}s`
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div
      data-slot="video-player"
      className={cn(
        "flex items-center gap-4 min-w-[280px]",
        "rounded-[var(--radius-card)] bg-popover border border-border",
        "shadow-popover",
        "pl-3.5 pr-6 py-3.5",
        className
      )}
      {...props}
    >
      {/* Play/Pause */}
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={isPlaying ? onPause : onPlay}
        aria-label={isPlaying ? "Pause" : "Play"}
        className="size-4 p-0.5"
      >
        {isPlaying ? <Pause className="size-3" /> : <Play className="size-3" />}
      </Button>

      {/* Progress bar */}
      <div className="flex-1">
        <Slider
          value={[progress]}
          max={100}
          step={1}
          onValueChange={([v]) => onSeek?.(v / 100 * duration)}
          className="h-0.5"
        />
      </div>

      {/* Duration */}
      <span className="text-xs font-medium text-muted-foreground tracking-[-0.12px] shrink-0">
        {formatTime(duration)}
      </span>
    </div>
  )
}

export { VideoPlayer }
