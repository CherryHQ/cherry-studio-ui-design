"use client"

import * as React from "react"
import { Check, Search, X } from "lucide-react"
import { cn } from "../../lib/utils"

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

const PickerPanel = React.forwardRef<HTMLDivElement, PickerPanelProps>(
  (
    {
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
    },
    ref
  ) => {
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
      <div ref={ref} className={cn("flex flex-col", className)}>
        {/* Search */}
        <div className="p-2 pb-1.5">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-muted/50 border border-input">
            <Search className="size-3.5 text-muted-foreground/50 shrink-0" />
            <input
              ref={searchRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground/50 outline-none min-w-0"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="text-muted-foreground/40 hover:text-muted-foreground transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                <X className="size-3" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        {hasGroups ? (
          <div className="flex flex-1 min-h-0">
            {/* Left: groups */}
            <div className="w-28 border-r border-border py-1 overflow-y-auto shrink-0">
              {groupKeys.map((g) => {
                const count = groups.get(g)?.length ?? 0
                return (
                  <button
                    key={g}
                    onClick={() => setActiveGroup(g)}
                    className={cn(
                      "flex items-center justify-between w-full px-2.5 py-1.5 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                      activeGroup === g
                        ? "bg-accent text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    )}
                  >
                    <span className="truncate">{g || "Other"}</span>
                    <span className="text-xs text-muted-foreground/50 shrink-0 ml-1">{count}</span>
                  </button>
                )
              })}
            </div>

            {/* Right: items */}
            <div className="flex-1 py-1 px-1 overflow-y-auto">
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
          </div>
        ) : (
          <div className="flex-1 py-1 px-1 overflow-y-auto">
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
        )}
      </div>
    )
  }
)
PickerPanel.displayName = "PickerPanel"

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
    <button
      onClick={() => onSelect(item.id)}
      className={cn(
        "flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-xs transition-colors text-left focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
        selected
          ? "bg-accent text-foreground"
          : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
      )}
    >
      {multi && (
        <div
          className={cn(
            "size-3.5 rounded border flex items-center justify-center shrink-0 transition-colors",
            selected ? "border-primary bg-primary" : "border-input"
          )}
        >
          {selected && <Check className="size-2.5 text-primary-foreground" />}
        </div>
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
                <span
                  key={tag}
                  className="px-1.5 py-px rounded-full bg-muted text-xs text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </span>
          )}
          {!multi && selected && <Check className="size-3.5 text-primary shrink-0 ml-0.5" />}
        </>
      )}
    </button>
  )
}

export { PickerPanel }
