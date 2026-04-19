import React, { useState } from "react"
import {
  ChatContainer, MessageList, MessageBubble, PromptInput,
  Avatar, AvatarFallback, Button, Badge, Separator, Slider,
  ThinkingBlock, CodeBlock, ToolCallCard, MultimodalMessage,
} from "@cherry-studio/ui"
import { Section, type PropDef } from "../components/Section"
import { Copy, ThumbsUp, Trash2, Inbox, Settings2, Thermometer, Cpu } from "lucide-react"

/* ═══════════════════════════════════════════
   Types
   ═══════════════════════════════════════════ */

interface Message {
  role: "user" | "assistant"
  content: string
  timestamp: string
  type?: "text" | "code" | "thinking" | "multimodal" | "tool-call"
  meta?: Record<string, unknown>
}

/* ═══════════════════════════════════════════
   Mock data — 8+ messages covering all types
   ═══════════════════════════════════════════ */

const initialMessages: Message[] = [
  { role: "user", content: "What models does Cherry Studio support?", timestamp: "2:30 PM", type: "text" },
  {
    role: "assistant", timestamp: "2:30 PM", type: "text",
    content:
      "Cherry Studio supports a wide range of LLM providers including OpenAI (GPT-4o, GPT-4o Mini), Anthropic (Claude Opus 4, Claude Sonnet 4), Google (Gemini 2.5 Pro), and local models via Ollama. You can configure multiple providers simultaneously and switch between them per conversation.",
  },
  { role: "user", content: "Show me how to configure a new provider in code", timestamp: "2:31 PM", type: "text" },
  {
    role: "assistant", timestamp: "2:31 PM", type: "code",
    content: "Here's a minimal provider configuration:",
    meta: {
      code: `import { ProviderConfig } from "@cherry-studio/core"

const config: ProviderConfig = {
  id: "openai",
  name: "OpenAI",
  apiKey: process.env.OPENAI_API_KEY,
  baseUrl: "https://api.openai.com/v1",
  models: ["gpt-4o", "gpt-4o-mini"],
}`,
      language: "typescript",
    },
  },
  {
    role: "user", timestamp: "2:32 PM", type: "multimodal",
    content: "Here's a screenshot of my current settings — can you spot any issues?",
    meta: { images: [{ src: "", alt: "Settings screenshot", emoji: "📸" }] },
  },
  {
    role: "assistant", timestamp: "2:32 PM", type: "thinking",
    content: "Looking at your configuration, everything looks correct. The API key is properly set and the base URL matches the official endpoint.",
    meta: {
      thinking: "The user shared a screenshot. Let me analyze the settings panel. The API key field is filled, base URL looks standard. Model list includes gpt-4o — that's correct. Temperature is set to 0.7 which is reasonable. No obvious issues.",
      duration: 3.2,
    },
  },
  { role: "user", content: "Can you search the docs for rate limiting info?", timestamp: "2:33 PM", type: "text" },
  {
    role: "assistant", timestamp: "2:33 PM", type: "tool-call",
    content: "I found the rate limiting documentation. OpenAI's GPT-4o has a default rate limit of 10,000 RPM for Tier 5 accounts.",
    meta: {
      toolName: "search_docs",
      args: JSON.stringify({ query: "rate limiting", scope: "openai" }, null, 2),
      status: "done" as const,
      result: JSON.stringify({ found: 3, topResult: "OpenAI Rate Limits — Tier 5: 10,000 RPM" }),
    },
  },
]

/* ═══════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════ */

function ActionBtn({ icon: Icon, onClick }: { icon: React.ElementType; onClick?: () => void }) {
  return (
    <Button variant="ghost" type="button" onClick={onClick} className="h-auto px-0 py-0 font-normal tracking-normal p-1 rounded-sm text-muted-foreground/40 hover:text-muted-foreground hover:bg-accent/50 transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
      <Icon size={12} />
    </Button>
  )
}

function now() {
  return new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
}

