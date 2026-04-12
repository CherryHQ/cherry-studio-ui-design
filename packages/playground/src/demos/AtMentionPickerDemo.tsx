import React, { useState, useRef } from "react"
import {
  Input, Avatar, AvatarFallback, Badge,
  Popover, PopoverContent, PopoverAnchor,
  Tabs, TabsList, TabsTrigger, TabsContent,
  ScrollArea
} from "@cherry-studio/ui"
import { Section } from "../components/Section"

interface MentionItem {
  id: string; name: string; description: string; emoji: string; category: "agent" | "assistant" | "knowledge"
}

const mentionItems: MentionItem[] = [
  { id: "1", name: "Research Agent", description: "Web research & analysis", emoji: "🔬", category: "agent" },
  { id: "2", name: "Code Reviewer", description: "PR review & suggestions", emoji: "🤖", category: "agent" },
  { id: "3", name: "Writing Assistant", description: "Polish & improve writing", emoji: "✍️", category: "assistant" },
  { id: "4", name: "Translator", description: "Multi-language translation", emoji: "🌐", category: "assistant" },
  { id: "5", name: "Data Analyst", description: "CSV & chart analysis", emoji: "📊", category: "assistant" },
  { id: "6", name: "API Docs", description: "REST API reference (234 docs)", emoji: "📚", category: "knowledge" },
  { id: "7", name: "ML Papers", description: "Machine learning papers (512)", emoji: "🧠", category: "knowledge" },
  { id: "8", name: "Company Wiki", description: "Internal documentation (89)", emoji: "📖", category: "knowledge" },
]

export function AtMentionPickerDemo() {
  const [value, setValue] = useState("")
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    setValue(v)
    const atIdx = v.lastIndexOf("@")
    if (atIdx >= 0 && (atIdx === 0 || v[atIdx - 1] === " ")) {
      setFilter(v.slice(atIdx + 1).toLowerCase())
      setOpen(true)
    } else {
      setOpen(false)
    }
  }

  const handleSelect = (item: MentionItem) => {
    const atIdx = value.lastIndexOf("@")
    setValue(value.slice(0, atIdx) + `@${item.name} `)
    setOpen(false)
    inputRef.current?.focus()
  }

  const filteredItems = (cat: MentionItem["category"]) =>
    mentionItems.filter(i => i.category === cat && i.name.toLowerCase().includes(filter))

  const MentionList = ({ items }: { items: MentionItem[] }) => (
    <div className="space-y-0.5">
      {items.map(item => (
        <button
          key={item.id}
          className="w-full flex items-center gap-2 p-1.5 rounded-md hover:bg-accent/50 transition-colors text-left"
          onClick={() => handleSelect(item)}
        >
          <Avatar className="h-6 w-6">
            <AvatarFallback className="text-xs">{item.emoji}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">{item.name}</p>
            <p className="text-[10px] text-muted-foreground truncate">{item.description}</p>
          </div>
        </button>
      ))}
      {items.length === 0 && <p className="text-[10px] text-muted-foreground/50 text-center py-2">No results</p>}
    </div>
  )

  return (
    <Section title="@Mention Picker" install="npm install @cherry-studio/ui">
      <div className="max-w-md space-y-3">
        <p className="text-xs text-muted-foreground">Type "@" in the input below to trigger the mention picker.</p>

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverAnchor asChild>
            <Input
              ref={inputRef}
              value={value}
              onChange={handleChange}
              placeholder='Try typing "@" to mention an agent or knowledge base...'
              className="h-9 text-xs"
            />
          </PopoverAnchor>
          <PopoverContent className="w-72 p-2" align="start" side="bottom" onOpenAutoFocus={e => e.preventDefault()}>
            <Tabs defaultValue="agent">
              <TabsList className="w-full h-7 mb-2">
                <TabsTrigger value="agent" className="text-[10px] h-5 flex-1">Agents</TabsTrigger>
                <TabsTrigger value="assistant" className="text-[10px] h-5 flex-1">Assistants</TabsTrigger>
                <TabsTrigger value="knowledge" className="text-[10px] h-5 flex-1">Knowledge</TabsTrigger>
              </TabsList>
              <ScrollArea className="h-40">
                <TabsContent value="agent" className="mt-0">
                  <MentionList items={filteredItems("agent")} />
                </TabsContent>
                <TabsContent value="assistant" className="mt-0">
                  <MentionList items={filteredItems("assistant")} />
                </TabsContent>
                <TabsContent value="knowledge" className="mt-0">
                  <MentionList items={filteredItems("knowledge")} />
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </PopoverContent>
        </Popover>

        {value.includes("@") && (
          <div className="flex flex-wrap gap-1">
            {value.match(/@[\w\s]+/g)?.map((mention, i) => (
              <Badge key={i} variant="secondary" className="text-[10px]">{mention.trim()}</Badge>
            ))}
          </div>
        )}
      </div>
    </Section>
  )
}
