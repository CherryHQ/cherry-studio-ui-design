import React, { useState } from "react"
import {
  Input, Badge, Button, Card, CardContent,
  Tabs, TabsList, TabsTrigger, TabsContent
} from "@cherry-studio/ui"
import { Section } from "../components/Section"
import { Search, Download, Check, Globe, Code2, Image, FileText, Palette, Terminal } from "lucide-react"

interface Extension {
  id: string; name: string; description: string; version: string; icon: React.ElementType
  installed: boolean; recommended?: boolean
}

const extensions: Extension[] = [
  { id: "web", name: "Web Search Pro", description: "Enhanced web search with multi-engine support and result caching", version: "2.1.0", icon: Globe, installed: true },
  { id: "code", name: "Code Interpreter", description: "Execute Python, JavaScript, and Shell code in sandboxed environments", version: "3.0.2", icon: Code2, installed: true },
  { id: "img", name: "Image Generator", description: "Generate images using DALL-E 3, Midjourney, and Stable Diffusion APIs", version: "1.4.1", icon: Image, installed: false, recommended: true },
  { id: "doc", name: "Doc Converter", description: "Convert between PDF, DOCX, Markdown, and HTML formats", version: "1.2.0", icon: FileText, installed: false, recommended: true },
  { id: "theme", name: "Theme Studio", description: "Create and share custom Cherry Studio themes", version: "0.9.3", icon: Palette, installed: false },
  { id: "term", name: "Terminal Bridge", description: "Connect to local terminal for system command execution", version: "1.0.0", icon: Terminal, installed: true },
]

export function ExtensionsDemo() {
  const [search, setSearch] = useState("")
  const [installed, setInstalled] = useState<Record<string, boolean>>(
    Object.fromEntries(extensions.map(e => [e.id, e.installed]))
  )

  const filter = (list: Extension[]) =>
    list.filter(e => e.name.toLowerCase().includes(search.toLowerCase()))

  const allExts = filter(extensions)
  const installedExts = filter(extensions.filter(e => installed[e.id]))
  const recommendedExts = filter(extensions.filter(e => e.recommended))

  const ExtCard = ({ ext }: { ext: Extension }) => (
    <Card className="p-0">
      <CardContent className="p-3 space-y-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-accent/50 flex items-center justify-center">
              <ext.icon size={16} className="text-foreground/70" />
            </div>
            <div>
              <p className="text-xs font-medium">{ext.name}</p>
              <Badge variant="outline" className="text-[9px] mt-0.5">v{ext.version}</Badge>
            </div>
          </div>
          <Button
            size="sm"
            variant={installed[ext.id] ? "outline" : "default"}
            className="h-6 text-[10px] px-2"
            onClick={() => setInstalled(s => ({ ...s, [ext.id]: !s[ext.id] }))}
          >
            {installed[ext.id] ? <><Check size={10} className="mr-0.5" /> Installed</> : <><Download size={10} className="mr-0.5" /> Install</>}
          </Button>
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">{ext.description}</p>
      </CardContent>
    </Card>
  )

  return (
    <Section title="Extensions Market" install="npm install @cherry-studio/ui">
      <div className="max-w-xl space-y-3">
        <Tabs defaultValue="all">
          <div className="flex items-center gap-2 mb-3">
            <TabsList className="h-8">
              <TabsTrigger value="all" className="text-xs h-6">All</TabsTrigger>
              <TabsTrigger value="installed" className="text-xs h-6">Installed ({Object.values(installed).filter(Boolean).length})</TabsTrigger>
              <TabsTrigger value="recommended" className="text-xs h-6">Recommended</TabsTrigger>
            </TabsList>
            <div className="relative flex-1">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search extensions..." className="pl-8 h-8 text-xs" />
            </div>
          </div>

          <TabsContent value="all">
            <div className="grid grid-cols-2 gap-2">
              {allExts.map(e => <ExtCard key={e.id} ext={e} />)}
            </div>
          </TabsContent>
          <TabsContent value="installed">
            <div className="grid grid-cols-2 gap-2">
              {installedExts.map(e => <ExtCard key={e.id} ext={e} />)}
            </div>
            {installedExts.length === 0 && <p className="text-xs text-muted-foreground/50 text-center py-6">No installed extensions</p>}
          </TabsContent>
          <TabsContent value="recommended">
            <div className="grid grid-cols-2 gap-2">
              {recommendedExts.map(e => <ExtCard key={e.id} ext={e} />)}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Section>
  )
}
