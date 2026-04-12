import React, { useState } from "react"
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
  Switch, Button, Badge, Kbd
} from "@cherry-studio/ui"
import { Section } from "../components/Section"
import { RotateCcw } from "lucide-react"

interface Shortcut {
  id: string
  label: string
  keys: string[]
  enabled: boolean
}

const shortcutGroups: { group: string; items: Shortcut[] }[] = [
  {
    group: "General",
    items: [
      { id: "new-chat", label: "New Chat", keys: ["⌘", "N"], enabled: true },
      { id: "settings", label: "Open Settings", keys: ["⌘", ","], enabled: true },
      { id: "search", label: "Global Search", keys: ["⌘", "K"], enabled: true },
      { id: "close-tab", label: "Close Tab", keys: ["⌘", "W"], enabled: true },
    ],
  },
  {
    group: "Chat",
    items: [
      { id: "send", label: "Send Message", keys: ["↵"], enabled: true },
      { id: "newline", label: "New Line", keys: ["⇧", "↵"], enabled: true },
      { id: "stop", label: "Stop Generation", keys: ["Esc"], enabled: true },
      { id: "regenerate", label: "Regenerate", keys: ["⌘", "⇧", "R"], enabled: false },
    ],
  },
  {
    group: "Editor",
    items: [
      { id: "bold", label: "Bold", keys: ["⌘", "B"], enabled: true },
      { id: "italic", label: "Italic", keys: ["⌘", "I"], enabled: true },
      { id: "code", label: "Code Block", keys: ["⌘", "⇧", "C"], enabled: true },
      { id: "copy-code", label: "Copy Code Block", keys: ["⌘", "⇧", "K"], enabled: false },
    ],
  },
]

export function ShortcutEditorDemo() {
  const [shortcuts, setShortcuts] = useState(shortcutGroups)

  const toggleShortcut = (groupIdx: number, itemIdx: number) => {
    setShortcuts((prev) =>
      prev.map((g, gi) =>
        gi === groupIdx
          ? { ...g, items: g.items.map((item, ii) => (ii === itemIdx ? { ...item, enabled: !item.enabled } : item)) }
          : g
      )
    )
  }

  return (
    <Section title="Shortcut Editor" code={`// Compose with: Accordion, Kbd, Switch, Button, Badge`}>
      <div className="max-w-lg">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-muted-foreground">Keyboard Shortcuts</p>
          <Button variant="ghost" size="sm" className="h-7 text-xs">
            <RotateCcw className="size-3 mr-1" /> Reset All
          </Button>
        </div>
        <Accordion type="multiple" defaultValue={["General", "Chat", "Editor"]} className="space-y-2">
          {shortcuts.map((group, gi) => (
            <AccordionItem key={group.group} value={group.group} className="border rounded-lg px-3">
              <AccordionTrigger className="text-xs font-medium py-2.5 hover:no-underline">
                {group.group}
                <Badge variant="secondary" className="text-[9px] ml-2">{group.items.length}</Badge>
              </AccordionTrigger>
              <AccordionContent className="pb-2">
                <div className="space-y-0">
                  {group.items.map((item, ii) => (
                    <div key={item.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                      <span className={`text-xs ${item.enabled ? "text-foreground" : "text-muted-foreground"}`}>{item.label}</span>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-0.5">
                          {item.keys.map((k, ki) => (
                            <Kbd key={ki} className={`text-[10px] ${!item.enabled ? "opacity-40" : ""}`}>{k}</Kbd>
                          ))}
                        </div>
                        <Switch
                          checked={item.enabled}
                          onCheckedChange={() => toggleShortcut(gi, ii)}
                          className="scale-75"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </Section>
  )
}
