"use client"

import * as React from "react"
import { ChevronDown, Check } from "lucide-react"
import { cn } from "../../lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"
import { Button } from "./button"

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

  const selected = options.find((o) => o.value === value)

  const isMd = size === "md"
  const btnText = "text-xs"
  const chevronSize = isMd ? 12 : 12
  const checkSize = isMd ? 12 : 12

  const renderLabel = (opt: InlineSelectOption) => {
    if (showDesc && opt.desc) {
      return (
        <div className="flex items-center gap-2">
          <span className={btnText}>{opt.desc}</span>
          <span>{opt.label}</span>
        </div>
      )
    }
    return <span>{opt.label}</span>
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div data-slot="inline-select" className={cn("relative tracking-[-0.14px]", className)}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size={isMd ? "sm" : "xs"}
            disabled={disabled}
            className={cn(
              "flex items-center gap-1.5 bg-muted/50 justify-between",
              btnText,
              fullWidth
                ? "w-full"
                : isMd
                  ? "min-w-40"
                  : "min-w-36",
              disabled
                ? "text-muted-foreground"
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
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          side={dropUp ? "top" : "bottom"}
          className={cn(
            "p-1.5 w-auto",
            isMd ? "min-w-[180px]" : "min-w-[150px]"
          )}
        >
          {options.map((opt) => (
            <Button
              key={opt.value}
              variant="ghost"
              size="sm"
              onClick={() => {
                onChange(opt.value)
                setOpen(false)
              }}
              className={cn(
                "w-full justify-between gap-3",
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
            </Button>
          ))}
        </PopoverContent>
      </div>
    </Popover>
  )
}
InlineSelect.displayName = "InlineSelect"

export { InlineSelect }
