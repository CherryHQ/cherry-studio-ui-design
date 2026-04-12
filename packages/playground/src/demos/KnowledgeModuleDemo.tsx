import React, { useState } from "react"
import {
  Tabs, TabsList, TabsTrigger, TabsContent,
  Button, Badge, Card, Input, Slider, Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  Progress
} from "@cherry-studio/ui"
import { Section } from "../components/Section"
import { Database, FileText, Search, Plus, Settings, Zap, Upload } from "lucide-react"

const knowledgeBases = [
  { id: "1", name: "Product Docs", count: 142, status: "ready" },
  { id: "2", name: "API Reference", count: 89, status: "ready" },
  { id: "3", name: "Internal Wiki", count: 256, status: "indexing" },
  { id: "4", name: "Support Tickets", count: 1024, status: "ready" },
]

const searchResults = [
  { id: "1", title: "Getting Started Guide", score: 0.95, source: "Product Docs", snippet: "Cherry Studio supports multiple AI model providers..." },
  { id: "2", title: "API Authentication", score: 0.87, source: "API Reference", snippet: "All API requests require a valid API key..." },
  { id: "3", title: "Deployment Guide", score: 0.72, source: "Internal Wiki", snippet: "Follow these steps to deploy Cherry Studio..." },
]

export function KnowledgeModuleDemo() {
  const [activeKb, setActiveKb] = useState("1")
  const [query, setQuery] = useState("")
  const [chunkSize, setChunkSize] = useState([512])
  const [topK, setTopK] = useState([5])

  return (
    <Section title="Knowledge Base Module" code={`// Compose with: Tabs, Card, Input, Slider, Select, Progress, Badge, Button`}>
      <div className="max-w-3xl rounded-xl border bg-background overflow-hidden">
        <div className="grid md:grid-cols-[200px_1fr] divide-x divide-border">
          {/* Left: KB list */}
          <div className="p-3 space-y-1">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium">Knowledge Bases</p>
              <Button variant="ghost" size="icon" className="size-6"><Plus className="size-3" /></Button>
            </div>
            {knowledgeBases.map((kb) => (
              <button
                key={kb.id}
                onClick={() => setActiveKb(kb.id)}
                className={`flex items-center gap-2 w-full px-2.5 py-2 rounded-md text-xs transition-colors text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  activeKb === kb.id ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent/50"
                }`}
              >
                <Database className="size-3.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="truncate">{kb.name}</div>
                  <div className="text-[10px] text-muted-foreground/60">{kb.count} docs</div>
                </div>
                <Badge variant={kb.status === "indexing" ? "secondary" : "outline"} className="text-[9px] px-1.5">
                  {kb.status}
                </Badge>
              </button>
            ))}
          </div>

          {/* Right: Tabs */}
          <div className="p-4">
            <Tabs defaultValue="sources">
              <TabsList className="h-8 mb-3">
                <TabsTrigger value="sources" className="text-xs h-7"><FileText className="size-3 mr-1" /> Sources</TabsTrigger>
                <TabsTrigger value="settings" className="text-xs h-7"><Settings className="size-3 mr-1" /> RAG Settings</TabsTrigger>
                <TabsTrigger value="test" className="text-xs h-7"><Zap className="size-3 mr-1" /> Test</TabsTrigger>
              </TabsList>

              <TabsContent value="sources" className="space-y-3">
                <Button variant="outline" size="sm" className="w-full"><Upload className="size-3.5 mr-1.5" /> Upload Documents</Button>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-md border text-xs">
                    <FileText className="size-3.5 text-muted-foreground shrink-0" />
                    <span className="flex-1 truncate">document-{i}.pdf</span>
                    <Badge variant="outline" className="text-[9px]">{(i * 12.5).toFixed(1)} KB</Badge>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs"><span>Chunk Size</span><span className="text-muted-foreground tabular-nums">{chunkSize[0]}</span></div>
                  <Slider value={chunkSize} onValueChange={setChunkSize} min={128} max={2048} step={128} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs"><span>Top K Results</span><span className="text-muted-foreground tabular-nums">{topK[0]}</span></div>
                  <Slider value={topK} onValueChange={setTopK} min={1} max={20} step={1} />
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs">Embedding Model</p>
                  <Select defaultValue="text-embedding-3-small">
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text-embedding-3-small">text-embedding-3-small</SelectItem>
                      <SelectItem value="text-embedding-3-large">text-embedding-3-large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              <TabsContent value="test" className="space-y-3">
                <div className="flex gap-2">
                  <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Enter a test query..." className="h-8 text-xs" />
                  <Button size="sm" className="h-8"><Search className="size-3.5 mr-1" /> Search</Button>
                </div>
                {searchResults.map((r) => (
                  <Card key={r.id} className="p-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium">{r.title}</span>
                      <Badge variant="outline" className="text-[9px] tabular-nums">{(r.score * 100).toFixed(0)}%</Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-2">{r.snippet}</p>
                    <div className="flex items-center gap-2">
                      <Progress value={r.score * 100} className="h-1 flex-1" />
                      <span className="text-[9px] text-muted-foreground">{r.source}</span>
                    </div>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Section>
  )
}
