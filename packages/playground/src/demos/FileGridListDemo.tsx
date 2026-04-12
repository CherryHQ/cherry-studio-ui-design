import React, { useState } from "react"
import {
  Card, Badge, Button, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
  ToggleGroup, ToggleGroupItem
} from "@cherry-studio/ui"
import { Section } from "../components/Section"
import {
  LayoutGrid, List, Search, FileText, Image, FileCode, FolderOpen,
  MoreHorizontal, Download, Trash2
} from "lucide-react"

interface FileItem {
  id: string
  name: string
  type: "document" | "image" | "code" | "folder"
  size: string
  modified: string
}

const files: FileItem[] = [
  { id: "1", name: "Project Brief.pdf", type: "document", size: "2.4 MB", modified: "2 hours ago" },
  { id: "2", name: "screenshot.png", type: "image", size: "540 KB", modified: "Yesterday" },
  { id: "3", name: "main.tsx", type: "code", size: "12 KB", modified: "3 days ago" },
  { id: "4", name: "Assets", type: "folder", size: "—", modified: "1 week ago" },
  { id: "5", name: "README.md", type: "document", size: "8 KB", modified: "2 days ago" },
  { id: "6", name: "logo.svg", type: "image", size: "24 KB", modified: "5 days ago" },
  { id: "7", name: "utils.ts", type: "code", size: "4 KB", modified: "Yesterday" },
  { id: "8", name: "Components", type: "folder", size: "—", modified: "3 days ago" },
]

const typeIcons: Record<FileItem["type"], React.ReactNode> = {
  document: <FileText className="size-5 text-blue-500" />,
  image: <Image className="size-5 text-green-500" />,
  code: <FileCode className="size-5 text-amber-500" />,
  folder: <FolderOpen className="size-5 text-muted-foreground" />,
}

const smallTypeIcons: Record<FileItem["type"], React.ReactNode> = {
  document: <FileText className="size-4 text-blue-500" />,
  image: <Image className="size-4 text-green-500" />,
  code: <FileCode className="size-4 text-amber-500" />,
  folder: <FolderOpen className="size-4 text-muted-foreground" />,
}

export function FileGridListDemo() {
  const [view, setView] = useState("grid")
  const [search, setSearch] = useState("")

  const filtered = files.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Section title="File Grid / List View Toggle" code={`import { ToggleGroup, ToggleGroupItem, Card, Table } from "@cherry-studio/ui"

<ToggleGroup type="single" value={view} onValueChange={setView}>
  <ToggleGroupItem value="grid"><LayoutGrid /></ToggleGroupItem>
  <ToggleGroupItem value="list"><List /></ToggleGroupItem>
</ToggleGroup>

{view === "grid" ? <GridView files={files} /> : <ListView files={files} />}`}>
      <div className="max-w-3xl space-y-3">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-60">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search files..."
              className="pl-8 h-8 text-xs"
            />
          </div>
          <ToggleGroup type="single" value={view} onValueChange={(v) => v && setView(v)} className="h-8">
            <ToggleGroupItem value="grid" className="size-8 p-0"><LayoutGrid className="size-3.5" /></ToggleGroupItem>
            <ToggleGroupItem value="list" className="size-8 p-0"><List className="size-3.5" /></ToggleGroupItem>
          </ToggleGroup>
        </div>

        {/* Grid View */}
        {view === "grid" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {filtered.map((file) => (
              <Card key={file.id} className="p-3 cursor-pointer hover:bg-accent/50 transition-colors group">
                <div className="flex items-start justify-between">
                  {typeIcons[file.type]}
                  <Button variant="ghost" size="icon" className="size-6 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="size-3.5" />
                  </Button>
                </div>
                <p className="text-xs font-medium mt-2 truncate">{file.name}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{file.size} · {file.modified}</p>
              </Card>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="w-20">Size</TableHead>
                  <TableHead className="w-28">Modified</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((file) => (
                  <TableRow key={file.id} className="cursor-pointer">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {smallTypeIcons[file.type]}
                        <span className="text-xs font-medium">{file.name}</span>
                        {file.type === "folder" && (
                          <Badge variant="secondary" className="text-[9px] px-1.5 py-0">folder</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{file.size}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{file.modified}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="size-6">
                        <MoreHorizontal className="size-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <p className="text-xs text-muted-foreground">{filtered.length} items</p>
      </div>
    </Section>
  )
}
