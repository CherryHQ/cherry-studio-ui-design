import React from "react"
import { Moon, Sun, Palette } from "lucide-react"

interface SidebarProps {
  demos: { id: string; title: string; category: string }[]
  active: string
  onSelect: (id: string) => void
  dark: boolean
  onToggleDark: () => void
}

export function Sidebar({ demos, active, onSelect, dark, onToggleDark }: SidebarProps) {
  const categories = [...new Set(demos.map((d) => d.category))]

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
      <nav className="flex-1 overflow-y-auto py-2 px-2 [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:bg-border/30 [&::-webkit-scrollbar-thumb]:rounded-full">
        {categories.map((cat) => (
          <div key={cat} className="mb-3">
            <div className="px-2 py-1 text-[10px] font-medium text-muted-foreground/50 uppercase tracking-wider">
              {cat}
            </div>
            {demos
              .filter((d) => d.category === cat)
              .map((demo) => (
                <button
                  key={demo.id}
                  onClick={() => onSelect(demo.id)}
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
    </aside>
  )
}
