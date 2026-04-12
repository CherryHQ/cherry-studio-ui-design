import React, { useState } from "react"
import { InlineSelect, FormRow, SectionHeader } from "@cherry-studio/ui"
import { Section, type PropDef } from "../components/Section"

const modelOptions = [
  { value: "gpt-4o", label: "GPT-4o" },
  { value: "gpt-4o-mini", label: "GPT-4o Mini" },
  { value: "claude-opus", label: "Claude Opus 4" },
  { value: "claude-sonnet", label: "Claude Sonnet 4" },
  { value: "gemini-pro", label: "Gemini 2.5 Pro" },
]

const languageOptions = [
  { value: "en", label: "English", desc: "🇺🇸" },
  { value: "zh", label: "中文", desc: "🇨🇳" },
  { value: "ja", label: "日本語", desc: "🇯🇵" },
  { value: "ko", label: "한국어", desc: "🇰🇷" },
]

const themeOptions = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
]

export function InlineSelectDemo() {
  const [model, setModel] = useState("gpt-4o")
  const [lang, setLang] = useState("en")
  const [theme, setTheme] = useState("system")
  const [size, setSize] = useState("md")

  return (
    <>
      <Section title="Basic" install="npm install @cherry-studio/ui" props={[
        { name: "value", type: "string", description: "Current selected value" },
        { name: "options", type: "InlineSelectOption[]", description: "Options array" },
        { name: "onChange", type: "(value: string) => void", description: "Change handler" },
        { name: "size", type: '"sm" | "md"', default: '"sm"', description: "Select size" },
        { name: "fullWidth", type: "boolean", default: "false", description: "Full width mode" },
        { name: "dropUp", type: "boolean", default: "false", description: "Open upward" },
        { name: "showDesc", type: "boolean", default: "false", description: "Show option descriptions" },
      ]} code={`import { InlineSelect } from "@cherry-studio/ui"

const options = [
  { value: "gpt-4o", label: "GPT-4o" },
  { value: "claude-sonnet", label: "Claude Sonnet 4" },
]

<InlineSelect value={model} options={options} onChange={setModel} />`}>
        <div className="max-w-md space-y-4">
          <div className="space-y-1.5">
            <p className="text-sm text-muted-foreground">Small (default)</p>
            <InlineSelect value={model} options={modelOptions} onChange={setModel} />
          </div>
          <div className="space-y-1.5">
            <p className="text-sm text-muted-foreground">Medium</p>
            <InlineSelect value={model} options={modelOptions} onChange={setModel} size="md" />
          </div>
        </div>
      </Section>

      <Section title="With Description Prefix">
        <div className="max-w-md">
          <InlineSelect value={lang} options={languageOptions} onChange={setLang} showDesc />
        </div>
      </Section>

      <Section title="Full Width">
        <div className="max-w-xs">
          <InlineSelect value={theme} options={themeOptions} onChange={setTheme} fullWidth />
        </div>
      </Section>

      <Section title="Drop Up">
        <div className="max-w-md pt-32">
          <InlineSelect value={model} options={modelOptions} onChange={setModel} dropUp />
        </div>
      </Section>

      <Section title="Disabled">
        <div className="max-w-md">
          <InlineSelect value="gpt-4o" options={modelOptions} onChange={() => {}} disabled />
        </div>
      </Section>

      <Section title="Practical: Settings Integration">
        <div className="max-w-md rounded-xl border bg-card p-4 space-y-0">
          <SectionHeader title="Preferences" />
          <FormRow label="Default Model" desc="Model used for new conversations">
            <InlineSelect value={model} options={modelOptions} onChange={setModel} />
          </FormRow>
          <FormRow label="Language" desc="Interface language">
            <InlineSelect value={lang} options={languageOptions} onChange={setLang} showDesc />
          </FormRow>
          <FormRow label="Theme">
            <InlineSelect value={theme} options={themeOptions} onChange={setTheme} />
          </FormRow>
          <FormRow label="Font Size">
            <InlineSelect
              value={size}
              options={[
                { value: "sm", label: "Small" },
                { value: "md", label: "Medium" },
                { value: "lg", label: "Large" },
              ]}
              onChange={setSize}
            />
          </FormRow>
        </div>
      </Section>
    </>
  )
}
