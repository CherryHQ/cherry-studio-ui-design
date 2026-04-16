import React, { useState } from "react"
import { ModelPickerPanel, type ModelInfo } from "@cherry-studio/ui"
import { Section } from "../components/Section"

const sampleModels: ModelInfo[] = [
  { id: "gpt-4o", name: "GPT-4o", provider: "OpenAI", capabilities: ["vision", "tools", "web"] },
  { id: "gpt-4o-mini", name: "GPT-4o Mini", provider: "OpenAI", capabilities: ["tools"] },
  { id: "claude-3.5", name: "Claude 3.5 Sonnet", provider: "Anthropic", capabilities: ["vision", "reasoning", "tools"] },
  { id: "claude-3-haiku", name: "Claude 3 Haiku", provider: "Anthropic", capabilities: ["tools"] },
  { id: "gemini-pro", name: "Gemini 1.5 Pro", provider: "Google", capabilities: ["vision", "reasoning", "web"] },
  { id: "deepseek-v3", name: "DeepSeek V3", provider: "DeepSeek", capabilities: ["reasoning", "tools"] },
]

export function ModelPickerPanelDemo() {
  const [selected, setSelected] = useState<string[]>(["claude-3.5"])
  const [multi, setMulti] = useState(false)

  return (
    <>
      <Section title="ModelPickerPanel" props={[
        { name: "models", type: "ModelInfo[]", description: "Available models list" },
        { name: "selectedModels", type: "string[]", description: "Currently selected model ids" },
        { name: "onSelectModel", type: "(id: string) => void", description: "Model selection handler" },
        { name: "multiModel", type: "boolean", default: "false", description: "Allow multi-model selection" },
        { name: "providerColors", type: "Record<string, string>", description: "Provider color map" },
      ]} code={`import { ModelPickerPanel } from "@cherry-studio/ui"

<ModelPickerPanel
  models={models}
  selectedModels={selected}
  onSelectModel={(id) => handleSelect(id)}
  multiModel={false}
  onToggleMultiModel={() => setMulti(!multi)}
/>`}>
        <div className="max-w-sm border rounded-xl overflow-hidden bg-popover p-0">
          <ModelPickerPanel
            models={sampleModels}
            selectedModels={selected}
            onSelectModel={(id) => {
              setSelected(prev =>
                multi ? (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]) : [id]
              )
            }}
            multiModel={multi}
            onToggleMultiModel={() => setMulti(!multi)}
            providerColors={{ OpenAI: "bg-accent-green", Anthropic: "bg-accent-orange", Google: "bg-accent-blue" }}
            autoFocus={false}
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Selected: <span className="font-medium text-foreground">{selected.join(", ") || "none"}</span>
        </p>
      </Section>
    </>
  )
}