function renderMessageContent(msg: Message) {
  switch (msg.type) {
    case "code":
      return (
        <div className="space-y-2">
          <p className="text-sm">{msg.content}</p>
          <CodeBlock
            code={(msg.meta?.code as string) ?? ""}
            language={(msg.meta?.language as string) ?? "text"}
          />
        </div>
      )
    case "thinking":
      return (
        <div className="space-y-2">
          <ThinkingBlock
            content={(msg.meta?.thinking as string) ?? ""}
            duration={msg.meta?.duration as number}
          />
          <p className="text-sm">{msg.content}</p>
        </div>
      )
    case "multimodal":
      return (
        <div className="space-y-2">
          <p className="text-sm">{msg.content}</p>
          <MultimodalMessage
            images={(msg.meta?.images as Array<{ src: string; alt: string; emoji?: string }>)?.map(img => ({
              src: img.src,
              alt: img.alt,
            }))}
          />
        </div>
      )
    case "tool-call":
      return (
        <div className="space-y-2">
          <ToolCallCard
            toolName={(msg.meta?.toolName as string) ?? ""}
            args={typeof msg.meta?.args === "string" ? JSON.parse(msg.meta.args) : (msg.meta?.args as Record<string, unknown>) ?? {}}
            status={(msg.meta?.status as "done" | "error" | "pending" | "running") ?? "done"}
            result={msg.meta?.result as string}
          />
          <p className="text-sm">{msg.content}</p>
        </div>
      )
    default:
      return <>{msg.content}</>
  }
}

/* ═══════════════════════════════════════════
   Settings Panel
   ═══════════════════════════════════════════ */

