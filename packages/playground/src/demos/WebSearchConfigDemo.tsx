import React, { useState } from "react"
import {
  PanelHeader, ConfigSection, FormRow, Input, Badge, Button, Switch,
  Card, CardContent
} from "@cherry-studio/ui"
import { Section } from "../components/Section"
import { Globe, Eye, EyeOff, ExternalLink } from "lucide-react"

interface SearchEngine {
  id: string; name: string; icon: string; status: "active" | "inactive" | "error"
  description: string
}

const engines: SearchEngine[] = [
  { id: "google", name: "Google Search", icon: "🔍", status: "active", description: "Google Custom Search API" },
  { id: "bing", name: "Bing Search", icon: "🅱️", status: "active", description: "Microsoft Bing Web Search API" },
  { id: "tavily", name: "Tavily AI", icon: "🤖", status: "inactive", description: "AI-optimized search for LLMs" },
  { id: "serper", name: "Serper", icon: "⚡", status: "error", description: "Google SERP API (fast)" },
]

const statusColors: Record<string, string> = {
  active: "bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/20",
  inactive: "bg-muted text-muted-foreground border-border",
  error: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/20",
}

export function WebSearchConfigDemo() {
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({})
  const [selected, setSelected] = useState("google")

  return (
    <Section title="Web Search Configuration" install="npm install @cherry-studio/ui">
      <div className="max-w-lg space-y-3">
        <PanelHeader icon={<Globe size={16} />} title="Web Search" desc="Configure search engine providers" />

        <div className="grid grid-cols-2 gap-2">
          {engines.map(engine => (
            <Card
              key={engine.id}
              className={`p-0 cursor-pointer transition-colors ${selected === engine.id ? "ring-2 ring-primary" : "hover:bg-accent/30"}`}
              onClick={() => setSelected(engine.id)}
            >
              <CardContent className="p-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{engine.icon}</span>
                    <div>
                      <p className="text-xs font-medium">{engine.name}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{engine.description}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-1.5">
                  <div className={`h-1.5 w-1.5 rounded-full ${engine.status === "active" ? "bg-green-500" : engine.status === "error" ? "bg-red-500" : "bg-muted-foreground/30"}`} />
                  <Badge variant="outline" className={`text-[9px] ${statusColors[engine.status]}`}>
                    {engine.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <ConfigSection title="API Configuration" hint={`Settings for ${engines.find(e => e.id === selected)?.name}`}>
          <FormRow label="API Key" direction="vertical">
            <div className="flex items-center gap-1.5">
              <Input
                type={showKeys[selected] ? "text" : "password"}
                defaultValue={selected === "google" ? "AIza-xxxx-xxxx-xxxx" : ""}
                placeholder="Enter API key..."
                className="h-7 text-xs font-mono flex-1"
              />
              <button
                onClick={() => setShowKeys(s => ({ ...s, [selected]: !s[selected] }))}
                className="text-foreground/30 hover:text-foreground/60 transition-colors p-1"
              >
                {showKeys[selected] ? <EyeOff size={12} /> : <Eye size={12} />}
              </button>
            </div>
          </FormRow>
          {selected === "google" && (
            <>
              <FormRow label="Custom Search Engine ID" direction="vertical">
                <Input defaultValue="a1b2c3d4e5f" className="h-7 text-xs font-mono" />
              </FormRow>
              <FormRow label="Max Results">
                <Input type="number" defaultValue="10" className="h-7 text-xs w-20" />
              </FormRow>
              <FormRow label="Safe Search">
                <Switch defaultChecked />
              </FormRow>
            </>
          )}
          {selected === "bing" && (
            <>
              <FormRow label="Market" direction="vertical">
                <Input defaultValue="en-US" className="h-7 text-xs w-28" />
              </FormRow>
              <FormRow label="Freshness">
                <Input defaultValue="Week" className="h-7 text-xs w-28" />
              </FormRow>
            </>
          )}
          <div className="flex justify-between pt-1">
            <Button variant="outline" size="sm" className="h-7 text-[10px]">
              Test Connection
            </Button>
            <Button variant="link" size="sm" className="h-7 text-[10px] gap-1">
              Documentation <ExternalLink size={10} />
            </Button>
          </div>
        </ConfigSection>
      </div>
    </Section>
  )
}
