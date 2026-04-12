import React, { useState } from "react"
import {
  Button, Input, Textarea,
  ToggleGroup, ToggleGroupItem,
  MessageBubble, Avatar, AvatarFallback, Composer
} from "@cherry-studio/ui"
import { Section } from "../components/Section"
import {
  Bold, Italic, List, ListOrdered, Code, Heading2,
  FileText, Search, Plus, Sparkles
} from "lucide-react"

const noteTree = [
  { id: "1", name: "Getting Started", active: false },
  { id: "2", name: "Architecture Notes", active: true },
  { id: "3", name: "Meeting 04/10", active: false },
  { id: "4", name: "API Design", active: false },
  { id: "5", name: "TODO List", active: false },
]

export function NoteModuleDemo() {
  const [content, setContent] = useState(
    "# Architecture Notes\n\nCherry Studio uses a modular architecture with the following key systems:\n\n## Core Modules\n\n- **Chat Engine**: Manages conversations and message routing\n- **Model Service**: Handles LLM provider connections\n- **Knowledge Base**: RAG pipeline for document retrieval\n\n## Design Principles\n\n1. Plugin-based extensibility\n2. Provider-agnostic model layer\n3. Real-time streaming responses"
  )
  const [activeNote, setActiveNote] = useState("2")

  return (
    <Section title="Note Editor Module" code={`// Three-column layout: file tree + editor + AI assistant
// Compose with: Input, Textarea, ToggleGroup, Button, MessageBubble, Composer`}>
      <div className="max-w-4xl rounded-xl border bg-background overflow-hidden h-96">
        <div className="grid grid-cols-[180px_1fr_240px] divide-x divide-border h-full">
          {/* Left: File tree */}
          <div className="flex flex-col">
            <div className="p-2 border-b">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
                <Input placeholder="Search notes..." className="h-7 pl-7 text-[10px] border-0 bg-muted/50 shadow-none" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
              {noteTree.map((n) => (
                <button
                  key={n.id}
                  onClick={() => setActiveNote(n.id)}
                  className={`flex items-center gap-1.5 w-full px-2 py-1.5 rounded-md text-[10px] text-left transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 ${
                    activeNote === n.id ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent/50"
                  }`}
                >
                  <FileText className="size-3 shrink-0" />
                  <span className="truncate">{n.name}</span>
                </button>
              ))}
            </div>
            <div className="p-2 border-t">
              <Button variant="ghost" size="sm" className="w-full h-7 text-[10px]">
                <Plus className="size-3 mr-1" /> New Note
              </Button>
            </div>
          </div>

          {/* Center: Editor */}
          <div className="flex flex-col">
            <div className="flex items-center gap-0.5 px-2 py-1.5 border-b">
              <ToggleGroup type="multiple" className="h-7 gap-0">
                <ToggleGroupItem value="bold" className="size-7 p-0"><Bold className="size-3" /></ToggleGroupItem>
                <ToggleGroupItem value="italic" className="size-7 p-0"><Italic className="size-3" /></ToggleGroupItem>
                <ToggleGroupItem value="h2" className="size-7 p-0"><Heading2 className="size-3" /></ToggleGroupItem>
                <ToggleGroupItem value="ul" className="size-7 p-0"><List className="size-3" /></ToggleGroupItem>
                <ToggleGroupItem value="ol" className="size-7 p-0"><ListOrdered className="size-3" /></ToggleGroupItem>
                <ToggleGroupItem value="code" className="size-7 p-0"><Code className="size-3" /></ToggleGroupItem>
              </ToggleGroup>
            </div>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="flex-1 border-0 rounded-none resize-none focus-visible:ring-0 text-xs leading-relaxed font-mono p-4"
            />
          </div>

          {/* Right: AI Assistant */}
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 px-3 py-2 border-b">
              <Sparkles className="size-3 text-primary" />
              <span className="text-[10px] font-medium">AI Assistant</span>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              <MessageBubble role="assistant" avatar={<Avatar className="size-5"><AvatarFallback className="text-[8px]">🍒</AvatarFallback></Avatar>}>
                <p className="text-[10px]">I can help you with your notes. Try asking me to summarize, expand, or rewrite a section.</p>
              </MessageBubble>
            </div>
            <div className="border-t p-2">
              <div className="flex gap-1 mb-2">
                {["Summarize", "Expand", "Fix"].map((a) => (
                  <Button key={a} variant="outline" size="sm" className="h-6 text-[9px] px-2">{a}</Button>
                ))}
              </div>
              <Composer onSendMessage={() => {}} placeholder="Ask AI..." variant="rounded" />
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}