function SettingsPanel({ temperature, setTemperature, model, setModel }: {
  temperature: number; setTemperature: (v: number) => void
  model: string; setModel: (v: string) => void
}) {
  const models = ["Claude Sonnet 4", "GPT-4o", "Gemini 2.5 Pro", "DeepSeek V3"]
  return (
    <div className="w-[220px] border-l bg-background/95 p-4 space-y-4 overflow-y-auto">
      <div className="flex items-center gap-1.5">
        <Settings2 size={12} className="text-muted-foreground" />
        <span className="text-xs font-medium text-foreground/70">对话设置</span>
      </div>
      <Separator />
      <div className="space-y-2">
        <label className="text-xs text-muted-foreground/70 uppercase tracking-wider">模型</label>
        <div className="space-y-1">
          {models.map(m => (
            <Button
              key={m}
              variant="ghost"
              size="sm"
              onClick={() => setModel(m)}
              className={`w-full justify-start px-2.5 py-1.5 h-auto rounded-[8px] text-xs ${m === model ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-accent/50"}`}
            >
              {m}
            </Button>
          ))}
        </div>
      </div>
      <Separator />
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Thermometer size={10} className="text-muted-foreground/50" />
            <label className="text-xs text-muted-foreground/70 uppercase tracking-wider">温度</label>
          </div>
          <span className="text-xs text-foreground/60 tabular-nums font-medium">{temperature.toFixed(1)}</span>
        </div>
        <Slider
          min={0} max={2} step={0.1}
          value={[temperature]}
          onValueChange={v => setTemperature(v[0])}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground/60">
          <span>精确</span><span>创造性</span>
        </div>
      </div>
      <Separator />
      <div className="space-y-1.5">
        <label className="text-xs text-muted-foreground/70 uppercase tracking-wider">Token 用量</label>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground/60">输入</span>
          <span className="text-xs text-foreground/50 tabular-nums">12,480</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground/60">输出</span>
          <span className="text-xs text-foreground/50 tabular-nums">8,320</span>
        </div>
        <div className="h-[2px] rounded-full bg-muted/30 overflow-hidden mt-1">
          <div className="h-full rounded-full bg-primary/40" style={{ width: "42%" }} />
        </div>
        <span className="text-xs text-muted-foreground/50">42% of context window</span>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   Props
   ═══════════════════════════════════════════ */

const chatModuleProps: PropDef[] = [
  { name: "hasMessages", type: "boolean", default: "true", description: "Whether there are messages" },
  { name: "onSendMessage", type: "(text: string) => void", default: "required", description: "Send message handler" },
]

/* ═══════════════════════════════════════════
   Main Demo
   ═══════════════════════════════════════════ */

export function ChatModuleDemo() {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [showSettings, setShowSettings] = useState(true)
  const [temperature, setTemperature] = useState(0.7)
  const [model, setModel] = useState("Claude Sonnet 4")
  const [promptValue, setPromptValue] = useState("")
  const [likedMsgs, setLikedMsgs] = useState<Set<number>>(new Set())

  const handleSend = () => {
    const text = promptValue.trim()
    if (!text) return
    const ts = now()
    setMessages(prev => [
      ...prev,
      { role: "user", content: text, timestamp: ts, type: "text" },
      {
        role: "assistant", timestamp: ts, type: "text",
        content: `Great question! Here's what I can tell you about "${text}" — Cherry Studio makes it easy to explore, configure, and iterate. Let me know if you need more details.`,
      },
    ])
    setPromptValue("")
  }

  const handleClear = () => setMessages([])

  return (
    <Section title="Chat Module" install="npm install @cherry-studio/ui" props={chatModuleProps} code={`<ChatContainer hasMessages={messages.length > 0} emptyState={<p>No messages</p>}>
  <MessageList scrollDeps={[messages.length]}>
    {messages.map((msg, i) => (
      <MessageBubble key={i} role={msg.role} name={msg.role === "user" ? "You" : "AI"}>
        {renderMessageContent(msg)}
      </MessageBubble>
    ))}
  </MessageList>
  <PromptInput value={value} onChange={setValue} onSubmit={handleSend} />
</ChatContainer>`}>
      <div className="space-y-3">
        {/* Header bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground/80">Cherry Studio 功能问答</span>
            <Badge variant="outline" className="text-xs gap-1">
              <Cpu size={9} /> {model}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {messages.length} messages
            </Badge>
          </div>
          <div className="flex items-center gap-1.5">
            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setShowSettings(s => !s)}>
              <Settings2 size={12} className="mr-1" /> Settings
            </Button>
            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={handleClear}>
              <Trash2 size={12} className="mr-1" /> Clear
            </Button>
          </div>
        </div>

        {/* Chat area with optional settings panel */}
        <div className="flex h-[600px] border rounded-[12px] overflow-hidden bg-background">
          {/* Main chat */}
          <div className="flex-1 min-w-0">
            <ChatContainer
              hasMessages={messages.length > 0}
              emptyState={
                <div className="text-center space-y-2">
                  <Inbox className="h-10 w-10 mx-auto text-muted-foreground/30" />
                  <p className="text-sm font-medium text-muted-foreground/60">No messages yet</p>
                  <p className="text-xs text-muted-foreground/60">Type a message below to start chatting</p>
                </div>
              }
            >
              <MessageList scrollDeps={[messages.length]}>
                {messages.map((msg, i) => (
                  <MessageBubble
                    key={i}
                    role={msg.role}
                    timestamp={msg.timestamp}
                    avatar={
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="text-[10px]">
                          {msg.role === "user" ? "You" : "🍒"}
                        </AvatarFallback>
                      </Avatar>
                    }
                    name={msg.role === "user" ? "You" : "Cherry AI"}
                    actions={
                      msg.role === "assistant" ? (
                        <>
                          <ActionBtn icon={Copy} onClick={() => navigator.clipboard.writeText(String(msg.content))} />
                          <ActionBtn icon={likedMsgs.has(i) ? ThumbsUp : ThumbsUp} onClick={() => setLikedMsgs(prev => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n })} />
                        </>
                      ) : undefined
                    }
                  >
                    {renderMessageContent(msg)}
                  </MessageBubble>
                ))}
              </MessageList>
              <div className="p-3 border-t">
                <PromptInput
                  value={promptValue}
                  onChange={setPromptValue}
                  onSubmit={handleSend}
                  placeholder="Ask Cherry AI anything... (use @ to mention)"
                  modelName={model}
                />
              </div>
            </ChatContainer>
          </div>

          {/* Settings side panel */}
          {showSettings && (
            <SettingsPanel
              temperature={temperature}
              setTemperature={setTemperature}
              model={model}
              setModel={setModel}
            />
          )}
        </div>
      </div>
    </Section>
  )
}
