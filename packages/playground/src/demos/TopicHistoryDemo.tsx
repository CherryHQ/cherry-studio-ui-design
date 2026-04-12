import React, { useState } from "react"
import {
  Input, Badge, Button, Card, CardContent,
  Avatar, AvatarFallback,
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
  ToggleGroup, ToggleGroupItem
} from "@cherry-studio/ui"
import { Section } from "../components/Section"
import { Search, Grid3X3, List, MessageSquare } from "lucide-react"

const topics = [
  { id: "1", title: "React Architecture Discussion", emoji: "⚛️", time: "2 hours ago", messages: 24, tag: "Development" },
  { id: "2", title: "ML Model Comparison", emoji: "🧠", time: "5 hours ago", messages: 18, tag: "Research" },
  { id: "3", title: "API Design Review", emoji: "🔌", time: "Yesterday", messages: 42, tag: "Development" },
  { id: "4", title: "Product Roadmap Q3", emoji: "🗺️", time: "Yesterday", messages: 15, tag: "Planning" },
  { id: "5", title: "Bug Investigation #342", emoji: "🐛", time: "2 days ago", messages: 31, tag: "Development" },
  { id: "6", title: "UX Research Findings", emoji: "🎨", time: "3 days ago", messages: 8, tag: "Design" },
]

const allTags = ["All", "Development", "Research", "Planning", "Design"]

export function TopicHistoryDemo() {
  const [search, setSearch] = useState("")
  const [view, setView] = useState("grid")
  const [sort, setSort] = useState("recent")
  const [activeTag, setActiveTag] = useState("All")

  const filtered = topics.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase())
    const matchTag = activeTag === "All" || t.tag === activeTag
    return matchSearch && matchTag
  })

  return (
    <Section title="Topic History" install="npm install @cherry-studio/ui">
      <div className="max-w-xl space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search topics..."
              className="pl-8 h-8 text-xs"
            />
          </div>
          <ToggleGroup type="single" value={view} onValueChange={v => v && setView(v)} className="h-8">
            <ToggleGroupItem value="grid" className="h-8 w-8 p-0"><Grid3X3 size={14} /></ToggleGroupItem>
            <ToggleGroupItem value="list" className="h-8 w-8 p-0"><List size={14} /></ToggleGroupItem>
          </ToggleGroup>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-28 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="messages">Most Messages</SelectItem>
              <SelectItem value="name">Name A-Z</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-1.5 flex-wrap">
          {allTags.map(tag => (
            <Button
              key={tag}
              variant={activeTag === tag ? "default" : "outline"}
              size="sm"
              className="h-6 text-[10px] px-2.5"
              onClick={() => setActiveTag(tag)}
            >
              {tag}
            </Button>
          ))}
        </div>

        <div className={view === "grid" ? "grid grid-cols-2 gap-2" : "space-y-1.5"}>
          {filtered.map(topic => (
            <Card key={topic.id} className="cursor-pointer hover:bg-accent/30 transition-colors p-0">
              <CardContent className={view === "grid" ? "p-3 space-y-2" : "p-2.5 flex items-center gap-3"}>
                <Avatar className={view === "grid" ? "h-9 w-9" : "h-7 w-7"}>
                  <AvatarFallback className="text-sm">{topic.emoji}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{topic.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-muted-foreground">{topic.time}</span>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                      <MessageSquare size={9} /> {topic.messages}
                    </span>
                  </div>
                </div>
                <Badge variant="outline" className="text-[9px] shrink-0">{topic.tag}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
        {filtered.length === 0 && (
          <p className="text-xs text-muted-foreground/50 text-center py-6">No topics found</p>
        )}
      </div>
    </Section>
  )
}
