import React from "react"
import { Toggle, ToggleGroup, ToggleGroupItem } from "@cherry-studio/ui"
import { Section } from "../components/Section"
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight } from "lucide-react"

export function ToggleDemo() {
  return (
    <>
      <Section title="Toggle">
        <div className="flex gap-2">
          <Toggle aria-label="Bold"><Bold className="h-4 w-4" /></Toggle>
          <Toggle aria-label="Italic"><Italic className="h-4 w-4" /></Toggle>
          <Toggle aria-label="Underline"><Underline className="h-4 w-4" /></Toggle>
        </div>
      </Section>

      <Section title="Toggle Group">
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Single selection</p>
            <ToggleGroup type="single" defaultValue="center">
              <ToggleGroupItem value="left" aria-label="Left"><AlignLeft className="h-4 w-4" /></ToggleGroupItem>
              <ToggleGroupItem value="center" aria-label="Center"><AlignCenter className="h-4 w-4" /></ToggleGroupItem>
              <ToggleGroupItem value="right" aria-label="Right"><AlignRight className="h-4 w-4" /></ToggleGroupItem>
            </ToggleGroup>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-2">Multiple selection</p>
            <ToggleGroup type="multiple">
              <ToggleGroupItem value="bold" aria-label="Bold"><Bold className="h-4 w-4" /></ToggleGroupItem>
              <ToggleGroupItem value="italic" aria-label="Italic"><Italic className="h-4 w-4" /></ToggleGroupItem>
              <ToggleGroupItem value="underline" aria-label="Underline"><Underline className="h-4 w-4" /></ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      </Section>
    </>
  )
}
