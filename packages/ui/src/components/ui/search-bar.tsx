"use client"

import * as React from "react"
import { Search } from "lucide-react"
import { cn } from "../../lib/utils"
import { Input } from "./input"
import { Kbd } from "./kbd"

export interface SearchBarProps
  extends Omit<React.ComponentProps<"input">, "type"> {
  icon?: React.ReactNode
  shortcut?: string
}

function SearchBar({
  icon,
  shortcut,
  className,
  ...props
}: SearchBarProps) {
  return (
    <div data-slot="search-bar" className="relative">
      <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
        {icon ?? <Search className="size-4" />}
      </div>
      <Input
        type="search"
        data-slot="search-bar-input"
        className={cn(
          "pl-10 pr-4",
          shortcut && "pr-14",
          className
        )}
        {...props}
      />
      {shortcut && (
        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
          <Kbd>{shortcut}</Kbd>
        </div>
      )}
    </div>
  )
}

export { SearchBar }
