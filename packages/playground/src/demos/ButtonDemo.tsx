import React from "react"
import { Button } from "@cherry-studio/ui"
import { Section, type PropDef } from "../components/Section"
import { ChevronRight, Mail, Loader2, Plus, Download } from "lucide-react"

export function ButtonDemo() {
  return (
    <>
      <Section title="Variants" install="npx shadcn@latest add button" props={[
        { name: "variant", type: '"default" | "secondary" | "destructive" | "outline" | "ghost" | "link"', default: '"default"', description: "Visual style variant" },
        { name: "size", type: '"default" | "sm" | "lg" | "icon"', default: '"default"', description: "Button size" },
        { name: "asChild", type: "boolean", default: "false", description: "Merge props onto child element instead of rendering a button" },
        { name: "disabled", type: "boolean", default: "false", description: "Disable the button" },
      ]} code={`import { Button } from "@cherry-studio/ui"

<Button>Default</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>`}>
        <div className="flex flex-wrap gap-3">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
      </Section>

      <Section title="Sizes">
        <div className="flex flex-wrap items-center gap-3">
          <Button size="lg">Large</Button>
          <Button size="default">Default</Button>
          <Button size="sm">Small</Button>
          <Button size="icon"><Plus className="h-4 w-4" /></Button>
        </div>
      </Section>

      <Section title="With Icons">
        <div className="flex flex-wrap gap-3">
          <Button><Mail className="mr-2 h-4 w-4" /> Login with Email</Button>
          <Button variant="secondary"><Download className="mr-2 h-4 w-4" /> Download</Button>
          <Button variant="outline">Next <ChevronRight className="ml-2 h-4 w-4" /></Button>
        </div>
      </Section>

      <Section title="States">
        <div className="flex flex-wrap gap-3">
          <Button disabled>Disabled</Button>
          <Button disabled variant="secondary">Disabled</Button>
          <Button><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading...</Button>
        </div>
      </Section>
    </>
  )
}
