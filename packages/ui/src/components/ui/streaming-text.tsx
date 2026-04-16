"use client"

import * as React from "react"
import { cn } from "../../lib/utils"

export interface StreamingTextProps extends React.HTMLAttributes<HTMLDivElement> {
  text: string
  isStreaming: boolean
}

function StreamingText({ text, isStreaming, className, ...props }: StreamingTextProps) {
  return (
    <div
      data-slot="streaming-text"
      className={cn("whitespace-pre-wrap", className)}
      {...props}
    >
      {text}
      {isStreaming && (
        <span
          className="inline-block w-[2px] h-[1em] bg-foreground ml-0.5 align-text-bottom animate-pulse"
          aria-hidden="true"
        />
      )}
    </div>
  )
}

export { StreamingText }
