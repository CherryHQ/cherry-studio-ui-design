"use client"

import * as React from "react"
import { cn } from "../../lib/utils"
import { Button } from "./button"
import { Popover, PopoverTrigger, PopoverContent } from "./popover"
import { ScrollArea } from "./scroll-area"
import { Smile } from "lucide-react"

interface EmojiCategory {
  name: string
  emojis: string[]
}

interface EmojiPickerProps extends Omit<React.ComponentProps<"div">, "onSelect"> {
  onSelect?: (emoji: string) => void
  trigger?: React.ReactNode
  recentEmojis?: string[]
  categories?: EmojiCategory[]
  labels?: {
    recent?: string
  }
}

const DEFAULT_CATEGORIES: EmojiCategory[] = [
  { name: "Smileys", emojis: ["😀", "😂", "🥰", "😎", "🤔", "😊", "🥳", "😴", "🤗", "😇", "🙃", "😜", "🤩", "😤", "🫡", "😮"] },
  { name: "Gestures", emojis: ["👍", "👎", "👏", "🤝", "✌️", "🤞", "💪", "🙌", "👋", "🤙", "✊", "🫶", "👌", "🫰", "☝️", "🤘"] },
  { name: "Symbols", emojis: ["❤️", "🔥", "⭐", "✅", "❌", "⚡", "💡", "🎉", "💯", "🏆", "📌", "🚀", "💬", "📎", "🔗", "🎯"] },
]

function EmojiPicker({ onSelect, trigger, recentEmojis, categories = DEFAULT_CATEGORIES, labels, className, ...props }: EmojiPickerProps) {
  const [activeTab, setActiveTab] = React.useState(recentEmojis?.length ? "recent" : categories[0]?.name || "")

  const recentLabel = labels?.recent ?? "Recent"

  const tabs = React.useMemo(() => {
    const t: { id: string; label: string }[] = []
    if (recentEmojis?.length) t.push({ id: "recent", label: recentLabel })
    categories.forEach(c => t.push({ id: c.name, label: c.name }))
    return t
  }, [recentEmojis, categories, recentLabel])

  const activeEmojis = activeTab === "recent"
    ? (recentEmojis || [])
    : (categories.find(c => c.name === activeTab)?.emojis || [])

  return (
    <Popover>
      <PopoverTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon-sm" data-slot="emoji-picker-trigger" aria-label="Open emoji picker">
            <Smile className="size-4 text-muted-foreground" />
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent
        data-slot="emoji-picker"
        {...props}
        className={cn("rounded-[var(--radius-card)] w-[280px] p-0", className)}
        align="start"
        sideOffset={4}
      >
        {/* Category tabs */}
        <div className="flex items-center gap-0.5 px-2 pt-2 pb-1 border-b border-border/20">
          {tabs.map(tab => (
            <Button
              key={tab.id}
              variant="ghost"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "h-auto px-2 py-1 text-xs rounded-[var(--radius-kbd)] font-normal",
                activeTab === tab.id ? "bg-accent text-foreground" : "text-muted-foreground/50 hover:text-foreground"
              )}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Emoji grid */}
        <ScrollArea className="h-[180px]">
          <div className="grid grid-cols-8 gap-1 p-2">
            {activeEmojis.map((emoji, i) => (
              <Button
                key={emoji}
                variant="ghost"
                onClick={() => onSelect?.(emoji)}
                className="h-8 w-8 p-0 text-base rounded-[var(--radius-kbd)] hover:bg-accent/70"
              >
                {emoji}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}

export { EmojiPicker, DEFAULT_CATEGORIES }
export type { EmojiPickerProps, EmojiCategory }
