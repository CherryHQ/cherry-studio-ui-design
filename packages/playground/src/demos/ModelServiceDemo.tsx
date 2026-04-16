import React, { useState } from "react"
import {
  Card, Button, Badge, Input, Switch,
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@cherry-studio/ui"
import { Section } from "../components/Section"
import { Eye, EyeOff, Copy, Check, TestTube, CircleDot } from "lucide-react"

const providers = [
  {
    name: "OpenAI",
    color: "bg-success",
    status: "connected",
    apiKey: "sk-proj-abc...xyz",
    models: [
      { name: "GPT-4o", caps: ["vision", "tools"], context: "128K", enabled: true },
      { name: "GPT-4o Mini", caps: ["tools"], context: "128K", enabled: true },
      { name: "o3", caps: ["reasoning"], context: "200K", enabled: false },
      { name: "o4-mini", caps: ["reasoning", "tools"], context: "200K", enabled: true },
    ],
  },
  {
    name: "Anthropic",
    color: "bg-accent-amber",
    status: "connected",
    apiKey: "sk-ant-abc...xyz",
    models: [
      { name: "Claude Opus 4", caps: ["vision", "reasoning", "tools"], context: "200K", enabled: true },
      { name: "Claude Sonnet 4", caps: ["vision", "tools"], context: "200K", enabled: true },
      { name: "Claude Haiku 4.5", caps: ["tools"], context: "200K", enabled: false },
    ],
  },
]

const capColors: Record<string, string> = {
  vision: "bg-info-muted text-info border-info/20",
  tools: "bg-accent-amber-muted text-accent-amber border-accent-amber/20",
  reasoning: "bg-accent-violet-muted text-accent-violet border-accent-violet/20",
}

export function ModelServiceDemo() {
  const [showKey, setShowKey] = useState<Record<string, boolean>>({})
  const [copied, setCopied] = useState("")

  const toggleKey = (name: string) => setShowKey((p) => ({ ...p, [name]: !p[name] }))
  const handleCopy = (name: string, key: string) => {
    navigator.clipboard.writeText(key)
    setCopied(name)
    setTimeout(() => setCopied(""), 1500)
  }

  return (
    <Section title="Model Service Configuration" props={[
        { name: "providers", type: "Provider[]", default: "[]", description: "List of AI model providers" },
        { name: "onTestConnection", type: "(providerName: string) => void", default: "undefined", description: "Callback to test a provider API key" },
        { name: "onModelToggle", type: "(providerName: string, modelName: string, enabled: boolean) => void", default: "undefined", description: "Callback when a model is enabled/disabled" },
      ]} code={`// Compose with: Card, Input, Switch, Table, Badge, Button, BrandLogos`}>
      <div className="max-w-3xl space-y-4">
        {providers.map((p) => (
          <Card key={p.name} className="overflow-hidden">
            {/* Provider header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b bg-muted/30">
              <div className={`size-3 rounded-full ${p.color}`} />
              <span className="text-sm font-medium flex-1">{p.name}</span>
              <CircleDot className="size-3 text-success" />
              <Badge variant="outline" className="text-[9px] bg-success-muted text-success border-success/20">
                {p.status}
              </Badge>
            </div>

            {/* API Key */}
            <div className="px-4 py-2.5 border-b flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-16 shrink-0">API Key</span>
              <Input
                value={showKey[p.name] ? p.apiKey : "sk-****...****"}
                readOnly
                className="h-7 text-xs font-mono border-0 bg-transparent shadow-none focus-visible:ring-0 flex-1"
              />
              <Button variant="ghost" size="icon" className="size-6" onClick={() => toggleKey(p.name)}>
                {showKey[p.name] ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
              </Button>
              <Button variant="ghost" size="icon" className="size-6" onClick={() => handleCopy(p.name, p.apiKey)}>
                {copied === p.name ? <Check className="size-3 text-primary" /> : <Copy className="size-3" />}
              </Button>
              <Button variant="outline" size="sm" className="h-6 text-[10px]">
                <TestTube className="size-3 mr-1" /> Test
              </Button>
            </div>

            {/* Models table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[10px]">Model</TableHead>
                  <TableHead className="text-[10px]">Capabilities</TableHead>
                  <TableHead className="text-[10px] w-16">Context</TableHead>
                  <TableHead className="text-[10px] w-16">Enabled</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {p.models.map((m) => (
                  <TableRow key={m.name}>
                    <TableCell className="text-xs font-medium">{m.name}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {m.caps.map((c) => (
                          <Badge key={c} variant="outline" className={`text-[8px] px-1.5 py-0 ${capColors[c] || ""}`}>{c}</Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-[10px] text-muted-foreground">{m.context}</TableCell>
                    <TableCell><Switch defaultChecked={m.enabled} className="scale-75" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        ))}
      </div>
    </Section>
  )
}
