import React, { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel, SelectSeparator, Label } from "@cherry-studio/ui"
import { Section, type PropDef } from "../components/Section"

export function SelectDemo() {
  const [fruit, setFruit] = useState("")
  const [model, setModel] = useState("")

  return (
    <>
      <Section title="Basic Select" install="npx shadcn@latest add select" props={[
        { name: "value", type: "string", default: "undefined", description: "Controlled value" },
        { name: "defaultValue", type: "string", default: "undefined", description: "Default value" },
        { name: "onValueChange", type: "(value: string) => void", default: "undefined", description: "Change handler" },
        { name: "disabled", type: "boolean", default: "false", description: "Disable the select" },
      ] satisfies PropDef[]} code={`import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@cherry-studio/ui"

<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select a fruit" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="apple">Apple</SelectItem>
    <SelectItem value="banana">Banana</SelectItem>
  </SelectContent>
</Select>`}>
        <div className="max-w-70 space-y-3">
          <Select value={fruit} onValueChange={setFruit}>
            <SelectTrigger>
              <SelectValue placeholder="Select a fruit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="apple">Apple</SelectItem>
              <SelectItem value="banana">Banana</SelectItem>
              <SelectItem value="orange">Orange</SelectItem>
              <SelectItem value="grape">Grape</SelectItem>
              <SelectItem value="mango">Mango</SelectItem>
            </SelectContent>
          </Select>
          {fruit && <p className="text-sm text-muted-foreground">You picked: <span className="text-foreground font-medium">{fruit}</span></p>}
        </div>
      </Section>

      <Section title="Grouped Select">
        <div className="max-w-70 space-y-3">
          <Select value={model} onValueChange={setModel}>
            <SelectTrigger>
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>OpenAI</SelectLabel>
                <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
              </SelectGroup>
              <SelectSeparator />
              <SelectGroup>
                <SelectLabel>Anthropic</SelectLabel>
                <SelectItem value="claude-opus">Claude Opus 4</SelectItem>
                <SelectItem value="claude-sonnet">Claude Sonnet 4</SelectItem>
              </SelectGroup>
              <SelectSeparator />
              <SelectGroup>
                <SelectLabel>Google</SelectLabel>
                <SelectItem value="gemini-pro">Gemini 2.5 Pro</SelectItem>
                <SelectItem value="gemini-flash">Gemini 2.5 Flash</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          {model && <p className="text-sm text-muted-foreground">Selected: <span className="text-foreground font-medium">{model}</span></p>}
        </div>
      </Section>

      <Section title="With Disabled Items">
        <div className="max-w-70">
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select a plan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="free">Free</SelectItem>
              <SelectItem value="pro">Pro — $9/mo</SelectItem>
              <SelectItem value="enterprise" disabled>Enterprise (Contact us)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Section>

      <Section title="States">
        <div className="space-y-4 max-w-70">
          <div className="space-y-2">
            <Label className="text-sm">Disabled</Label>
            <Select disabled>
              <SelectTrigger>
                <SelectValue placeholder="Disabled select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="a">Option A</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-sm text-destructive">With Error</Label>
            <Select>
              <SelectTrigger aria-invalid="true">
                <SelectValue placeholder="Select required" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="a">Option A</SelectItem>
                <SelectItem value="b">Option B</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-destructive">This field is required.</p>
          </div>
        </div>
      </Section>

      <Section title="Scrollable Long List">
        <div className="max-w-70">
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select timezone" />
            </SelectTrigger>
            <SelectContent>
              {[
                "UTC-12:00", "UTC-11:00", "UTC-10:00", "UTC-09:00", "UTC-08:00 (PST)",
                "UTC-07:00 (MST)", "UTC-06:00 (CST)", "UTC-05:00 (EST)", "UTC-04:00",
                "UTC-03:00", "UTC-02:00", "UTC-01:00", "UTC+00:00 (GMT)",
                "UTC+01:00 (CET)", "UTC+02:00 (EET)", "UTC+03:00", "UTC+04:00",
                "UTC+05:00", "UTC+05:30 (IST)", "UTC+06:00", "UTC+07:00",
                "UTC+08:00 (CST)", "UTC+09:00 (JST)", "UTC+10:00", "UTC+11:00", "UTC+12:00"
              ].map((tz) => (
                <SelectItem key={tz} value={tz}>{tz}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Section>
    </>
  )
}
