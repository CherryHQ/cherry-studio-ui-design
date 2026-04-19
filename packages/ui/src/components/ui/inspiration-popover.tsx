"use client"

import * as React from "react"
import { cn } from "../../lib/utils"
import { Button } from "./button"
import { ScrollArea } from "./scroll-area"
import { Shuffle } from "lucide-react"

// ===========================
// Types
// ===========================

export interface InspirationCategory {
  id: string
  label: string
  icon?: React.ReactNode
}

export interface InspirationPrompt {
  id: string
  text: string
  category: string
}

export interface InspirationPopoverProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (prompt: string) => void
  categories?: InspirationCategory[]
  prompts?: InspirationPrompt[]
  className?: string
}

// ===========================
// Default data
// ===========================

const DEFAULT_CATEGORIES: InspirationCategory[] = [
  { id: "surprise", label: "Surprise me", icon: <Shuffle className="size-3" /> },
  { id: "characters", label: "Characters" },
  { id: "objects", label: "Objects" },
  { id: "backgrounds", label: "Backgrounds" },
  { id: "cute", label: "Cute" },
]

const DEFAULT_PROMPTS: InspirationPrompt[] = [
  { id: "p1", text: "Write a creative story about a time-traveling librarian", category: "characters" },
  { id: "p2", text: "Explain quantum computing to a 5 year old", category: "surprise" },
  { id: "p3", text: "Design a futuristic cityscape with floating gardens", category: "backgrounds" },
  { id: "p4", text: "Create a cute mascot for a coding bootcamp", category: "cute" },
  { id: "p5", text: "Describe a mysterious ancient artifact found in the ocean", category: "objects" },
  { id: "p6", text: "Write a haiku about artificial intelligence", category: "surprise" },
  { id: "p7", text: "Design a cozy reading nook in a treehouse", category: "backgrounds" },
  { id: "p8", text: "Create a character who communicates only through music", category: "characters" },
]

// ===========================
// Component
// ===========================

function InspirationPopover({
  open,
  onOpenChange,
  onSelect,
  categories = DEFAULT_CATEGORIES,
  prompts = DEFAULT_PROMPTS,
  className,
}: InspirationPopoverProps) {
  const [activeCategory, setActiveCategory] = React.useState(categories[0]?.id || "")
  const popoverRef = React.useRef<HTMLDivElement>(null)

  // Auto-focus and reset category when opened
  React.useEffect(() => {
    if (open) {
      setActiveCategory(categories[0]?.id || "")
      popoverRef.current?.focus()
    }
  }, [open, categories])

  const filteredPrompts = activeCategory === "surprise"
    ? prompts
    : prompts.filter(p => p.category === activeCategory)

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[var(--z-overlay)]" aria-hidden="true" onClick={() => onOpenChange(false)} />

      {/* Popover */}
      <div
        data-slot="inspiration-popover"
        ref={popoverRef}
        role="dialog"
        aria-label="Inspiration prompts"
        tabIndex={-1}
        onKeyDown={(e) => { if (e.key === "Escape") onOpenChange(false) }}
        className={cn(
          "absolute bottom-full left-0 mb-2 w-full z-[var(--z-popover)]",
          "rounded-[var(--radius-card)] border border-border bg-popover shadow-popover backdrop-blur-[6px]",
          "flex flex-col overflow-hidden",
          "animate-in fade-in slide-in-from-bottom-2 duration-[var(--duration-normal)]",
          className
        )}
      >
        {/* Prompt list */}
        <ScrollArea className="max-h-[280px]">
          <div className="flex flex-col gap-0.5 p-3">
            {filteredPrompts.length > 0 ? (
              filteredPrompts.map(prompt => (
                <button
                  key={prompt.id}
                  type="button"
                  onClick={() => { onSelect(prompt.text); onOpenChange(false) }}
                  className={cn(
                    "w-full text-left rounded-[var(--radius-control)] p-3",
                    "text-sm leading-4 tracking-[-0.13px] font-normal",
                    "text-foreground truncate",
                    "transition-colors",
                    "hover:bg-secondary hover:outline hover:outline-1 hover:outline-border",
                  )}
                >
                  {prompt.text}
                </button>
              ))
            ) : (
              <p className="py-6 text-center text-sm text-muted-foreground/60">No prompts in this category</p>
            )}
          </div>
        </ScrollArea>

        {/* Tags bar — border-t + surface-02 background */}
        <div className="relative border-t border-border bg-secondary p-3">
          <div className="flex items-center gap-1.5 overflow-x-auto [&::-webkit-scrollbar]:hidden">
            {categories.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "shrink-0 h-9 rounded-[var(--radius-button)] px-5 py-2.5",
                  "border border-input",
                  "text-xs font-medium tracking-[-0.12px]",
                  "transition-colors",
                  cat.id === activeCategory
                    ? "bg-muted shadow-[inset_0px_2px_0px_0px_rgba(255,255,255,0.8),0px_1px_3.2px_-2px_rgba(0,0,0,0.99)]"
                    : "bg-transparent hover:bg-accent/30"
                )}
              >
                {cat.icon && <span className="mr-2 inline-flex">{cat.icon}</span>}
                {cat.label}
              </button>
            ))}
          </div>
          {/* Right fade gradient */}
          <div className="absolute right-0 top-0 bottom-0 w-[93px] bg-gradient-to-l from-secondary to-transparent pointer-events-none" />
        </div>
      </div>
    </>
  )
}

export { InspirationPopover }
