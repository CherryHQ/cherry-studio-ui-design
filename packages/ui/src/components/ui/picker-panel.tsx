"use client"

import * as React from "react"
import { Check, Search, X } from "lucide-react"
import { cn } from "../../lib/utils"
import { Badge } from "./badge"
import { Button } from "./button"
import { Checkbox } from "./checkbox"
import { Input } from "./input"
import { ScrollArea } from "./scroll-area"

export interface PickerPanelItem {
  id: string
  label: string
  group?: string
  icon?: React.ReactNode
  tags?: string[]
  description?: string
  disabled?: boolean
}

export interface PickerPanelProps {
  items: PickerPanelItem[]
  value?: string
  onValueChange?: (id: string) => void
  values?: string[]
  onValuesChange?: (ids: string[]) => void
  searchPlaceholder?: string
  emptyMessage?: string
  className?: string
  /** Auto-focus search input on mount */
  autoFocus?: boolean
  /** Render custom item content. Falls back to default rendering. */
  renderItem?: (item: PickerPanelItem, selected: boolean) => React.ReactNode
}

function PickerPanel({
  items,
  value,
  onValueChange,
  values,
  onValuesChange,
  searchPlaceholder = "Search...",
  emptyMessage = "No results.",
  className,
  autoFocus = false,
  renderItem,
  ref,
}: PickerPanelProps & { ref?: React.Ref<HTMLDivElement> }) {
    const [search, setSearch] = React.useState("")
    const isMulti = !!onValuesChange
    const searchRef = React.useRef<HTMLInputElement>(null)

    React.useEffect(() => {
      if (!autoFocus) return
      const t = setTimeout(() => searchRef.current?.focus(), 60)
      return () => clearTimeout(t)
    }, [autoFocus])

    const groups = React.useMemo(() => {
      const q = search.toLowerCase()
      const filtered = items.filter(
        (item) =>
          !item.disabled &&
          (item.label.toLowerCase().includes(q) ||
            item.description?.toLowerCase().includes(q) ||
            item.tags?.some((t) => t.toLowerCase().includes(q)))
      )
      const map = new Map<string, PickerPanelItem[]>()
      for (const item of filtered) {
        const g = item.group || ""
        if (!map.has(g)) map.set(g, [])
        map.get(g)!.push(item)
      }
      return map
    }, [items, search])

    const groupKeys = React.useMemo(() => {
      const seen = new Set<string>()
      for (const item of items) {
        seen.add(item.group || "")
      }
      return Array.from(seen)
    }, [items])

    const [activeGroup, setActiveGroup] = React.useState<string>(() => groupKeys[0] || "")

    React.useEffect(() => {
      if (groupKeys.length > 0 && !groupKeys.includes(activeGroup)) {
        setActiveGroup(groupKeys[0])
      }
    }, [groupKeys, activeGroup])

    const isSelected = (id: string) =>
      isMulti ? values?.includes(id) ?? false : value === id

    const handleSelect = (id: string) => {
      if (isMulti) {
        const next = values?.includes(id)
          ? (values || []).filter((v) => v !== id)
          : [...(values || []), id]
        onValuesChange?.(next)
      } else {
        onValueChange?.(id === value ? "" : id)
      }
    }

    const hasGroups = groupKeys.length > 1 || (groupKeys.length === 1 && groupKeys[0] !== "")

    const activeItems = hasGroups
      ? groups.get(activeGroup) || []
      : Array.from(groups.values()).flat()

    return (
      <div ref={ref} data-slot="picker-panel" className={cn("flex flex-col tracking-[-0.14px]", className)}>
        {/* Search */}
        <div className="p-2 pb-1.5">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[var(--radius-button)] bg-muted/50 border border-input">
            <Search className="size-3.5 text-muted-foreground/50 shrink-0" />
            <Input
              ref={searchRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              className="flex-1 h-auto border-0 bg-transparent px-0 py-0 text-xs shadow-none focus-visible:ring-0 focus-visible:border-transparent min-w-0"
            />
            {search && (
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => setSearch("")}
                className="text-muted-foreground/40 hover:text-muted-foreground"
              >
                <X className="size-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        {hasGroups ? (
          <div className="flex flex-1 min-h-0">
            {/* Left: groups */}
            <ScrollArea className="w-28 border-r border-border shrink-0">
              <div className="py-1">
                {groupKeys.map((g) => {
                  const count = groups.get(g)?.length ?? 0
                  return (
                    <Button
                      key={g}
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveGroup(g)}
                      className={cn(
                        "w-full justify-between px-2.5 py-1.5 text-xs",
                        activeGroup === g
                          ? "bg-accent text-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                      )}
                    >
                      <span className="truncate">{g || "Other"}</span>
                      <span className="text-xs text-muted-foreground/50 shrink-0 ml-1">{count}</span>
                    </Button>
                  )
                })}
              </div>
            </ScrollArea>

            {/* Right: items */}
            <ScrollArea className="flex-1">
              <div className="py-1 px-1">
                {activeItems.length === 0 ? (
                  <div className="px-3 py-6 text-center text-xs text-muted-foreground">{emptyMessage}</div>
                ) : (
                  activeItems.map((item) => (
                    <ItemRow
                      key={item.id}
                      item={item}
                      selected={isSelected(item.id)}
                      multi={isMulti}
                      onSelect={handleSelect}
                      renderItem={renderItem}
                    />
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        ) : (
          <ScrollArea className="flex-1">
            <div className="py-1 px-1">
              {activeItems.length === 0 ? (
                <div className="px-3 py-6 text-center text-xs text-muted-foreground">{emptyMessage}</div>
              ) : (
                activeItems.map((item) => (
                  <ItemRow
                    key={item.id}
                    item={item}
                    selected={isSelected(item.id)}
                    multi={isMulti}
                    onSelect={handleSelect}
                    renderItem={renderItem}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        )}
      </div>
  )
}

function ItemRow({
  item,
  selected,
  multi,
  onSelect,
  renderItem,
}: {
  item: PickerPanelItem
  selected: boolean
  multi: boolean
  onSelect: (id: string) => void
  renderItem?: PickerPanelProps["renderItem"]
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => onSelect(item.id)}
      className={cn(
        "w-full justify-start gap-2 px-2 py-1.5 text-xs text-left",
        selected
          ? "bg-accent text-foreground"
          : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
      )}
    >
      {multi && (
        <Checkbox checked={selected} className="size-3.5 pointer-events-none" tabIndex={-1} />
      )}
      {renderItem ? (
        renderItem(item, selected)
      ) : (
        <>
          {item.icon && <span className="shrink-0">{item.icon}</span>}
          <span className="flex-1 truncate">{item.label}</span>
          {item.tags && item.tags.length > 0 && (
            <span className="flex items-center gap-1 shrink-0">
              {item.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="px-1.5 py-px text-xs text-muted-foreground"
                >
                  {tag}
                </Badge>
              ))}
            </span>
          )}
          {!multi && selected && <Check className="size-3.5 text-primary shrink-0 ml-0.5" />}
        </>
      )}
    </Button>
  )
}

export { PickerPanel }
