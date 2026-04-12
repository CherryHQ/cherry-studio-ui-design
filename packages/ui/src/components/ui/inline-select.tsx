"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { ChevronDown, Check } from "lucide-react"
import { cn } from "../../lib/utils"

export interface InlineSelectOption {
  value: string
  label: string
  desc?: string
}

export interface InlineSelectProps {
  value: string
  options: InlineSelectOption[]
  onChange: (value: string) => void
  className?: string
  fullWidth?: boolean
  disabled?: boolean
  /** "sm" = compact (default), "md" = larger */
  size?: "sm" | "md"
  /** Show option.desc as prefix in trigger and dropdown */
  showDesc?: boolean
  /** Open dropdown upward */
  dropUp?: boolean
}

function InlineSelect({
  value,
  options,
  onChange,
  className,
  fullWidth,
  disabled,
  size = "sm",
  showDesc,
  dropUp,
}: InlineSelectProps) {
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)
  const portalRef = React.useRef<HTMLDivElement>(null)
  const [rect, setRect] = React.useState<DOMRect | null>(null)

  const updateRect = React.useCallback(() => {
    if (ref.current) setRect(ref.current.getBoundingClientRect())
  }, [])

  React.useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current?.contains(e.target as Node)) return
      if (portalRef.current?.contains(e.target as Node)) return
      setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  React.useEffect(() => {
    if (open) updateRect()
  }, [open, updateRect])

  const selected = options.find((o) => o.value === value)

  const isMd = size === "md"
  const btnPx = isMd ? "px-3.5" : "px-3"
  const btnPy = isMd ? "py-2" : "py-1.5"
  const btnText = isMd ? "text-xs" : "text-xs"
  const chevronSize = isMd ? 10 : 9
  const checkSize = isMd ? 12 : 10
  const descFontSize = isMd ? "text-xs" : "text-xs"
  const dropMinW = isMd ? 180 : 150

  const renderLabel = (opt: InlineSelectOption) => {
    if (showDesc && opt.desc) {
      return (
        <div className="flex items-center gap-2">
          <span className={descFontSize}>{opt.desc}</span>
          <span>{opt.label}</span>
        </div>
      )
    }
    return <span>{opt.label}</span>
  }

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        onClick={() => !disabled && setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-1.5 rounded-md bg-muted/50 transition-colors justify-between focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
          btnPx,
          btnPy,
          btnText,
          fullWidth
            ? "w-full"
            : isMd
              ? "min-w-40"
              : "min-w-36",
          disabled
            ? "opacity-50 cursor-not-allowed text-muted-foreground"
            : open
              ? "bg-muted text-foreground"
              : "text-muted-foreground hover:bg-muted/50"
        )}
      >
        <span className="truncate">
          {showDesc && selected?.desc ? renderLabel(selected) : (selected?.label || value)}
        </span>
        <ChevronDown
          size={chevronSize}
          className={cn(
            "flex-shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180"
          )}
        />
      </button>
      {open &&
        !disabled &&
        rect &&
        createPortal(
          <div
            ref={portalRef}
            className={cn(
              "fixed bg-popover border border-border/50 rounded-md shadow-md p-1.5 z-50 animate-in fade-in duration-100",
              dropUp ? "slide-in-from-bottom-1" : "slide-in-from-top-1"
            )}
            style={
              dropUp
                ? {
                    bottom: window.innerHeight - rect.top + 4,
                    left: rect.left,
                    minWidth: Math.max(rect.width, dropMinW),
                  }
                : {
                    top: rect.bottom + 4,
                    left: rect.left,
                    minWidth: Math.max(rect.width, dropMinW),
                  }
            }
          >
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  onChange(opt.value)
                  setOpen(false)
                }}
                className={cn(
                  "w-full text-left px-3 py-1.5 rounded-md transition-colors flex items-center justify-between gap-3",
                  btnText,
                  value === opt.value
                    ? "bg-accent text-accent-foreground font-medium"
                    : "text-muted-foreground hover:bg-muted/30"
                )}
              >
                {renderLabel(opt)}
                {value === opt.value && (
                  <Check
                    size={checkSize}
                    className="text-primary flex-shrink-0"
                  />
                )}
              </button>
            ))}
          </div>,
          document.body
        )}
    </div>
  )
}
InlineSelect.displayName = "InlineSelect"

export { InlineSelect }
