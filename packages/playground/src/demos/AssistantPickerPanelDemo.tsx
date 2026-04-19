import React, { useState } from "react"
import { AssistantPickerPanel, type AssistantItem } from "@cherry-studio/ui"
import { Section } from "../components/Section"

const sampleAssistants: AssistantItem[] = [
  { id: "default", name: "Default Assistant", modelProvider: "OpenAI" },
  { id: "coder", name: "Code Helper", modelProvider: "Anthropic" },
  { id: "writer", name: "Writing Expert", modelProvider: "Google" },
  { id: "translator", name: "Translator", modelProvider: "DeepSeek" },
  { id: "analyst", name: "Data Analyst", modelProvider: "OpenAI" },
]

const emojiMap: Record<string, string> = {
  "Default Assistant": "🤖",
  "Code Helper": "💻",
  "Writing Expert": "✍️",
  "Translator": "🌐",
  "Data Analyst": "📊",
}

export function AssistantPickerPanelDemo() {
  const [selected, setSelected] = useState<string[]>(["default"])
  const [multi, setMulti] = useState(false)

  return (
    <>
      <Section title="AssistantPickerPanel" props={[
        { name: "assistants", type: "AssistantItem[]", description: "Available assistants" },
        { name: "selectedAssistants", type: "string[]", description: "Selected assistant ids" },
        { name: "onSelectAssistant", type: "(id: string) => void", description: "Selection handler" },
        { name: "multiAssistant", type: "boolean", default: "false", description: "Multi-select mode" },
        { name: "emojiMap", type: "Record<string, string>", description: "Name-to-emoji mapping" },
        { name: "onCreateAssistant", type: "() => void", description: "Create new assistant handler" },
      ]} code={`import { AssistantPickerPanel } from "@cherry-studio/ui"

<AssistantPickerPanel
  assistants={assistants}
  selectedAssistants={selected}
  onSelectAssistant={(id) => handleSelect(id)}
  emojiMap={emojiMap}
/>`}>
        <div className="max-w-sm border rounded-[12px] overflow-hidden bg-popover">
          <AssistantPickerPanel
            assistants={sampleAssistants}
            selectedAssistants={selected}
            onSelectAssistant={(id) => {
              setSelected(prev =>
                multi ? (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]) : [id]
              )
            }}
            multiAssistant={multi}
            onToggleMultiAssistant={() => setMulti(!multi)}
            emojiMap={emojiMap}
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
