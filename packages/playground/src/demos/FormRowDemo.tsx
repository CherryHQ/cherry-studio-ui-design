import React, { useState } from "react"
import {
  FormRow, SectionHeader, Switch, Input, Textarea, Button, Slider, Badge
} from "@cherry-studio/ui"
import { Section, type PropDef } from "../components/Section"

export function FormRowDemo() {
  const [stream, setStream] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [sound, setSound] = useState(false)
  const [temp, setTemp] = useState([70])

  return (
    <>
      <Section title="Basic Form Rows" install="npm install @cherry-studio/ui" props={[
        { name: "label", type: "string", description: "Row label text" },
        { name: "desc", type: "string", default: "undefined", description: "Help tooltip text" },
        { name: "direction", type: '"horizontal" | "vertical"', default: '"horizontal"', description: "Layout direction" },
        { name: "disabled", type: "boolean", default: "false", description: "Disable row" },
      ]} code={`import { FormRow, Switch } from "@cherry-studio/ui"

<FormRow label="Stream Output" desc="Show tokens as they generate">
  <Switch />
</FormRow>
<FormRow label="Dark Mode">
  <Switch />
</FormRow>`}>
        <div className="max-w-md space-y-0">
          <FormRow label="Language" desc="Interface display language">
            <Badge variant="outline" className="text-[10px]">English</Badge>
          </FormRow>
          <FormRow label="Stream Output" desc="Show tokens as they generate in real time">
            <Switch checked={stream} onCheckedChange={setStream} />
          </FormRow>
          <FormRow label="Dark Mode">
            <Switch checked={darkMode} onCheckedChange={setDarkMode} />
          </FormRow>
          <FormRow label="Sound Effects" desc="Play sounds on message send/receive">
            <Switch checked={sound} onCheckedChange={setSound} />
          </FormRow>
        </div>
      </Section>

      <Section title="With Section Headers">
        <div className="max-w-md space-y-0">
          <SectionHeader title="Model Configuration" />
          <FormRow label="Temperature" desc="Controls randomness. Lower = focused, higher = creative.">
            <div className="w-32">
              <Slider value={temp} onValueChange={setTemp} max={100} step={1} />
            </div>
          </FormRow>
          <FormRow label="Max Tokens" desc="Maximum number of tokens to generate">
            <span className="text-[10px] text-foreground/60 font-mono">4096</span>
          </FormRow>

          <SectionHeader title="Display" />
          <FormRow label="Font Size">
            <span className="text-[10px] text-foreground/60 font-mono">14px</span>
          </FormRow>
          <FormRow label="Show Timestamps" desc="Display message timestamps">
            <Switch defaultChecked />
          </FormRow>
        </div>
      </Section>

      <Section title="Vertical Direction">
        <div className="max-w-md space-y-3">
          <FormRow label="API Key" desc="Your OpenAI API key" direction="vertical">
            <Input type="password" placeholder="sk-..." className="font-mono text-xs" />
          </FormRow>
          <FormRow label="System Prompt" direction="vertical">
            <Textarea
              className="w-full rounded-[12px] border border-input bg-background px-3 py-2 text-xs min-h-[60px] resize-none"
              placeholder="You are a helpful assistant..."
            />
          </FormRow>
        </div>
      </Section>

      <Section title="Disabled State">
        <div className="max-w-md space-y-0">
          <FormRow label="Enabled Setting">
            <Switch defaultChecked />
          </FormRow>
          <FormRow label="Disabled Setting" disabled>
            <Switch disabled />
          </FormRow>
          <FormRow label="Another Disabled" desc="This feature is not available yet" disabled>
            <Badge variant="outline" className="text-[10px]">Coming Soon</Badge>
          </FormRow>
        </div>
      </Section>

      <Section title="Practical: Settings Panel">
        <div className="max-w-md rounded-[12px] border bg-card p-4 space-y-0">
          <SectionHeader title="Chat Settings" />
          <FormRow label="Auto-scroll" desc="Scroll to bottom on new messages">
            <Switch defaultChecked />
          </FormRow>
          <FormRow label="Markdown Rendering" desc="Render markdown in assistant messages">
            <Switch defaultChecked />
          </FormRow>
          <FormRow label="Code Highlighting" desc="Syntax highlighting in code blocks">
            <Switch defaultChecked />
          </FormRow>

          <SectionHeader title="Privacy" />
          <FormRow label="Usage Analytics" desc="Send anonymous usage data to help improve the app">
            <Switch />
          </FormRow>
          <FormRow label="Crash Reports" desc="Automatically send crash reports">
            <Switch defaultChecked />
          </FormRow>

          <div className="pt-3 flex gap-2">
            <Button size="sm">Save Changes</Button>
            <Button size="sm" variant="outline">Reset</Button>
          </div>
        </div>
      </Section>
    </>
  )
}
