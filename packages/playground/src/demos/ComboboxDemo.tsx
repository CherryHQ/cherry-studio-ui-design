import React, { useState } from "react"
import { Combobox } from "@cherry-studio/ui"
import { Section, type PropDef } from "../components/Section"

const frameworks = [
  { value: "react", label: "React" },
  { value: "vue", label: "Vue" },
  { value: "angular", label: "Angular" },
  { value: "svelte", label: "Svelte" },
  { value: "solid", label: "SolidJS" },
  { value: "next", label: "Next.js" },
]

const aiModels = [
  { value: "gpt-4o", label: "GPT-4o" },
  { value: "gpt-4o-mini", label: "GPT-4o Mini" },
  { value: "claude-opus-4", label: "Claude Opus 4" },
  { value: "claude-sonnet-4", label: "Claude Sonnet 4" },
  { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro" },
  { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
  { value: "deepseek-v3", label: "DeepSeek V3" },
  { value: "qwen-3", label: "Qwen 3" },
]

export function ComboboxDemo() {
  const [single, setSingle] = useState("")
  const [multi, setMulti] = useState<string[]>([])
  const [model, setModel] = useState("claude-sonnet-4")

  return (
    <>
      <Section
        title="Single Select"
        install="npx shadcn@latest add combobox"
        props={[
          { name: "options", type: "ComboboxOption[]", description: "Array of { value, label, disabled? }" },
          { name: "value", type: "string", description: "Selected value (single mode)" },
          { name: "onValueChange", type: "(value: string) => void", description: "Callback on selection change" },
          { name: "placeholder", type: "string", default: '"Select..."', description: "Placeholder text" },
          { name: "searchPlaceholder", type: "string", default: '"Search..."', description: "Search input placeholder" },
          { name: "emptyMessage", type: "string", default: '"No results found."', description: "Message when no options match" },
          { name: "disabled", type: "boolean", default: "false", description: "Disable the combobox" },
        ] satisfies PropDef[]}
        code={`import { Combobox } from "@cherry-studio/ui"

const options = [
  { value: "react", label: "React" },
  { value: "vue", label: "Vue" },
  { value: "angular", label: "Angular" },
]

const [value, setValue] = useState("")

<Combobox options={options} value={value} onValueChange={setValue} placeholder="Select framework..." />`}
      >
        <div className="flex flex-wrap items-center gap-4">
          <div className="space-y-1.5">
            <p className="text-sm text-muted-foreground">Choose a framework</p>
            <Combobox
              options={frameworks}
              value={single}
              onValueChange={setSingle}
              placeholder="Select framework..."
              searchPlaceholder="Search frameworks..."
            />
          </div>
          <div className="space-y-1.5">
            <p className="text-sm text-muted-foreground">Disabled</p>
            <Combobox options={frameworks} value="" onValueChange={() => {}} disabled />
          </div>
        </div>
      </Section>

      <Section
        title="Multi Select"
        code={`import { Combobox } from "@cherry-studio/ui"

const [values, setValues] = useState<string[]>([])

<Combobox
  options={options}
  values={values}
  onValuesChange={setValues}
  placeholder="Select frameworks..."
/>`}
      >
        <div className="space-y-1.5">
          <p className="text-sm text-muted-foreground">Select multiple frameworks</p>
          <Combobox
            options={frameworks}
            values={multi}
            onValuesChange={setMulti}
            placeholder="Select frameworks..."
            searchPlaceholder="Search frameworks..."
            className="w-75"
          />
          {multi.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Selected: {multi.join(", ")}
            </p>
          )}
        </div>
      </Section>

      <Section
        title="Practical: Model Selector"
        code={`const aiModels = [
  { value: "gpt-4o", label: "GPT-4o" },
  { value: "claude-opus-4", label: "Claude Opus 4" },
  { value: "claude-sonnet-4", label: "Claude Sonnet 4" },
  { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro" },
]

<Combobox
  options={aiModels}
  value={model}
  onValueChange={setModel}
  placeholder="Select model..."
  searchPlaceholder="Search models..."
/>`}
      >
        <div className="space-y-1.5">
          <p className="text-sm text-muted-foreground">Choose an AI model for your conversation</p>
          <Combobox
            options={aiModels}
            value={model}
            onValueChange={setModel}
            placeholder="Select model..."
            searchPlaceholder="Search models..."
            className="w-70"
          />
          {model && (
            <p className="text-xs text-muted-foreground">
              Active model: {aiModels.find((m) => m.value === model)?.label}
            </p>
          )}
        </div>
      </Section>
    </>
  )
}
