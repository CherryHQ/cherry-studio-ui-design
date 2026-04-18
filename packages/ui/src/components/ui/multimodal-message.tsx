"use client"

import * as React from "react"
import {
  FileIcon,
  ImageIcon,
  Play,
  Pause,
  X,
} from "lucide-react"
import { cn } from "../../lib/utils"
import { Button } from "./button"
import { Progress } from "./progress"

export interface MultimodalMessageProps {
  /** Images to display in a grid */
  images?: { src: string; alt?: string }[]
  /** Audio attachment with playback controls */
  audio?: { src: string; title?: string }
  /** File attachments to list */
  files?: {
    name: string
    size?: string
    type?: string
    icon?: React.ReactNode
  }[]
  /** Additional CSS classes */
  className?: string
}

function MultimodalMessage({
  images,
  audio,
  files,
  className,
}: MultimodalMessageProps) {
  const [lightboxSrc, setLightboxSrc] = React.useState<string | null>(null)
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [duration, setDuration] = React.useState("0:00")
  const audioRef = React.useRef<HTMLAudioElement | null>(null)

  const handleTimeUpdate = React.useCallback(() => {
    const el = audioRef.current
    if (!el || !el.duration) return
    setProgress((el.currentTime / el.duration) * 100)
  }, [])

  const handleLoadedMetadata = React.useCallback(() => {
    const el = audioRef.current
    if (!el) return
    const mins = Math.floor(el.duration / 60)
    const secs = Math.floor(el.duration % 60)
    setDuration(`${mins}:${secs.toString().padStart(2, "0")}`)
  }, [])

  const toggleAudio = React.useCallback(() => {
    const el = audioRef.current
    if (!el) return
    if (isPlaying) {
      el.pause()
    } else {
      el.play()
    }
    setIsPlaying(!isPlaying)
  }, [isPlaying])

  const handleAudioEnded = React.useCallback(() => {
    setIsPlaying(false)
    setProgress(0)
  }, [])

  const hasContent =
    (images && images.length > 0) || audio || (files && files.length > 0)

  if (!hasContent) return null

  return (
    <div
      data-slot="multimodal-message"
      className={cn("flex flex-col gap-2 tracking-[-0.14px]", className)}
    >
      {/* Images grid */}
      {images && images.length > 0 && (
        <div
          data-slot="multimodal-images"
          className={cn(
            "grid gap-2",
            images.length === 1 ? "grid-cols-1" : "grid-cols-2"
          )}
        >
          {images.map((img, i) => (
            <Button
              key={i}
              variant="ghost"
              type="button"
              onClick={() => setLightboxSrc(img.src)}
              className="relative overflow-hidden rounded-[var(--radius-button)] border border-border bg-muted/30 hover:opacity-90 h-auto p-0"
            >
              <img
                src={img.src}
                alt={img.alt ?? ""}
                className="w-full h-auto max-h-64 object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-foreground/20 transition-opacity">
                <ImageIcon className="size-5 text-primary-foreground" />
              </div>
            </Button>
          ))}
        </div>
      )}

      {/* Audio player */}
      {audio && (
        <div
          data-slot="multimodal-audio"
          className="flex items-center gap-3 rounded-[var(--radius-button)] border border-border bg-card px-3 py-2.5"
        >
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <audio
            ref={audioRef}
            src={audio.src}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleAudioEnded}
            preload="metadata"
          />
          <Button
            size="icon-sm"
            onClick={toggleAudio}
            className="size-8 rounded-full shrink-0"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="size-3.5" />
            ) : (
              <Play className="size-3.5 ml-0.5" />
            )}
          </Button>
          <div className="flex flex-col flex-1 gap-1 min-w-0">
            {audio.title && (
              <span className="text-xs font-medium text-foreground truncate">
                {audio.title}
              </span>
            )}
            <Progress value={progress} className="h-1" />
          </div>
          <span className="text-xs tabular-nums text-muted-foreground shrink-0">
            {duration}
          </span>
        </div>
      )}

      {/* Files list */}
      {files && files.length > 0 && (
        <div data-slot="multimodal-files" className="flex flex-col gap-1.5">
          {files.map((file, i) => (
            <div
              key={i}
              className="flex items-center gap-2.5 rounded-[var(--radius-button)] border border-border bg-card px-3 py-2"
            >
              <div className="flex items-center justify-center size-8 rounded-[var(--radius-button)] bg-muted shrink-0">
                {file.icon ?? <FileIcon className="size-4 text-muted-foreground" />}
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-sm font-medium text-foreground truncate">
                  {file.name}
                </span>
                {(file.size || file.type) && (
                  <span className="text-xs text-muted-foreground">
                    {[file.type, file.size].filter(Boolean).join(" \u00b7 ")}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox overlay */}
      {lightboxSrc && (
        <div
          data-slot="multimodal-lightbox"
          className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center bg-foreground/80"
          onClick={() => setLightboxSrc(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
        >
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setLightboxSrc(null)}
            className="absolute top-4 right-4 rounded-full bg-background/20 text-primary-foreground hover:bg-background/40"
            aria-label="Close"
          >
            <X className="size-5" />
          </Button>
          <img
            src={lightboxSrc}
            alt=""
            className="max-w-[90vw] max-h-[90vh] rounded-[var(--radius-button)] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}

export { MultimodalMessage }
