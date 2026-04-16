import { useState, useCallback, useRef, useEffect } from "react"
import {
  MessageBubble, Composer, StreamingText, MarkdownRenderer,
  ToolCallCard, ThinkingBlock, Button,
} from "@cherry-studio/ui"
import { Bot, User, Sparkles } from "lucide-react"
import { Section } from "../components/Section"

interface SimpleMessage {
  id: string
  role: "user" | "assistant"
  content: string
  thinking?: string
  toolCalls?: { toolName: string; args: Record<string, unknown>; status: "done"; result?: unknown }[]
}

const INITIAL_MESSAGES: SimpleMessage[] = [
  {
    id: "1",
    role: "user",
    content: "Explain React hooks and show a code example",
  },
  {
    id: "2",
    role: "assistant",
    content: `## React Hooks

React Hooks are functions that let you **use state** and other React features in function components.

### Common Hooks

| Hook | Purpose |
|------|---------|
| \`useState\` | Manage local state |
| \`useEffect\` | Side effects |
| \`useRef\` | Mutable references |
| \`useCallback\` | Memoize functions |

### Example

\`\`\`tsx
function Counter() {
  const [count, setCount] = useState(0)

  return (
    <Button variant="ghost" onClick={() => setCount(c => c + 1)}>
      Count: {count}
    </Button>
  )
}
\`\`\`

> **Tip**: Always call hooks at the top level of your component, never inside conditions or loops.

For more details, check the [React documentation](https://react.dev/reference/react).`,
  },
  {
    id: "3",
    role: "user",
    content: "What's the weather in San Francisco?",
  },
  {
    id: "4",
    role: "assistant",
    content: "Let me check the weather for you.",
    thinking: "The user is asking about weather. I'll use the get_weather tool to fetch current conditions for San Francisco.",
    toolCalls: [
      {
        toolName: "get_weather",
        args: { city: "San Francisco", units: "celsius" },
        status: "done",
        result: { temp: 18, condition: "Partly cloudy", humidity: 65 },
      },
    ],
  },
  {
    id: "5",
    role: "assistant",
    content: "The current weather in **San Francisco** is:\n\n- 🌡️ Temperature: **18°C**\n- ☁️ Condition: Partly cloudy\n- 💧 Humidity: 65%",
  },
]

const STREAMING_RESPONSE = `Here's a quick summary of **TypeScript generics**:

\`\`\`typescript
function identity<T>(arg: T): T {
  return arg
}

const result = identity<string>("hello")
\`\`\`

Generics let you write *reusable* components that work with any type while maintaining type safety.`

export function AISDKChatDemo() {
  const [messages, setMessages] = useState<SimpleMessage[]>(INITIAL_MESSAGES)
  const [input, setInput] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamText, setStreamText] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, streamText])

  const handleSend = useCallback((text: string) => {
    const userMsg: SimpleMessage = { id: Date.now().toString(), role: "user", content: text }
    setMessages(prev => [...prev, userMsg])
    setInput("")

    setIsStreaming(true)
    setStreamText("")
    let i = 0
    const interval = setInterval(() => {
      if (i < STREAMING_RESPONSE.length) {
        setStreamText(prev => prev + STREAMING_RESPONSE[i])
        i++
      } else {
        clearInterval(interval)
        setIsStreaming(false)
        setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", content: STREAMING_RESPONSE }])
        setStreamText("")
      }
    }, 15)
  }, [])

  return (
    <Section
      title="AI SDK Chat Integration"
      props={[
        { name: "messages", type: "ChatMessage[]", default: "[]", description: "Array of chat messages from useChat" },
        { name: "isLoading", type: "boolean", default: "false", description: "Whether a response is being generated" },
        { name: "input", type: "string", default: '""', description: "Controlled input value from useChat" },
        { name: "onSubmit", type: "(e: FormEvent) => void", default: "-", description: "Form submit handler from useChat" },
      ]}
      code={`import { useChatStream, MessageBubble, Composer, MarkdownRenderer, Button } from "@cherry-studio/ui"

const { messages, input, setInput, handleSubmit, isLoading, stop } = useChatStream({ ... })

<ChatContainer messages={messages} isLoading={isLoading}>
  {messages.map(msg => (
    <MessageBubble key={msg.id} role={msg.role} message={msg}>
      <MarkdownRenderer content={msg.content} />
    </MessageBubble>
  ))}
</ChatContainer>
<Composer input={input} onInputChange={setInput} onSubmit={handleSubmit} isLoading={isLoading} onStop={stop} />`}
    >
      <div className="border rounded-[24px] overflow-hidden bg-background h-[520px] flex flex-col">
        <div className="flex items-center gap-2 px-4 py-2 border-b bg-muted/30">
          <Sparkles className="size-4 text-primary" />
          <span className="text-[13px] font-medium">AI Chat Demo</span>
          <span className="text-[10px] text-muted-foreground ml-auto">{messages.length} messages</span>
        </div>
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map(msg => (
            <div key={msg.id}>
              {msg.thinking && (
                <ThinkingBlock content={msg.thinking} className="mb-2" />
              )}
              {msg.toolCalls?.map((tc, i) => (
                <ToolCallCard
                  key={`${msg.id}-tool-${i}`}
                  toolName={tc.toolName}
                  args={tc.args}
                  status={tc.status}
                  result={tc.result}
                  className="mb-2"
                />
              ))}
              <MessageBubble
                role={msg.role}
                avatar={msg.role === "user" ? <User className="size-4" /> : <Bot className="size-4" />}
                name={msg.role === "user" ? "You" : "Assistant"}
              >
                <MarkdownRenderer content={msg.content} />
              </MessageBubble>
            </div>
          ))}
          {isStreaming && (
            <MessageBubble role="assistant" avatar={<Bot className="size-4" />} name="Assistant" isStreaming>
              <StreamingText text={streamText} isStreaming={isStreaming} />
            </MessageBubble>
          )}
        </div>
        <div className="border-t p-3">
          <Composer
            input={input}
            onInputChange={setInput}
            onSendMessage={handleSend}
            isLoading={isStreaming}
            onStop={() => setIsStreaming(false)}
            placeholder="Try: 'Explain TypeScript generics'"
          />
        </div>
      </div>
    </Section>
  )
}

export default AISDKChatDemo
