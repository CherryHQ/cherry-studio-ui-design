import React, { useState } from "react"
import { TabContextMenu, Button, type ContextMenuState, type ContextMenuTab } from "@cherry-studio/ui"
import { Section } from "../components/Section"
import { MessageCircle, FileText, Compass } from "lucide-react"

const sampleTabs: ContextMenuTab[] = [
  { id: "chat", title: "New Chat", icon: MessageCircle, closeable: true, pinned: false },
  { id: "notes", title: "My Notes", icon: FileText, closeable: true, pinned: true },
  { id: "explore", title: "Explore", icon: Compass, closeable: true },
]

export function TabContextMenuDemo() {
  const [menuState, setMenuState] = useState<ContextMenuState>({ visible: false, x: 0, y: 0, tabId: "" })
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(new Set(["notes"]))

  const handleContextMenu = (e: React.MouseEvent, tabId: string) => {
    e.preventDefault()
    setMenuState({ visible: true, x: e.clientX, y: e.clientY, tabId })
  }

  const currentTab = sampleTabs.find(t => t.id === menuState.tabId)
  const displayTab = currentTab ? { ...currentTab, pinned: pinnedIds.has(currentTab.id) } : undefined

  return (
    <>
      <Section title="TabContextMenu" props={[
        { name: "state", type: "ContextMenuState", description: "Menu visibility and position" },
        { name: "tab", type: "ContextMenuTab", description: "Tab data for the context menu" },
        { name: "onPin", type: "(id: string) => void", description: "Pin/unpin tab handler" },
        { name: "onClose", type: "(id: string) => void", description: "Close tab handler" },
        { name: "onDock", type: "(id: string) => void", description: "Dock to sidebar handler" },
        { name: "onDismiss", type: "() => void", description: "Dismiss the menu" },
      ]} code={`import { TabContextMenu } from "@cherry-studio/ui"

<TabContextMenu
  state={menuState}
  tab={tab}
  onPin={(id) => togglePin(id)}
  onClose={(id) => closeTab(id)}
  onDock={(id) => dockTab(id)}
  onDismiss={() => setMenuState({ ...menuState, visible: false })}
/>`}>
        <div className="space-y-3 max-w-md">
          <p className="text-xs text-muted-foreground">Right-click a tab below to open the context menu:</p>
          <div className="flex gap-2">
            {sampleTabs.map(tab => (
              <Button variant="ghost"
                key={tab.id}
                onContextMenu={(e) => handleContextMenu(e, tab.id)}
                className="px-3 py-1.5 text-xs rounded-xl border hover:bg-accent/50 transition-colors flex items-center gap-1.5"
              >
                <tab.icon size={12} />
                {tab.title}
                {pinnedIds.has(tab.id) && <span className="text-[9px] text-primary">pinned</span>}
              </Button>
            ))}
          </div>
          <TabContextMenu
            state={menuState}
            tab={displayTab}
            onPin={(id) => {
              setPinnedIds(prev => {
                const next = new Set(prev)
                if (next.has(id)) next.delete(id); else next.add(id)
                return next
              })
            }}
            onClose={() => {}}
            onDock={() => {}}
            onDismiss={() => setMenuState(prev => ({ ...prev, visible: false }))}
          />
        </div>
      </Section>
    </>
  )
}
