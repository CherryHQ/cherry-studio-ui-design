import React, { useState } from "react"
import {
  PanelHeader, ConfigSection, FormRow, Input, Button, Badge, Card, CardContent,
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem
} from "@cherry-studio/ui"
import { Section } from "../components/Section"
import { Play, Terminal, Code2, FileCode2, Cpu } from "lucide-react"

const codeTools = [
  { id: "python", name: "Python Runner", icon: "🐍", desc: "Execute Python scripts with pip packages", active: true },
  { id: "node", name: "Node.js Runner", icon: "🟢", desc: "Run JavaScript/TypeScript in Node environment", active: false },
  { id: "shell", name: "Shell Executor", icon: "📟", desc: "Execute bash/zsh commands", active: false },
  { id: "jupyter", name: "Jupyter Kernel", icon: "📓", desc: "Interactive notebook-style execution", active: true },
]

export function CodeToolDemo() {
  const [selected, setSelected] = useState("python")
  const [model, setModel] = useState("claude-sonnet")
  const [terminal, setTerminal] = useState("built-in")
  const [workDir, setWorkDir] = useState("~/projects")

  return (
    <Section title="Code Tool Configuration" install="npm install @cherry-studio/ui">
      <div className="max-w-lg space-y-3">
        <PanelHeader icon={<Code2 size={16} />} title="Code Tools" desc="Configure code execution environments" />

        <div className="grid grid-cols-2 gap-2">
          {codeTools.map(tool => (
            <Card
              key={tool.id}
              className={`p-0 cursor-pointer transition-colors ${selected === tool.id ? "ring-2 ring-primary" : "hover:bg-accent/30"}`}
              onClick={() => setSelected(tool.id)}
            >
              <CardContent className="p-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{tool.icon}</span>
                    <div>
                      <p className="text-xs font-medium">{tool.name}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{tool.desc}</p>
                    </div>
                  </div>
                </div>
                {tool.active && (
                  <Badge variant="outline" className="text-[9px] mt-2 bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/20">
                    Active
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <ConfigSection title="Configuration" hint={`Settings for ${codeTools.find(t => t.id === selected)?.name}`}>
          <FormRow label="AI Model" desc="Model for code generation">
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger className="w-40 h-7 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="claude-sonnet">Claude Sonnet 4</SelectItem>
                <SelectItem value="claude-opus">Claude Opus 4</SelectItem>
                <SelectItem value="gpt-4o">GPT-4o</SelectItem>
              </SelectContent>
            </Select>
          </FormRow>
          <FormRow label="Terminal" desc="Output terminal">
            <Select value={terminal} onValueChange={setTerminal}>
              <SelectTrigger className="w-40 h-7 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="built-in">Built-in</SelectItem>
                <SelectItem value="iterm">iTerm2</SelectItem>
                <SelectItem value="vscode">VS Code</SelectItem>
              </SelectContent>
            </Select>
          </FormRow>
          <FormRow label="Working Directory" direction="vertical">
            <Input value={workDir} onChange={e => setWorkDir(e.target.value)} className="h-7 text-xs font-mono" />
          </FormRow>
        </ConfigSection>

        <div className="flex justify-end">
          <Button className="h-8 text-xs">
            <Play size={12} className="mr-1" /> Launch Environment
          </Button>
        </div>
      </div>
    </Section>
  )
}
