import React, { useState } from "react"
import { PickerPanel } from "@cherry-studio/ui"
import { Section, type PropDef } from "../components/Section"
import { Bot, Brain, Eye, Hammer, Globe, Sparkles } from "lucide-react"

const modelItems = [
  { id: "gpt-4o", label: "GPT-4o", group: "OpenAI", tags: ["vision", "tools"], icon: <Bot className="size-3.5 text-green-600" /> },
  { id: "gpt-4o-mini", label: "GPT-4o Mini", group: "OpenAI", tags: ["tools"], icon: <Bot className="size-3.5 text-green-600" /> },
  { id: "o3", label: "o3", group: "OpenAI", tags: ["reasoning"], icon: <Brain className="size-3.5 text-green-600" /> },
  { id: "claude-opus-4", label: "Claude Opus 4", group: "Anthropic", tags: ["vision", "reasoning", "tools"], icon: <Sparkles className="size-3.5 text-amber-600" /> },
  { id: "claude-sonnet-4", label: "Claude Sonnet 4", group: "Anthropic", tags: ["vision", "tools"], icon: <Sparkles className="size-3.5 text-amber-600" /> },
  { id: "gemini-2.5-pro", label: "Gemini 2.5 Pro", group: "Google", tags: ["vision", "reasoning", "web"], icon: <Globe className="size-3.5 text-blue-500" /> },
  { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash", group: "Google", tags: ["vision"], icon: <Globe className="size-3.5 text-blue-500" /> },
  { id: "deepseek-v3", label: "DeepSeek V3", group: "DeepSeek", tags: ["reasoning"], icon: <Brain className="size-3.5 text-cyan-500" /> },
  { id: "deepseek-r1", label: "DeepSeek R1", group: "DeepSeek", tags: ["reasoning"], icon: <Brain className="size-3.5 text-cyan-500" /> },
  { id: "qwen-3", label: "Qwen 3", group: "Alibaba", tags: ["tools"], icon: <Hammer className="size-3.5 text-orange-500" /> },
]

const assistantItems = [
  { id: "general", label: "General Assistant", description: "Helpful all-purpose assistant", icon: <span className="text-sm">🤖</span> },
  { id: "coder", label: "Code Expert", description: "Software engineering specialist", icon: <span className="text-sm">👨‍💻</span> },
  { id: "writer", label: "Creative Writer", description: "Writing and content creation", icon: <span className="text-sm">✍️</span> },
  { id: "analyst", label: "Data Analyst", description: "Data analysis and visualization", icon: <span className="text-sm">📊</span> },
  { id: "translator", label: "Translator", description: "Multi-language translation", icon: <span className="text-sm">🌐</span> },
]

const pickerProps: PropDef[] = [
  { name: "items", type: "PickerPanelItem[]", description: "Array of { id, label, group?, icon?, tags?, description?, disabled? }" },
  { name: "value", type: "string", default: "undefined", description: "Selected item id (single select)" },
  { name: "onValueChange", type: "(id: string) => void", default: "undefined", description: "Single select callback" },
  { name: "values", type: "string[]", default: "undefined", description: "Selected ids (multi select)" },
  { name: "onValuesChange", type: "(ids: string[]) => void", default: "undefined", description: "Multi select callback" },
  { name: "searchPlaceholder", type: "string", default: '"Search..."', description: "Search input placeholder" },
  { name: "renderItem", type: "(item, selected) => ReactNode", default: "undefined", description: "Custom item renderer" },
]

export function PickerPanelDemo() {
  const [model, setModel] = useState("claude-sonnet-4")
  const [models, setModels] = useState<string[]>(["gpt-4o", "claude-opus-4"])
  const [assistant, setAssistant] = useState("general")

  return (
    <>
      <Section title="Model Picker — Single Select (Grouped)" install="npm install @cherry-studio/ui" props={pickerProps} code={`import { PickerPanel } from "@cherry-studio/ui"

<PickerPanel
  items={modelItems}
  value={model}
  onValueChange={setModel}
  searchPlaceholder="Search models..."
/>`}>
        <div className="max-w-md rounded-lg border h-72">
          <PickerPanel
            items={modelItems}
            value={model}
            onValueChange={setModel}
            searchPlaceholder="Search models..."
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">Selected: <span className="text-foreground font-medium">{model || "None"}</span></p>
      </Section>

      <Section title="Model Picker — Multi Select">
        <div className="max-w-md rounded-lg border h-72">
          <PickerPanel
            items={modelItems}
            values={models}
            onValuesChange={setModels}
            searchPlaceholder="Search models..."
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">Selected: <span className="text-foreground font-medium">{models.join(", ") || "None"}</span></p>
      </Section>

      <Section title="Assistant Picker — Flat List (No Groups)">
        <div className="max-w-sm rounded-lg border">
          <PickerPanel
            items={assistantItems}
            value={assistant}
            onValueChange={setAssistant}
            searchPlaceholder="Search assistants..."
            renderItem={(item, selected) => (
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {item.icon && <span className="shrink-0">{item.icon}</span>}
                <div className="min-w-0 flex-1">
                  <div className="text-xs truncate">{item.label}</div>
                  {item.description && (
                    <div className="text-[10px] text-muted-foreground/60 truncate">{item.description}</div>
                  )}
                </div>
              </div>
            )}
          />
        </div>
      </Section>
    </>
  )
}
