"use client"

import * as React from "react"
import { cn } from "../../lib/utils"

export interface ThumbnailProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string
  alt?: string
  active?: boolean
}

function Thumbnail({
  src,
  alt = "",
  active = false,
  className,
  onClick,
  ref,
  ...props
}: ThumbnailProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <div
      ref={ref}
      data-slot="thumbnail"
      data-active={active || undefined}
      className={cn(
        "rounded-[var(--radius-button)] border-[1.5px] overflow-hidden cursor-pointer transition-colors",
        active
          ? "border-primary"
          : "border-transparent hover:border-border",
        className
      )}
      onClick={onClick}
      {...props}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="h-full w-full bg-muted" />
      )}
    </div>
  )
}

export { Thumbnail }
