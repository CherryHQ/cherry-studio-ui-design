import React, { useState } from "react"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  Button, Badge, Avatar, AvatarFallback, ScrollArea,
  Textarea
} from "@cherry-studio/ui"
import { Section } from "../components/Section"
import { ArrowLeftRight, Copy, Trash2, Volume2, Check } from "lucide-react"

const languages = [
  { value: "zh", label: "中文" },
  { value: "en", label: "English" },
  { value: "ja", label: "日本語" },
  { value: "ko", label: "한국어" },
  { value: "fr", label: "Français" },
  { value: "de", label: "Deutsch" },
]

const experts = [
  { id: "1", name: "Standard", emoji: "🌐" },
  { id: "2", name: "Literary", emoji: "📖" },
  { id: "3", name: "Technical", emoji: "⚙️" },
  { id: "4", name: "Casual", emoji: "😊" },
  { id: "5", name: "Business", emoji: "💼" },
  { id: "6", name: "Academic", emoji: "🎓" },
]

export function TranslateModuleDemo() {
  const [source, setSource] = useState("zh")
  const [target, setTarget] = useState("en")
  const [text, setText] = useState("Cherry Studio 是一个 AI 驱动的开发环境，支持多种 LLM 服务商、知识库和自主代理。")
  const [result] = useState("Cherry Studio is an AI-powered development environment that supports multiple LLM providers, knowledge bases, and autonomous agents.")
  const [copied, setCopied] = useState(false)
  const [activeExpert, setActiveExpert] = useState("1")

  const handleCopy = () => {
    navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const swap = () => {
    setSource(target)
    setTarget(source)
  }

  return (
    <Section title="Translate Module" code={`// Compose with: Select, Button, Textarea, Avatar, ScrollArea
<div className="grid grid-cols-2 gap-4">
  <Textarea value={source} onChange={...} />
  <Textarea value={result} readOnly />
</div>`}>
      <div className="max-w-3xl rounded-xl border bg-background overflow-hidden">
        {/* Language bar */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b bg-muted/30">
          <Select value={source} onValueChange={setSource}>
            <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {languages.map((l) => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="ghost" size="icon" className="size-8" onClick={swap}>
            <ArrowLeftRight className="size-3.5" />
          </Button>
          <Select value={target} onValueChange={setTarget}>
            <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {languages.map((l) => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="flex-1" />
          <Badge variant="outline" className="text-[10px]">GPT-4o</Badge>
        </div>

        {/* Translation area */}
        <div className="grid md:grid-cols-2 divide-x divide-border">
          {/* Source */}
          <div className="flex flex-col">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter text to translate..."
              className="flex-1 min-h-40 border-0 rounded-none resize-none focus-visible:ring-0 text-sm"
            />
            <div className="flex items-center gap-1 px-3 py-1.5 border-t">
              <Button variant="ghost" size="icon" className="size-6"><Volume2 className="size-3" /></Button>
              <div className="flex-1" />
              <span className="text-[10px] text-muted-foreground">{text.length} chars</span>
              <Button variant="ghost" size="icon" className="size-6" onClick={() => setText("")}><Trash2 className="size-3" /></Button>
            </div>
          </div>
          {/* Target */}
          <div className="flex flex-col bg-muted/20">
            <Textarea
              value={result}
              readOnly
              className="flex-1 min-h-40 border-0 rounded-none resize-none focus-visible:ring-0 text-sm bg-transparent"
            />
            <div className="flex items-center gap-1 px-3 py-1.5 border-t">
              <Button variant="ghost" size="icon" className="size-6"><Volume2 className="size-3" /></Button>
              <div className="flex-1" />
              <Button variant="ghost" size="icon" className="size-6" onClick={handleCopy}>
                {copied ? <Check className="size-3 text-primary" /> : <Copy className="size-3" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Expert selector */}
        <div className="border-t px-4 py-2.5">
          <p className="text-[10px] text-muted-foreground mb-2">Translation Expert</p>
          <ScrollArea className="w-full">
            <div className="flex gap-2">
              {experts.map((e) => (
                <button
                  key={e.id}
                  onClick={() => setActiveExpert(e.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 ${
                    activeExpert === e.id ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent/50"
                  }`}
                >
                  <span>{e.emoji}</span>
                  <span>{e.name}</span>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </Section>
  )
}
