import React, { useState } from "react"
import {
  ConfigSection, FormRow, SectionHeader, PanelHeader,
  Switch, Button, Badge, Input
} from "@cherry-studio/ui"
import { Section, type PropDef } from "../components/Section"
import { Settings, Trash2, Copy, Eye, EyeOff } from "lucide-react"

export function ConfigSectionDemo() {
  const [showKey, setShowKey] = useState(false)
  const [autoSave, setAutoSave] = useState(true)
  const [spellCheck, setSpellCheck] = useState(false)
  const [debugMode, setDebugMode] = useState(false)
  const [verboseLogging, setVerboseLogging] = useState(false)
  const [compactMode, setCompactMode] = useState(false)

  return (
    <>
      <Section title="Config Section — Basic" install="npm install @cherry-studio/ui" props={[
        { name: "title", type: "string", description: "Section title" },
        { name: "hint", type: "string", default: "undefined", description: "Hint text below title" },
        { name: "actions", type: "ReactNode", default: "undefined", description: "Action buttons area" },
        { name: "disabled", type: "boolean", default: "false", description: "Disable section" },
      ]} code={`import { ConfigSection, FormRow, Switch } from "@cherry-studio/ui"

<ConfigSection title="General" hint="Basic settings">
  <FormRow label="Auto-save">
    <Switch defaultChecked />
  </FormRow>
  <FormRow label="Spell Check">
    <Switch />
  </FormRow>
</ConfigSection>`}>
        <div className="max-w-md space-y-3">
          <ConfigSection title="General" hint="Basic application settings">
            <FormRow label="Auto-save">
              <Switch checked={autoSave} onCheckedChange={setAutoSave} />
            </FormRow>
            <FormRow label="Spell Check">
              <Switch checked={spellCheck} onCheckedChange={setSpellCheck} />
            </FormRow>
          </ConfigSection>

          <ConfigSection title="Advanced" hint="Experimental features">
            <FormRow label="Debug Mode">
              <Switch checked={debugMode} onCheckedChange={setDebugMode} />
            </FormRow>
            <FormRow label="Verbose Logging">
              <Switch checked={verboseLogging} onCheckedChange={setVerboseLogging} />
            </FormRow>
          </ConfigSection>
        </div>
      </Section>

      <Section title="With Actions">
        <div className="max-w-md space-y-3">
          <ConfigSection
            title="OpenAI"
            hint="Configure your OpenAI API connection"
            actions={
              <Badge variant="outline" className="bg-success-muted text-success border-success/20 text-[10px]">
                Connected
              </Badge>
            }
          >
            <FormRow label="API Key">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono text-foreground/40">
                  {showKey ? "sk-proj-abc123...xyz" : "sk-****...****"}
                </span>
                <Button variant="ghost"
                  onClick={() => setShowKey(!showKey)}
                  className="text-foreground/30 hover:text-foreground/60 transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                  {showKey ? <EyeOff size={11} /> : <Eye size={11} />}
                </Button>
              </div>
            </FormRow>
            <FormRow label="Base URL">
              <span className="text-[10px] font-mono text-foreground/40">https://api.openai.com/v1</span>
            </FormRow>
          </ConfigSection>

          <ConfigSection
            title="Anthropic"
            hint="Configure your Anthropic API connection"
            actions={
              <Badge variant="outline" className="text-[10px] text-destructive border-destructive/20">
                Not configured
              </Badge>
            }
          >
            <FormRow label="API Key" direction="vertical">
              <Input placeholder="sk-ant-..." className="font-mono text-xs" />
            </FormRow>
            <div className="flex justify-end pt-1">
              <Button size="sm" variant="outline" className="text-[10px] h-7">Test Connection</Button>
            </div>
          </ConfigSection>
        </div>
      </Section>

      <Section title="Disabled">
        <div className="max-w-md">
          <ConfigSection title="Beta Features" hint="These features are not yet available" disabled>
            <FormRow label="AI Agents">
              <Switch />
            </FormRow>
            <FormRow label="Plugin System">
              <Switch />
            </FormRow>
          </ConfigSection>
        </div>
      </Section>

      <Section title="Panel Header">
        <div className="max-w-md space-y-4">
          <div className="rounded-xl border p-4">
            <PanelHeader
              icon="⚙️"
              title="General Settings"
              desc="Configure application preferences"
              actions={<Button size="sm" variant="ghost" className="h-7 text-[10px]"><Settings size={12} className="mr-1" /> Advanced</Button>}
            />
            <ConfigSection title="Appearance">
              <FormRow label="Theme">
                <Badge variant="outline" className="text-[10px]">System</Badge>
              </FormRow>
              <FormRow label="Compact Mode">
                <Switch checked={compactMode} onCheckedChange={setCompactMode} />
              </FormRow>
            </ConfigSection>
          </div>

          <div className="rounded-xl border p-4">
            <PanelHeader
              icon="🤖"
              title="Model Services"
              desc="Manage your AI model providers"
            />
            <p className="text-xs text-muted-foreground">3 providers configured</p>
          </div>

          <div className="rounded-xl border p-4">
            <PanelHeader
              icon={<Settings className="h-4 w-4 text-muted-foreground" />}
              title="With React Node Icon"
              desc="Icon prop also accepts React elements"
            />
            <p className="text-xs text-muted-foreground">Content goes here.</p>
          </div>
        </div>
      </Section>
    </>
  )
}
