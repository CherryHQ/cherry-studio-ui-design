import React, { useState } from "react"
import { Checkbox, RadioGroup, RadioGroupItem, Switch, Label } from "@cherry-studio/ui"
import { Section, type PropDef } from "../components/Section"

export function CheckboxRadioSwitchDemo() {
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false,
  })

  return (
    <>
      <Section title="Checkbox" install="npx shadcn@latest add checkbox" props={[
        { name: "checked", type: "boolean", description: "Controlled state" },
        { name: "onCheckedChange", type: "(checked) => void", description: "Change handler" },
        { name: "disabled", type: "boolean", default: "false", description: "Disable" },
      ]} code={`import { Checkbox, Label } from "@cherry-studio/ui"

<div className="flex items-center space-x-2">
  <Checkbox id="terms" />
  <Label htmlFor="terms">Accept terms and conditions</Label>
</div>`}>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox id="terms" />
            <Label htmlFor="terms">Accept terms and conditions</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="marketing" defaultChecked />
            <Label htmlFor="marketing">Receive marketing emails</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="disabled-cb" disabled />
            <Label htmlFor="disabled-cb" className="text-muted-foreground">Disabled</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="disabled-checked" disabled defaultChecked />
            <Label htmlFor="disabled-checked" className="text-muted-foreground">Disabled (checked)</Label>
          </div>
        </div>
      </Section>

      <Section title="Checkbox — Practical Settings">
        <div className="rounded-lg border p-4 max-w-sm space-y-4">
          <h4 className="text-sm font-medium">Notification Preferences</h4>
          {(["email", "push", "sms"] as const).map((key) => (
            <div key={key} className="flex items-start space-x-3">
              <Checkbox
                id={`notif-${key}`}
                checked={notifications[key]}
                onCheckedChange={(checked) =>
                  setNotifications((prev) => ({ ...prev, [key]: !!checked }))
                }
                className="mt-0.5"
              />
              <div className="space-y-0.5">
                <Label htmlFor={`notif-${key}`} className="leading-none">
                  {key === "email" ? "Email notifications" : key === "push" ? "Push notifications" : "SMS notifications"}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {key === "email" ? "Receive updates via email" : key === "push" ? "Browser push notifications" : "Text message alerts"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Radio Group">
        <div className="space-y-4">
          <RadioGroup defaultValue="comfortable">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="default" id="r1" />
              <Label htmlFor="r1">Default</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="comfortable" id="r2" />
              <Label htmlFor="r2">Comfortable</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="compact" id="r3" />
              <Label htmlFor="r3">Compact</Label>
            </div>
          </RadioGroup>
        </div>
      </Section>

      <Section title="Radio Group — Card Style">
        <RadioGroup defaultValue="gpt4o" className="grid grid-cols-3 gap-3 max-w-lg">
          {[
            { value: "gpt4o", label: "GPT-4o", desc: "128K context" },
            { value: "claude", label: "Claude Opus", desc: "200K context" },
            { value: "gemini", label: "Gemini Pro", desc: "1M context" },
          ].map((model) => (
            <Label
              key={model.value}
              htmlFor={`model-${model.value}`}
              className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer has-[:checked]:border-primary [&:has(:checked)]:border-primary"
            >
              <RadioGroupItem value={model.value} id={`model-${model.value}`} className="sr-only" />
              <span className="text-sm font-medium">{model.label}</span>
              <span className="text-xs text-muted-foreground">{model.desc}</span>
            </Label>
          ))}
        </RadioGroup>
      </Section>

      <Section title="Switch">
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Switch id="airplane" />
            <Label htmlFor="airplane">Airplane Mode</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="wifi" defaultChecked />
            <Label htmlFor="wifi">Wi-Fi</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="disabled-sw" disabled />
            <Label htmlFor="disabled-sw" className="text-muted-foreground">Disabled</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="disabled-on" disabled defaultChecked />
            <Label htmlFor="disabled-on" className="text-muted-foreground">Disabled (on)</Label>
          </div>
        </div>
      </Section>

      <Section title="Switch — Practical Settings Row">
        <div className="max-w-sm space-y-4 rounded-lg border p-4">
          {[
            { id: "dark-mode", label: "Dark Mode", desc: "Use dark theme", on: true },
            { id: "stream", label: "Stream Output", desc: "Show tokens as they generate", on: true },
            { id: "sound", label: "Sound Effects", desc: "Play sounds on events", on: false },
            { id: "analytics", label: "Usage Analytics", desc: "Send anonymous usage data", on: false },
          ].map((item) => (
            <div key={item.id} className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor={item.id}>{item.label}</Label>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <Switch id={item.id} defaultChecked={item.on} />
            </div>
          ))}
        </div>
      </Section>
    </>
  )
}
