import React, { useState } from "react"
import { ChatInterface, ChatMessage } from "@cherry-studio/ui"
import { Section } from "../components/Section"
import type { ChatMessageData } from "@cherry-studio/ui"

const initialMessages: ChatMessageData[] = [
  { id: "1", role: "user", parts: [{ type: "text" as const, text: "Hello! Can you help me with TypeScript?" }] },
  { id: "2", role: "assistant", parts: [{ type: "text" as const, text: "Of course! I'd be happy to help you with TypeScript. What would you like to know?" }] },
]

export function ChatInterfaceDemo() {
  const [messages, setMessages] = useState(initialMessages)

  const handleSend = (text: string) => {
    const userMsg: ChatMessageData = { id: String(Date.now()), role: "user", parts: [{ type: "text" as const, text }] }
    setMessages(prev => [...prev, userMsg])
  }

  return (
    <>
      <Section title="ChatInterface" props={[
        { name: "children", type: "ReactNode", description: "Message elements to render" },
        { name: "scrollDeps", type: "unknown[]", description: "Dependencies for auto-scroll" },
        { name: "onSendMessage", type: "(content: string) => void", description: "Send handler" },
        { name: "hasMessages", type: "boolean", default: "true", description: "Whether messages exist" },
        { name: "emptyState", type: "ReactNode", description: "Shown when no messages" },
        { name: "composerProps", type: "Partial<ComposerProps>", description: "Props forwarded to Composer" },
      ]} code={`import { ChatInterface, ChatMessage } from "@cherry-studio/ui"

<ChatInterface
  scrollDeps={[messages]}
  onSendMessage={handleSend}
>
  {messages.map(m => <ChatMessage key={m.id} message={m} />)}
</ChatInterface>`}>
        <div className="h-[400px] max-w-2xl border rounded-xl overflow-hidden bg-background">
          <ChatInterface
            scrollDeps={[messages]}
            onSendMessage={handleSend}
            composerProps={{ placeholder: "Type a message..." }}
          >
            {messages.map(m => (
              <ChatMessage key={m.id} message={m} />
            ))}
          </ChatInterface>
        </div>
      </Section>
    </>
  )
}
