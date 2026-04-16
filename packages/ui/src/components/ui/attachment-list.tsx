"use client"

import * as React from "react"
import { FileText, Image, X } from "lucide-react"
import { cn } from "../../lib/utils"
import { Button } from "./button"

export interface AttachmentItem {
  id: string
  name: string
  size?: number
  type?: string
  progress?: number
}

export interface AttachmentListProps {
  items: AttachmentItem[]
  onRemove?: (id: string) => void
  className?: string
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function isImage(type?: string): boolean {
  return !!type && type.startsWith("image/")
}

function AttachmentList({ items, onRemove, className, ref }: AttachmentListProps & { ref?: React.Ref<HTMLDivElement> }) {
  if (items.length === 0) return null

  return (
    <div ref={ref} data-slot="attachment-list" className={cn("flex flex-wrap gap-2 tracking-tight", className)}>
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center gap-2 rounded-[var(--radius-button)] border border-input bg-muted/30 px-2.5 py-1.5 text-xs group"
        >
          {isImage(item.type) ? (
            <Image className="size-3.5 text-accent-blue/70 shrink-0" />
          ) : (
            <FileText className="size-3.5 text-muted-foreground/70 shrink-0" />
          )}
          <span className="truncate max-w-40">{item.name}</span>
          {item.size != null && (
            <span className="text-xs text-muted-foreground/50 shrink-0">
              {formatSize(item.size)}
            </span>
          )}
          {item.progress != null && item.progress < 100 && (
            <span className="text-xs text-muted-foreground/50 tabular-nums shrink-0">
              {item.progress}%
            </span>
          )}
          {onRemove && (
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => onRemove(item.id)}
              aria-label={`Remove ${item.name}`}
              className="text-muted-foreground/40 hover:text-foreground shrink-0 opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
            >
              <X className="size-3" />
            </Button>
          )}
        </div>
      ))}
    </div>
  )
}

export { AttachmentList }
