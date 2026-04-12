import React, { useState } from "react"
import {
  Input, Card, CardContent, Badge, Button,
  TreeNav,
  ToggleGroup, ToggleGroupItem,
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem
} from "@cherry-studio/ui"
import { Section } from "../components/Section"
import { Search, Grid3X3, List, FileText, Image, Code2, FolderOpen } from "lucide-react"

const folders = [
  {
    id: "docs", label: "Documents", icon: "📄", children: [
      { id: "docs-reports", label: "Reports" },
      { id: "docs-notes", label: "Notes" },
    ],
  },
  {
    id: "media", label: "Media", icon: "🖼️", children: [
      { id: "media-images", label: "Images" },
      { id: "media-diagrams", label: "Diagrams" },
    ],
  },
  { id: "code", label: "Code Snippets", icon: "💻" },
  { id: "bookmarks", label: "Bookmarks", icon: "🔖" },
]

const resources = [
  { id: "1", name: "Project Architecture.pdf", type: "pdf", size: "2.4 MB", folder: "docs-reports", date: "2 days ago" },
  { id: "2", name: "API Reference.md", type: "md", size: "45 KB", folder: "docs-notes", date: "1 week ago" },
  { id: "3", name: "System Diagram.png", type: "image", size: "890 KB", folder: "media-diagrams", date: "3 days ago" },
  { id: "4", name: "auth-middleware.ts", type: "code", size: "3.2 KB", folder: "code", date: "5 hours ago" },
  { id: "5", name: "Meeting Notes Oct.md", type: "md", size: "12 KB", folder: "docs-notes", date: "Yesterday" },
  { id: "6", name: "Dashboard Screenshot.png", type: "image", size: "1.2 MB", folder: "media-images", date: "4 days ago" },
]

const iconMap: Record<string, React.ElementType> = { pdf: FileText, md: FileText, image: Image, code: Code2 }

export function LibraryDemo() {
  const [search, setSearch] = useState("")
  const [view, setView] = useState("grid")
  const [sort, setSort] = useState("recent")
  const [activeFolder, setActiveFolder] = useState<string | null>(null)

  const filtered = resources.filter(r => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase())
    const matchFolder = !activeFolder || r.folder === activeFolder || r.folder.startsWith(activeFolder)
    return matchSearch && matchFolder
  })

  return (
    <Section title="Resource Library" install="npm install @cherry-studio/ui">
      <div className="max-w-2xl flex gap-3 min-h-[400px]">
        <div className="w-48 shrink-0 rounded-lg border bg-background p-2">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-2 mb-2">Folders</p>
          <TreeNav
            items={folders}
            selectedId={activeFolder}
            onSelect={(id) => setActiveFolder(id === activeFolder ? null : id)}
          />
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search resources..." className="pl-8 h-8 text-xs" />
            </div>
            <ToggleGroup type="single" value={view} onValueChange={v => v && setView(v)} className="h-8">
              <ToggleGroupItem value="grid" className="h-8 w-8 p-0"><Grid3X3 size={14} /></ToggleGroupItem>
              <ToggleGroupItem value="list" className="h-8 w-8 p-0"><List size={14} /></ToggleGroupItem>
            </ToggleGroup>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Recent</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="size">Size</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {activeFolder && (
            <div className="flex items-center gap-1">
              <FolderOpen size={12} className="text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">{activeFolder}</span>
              <Button variant="ghost" size="sm" className="h-4 text-[9px] px-1" onClick={() => setActiveFolder(null)}>Clear</Button>
            </div>
          )}

          <div className={view === "grid" ? "grid grid-cols-3 gap-2" : "space-y-1"}>
            {filtered.map(r => {
              const Icon = iconMap[r.type] || FileText
              return (
                <Card key={r.id} className="p-0 cursor-pointer hover:bg-accent/30 transition-colors">
                  <CardContent className={view === "grid" ? "p-3 text-center space-y-1.5" : "p-2 flex items-center gap-2.5"}>
                    <div className={view === "grid" ? "mx-auto h-8 w-8 rounded-lg bg-accent/50 flex items-center justify-center" : "h-7 w-7 rounded-md bg-accent/50 flex items-center justify-center shrink-0"}>
                      <Icon size={14} className="text-foreground/60" />
                    </div>
                    <div className={view === "grid" ? "" : "flex-1 min-w-0"}>
                      <p className="text-[11px] font-medium truncate">{r.name}</p>
                      <p className="text-[9px] text-muted-foreground">{r.size} &middot; {r.date}</p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
          {filtered.length === 0 && <p className="text-xs text-muted-foreground/50 text-center py-8">No resources found</p>}
        </div>
      </div>
    </Section>
  )
}
