import React, { useState } from "react"
import {
  Input, Card, CardContent, Button,
  Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@cherry-studio/ui"
import { Section } from "../components/Section"
import { Search, Plus } from "lucide-react"

interface MiniApp {
  id: string; name: string; emoji: string; color: string; description: string
}

const defaultApps: MiniApp[] = [
  { id: "translate", name: "Translate", emoji: "🌐", color: "bg-blue-500/15", description: "Multi-language translation" },
  { id: "summarize", name: "Summarize", emoji: "📝", color: "bg-green-500/15", description: "Text summarization" },
  { id: "image-gen", name: "Image Gen", emoji: "🎨", color: "bg-purple-500/15", description: "AI image generation" },
  { id: "code-assist", name: "Code Assist", emoji: "💻", color: "bg-orange-500/15", description: "Code helper & debugger" },
  { id: "writing", name: "Writing", emoji: "✍️", color: "bg-pink-500/15", description: "Writing improvement" },
  { id: "math", name: "Math Solver", emoji: "🔢", color: "bg-cyan-500/15", description: "Math & equations" },
  { id: "mindmap", name: "Mind Map", emoji: "🧠", color: "bg-yellow-500/15", description: "Visual brainstorming" },
  { id: "email", name: "Email Draft", emoji: "📧", color: "bg-red-500/15", description: "Email composition" },
  { id: "analysis", name: "Data Analysis", emoji: "📊", color: "bg-emerald-500/15", description: "CSV & data analysis" },
]

export function MiniAppsDemo() {
  const [search, setSearch] = useState("")
  const [apps, setApps] = useState(defaultApps)
  const [newName, setNewName] = useState("")
  const [newEmoji, setNewEmoji] = useState("🚀")
  const [open, setOpen] = useState(false)

  const filtered = apps.filter(a => a.name.toLowerCase().includes(search.toLowerCase()))

  const handleAdd = () => {
    if (!newName.trim()) return
    setApps(prev => [...prev, {
      id: `custom-${Date.now()}`, name: newName, emoji: newEmoji,
      color: "bg-accent/50", description: "Custom mini app",
    }])
    setNewName("")
    setNewEmoji("🚀")
    setOpen(false)
  }

  return (
    <Section title="Mini Apps" install="npm install @cherry-studio/ui">
      <div className="max-w-xl space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search apps..." className="pl-8 h-8 text-xs" />
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-8 text-xs"><Plus size={14} className="mr-1" /> Add App</Button>
            </DialogTrigger>
            <DialogContent className="max-w-xs">
              <DialogHeader>
                <DialogTitle className="text-sm">Add Custom App</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 py-2">
                <div>
                  <label className="text-[10px] text-muted-foreground">Emoji</label>
                  <Input value={newEmoji} onChange={e => setNewEmoji(e.target.value)} className="h-8 text-xs mt-1" />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground">Name</label>
                  <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="App name" className="h-8 text-xs mt-1" />
                </div>
              </div>
              <DialogFooter>
                <Button size="sm" className="text-xs" onClick={handleAdd}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {filtered.map(app => (
            <Card key={app.id} className="p-0 cursor-pointer hover:bg-accent/30 transition-colors">
              <CardContent className="p-3 text-center space-y-1.5">
                <div className={`h-10 w-10 rounded-xl ${app.color} flex items-center justify-center mx-auto text-lg`}>
                  {app.emoji}
                </div>
                <p className="text-xs font-medium">{app.name}</p>
                <p className="text-[10px] text-muted-foreground">{app.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        {filtered.length === 0 && <p className="text-xs text-muted-foreground/50 text-center py-6">No apps found</p>}
      </div>
    </Section>
  )
}
