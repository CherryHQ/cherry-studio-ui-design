import React from "react"
import { Separator } from "@cherry-studio/ui"
import { Section, type PropDef } from "../components/Section"

export function SeparatorDemo() {
  return (
    <>
      <Section title="Horizontal" install="npx shadcn@latest add separator" props={[
        { name: "orientation", type: '"horizontal" | "vertical"', default: '"horizontal"', description: "Separator direction" },
        { name: "decorative", type: "boolean", default: "true", description: "Whether purely decorative (hides from screen readers)" },
      ]} code={`import { Separator } from "@cherry-studio/ui"

<Separator />
<Separator className="my-4" />`}>
        <div className="max-w-md space-y-4">
          <div>
            <h4 className="text-sm font-medium">Cherry Studio</h4>
            <p className="text-sm text-muted-foreground">AI-powered development environment.</p>
          </div>
          <Separator />
          <div className="flex gap-4 text-sm">
            <span>Blog</span>
            <Separator orientation="vertical" className="h-4" />
            <span>Docs</span>
            <Separator orientation="vertical" className="h-4" />
            <span>GitHub</span>
          </div>
        </div>
      </Section>

      <Section title="Vertical">
        <div className="flex items-center gap-4 h-10">
          <span className="text-sm">Home</span>
          <Separator orientation="vertical" />
          <span className="text-sm">Settings</span>
          <Separator orientation="vertical" />
          <span className="text-sm">Profile</span>
        </div>
      </Section>

      <Section title="With Label">
        <div className="max-w-md">
          <div className="relative">
            <Separator className="my-4" />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">or continue with</span>
          </div>
        </div>
      </Section>
    </>
  )
}
