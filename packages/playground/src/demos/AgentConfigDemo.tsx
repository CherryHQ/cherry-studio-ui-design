import React, { useState } from "react"
import {
  PanelHeader, ConfigSection, FormRow, Input, Textarea, Slider, Switch, Badge,
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
  Avatar, AvatarFallback,
  Accordion, AccordionItem, AccordionTrigger, AccordionContent
} from "@cherry-studio/ui"
import { Section } from "../components/Section"

const tools = [
  { id: "web", name: "Web Search", desc: "Search the internet", enabled: true },
  { id: "code", name: "Code Execution", desc: "Run code in sandbox", enabled: true },
  { id: "file", name: "File Operations", desc: "Read and write files", enabled: false },
  { id: "db", name: "Database Query", desc: "Execute SQL queries", enabled: false },
]

export function AgentConfigDemo() {
  const [name, setName] = useState("Research Agent")
  const [model, setModel] = useState("claude-sonnet")
  const [temp, setTemp] = useState([70])
  const [topP, setTopP] = useState([90])
  const [toolState, setToolState] = useState<Record<string, boolean>>(
    Object.fromEntries(tools.map(t => [t.id, t.enabled]))
  )

  return (
    <Section title="Agent Configuration" install="npm install @cherry-studio/ui">
      <div className="max-w-md rounded-xl border bg-background p-4 space-y-3">
        <PanelHeader icon="🤖" title="Agent Configuration" desc="Configure your autonomous agent" />

        <ConfigSection title="Identity">
          <div className="flex justify-center py-3">
            <Avatar className="h-16 w-16 cursor-pointer hover:opacity-80 transition-opacity">
              <AvatarFallback className="text-2xl">🔬</AvatarFallback>
            </Avatar>
          </div>
          <FormRow label="Name" direction="vertical">
            <Input value={name} onChange={e => setName(e.target.value)} />
          </FormRow>
          <FormRow label="Description" direction="vertical">
            <Textarea
              placeholder="Describe what this agent does..."
              defaultValue="A research agent that searches the web, analyzes sources, and compiles comprehensive reports."
              className="min-h-[60px]"
            />
          </FormRow>
        </ConfigSection>

        <ConfigSection title="Model Settings">
          <FormRow label="Model">
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger className="w-40 h-7 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                <SelectItem value="claude-sonnet">Claude Sonnet 4</SelectItem>
                <SelectItem value="claude-opus">Claude Opus 4</SelectItem>
                <SelectItem value="gemini-pro">Gemini 2.5 Pro</SelectItem>
              </SelectContent>
            </Select>
          </FormRow>
          <FormRow label="Temperature" desc="Creativity level">
            <div className="flex items-center gap-2">
              <div className="w-28"><Slider value={temp} onValueChange={setTemp} max={100} step={1} /></div>
              <span className="text-[10px] font-mono text-muted-foreground w-6 text-right">{(temp[0] / 100).toFixed(1)}</span>
            </div>
          </FormRow>
          <FormRow label="Top P">
            <div className="flex items-center gap-2">
              <div className="w-28"><Slider value={topP} onValueChange={setTopP} max={100} step={1} /></div>
              <span className="text-[10px] font-mono text-muted-foreground w-6 text-right">{(topP[0] / 100).toFixed(1)}</span>
            </div>
          </FormRow>
        </ConfigSection>

        <ConfigSection title="Tools">
          <Accordion type="single" collapsible defaultValue="tools">
            <AccordionItem value="tools" className="border-none">
              <AccordionTrigger className="text-xs py-2">
                Available Tools
                <Badge variant="outline" className="ml-2 text-[9px]">
                  {Object.values(toolState).filter(Boolean).length} active
                </Badge>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-1">
                  {tools.map(tool => (
                    <FormRow key={tool.id} label={tool.name} desc={tool.desc}>
                      <Switch
                        checked={toolState[tool.id]}
                        onCheckedChange={v => setToolState(s => ({ ...s, [tool.id]: v }))}
                      />
                    </FormRow>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </ConfigSection>
      </div>
    </Section>
  )
}
