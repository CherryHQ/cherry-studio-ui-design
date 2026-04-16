"use client"

import * as React from "react"
import { ChevronRight, MoreHorizontal } from "lucide-react"
import { cn } from "../../lib/utils"
import { Button } from "./button"

/* ---------------------------------- Types --------------------------------- */

export interface TreeNavItem {
  id: string
  label: string
  icon?: React.ReactNode
  /** Count badge shown to the right */
  count?: number
  children?: TreeNavItem[]
}

/* -------------------------------- TreeNav -------------------------------- */

export interface TreeNavProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  items: TreeNavItem[]
  /** Currently selected node id */
  activeId?: string
  /** Initially expanded node ids */
  defaultExpanded?: string[]
  onSelect?: (id: string) => void
  /** Context menu handler — return ReactNode or void */
  onItemContextMenu?: (e: React.MouseEvent, item: TreeNavItem) => void
}

function TreeNav({
  items,
  activeId,
  defaultExpanded,
  onSelect,
  onItemContextMenu,
  className,
  ...props
}: TreeNavProps) {
  const [expanded, setExpanded] = React.useState<Set<string>>(
    new Set(defaultExpanded || [])
  )

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div
      data-slot="tree-nav"
      className={cn("space-y-0.5 tracking-tight", className)}
      role="list"
      {...props}
    >
      {items.map((item) => (
        <TreeNavNode
          key={item.id}
          item={item}
          depth={0}
          activeId={activeId}
          expanded={expanded}
          onToggle={toggle}
          onSelect={onSelect}
          onItemContextMenu={onItemContextMenu}
        />
      ))}
    </div>
  )
}
TreeNav.displayName = "TreeNav"

/* ------------------------------ TreeNavNode ------------------------------ */

interface TreeNavNodeProps {
  item: TreeNavItem
  depth: number
  activeId?: string
  expanded: Set<string>
  onToggle: (id: string) => void
  onSelect?: (id: string) => void
  onItemContextMenu?: (e: React.MouseEvent, item: TreeNavItem) => void
}

function TreeNavNode({
  item,
  depth,
  activeId,
  expanded,
  onToggle,
  onSelect,
  onItemContextMenu,
}: TreeNavNodeProps) {
  const hasChildren = item.children && item.children.length > 0
  const isExpanded = expanded.has(item.id)
  const isActive = activeId === item.id

  return (
    <div role="listitem">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          if (hasChildren) onToggle(item.id)
          onSelect?.(item.id)
        }}
        onContextMenu={(e) => onItemContextMenu?.(e, item)}
        className={cn(
          "w-full flex items-center gap-1.5 text-xs py-1.5 pr-2 justify-start group/node",
          isActive
            ? "bg-accent text-foreground font-medium"
            : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
        )}
        style={{ paddingLeft: 8 + depth * 16 }}
      >
        {/* Chevron for expandable nodes */}
        {hasChildren ? (
          <ChevronRight
            size={12}
            className={cn(
              "flex-shrink-0 transition-transform duration-150",
              isExpanded && "rotate-90"
            )}
          />
        ) : (
          <span className="w-3 flex-shrink-0" />
        )}

        {/* Icon */}
        {item.icon && (
          <span className="flex-shrink-0 [&>svg]:h-3.5 [&>svg]:w-3.5">
            {item.icon}
          </span>
        )}

        {/* Label */}
        <span className="truncate flex-1 text-left">{item.label}</span>

        {/* Count */}
        {item.count !== undefined && (
          <span className="text-xs text-muted-foreground tabular-nums flex-shrink-0">
            {item.count}
          </span>
        )}
      </Button>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div role="group">
          {item.children!.map((child) => (
            <TreeNavNode
              key={child.id}
              item={child}
              depth={depth + 1}
              activeId={activeId}
              expanded={expanded}
              onToggle={onToggle}
              onSelect={onSelect}
              onItemContextMenu={onItemContextMenu}
            />
          ))}
        </div>
      )}
    </div>
  )
}

/* ------------------------------ TreeNavGroup ----------------------------- */

export interface TreeNavGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  /** Collapsible */
  collapsible?: boolean
  defaultOpen?: boolean
}

function TreeNavGroup({
  title,
  collapsible = true,
  defaultOpen = true,
  className,
  children,
  ...props
}: TreeNavGroupProps) {
  const [open, setOpen] = React.useState(defaultOpen)

  return (
    <div className={cn("space-y-0.5", className)} {...props}>
      <Button
        variant="ghost"
        size="xs"
        onClick={() => collapsible && setOpen(!open)}
        className={cn(
          "w-full flex items-center gap-1.5 px-2 py-1 text-xs font-medium uppercase tracking-wider text-muted-foreground justify-start",
          collapsible && "cursor-pointer"
        )}
      >
        {collapsible && (
          <ChevronRight
            size={10}
            className={cn(
              "transition-transform duration-150",
              open && "rotate-90"
            )}
          />
        )}
        <span>{title}</span>
      </Button>
      {open && children}
    </div>
  )
}
TreeNavGroup.displayName = "TreeNavGroup"

export { TreeNav, TreeNavGroup }
