import React, { useState } from "react"
import {
  MessageList, MessageBubble, ChatContainer, Composer,
  Avatar, AvatarFallback, Button,
  ThinkingBlock, CodeBlock
} from "@cherry-studio/ui"
import { Section, type PropDef } from "../components/Section"
import { Copy, ThumbsUp, ThumbsDown, RotateCcw, Pencil, Inbox } from "lucide-react"

function ActionButton({ icon: Icon }: { icon: React.ElementType }) {
  return (
    <Button variant="ghost" className="p-1 rounded-sm text-muted-foreground/40 hover:text-muted-foreground hover:bg-accent/50 transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
      <Icon size={12} />
    </Button>
  )
}

const sampleMessages = [
  { role: "user" as const, content: "What is Cherry Studio?" },
  { role: "assistant" as const, content: "Cherry Studio is an AI-powered development environment for building smart applications. It supports multiple LLM providers, knowledge bases, autonomous agents, and a comprehensive UI component library." },
  { role: "user" as const, content: "How do I customize the theme?" },
  { role: "assistant" as const, content: "You can customize the theme by modifying CSS variables in `theme.css`. Cherry Studio uses a semantic token system:\n\n- `--primary` for brand color\n- `--destructive` for error states\n- `--muted` for secondary content\n\nAll components automatically adapt to light and dark modes." },
]

export function MessageBubbleDemo() {
  const [messages, setMessages] = useState(sampleMessages)

  return (
    <>
      <Section title="Message Bubbles" install="npm install @cherry-studio/ui" props={[
        { name: "role", type: '"user" | "assistant"', description: "Message sender role" },
        { name: "avatar", type: "ReactNode", default: "undefined", description: "Avatar element" },
        { name: "name", type: "string", default: "undefined", description: "Sender name" },
        { name: "timestamp", type: "string", default: "undefined", description: "Time string" },
        { name: "actions", type: "ReactNode", default: "undefined", description: "Action buttons" },
      ]} code={`import { MessageBubble, Avatar, AvatarFallback } from "@cherry-studio/ui"

<MessageBubble
  role="user"
  avatar={<Avatar><AvatarFallback>You</AvatarFallback></Avatar>}
>
  Hello! Can you help me?
</MessageBubble>
<MessageBubble role="assistant">
  Of course! What would you like to know?
</MessageBubble>`}>
        <div className="max-w-lg space-y-4">
          <MessageBubble
            role="user"
            avatar={<Avatar className="h-7 w-7"><AvatarFallback className="text-[10px]">You</AvatarFallback></Avatar>}
            name="You"
            timestamp="10:30 AM"
          >
            Hello! Can you help me with a question?
          </MessageBubble>

          <MessageBubble
            role="assistant"
            avatar={<Avatar className="h-7 w-7"><AvatarFallback className="text-[10px]">🍒</AvatarFallback></Avatar>}
            name="Cherry AI"
            timestamp="10:30 AM"
            actions={
              <>
                <ActionButton icon={Copy} />
                <ActionButton icon={ThumbsUp} />
                <ActionButton icon={ThumbsDown} />
                <ActionButton icon={RotateCcw} />
              </>
            }
          >
            Of course! I'd be happy to help. What would you like to know?
          </MessageBubble>

          <MessageBubble
            role="user"
            avatar={<Avatar className="h-7 w-7"><AvatarFallback className="text-[10px]">You</AvatarFallback></Avatar>}
            actions={<ActionButton icon={Pencil} />}
          >
            How do I add a new component to the library?
          </MessageBubble>

          <MessageBubble
            role="assistant"
            avatar={<Avatar className="h-7 w-7"><AvatarFallback className="text-[10px]">🍒</AvatarFallback></Avatar>}
            actions={
              <>
                <ActionButton icon={Copy} />
                <ActionButton icon={ThumbsUp} />
                <ActionButton icon={ThumbsDown} />
              </>
            }
          >
            <div className="space-y-2">
              <p>To add a new component:</p>
              <ol className="list-decimal pl-4 space-y-1 text-xs">
                <li>Create the component file in <code className="bg-background/50 px-1 rounded text-xs">packages/ui/src/components/ui/</code></li>
                <li>Export it from <code className="bg-background/50 px-1 rounded text-xs">index.ts</code></li>
                <li>Add a playground demo</li>
              </ol>
            </div>
          </MessageBubble>
        </div>
      </Section>

      <Section title="ThinkingBlock & CodeBlock">
        <div className="max-w-lg space-y-4">
          <MessageBubble
            role="assistant"
            avatar={<Avatar className="h-7 w-7"><AvatarFallback className="text-[10px]">🍒</AvatarFallback></Avatar>}
          >
            <ThinkingBlock
              content={"Let me analyze the user's request step by step.\n1. They want to create a React component\n2. It should use TypeScript\n3. It needs to be reusable and well-typed\n\nI'll provide a clean implementation with proper props interface."}
              duration={3200}
            />
            <p className="mt-1">Here's a simple counter component:</p>
            <CodeBlock
              language="tsx"
              code={`import { useState } from "react"\n\nexport function Counter({ initial = 0 }: { initial?: number }) {\n  const [count, setCount] = useState(initial)\n  return (\n    <Button variant="ghost" onClick={() => setCount(c => c + 1)}>\n      Count: {count}\n    </Button>\n  )\n}`}
            />
            <p>You can use it by importing and rendering <code className="bg-muted px-1 rounded text-xs">&lt;Counter initial={5} /&gt;</code>.</p>
          </MessageBubble>
        </div>
      </Section>

      <Section title="Full Chat Interface">
        <div className="max-w-lg h-[450px] border rounded-[12px] overflow-hidden bg-background">
          <ChatContainer hasMessages={messages.length > 0}>
            <MessageList scrollDeps={[messages.length]}>
              {messages.map((msg, i) => (
                <MessageBubble
                  key={i}
                  role={msg.role}
                  avatar={
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="text-[10px]">
                        {msg.role === "user" ? "You" : "🍒"}
                      </AvatarFallback>
                    </Avatar>
                  }
                >
                  {msg.content}
                </MessageBubble>
              ))}
            </MessageList>
            <Composer
              onSendMessage={(text) =>
                setMessages([
                  ...messages,
                  { role: "user", content: text },
                  { role: "assistant", content: `You said: "${text}". This is a demo response.` },
                ])
              }
              placeholder="Type a message..."
            />
          </ChatContainer>
        </div>
      </Section>

      <Section title="Empty State">
        <div className="max-w-lg h-[300px] border rounded-[12px] overflow-hidden bg-background">
          <ChatContainer
            hasMessages={false}
            emptyState={
              <div className="text-center space-y-2">
                <Inbox className="h-10 w-10 mx-auto text-muted-foreground/30" />
                <p className="text-sm font-medium text-muted-foreground/60">No messages yet</p>
                <p className="text-xs text-muted-foreground/40">Start a conversation</p>
              </div>
            }
          >
            <Composer onSendMessage={() => {}} variant="rounded" placeholder="Ask me anything..." />
          </ChatContainer>
        </div>
      </Section>
    </>
  )
}
