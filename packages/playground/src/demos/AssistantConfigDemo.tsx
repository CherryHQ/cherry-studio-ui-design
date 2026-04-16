import React, { useState } from "react"
import {
  PanelHeader, ConfigSection, FormRow, Input, Textarea, Badge, Switch, Button,
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
  Card, CardContent
} from "@cherry-studio/ui"
import { Section } from "../components/Section"
import { Plus, X, BookOpen, Code2, Globe } from "lucide-react"

const knowledgeBases = ["ML Papers", "API Docs", "Company Wiki"]
const toolList = [
  { id: "web", name: "Web Search", icon: Globe, enabled: true },
  { id: "code", name: "Code Runner", icon: Code2, enabled: false },
  { id: "kb", name: "Knowledge Base", icon: BookOpen, enabled: true },
]

export function AssistantConfigDemo() {
  const [model, setModel] = useState("claude-sonnet")
  const [tags, setTags] = useState(["General", "Research"])
  const [tools, setTools] = useState<Record<string, boolean>>(
    Object.fromEntries(toolList.map(t => [t.id, t.enabled]))
  )

  return (
    <Section title="Assistant Configuration" install="npm install @cherry-studio/ui" props={[
        { name: "name", type: "string", default: '""', description: "Assistant display name" },
        { name: "model", type: "string", default: '"claude-sonnet"', description: "Default model for the assistant" },
        { name: "systemPrompt", type: "string", default: '""', description: "System prompt that defines assistant behavior" },
        { name: "tools", type: "ToolConfig[]", default: "[]", description: "Enabled tools and capabilities" },
      ]}>
      <div className="max-w-md rounded-xl border bg-background p-4 space-y-3">
        <PanelHeader icon="✨" title="Assistant Configuration" desc="Set up your AI assistant" />

        <ConfigSection title="Profile" hint="Basic assistant information">
          <FormRow label="Name" direction="vertical">
            <Input defaultValue="Research Assistant" />
          </FormRow>
          <FormRow label="Description" direction="vertical">
            <Input defaultValue="Helps with research, summarization, and analysis" />
          </FormRow>
          <FormRow label="Tags">
            <div className="flex flex-wrap gap-1">
              {tags.map(tag => (
                <Badge key={tag} variant="secondary" className="text-[10px] gap-1">
                  {tag}
                  <Button variant="ghost" onClick={() => setTags(t => t.filter(x => x !== tag))} className="hover:text-destructive">
                    <X size={10} />
                  </Button>
                </Badge>
              ))}
              <Button variant="ghost"
                onClick={() => setTags(t => [...t, "New"])}
                className="text-[10px] text-muted-foreground hover:text-foreground px-1"
              >
                <Plus size={10} />
              </Button>
            </div>
          </FormRow>
        </ConfigSection>

        <ConfigSection title="Model">
          <FormRow label="Default Model">
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger className="w-40 h-7 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                <SelectItem value="claude-sonnet">Claude Sonnet 4</SelectItem>
                <SelectItem value="gemini-pro">Gemini 2.5 Pro</SelectItem>
              </SelectContent>
            </Select>
          </FormRow>
          <FormRow label="System Prompt" direction="vertical">
            <Textarea
              className="min-h-[80px] text-xs"
              defaultValue="You are a helpful research assistant. Analyze sources carefully, cite references, and provide balanced perspectives."
            />
          </FormRow>
        </ConfigSection>

        <ConfigSection title="Knowledge Bases" hint="Connected knowledge sources">
          <div className="flex flex-wrap gap-1.5 py-1">
            {knowledgeBases.map(kb => (
              <Badge key={kb} variant="outline" className="text-[10px] gap-1">
                <BookOpen size={10} /> {kb}
              </Badge>
            ))}
            <Button variant="ghost" size="sm" className="h-5 text-[10px] px-1.5">
              <Plus size={10} className="mr-0.5" /> Add
            </Button>
          </div>
        </ConfigSection>

        <ConfigSection title="Tools" hint="Enable capabilities for the assistant">
          <div className="space-y-2">
            {toolList.map(tool => (
              <Card key={tool.id} className="p-0">
                <CardContent className="flex items-center justify-between p-2.5">
                  <div className="flex items-center gap-2">
                    <tool.icon size={14} className="text-muted-foreground" />
                    <span className="text-xs font-medium">{tool.name}</span>
                  </div>
                  <Switch
                    checked={tools[tool.id]}
                    onCheckedChange={v => setTools(s => ({ ...s, [tool.id]: v }))}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </ConfigSection>
      </div>
    </Section>
  )
}
