import React from "react"
import { Toolbar, ToolbarSeparator, Button } from "@cherry-studio/ui"
import { Section } from "../components/Section"
import {
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
  Copy, Scissors, Clipboard, Undo, Redo,
} from "lucide-react"

export function ToolbarDemo() {
  return (
    <>
      <Section title="Toolbar" props={[
        { name: "orientation", type: '"horizontal" | "vertical"', description: "Layout direction (default: horizontal)" },
      ]} code={`import { Toolbar, ToolbarSeparator } from "@cherry-studio/ui"

<Toolbar>
  <Button variant="ghost" size="icon-sm"><Bold size={14} /></Button>
  <Button variant="ghost" size="icon-sm"><Italic size={14} /></Button>
  <ToolbarSeparator />
  <Button variant="ghost" size="icon-sm"><AlignLeft size={14} /></Button>
</Toolbar>`}>
        <div className="space-y-6 max-w-lg">
          <div>
            <p className="text-xs text-muted-foreground mb-2">Horizontal (default)</p>
            <Toolbar>
              <Button variant="ghost" size="icon-sm"><Bold size={14} /></Button>
              <Button variant="ghost" size="icon-sm"><Italic size={14} /></Button>
              <Button variant="ghost" size="icon-sm"><Underline size={14} /></Button>
              <ToolbarSeparator />
              <Button variant="ghost" size="icon-sm"><AlignLeft size={14} /></Button>
              <Button variant="ghost" size="icon-sm"><AlignCenter size={14} /></Button>
              <Button variant="ghost" size="icon-sm"><AlignRight size={14} /></Button>
              <ToolbarSeparator />
              <Button variant="ghost" size="icon-sm"><Undo size={14} /></Button>
              <Button variant="ghost" size="icon-sm"><Redo size={14} /></Button>
            </Toolbar>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-2">Vertical</p>
            <Toolbar orientation="vertical" className="inline-flex">
              <Button variant="ghost" size="icon-sm"><Copy size={14} /></Button>
              <Button variant="ghost" size="icon-sm"><Scissors size={14} /></Button>
              <Button variant="ghost" size="icon-sm"><Clipboard size={14} /></Button>
              <ToolbarSeparator orientation="vertical" />
              <Button variant="ghost" size="icon-sm"><Undo size={14} /></Button>
              <Button variant="ghost" size="icon-sm"><Redo size={14} /></Button>
            </Toolbar>
          </div>
        </div>
      </Section>
    </>
  )
}
