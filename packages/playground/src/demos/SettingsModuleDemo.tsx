import React, { useState } from "react"
import {
  PanelHeader, ConfigSection, FormRow, SectionHeader,
  InlineSelect, Switch, Input, Badge, Slider
} from "@cherry-studio/ui"
import { Section, type PropDef } from "../components/Section"

const modelOptions = [
  { value: "gpt-4o", label: "GPT-4o" },
  { value: "gpt-4o-mini", label: "GPT-4o Mini" },
  { value: "claude-opus", label: "Claude Opus 4" },
  { value: "claude-sonnet", label: "Claude Sonnet 4" },
  { value: "gemini-pro", label: "Gemini 2.5 Pro" },
]

const settingsModuleProps: PropDef[] = [
  { name: "className", type: "string", default: "undefined", description: "Additional CSS" },
]

export function SettingsModuleDemo() {
  const [model, setModel] = useState("claude-sonnet")
  const [temperature, setTemperature] = useState([70])
  const [stream, setStream] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [showTimestamps, setShowTimestamps] = useState(true)
  const [markdown, setMarkdown] = useState(true)
  const [analytics, setAnalytics] = useState(false)
  const [crashReports, setCrashReports] = useState(true)

  return (
    <Section title="Settings Module" install="npm install @cherry-studio/ui" props={settingsModuleProps} code={`<PanelHeader icon="⚙️" title="Settings" desc="Configure preferences" />
<ConfigSection title="General" hint="Basic options">
  <FormRow label="Dark Mode" desc="Use dark color scheme">
    <Switch checked={dark} onCheckedChange={setDark} />
  </FormRow>
  <FormRow label="Model" desc="Default model">
    <InlineSelect value={model} options={models} onChange={setModel} />
  </FormRow>
</ConfigSection>`}>
      <div className="max-w-md rounded-xl border bg-background p-4 space-y-3">
        <PanelHeader
          icon="⚙️"
          title="General Settings"
          desc="Configure your Cherry Studio preferences"
        />

        <ConfigSection title="Model Configuration" hint="Default model and generation parameters">
          <FormRow label="Default Model" desc="Used for new conversations">
            <InlineSelect value={model} options={modelOptions} onChange={setModel} />
          </FormRow>
          <FormRow label="Temperature" desc="Lower = focused, higher = creative">
            <div className="flex items-center gap-2">
              <div className="w-28">
                <Slider value={temperature} onValueChange={setTemperature} max={100} step={1} />
              </div>
              <span className="text-[10px] font-mono text-muted-foreground w-6 text-right">
                {(temperature[0] / 100).toFixed(1)}
              </span>
            </div>
          </FormRow>
          <FormRow label="Stream Output" desc="Show tokens as they generate">
            <Switch checked={stream} onCheckedChange={setStream} />
          </FormRow>
        </ConfigSection>

        <ConfigSection title="Display" hint="Appearance and rendering options">
          <FormRow label="Dark Mode" desc="Use dark color scheme">
            <Switch checked={darkMode} onCheckedChange={setDarkMode} />
          </FormRow>
          <FormRow label="Show Timestamps" desc="Display time on each message">
            <Switch checked={showTimestamps} onCheckedChange={setShowTimestamps} />
          </FormRow>
          <FormRow label="Markdown Rendering" desc="Render markdown in responses">
            <Switch checked={markdown} onCheckedChange={setMarkdown} />
          </FormRow>
        </ConfigSection>

        <ConfigSection
          title="Privacy"
          hint="Data collection preferences"
          actions={
            <Badge variant="outline" className="bg-violet-500/15 text-violet-700 border-violet-500/20 dark:text-violet-400 text-[9px]">
              Pro
            </Badge>
          }
        >
          <FormRow label="Usage Analytics" desc="Help improve Cherry Studio with anonymous usage data">
            <Switch checked={analytics} onCheckedChange={setAnalytics} />
          </FormRow>
          <FormRow label="Crash Reports" desc="Automatically send crash reports">
            <Switch checked={crashReports} onCheckedChange={setCrashReports} />
          </FormRow>
        </ConfigSection>
      </div>
    </Section>
  )
}
