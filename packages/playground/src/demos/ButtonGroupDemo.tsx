import React from "react"
import { Button, ButtonGroup } from "@cherry-studio/ui"
import { Section } from "../components/Section"
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, ChevronDown } from "lucide-react"

export function ButtonGroupDemo() {
  return (
    <>
      <Section title="Button Group">
        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Default</p>
            <ButtonGroup>
              <Button variant="outline">Cut</Button>
              <Button variant="outline">Copy</Button>
              <Button variant="outline">Paste</Button>
            </ButtonGroup>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">With Icons</p>
            <ButtonGroup>
              <Button variant="outline" size="icon"><Bold className="h-4 w-4" /></Button>
              <Button variant="outline" size="icon"><Italic className="h-4 w-4" /></Button>
              <Button variant="outline" size="icon"><Underline className="h-4 w-4" /></Button>
            </ButtonGroup>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Split Button</p>
            <ButtonGroup>
              <Button>Save</Button>
              <Button size="icon"><ChevronDown className="h-4 w-4" /></Button>
            </ButtonGroup>
          </div>
        </div>
      </Section>
    </>
  )
}
