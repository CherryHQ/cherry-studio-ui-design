import React from "react"
import { Kbd } from "@cherry-studio/ui"
import { Section, type PropDef } from "../components/Section"

export function KbdDemo() {
  return (
    <>
      <Section title="Basic" install="custom component" props={[
        { name: "children", type: "ReactNode", description: "Key text content" },
        { name: "className", type: "string", default: "undefined", description: "Additional CSS" },
      ]} code={`import { Kbd } from "@cherry-studio/ui"

<Kbd>⌘</Kbd>
<Kbd>K</Kbd>`}>
        <div className="flex flex-wrap gap-2">
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
          <Kbd>Ctrl</Kbd>
          <Kbd>Shift</Kbd>
          <Kbd>Enter</Kbd>
          <Kbd>Esc</Kbd>
          <Kbd>Tab</Kbd>
          <Kbd>↑</Kbd>
          <Kbd>↓</Kbd>
          <Kbd>←</Kbd>
          <Kbd>→</Kbd>
        </div>
      </Section>

      <Section title="Keyboard Shortcuts">
        <div className="max-w-sm space-y-3">
          {[
            { label: "Search", keys: ["⌘", "K"] },
            { label: "New chat", keys: ["⌘", "N"] },
            { label: "Settings", keys: ["⌘", ","] },
            { label: "Dark mode", keys: ["⌘", "D"] },
            { label: "Save", keys: ["⌘", "S"] },
            { label: "Undo", keys: ["⌘", "Z"] },
          ].map(({ label, keys }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{label}</span>
              <div className="flex gap-1">
                {keys.map((k, i) => <Kbd key={i}>{k}</Kbd>)}
              </div>
            </div>
          ))}
        </div>
      </Section>
    </>
  )
}
