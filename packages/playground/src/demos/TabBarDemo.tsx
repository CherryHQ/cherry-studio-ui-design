import React, { useState, useRef } from "react"
import {
  Tabs, TabsList, TabsTrigger,
  Button, Badge,
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger
} from "@cherry-studio/ui"
import { Section } from "../components/Section"
import { Plus, X, MessageSquare, MoreHorizontal, Pin, PinOff } from "lucide-react"

interface Tab {
  id: string
  title: string
  icon?: React.ReactNode
  pinned?: boolean
}

const initialTabs: Tab[] = [
  { id: "1", title: "General Chat", icon: <MessageSquare className="size-3" />, pinned: true },
  { id: "2", title: "Code Review", icon: <MessageSquare className="size-3" /> },
  { id: "3", title: "Translation", icon: <MessageSquare className="size-3" /> },
]

export function TabBarDemo() {
  const [tabs, setTabs] = useState<Tab[]>(initialTabs)
  const [active, setActive] = useState("1")
  const nextIdRef = useRef(4)

  const addTab = () => {
    const id = String(nextIdRef.current++)
    setTabs([...tabs, { id, title: `New Chat ${id}`, icon: <MessageSquare className="size-3" /> }])
    setActive(id)
  }

  const closeTab = (id: string) => {
    const tab = tabs.find((t) => t.id === id)
    if (tab?.pinned) return
    const next = tabs.filter((t) => t.id !== id)
    if (next.length === 0) return
    if (active === id) setActive(next[next.length - 1].id)
    setTabs(next)
  }

  const closeOthers = (id: string) => {
    setTabs(tabs.filter((t) => t.id === id || t.pinned))
    setActive(id)
  }

  const closeRight = (id: string) => {
    const idx = tabs.findIndex((t) => t.id === id)
    const next = tabs.filter((t, i) => i <= idx || t.pinned)
    setTabs(next)
    if (!next.find((t) => t.id === active)) {
      setActive(id)
    }
  }

  const togglePin = (id: string) => {
    setTabs(tabs.map((t) => (t.id === id ? { ...t, pinned: !t.pinned } : t)))
  }

  return (
    <Section title="Tab Bar Pattern" code={`import { Tabs, TabsList, TabsTrigger, Button, DropdownMenu } from "@cherry-studio/ui"

// Combine Tabs + Button + DropdownMenu to build a tab bar
<Tabs value={active} onValueChange={setActive}>
  <TabsList>
    {tabs.map(tab => (
      <TabsTrigger key={tab.id} value={tab.id}>
        {tab.title}
        <button onClick={() => closeTab(tab.id)}><X /></button>
      </TabsTrigger>
    ))}
    <Button size="icon" variant="ghost" onClick={addTab}><Plus /></Button>
  </TabsList>
</Tabs>`}>
      <div className="max-w-2xl">
        <div className="rounded-lg border bg-muted/30 overflow-hidden">
          {/* Tab bar */}
          <div className="flex items-center border-b bg-muted/50 overflow-x-auto">
            <Tabs value={active} onValueChange={setActive} className="flex-1 min-w-0">
              <TabsList className="h-9 bg-transparent rounded-none border-0 p-0 gap-0">
                {tabs.map((tab) => (
                  <DropdownMenu key={tab.id}>
                    <div className="flex items-center group relative">
                      <TabsTrigger
                        value={tab.id}
                        className="h-9 rounded-none border-0 px-3 gap-1.5 text-xs data-[state=active]:bg-background data-[state=active]:shadow-none"
                      >
                        {tab.icon}
                        <span className="truncate max-w-24">{tab.title}</span>
                        {tab.pinned && <Pin className="size-2.5 text-muted-foreground/50" />}
                      </TabsTrigger>
                      {!tab.pinned && (
                        <button
                          onClick={(e) => { e.stopPropagation(); closeTab(tab.id) }}
                          aria-label={`Close ${tab.title}`}
                          className="absolute right-1 p-0.5 rounded-sm text-muted-foreground/30 hover:text-foreground hover:bg-accent opacity-0 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 transition-opacity"
                        >
                          <X className="size-3" />
                        </button>
                      )}
                    </div>
                    <DropdownMenuTrigger asChild>
                      <button className="sr-only">Menu</button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-44">
                      <DropdownMenuItem onClick={() => togglePin(tab.id)}>
                        {tab.pinned ? <PinOff className="size-3.5 mr-2" /> : <Pin className="size-3.5 mr-2" />}
                        {tab.pinned ? "Unpin" : "Pin Tab"}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => closeTab(tab.id)} disabled={tab.pinned}>Close</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => closeOthers(tab.id)}>Close Others</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => closeRight(tab.id)}>Close to the Right</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ))}
              </TabsList>
            </Tabs>
            <Button variant="ghost" size="icon" className="size-8 shrink-0 mx-1" onClick={addTab}>
              <Plus className="size-3.5" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-4 h-40 flex items-center justify-center">
            <div className="text-center">
              <p className="text-sm font-medium">{tabs.find((t) => t.id === active)?.title}</p>
              <p className="text-xs text-muted-foreground mt-1">Tab content area</p>
              <Badge variant="outline" className="mt-2 text-[10px]">{tabs.length} tabs open</Badge>
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}
