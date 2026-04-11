import React from "react"
import { Checkbox, RadioGroup, RadioGroupItem, Switch, Label } from "@cherry-studio/ui"
import { Section } from "../components/Section"

export function CheckboxRadioSwitchDemo() {
  return (
    <>
      <Section title="Checkbox">
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
            <Checkbox id="disabled" disabled />
            <Label htmlFor="disabled" className="text-muted-foreground">Disabled</Label>
          </div>
        </div>
      </Section>

      <Section title="Radio Group">
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
        </div>
      </Section>
    </>
  )
}
