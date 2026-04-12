import React from "react"
import {
  Tabs, TabsList, TabsTrigger, TabsContent,
  Badge, Button, Card, CodeBlock
} from "@cherry-studio/ui"
import { Section } from "../components/Section"
import { Copy, Check, Clock, Zap, Hash } from "lucide-react"

const tokenStats = [
  { label: "Input", value: "1,247", color: "text-blue-600 dark:text-blue-400" },
  { label: "Output", value: "3,891", color: "text-green-600 dark:text-green-400" },
  { label: "Thinking", value: "12,450", color: "text-violet-600 dark:text-violet-400" },
  { label: "Cache", value: "890", color: "text-amber-600 dark:text-amber-400" },
]

const requestJson = `{
  "model": "claude-sonnet-4-20260514",
  "max_tokens": 4096,
  "messages": [
    {
      "role": "user",
      "content": "What is the most efficient sorting algorithm?"
    }
  ],
  "temperature": 0.7,
  "stream": true
}`

const responseJson = `{
  "id": "msg_01XFBe...",
  "type": "message",
  "role": "assistant",
  "content": [
    {
      "type": "text",
      "text": "The most efficient general-purpose sorting..."
    }
  ],
  "model": "claude-sonnet-4-20260514",
  "stop_reason": "end_turn",
  "usage": {
    "input_tokens": 1247,
    "output_tokens": 3891
  }
}`

export function ChatDetailPanelDemo() {
  const [copied, setCopied] = React.useState(false)

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <Section title="Chat Detail Panel" code={`// Compose with: Tabs, Badge, CodeBlock, Card, Button`}>
      <div className="max-w-lg rounded-xl border bg-background p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Message Details</p>
          <Badge variant="outline" className="text-[9px]">Assistant</Badge>
        </div>

        {/* Meta info */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 text-xs">
            <Hash className="size-3 text-muted-foreground" />
            <span className="text-muted-foreground">Session</span>
            <button
              onClick={() => handleCopy("sess_abc123")}
              className="font-mono text-[10px] text-foreground/70 hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
            >
              {copied ? <Check className="size-3 text-primary inline" /> : "sess_abc123"}
            </button>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Zap className="size-3 text-muted-foreground" />
            <span className="text-muted-foreground">Model</span>
            <span className="text-foreground/70">Claude Sonnet 4</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Clock className="size-3 text-muted-foreground" />
            <span className="text-muted-foreground">Latency</span>
            <span className="text-foreground/70 tabular-nums">2.3s</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">Status</span>
            <Badge variant="outline" className="text-[9px] bg-green-500/10 text-green-600 border-green-500/20">Complete</Badge>
          </div>
        </div>

        {/* Token stats */}
        <Card className="p-3">
          <p className="text-[10px] text-muted-foreground mb-2">Token Usage</p>
          <div className="grid grid-cols-4 gap-3">
            {tokenStats.map((s) => (
              <div key={s.label} className="text-center">
                <p className={`text-sm font-semibold tabular-nums ${s.color}`}>{s.value}</p>
                <p className="text-[9px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Request/Response tabs */}
        <Tabs defaultValue="request">
          <TabsList className="h-8">
            <TabsTrigger value="request" className="text-xs h-7">Request</TabsTrigger>
            <TabsTrigger value="response" className="text-xs h-7">Response</TabsTrigger>
          </TabsList>
          <TabsContent value="request">
            <CodeBlock code={requestJson} language="json" />
          </TabsContent>
          <TabsContent value="response">
            <CodeBlock code={responseJson} language="json" />
          </TabsContent>
        </Tabs>
      </div>
    </Section>
  )
}
