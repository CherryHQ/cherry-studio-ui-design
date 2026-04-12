"use client"

import * as React from "react"
import { Copy, Check } from "lucide-react"
import { cn } from "../../lib/utils"

export interface CodeBlockProps {
  code: string
  language?: string
  showLineNumbers?: boolean
  className?: string
}

const CodeBlock = React.forwardRef<HTMLDivElement, CodeBlockProps>(
  ({ code, language, showLineNumbers = true, className }, ref) => {
    const [copied, setCopied] = React.useState(false)
    const timerRef = React.useRef<ReturnType<typeof setTimeout>>()
    const lines = code.split("\n")

    const handleCopy = () => {
      navigator.clipboard.writeText(code).catch(() => {})
      setCopied(true)
      clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => setCopied(false), 1500)
    }

    return (
      <div
        ref={ref}
        className={cn("my-2 rounded-lg overflow-hidden border border-border", className)}
      >
        <div className="flex items-center justify-between px-3 py-1.5 bg-muted/50 border-b border-border">
          <span className="text-xs text-muted-foreground font-mono">
            {language || "text"}
          </span>
          <button
            onClick={handleCopy}
            aria-label={copied ? "Copied" : "Copy code"}
            className="p-1 rounded-sm text-muted-foreground/50 hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {copied ? (
              <Check className="size-3.5 text-primary" />
            ) : (
              <Copy className="size-3.5" />
            )}
          </button>
        </div>
        <pre className="px-3 py-2.5 overflow-x-auto text-xs leading-relaxed font-mono bg-muted/20 max-h-80 overflow-y-auto scrollbar-thin">
          {lines.map((line, i) => (
            <div key={i} className="flex">
              {showLineNumbers && (
                <span className="w-7 text-right pr-3 text-xs text-muted-foreground/30 select-none shrink-0 tabular-nums">
                  {i + 1}
                </span>
              )}
              <code className="flex-1">{line || "\n"}</code>
            </div>
          ))}
        </pre>
      </div>
    )
  }
)
CodeBlock.displayName = "CodeBlock"

export { CodeBlock }
