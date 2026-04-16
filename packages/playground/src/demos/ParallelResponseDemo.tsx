import React, { useState } from "react"
import {
  Card, Button, Badge, Avatar, AvatarFallback,
  ToggleGroup, ToggleGroupItem, ThinkingBlock, CodeBlock
} from "@cherry-studio/ui"
import { Section } from "../components/Section"
import { Copy, ThumbsUp, Check, Columns, Rows, LayoutGrid } from "lucide-react"

const responses = [
  {
    id: "gpt4o",
    model: "GPT-4o",
    provider: "OpenAI",
    avatar: "🟢",
    thinking: "Analyzing the user's question about sorting algorithms...\nComparing time complexity of different approaches.",
    thinkingDuration: 1200,
    content: "The most efficient general-purpose sorting algorithm is **Timsort**, used by Python and Java. It has O(n log n) worst-case and O(n) best-case time complexity.",
    tokens: { input: 45, output: 128 },
  },
  {
    id: "claude",
    model: "Claude Sonnet 4",
    provider: "Anthropic",
    avatar: "🟠",
    thinking: "The user asks about efficient sorting.\nLet me think about practical considerations beyond theoretical complexity.",
    thinkingDuration: 2100,
    content: "For most practical applications, I'd recommend **Quicksort** with median-of-three pivot selection. Here's an implementation:",
    code: `function quickSort(arr, lo = 0, hi = arr.length - 1) {\n  if (lo < hi) {\n    const pivot = partition(arr, lo, hi)\n    quickSort(arr, lo, pivot - 1)\n    quickSort(arr, pivot + 1, hi)\n  }\n  return arr\n}`,
    tokens: { input: 45, output: 256 },
  },
  {
    id: "gemini",
    model: "Gemini 2.5 Pro",
    provider: "Google",
    avatar: "🔵",
    content: "The answer depends on your constraints:\n\n• **Small arrays (< 50)**: Insertion sort\n• **General purpose**: Timsort or Introsort\n• **Nearly sorted data**: Insertion sort or Timsort\n• **Memory constrained**: Heapsort (in-place, O(1) extra space)",
    tokens: { input: 45, output: 180 },
  },
]

export function ParallelResponseDemo() {
  const [layout, setLayout] = useState("columns")
  const [copied, setCopied] = useState("")

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(""), 1500)
  }

  const gridClass =
    layout === "columns" ? "grid md:grid-cols-3 gap-3" :
    layout === "rows" ? "space-y-3" :
    "grid grid-cols-2 gap-3"

  return (
    <Section title="Parallel Response Pattern" props={[
        { name: "models", type: "string[]", default: "[]", description: "List of model IDs to query in parallel" },
        { name: "layout", type: '"columns" | "rows" | "grid"', default: '"columns"', description: "Layout arrangement for response cards" },
        { name: "showThinking", type: "boolean", default: "true", description: "Show thinking/reasoning process blocks" },
      ]} code={`// Multiple model responses side-by-side
// Compose with: Card, Avatar, ThinkingBlock, CodeBlock, ToggleGroup, Badge`}>
      <div className="max-w-4xl space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">3 models responding to: "What's the most efficient sorting algorithm?"</p>
          <ToggleGroup type="single" value={layout} onValueChange={(v) => v && setLayout(v)} className="h-7">
            <ToggleGroupItem value="columns" className="size-7 p-0"><Columns className="size-3" /></ToggleGroupItem>
            <ToggleGroupItem value="rows" className="size-7 p-0"><Rows className="size-3" /></ToggleGroupItem>
            <ToggleGroupItem value="grid" className="size-7 p-0"><LayoutGrid className="size-3" /></ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className={gridClass}>
          {responses.map((r) => (
            <Card key={r.id} className="p-3 space-y-2">
              <div className="flex items-center gap-2">
                <Avatar className="size-6"><AvatarFallback className="text-xs">{r.avatar}</AvatarFallback></Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{r.model}</p>
                  <p className="text-[10px] text-muted-foreground">{r.provider}</p>
                </div>
                <Badge variant="outline" className="text-[9px] tabular-nums">{r.tokens.output} tok</Badge>
              </div>

              {r.thinking && (
                <ThinkingBlock content={r.thinking} duration={r.thinkingDuration} />
              )}

              <p className="text-xs leading-relaxed">{r.content}</p>

              {r.code && <CodeBlock code={r.code} language="javascript" showLineNumbers={false} />}

              <div className="flex items-center gap-1 pt-1 border-t">
                <Button
                  variant="ghost" size="icon" className="size-6"
                  onClick={() => handleCopy(r.id, r.content)}
                >
                  {copied === r.id ? <Check className="size-3 text-primary" /> : <Copy className="size-3" />}
                </Button>
                <Button variant="ghost" size="icon" className="size-6"><ThumbsUp className="size-3" /></Button>
                <div className="flex-1" />
                <span className="text-[9px] text-muted-foreground tabular-nums">{r.tokens.input}→{r.tokens.output}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Section>
  )
}
