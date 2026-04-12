import React, { useState, useMemo } from "react"
import { Moon, Sun, Palette, Search, X } from "lucide-react"

interface SidebarProps {
  demos: { id: string; title: string; category: string }[]
  active: string
  onSelect: (id: string) => void
  dark: boolean
  onToggleDark: () => void
}

export function Sidebar({ demos, active, onSelect, dark, onToggleDark }: SidebarProps) {
  const [search, setSearch] = useState("")

  const filtered = useMemo(() => {
    if (!search.trim()) return demos
    const q = search.toLowerCase()
    return demos.filter(
      (d) => d.title.toLowerCase().includes(q) || d.category.toLowerCase().includes(q)
    )
  }, [demos, search])

  const categories = useMemo(
    () => [...new Set(filtered.map((d) => d.category))],
    [filtered]
  )

  return (
    <aside className="w-[220px] flex-shrink-0 border-r border-border bg-muted/30 flex flex-col">
      <div className="px-4 py-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-primary" />
          <span className="font-semibold text-sm">UI Playground</span>
        </div>
        <button
          onClick={onToggleDark}
          className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-accent transition-colors"
        >
          {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      <div className="px-2 pt-2 pb-1">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search components..."
            className="w-full h-7 pl-7 pr-7 rounded-md border border-border bg-background text-xs placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-1 px-2 [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:bg-border/30 [&::-webkit-scrollbar-thumb]:rounded-full">
        {categories.length === 0 && (
          <p className="px-2 py-4 text-xs text-muted-foreground/50 text-center">No results</p>
        )}
        {categories.map((cat) => (
          <div key={cat} className="mb-3">
            <div className="px-2 py-1 text-[10px] font-medium text-muted-foreground/50 uppercase tracking-wider">
              {cat}
            </div>
            {filtered
              .filter((d) => d.category === cat)
              .map((demo) => (
                <button
                  key={demo.id}
                  onClick={() => { onSelect(demo.id); setSearch("") }}
                  className={`w-full text-left px-2.5 py-[5px] rounded-md text-[12px] transition-colors mb-0.5 ${
                    active === demo.id
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  }`}
                >
                  {demo.title}
                </button>
              ))}
          </div>
        ))}
      </nav>

      <div className="px-3 py-2 border-t border-border">
        <p className="text-[10px] text-muted-foreground/50 text-center">
          {demos.length} components
        </p>
      </div>
    </aside>
  )
}
