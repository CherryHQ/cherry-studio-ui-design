import React from "react"
import { ChatMessage } from "@cherry-studio/ui"
import { Section } from "../components/Section"
import type { ChatMessageData } from "@cherry-studio/ui"

const userMessage: ChatMessageData = {
  id: "1",
  role: "user",
  parts: [{ type: "text" as const, text: "What is React Server Components?" }],

}

const assistantMessage: ChatMessageData = {
  id: "2",
  role: "assistant",
  parts: [{
    type: "text" as const,
    text: "**React Server Components** (RSC) allow you to render components on the server.\n\nKey benefits:\n- Zero bundle size for server components\n- Direct access to backend resources\n- Automatic code splitting\n\n```tsx\nasync function Page() {\n  const data = await db.query('SELECT * FROM posts');\n  return <PostList posts={data} />;\n}\n```",
  }],

}

export function ChatMessageDemo() {
  return (
    <>
      <Section title="User Message" props={[
        { name: "message", type: "ChatMessageData", description: "Message object with role, parts, createdAt" },
        { name: "isStreaming", type: "boolean", default: "false", description: "Show streaming indicator" },
        { name: "showActions", type: "boolean", default: "true", description: "Show action buttons on assistant messages" },
        { name: "onCopy", type: "() => void", description: "Copy button handler" },
        { name: "onRegenerate", type: "() => void", description: "Regenerate button handler" },
      ]} code={`import { ChatMessage } from "@cherry-studio/ui"

<ChatMessage message={userMessage} />`}>
        <div className="max-w-2xl border rounded-[12px] p-4 bg-background">
          <ChatMessage message={userMessage} />
        </div>
      </Section>

      <Section title="Assistant Message with Markdown">
        <div className="max-w-2xl border rounded-[12px] p-4 bg-background">
          <ChatMessage
            message={assistantMessage}
            showActions
            onCopy={() => {}}
            onRegenerate={() => {}}
          />
        </div>
      </Section>
    </>
  )
}
