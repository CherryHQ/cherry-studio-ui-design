import React, { useState } from "react"
import {
  ChatContainer, MessageList, MessageBubble, Composer,
  Avatar, AvatarFallback, Button
} from "@cherry-studio/ui"
import { Section, type PropDef } from "../components/Section"
import { Copy, ThumbsUp, Trash2, Inbox } from "lucide-react"

interface Message {
  role: "user" | "assistant"
  content: string
  timestamp: string
}

function ActionBtn({ icon: Icon }: { icon: React.ElementType }) {
  return (
    <Button variant="ghost" type="button" className="h-auto px-0 py-0 font-normal tracking-normal p-1 rounded-sm text-muted-foreground/40 hover:text-muted-foreground hover:bg-accent/50 transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
      <Icon size={12} />
    </Button>
  )
}

const initialMessages: Message[] = [
  { role: "user", content: "What models does Cherry Studio support?", timestamp: "2:30 PM" },
  {
    role: "assistant",
    content:
      "Cherry Studio supports a wide range of LLM providers including OpenAI (GPT-4o, GPT-4o Mini), Anthropic (Claude Opus 4, Claude Sonnet 4), Google (Gemini 2.5 Pro), and local models via Ollama. You can configure multiple providers simultaneously and switch between them per conversation.",
    timestamp: "2:30 PM",
  },
  { role: "user", content: "Can I use my own knowledge base with it?", timestamp: "2:31 PM" },
  {
    role: "assistant",
    content:
      "Yes! Cherry Studio has a built-in knowledge base system. You can upload PDFs, Markdown files, and other documents. They are automatically chunked, embedded, and indexed for retrieval-augmented generation (RAG). You can attach a knowledge base to any conversation or agent to ground responses in your own data.",
    timestamp: "2:31 PM",
  },
]

function now() {
  return new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
}

const chatModuleProps: PropDef[] = [
  { name: "hasMessages", type: "boolean", default: "true", description: "Whether there are messages" },
  { name: "onSendMessage", type: "(text: string) => void", default: "required", description: "Send message handler" },
]

export function ChatModuleDemo() {
  const [messages, setMessages] = useState<Message[]>(initialMessages)

  const handleSend = (text: string) => {
    const ts = now()
    setMessages((prev) => [
      ...prev,
      { role: "user", content: text, timestamp: ts },
      {
        role: "assistant",
        content: `Great question! Here's what I can tell you about "${text}" — Cherry Studio makes it easy to explore, configure, and iterate. Let me know if you need more details.`,
        timestamp: ts,
      },
    ])
  }

  const handleClear = () => setMessages([])

  return (
    <Section title="Chat Module" install="npm install @cherry-studio/ui" props={chatModuleProps} code={`<ChatContainer hasMessages={messages.length > 0} emptyState={<p>No messages</p>}>
  <MessageList scrollDeps={[messages.length]}>
    {messages.map((msg, i) => (
      <MessageBubble key={i} role={msg.role} name={msg.role === "user" ? "You" : "AI"}>
        {msg.content}
      </MessageBubble>
    ))}
  </MessageList>
  <Composer onSendMessage={handleSend} placeholder="Type a message..." />
</ChatContainer>`}>
      <div className="max-w-lg space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">{messages.length} messages</p>
          <Button size="sm" variant="ghost" className="h-7 text-[11px]" onClick={handleClear}>
            <Trash2 size={12} className="mr-1" /> Clear
          </Button>
        </div>

        <div className="h-[500px] border rounded-xl overflow-hidden bg-background">
          <ChatContainer
            hasMessages={messages.length > 0}
            emptyState={
              <div className="text-center space-y-2">
                <Inbox className="h-10 w-10 mx-auto text-muted-foreground/30" />
                <p className="text-sm font-medium text-muted-foreground/60">No messages yet</p>
                <p className="text-xs text-muted-foreground/40">Type a message below to start chatting</p>
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
                        <ActionBtn icon={Copy} />
                        <ActionBtn icon={ThumbsUp} />
                      </>
                    ) : undefined
                  }
                >
                  {msg.content}
                </MessageBubble>
              ))}
            </MessageList>
            <Composer
              onSendMessage={handleSend}
              placeholder="Ask Cherry AI anything..."
            />
          </ChatContainer>
        </div>
      </div>
    </Section>
  )
}
