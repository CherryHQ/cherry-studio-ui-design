import React, { useState } from "react"
import { NewTabDialog, Button, type AppIconItem, type HistoryItem, type FileItem, type QuickActionItem } from "@cherry-studio/ui"
import { Section } from "../components/Section"
import { MessageCircle, Compass, BookOpen, Search, Image, Code2, FileText, Globe } from "lucide-react"

const appIcons: AppIconItem[] = [
  { id: "chat", label: "Chat", icon: MessageCircle, color: "text-primary", bg: "bg-primary/10" },
  { id: "explore", label: "Explore", icon: Compass, color: "text-accent-blue", bg: "bg-accent-blue/10" },
  { id: "library", label: "Library", icon: BookOpen, color: "text-accent-amber", bg: "bg-accent-amber/10" },
  { id: "image", label: "Image", icon: Image, color: "text-accent-violet", bg: "bg-accent-violet/10" },
  { id: "code", label: "Code", icon: Code2, color: "text-accent-green", bg: "bg-accent-green/10" },
]

const historyItems: HistoryItem[] = [
  { id: "h1", label: "React Hooks Guide", desc: "Chat about React hooks", icon: MessageCircle, count: 12, category: "Chat" },
  { id: "h2", label: "API Design Notes", desc: "REST API best practices", icon: FileText, count: 5, category: "Note" },
]

const fileItems: FileItem[] = [
  { id: "f1", label: "design-system.md", desc: "Design tokens reference", meta: "2.3 KB", icon: FileText, category: "Document" },
]

const quickActions: QuickActionItem[] = [
  { id: "q1", label: "New Chat", icon: MessageCircle, shortcut: "⌘N" },
  { id: "q2", label: "Search", icon: Search, shortcut: "⌘K" },
]

export function NewTabDialogDemo() {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [hidden, setHidden] = useState<Set<string>>(new Set())
  const [order, setOrder] = useState(appIcons.map(a => a.id))

  return (
    <>
      <Section title="NewTabDialog" props={[
        { name: "open", type: "boolean", description: "Whether dialog is open" },
        { name: "search", type: "string", description: "Search query" },
        { name: "dialogAppIcons", type: "AppIconItem[]", description: "App icons grid" },
        { name: "newTabHistoryItems", type: "HistoryItem[]", description: "Recent history items" },
        { name: "dialogQuickActions", type: "QuickActionItem[]", description: "Quick action shortcuts" },
      ]} code={`import { NewTabDialog } from "@cherry-studio/ui"

<NewTabDialog
  open={open}
  search={search}
  onSearchChange={setSearch}
  onSelect={(id) => console.log(id)}
  onClose={() => setOpen(false)}
  dialogAppIcons={appIcons}
/>`}>
        <Button onClick={() => setOpen(true)}>Open New Tab Dialog</Button>
        <NewTabDialog
          open={open}
          search={search}
          onSearchChange={setSearch}
          onSelect={() => setOpen(false)}
          onClose={() => setOpen(false)}
          hiddenApps={hidden}
          setHiddenApps={setHidden}
          appOrder={order}
          setAppOrder={setOrder}
          dialogAppIcons={appIcons}
          dialogFilterTabs={["All", "Chat", "Note", "Document"]}
          newTabHistoryItems={historyItems}
          newTabFileItems={fileItems}
          dialogQuickActions={quickActions}
        />
      </Section>
    </>
  )
}
