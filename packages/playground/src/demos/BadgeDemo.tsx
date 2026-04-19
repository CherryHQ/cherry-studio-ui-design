import React from "react"
import { Badge, Button } from "@cherry-studio/ui"
import { Section, type PropDef } from "../components/Section"
import { Check, Clock, AlertTriangle, X, Star, Bell, ArrowUp, Zap } from "lucide-react"

export function BadgeDemo() {
  return (
    <>
      <Section title="Variants" install="npx shadcn@latest add badge" props={[
        { name: "variant", type: '"default" | "secondary" | "destructive" | "outline"', default: '"default"', description: "Visual style" },
      ]} code={`import { Badge } from "@cherry-studio/ui"

<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Destructive</Badge>
<Badge variant="outline">Outline</Badge>`}>
        <div className="flex flex-wrap gap-3">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="outline">Outline</Badge>
        </div>
      </Section>

      <Section title="With Icons">
        <div className="flex flex-wrap gap-3">
          <Badge><Check className="mr-1 h-3 w-3" /> Approved</Badge>
          <Badge variant="secondary"><Clock className="mr-1 h-3 w-3" /> Pending</Badge>
          <Badge variant="destructive"><AlertTriangle className="mr-1 h-3 w-3" /> Error</Badge>
          <Badge variant="outline"><Star className="mr-1 h-3 w-3" /> Featured</Badge>
        </div>
      </Section>

      <Section title="Status Indicators">
        <div className="flex flex-wrap gap-3">
          <Badge variant="outline" className="bg-success-muted text-success border-success/20 hover:bg-success-muted">
            <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-success inline-block" /> Online
          </Badge>
          <Badge variant="outline" className="bg-warning-muted text-warning border-warning/20 hover:bg-warning-muted">
            <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-warning inline-block" /> Away
          </Badge>
          <Badge variant="outline" className="bg-error-muted text-error border-error/20 hover:bg-error-muted">
            <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-error inline-block" /> Offline
          </Badge>
          <Badge variant="outline" className="bg-info-muted text-info border-info/20 hover:bg-info-muted">
            <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-info animate-pulse inline-block" /> Syncing
          </Badge>
        </div>
      </Section>

      <Section title="Notification Counts">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative inline-flex">
            <Button variant="outline" size="icon"><Bell className="h-4 w-4" /></Button>
            <Badge className="absolute -top-2 -right-2 h-5 min-w-5 px-1 justify-center text-[10px]">3</Badge>
          </div>
          <div className="relative inline-flex">
            <Button variant="outline" size="icon"><Bell className="h-4 w-4" /></Button>
            <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 min-w-5 px-1 justify-center text-[10px]">99+</Badge>
          </div>
          <div className="relative inline-flex">
            <Button variant="outline">Messages</Button>
            <Badge className="absolute -top-2 -right-2 h-5 min-w-5 px-1 justify-center text-[10px]">12</Badge>
          </div>
        </div>
      </Section>

      <Section title="Practical: Tag List">
        <div className="flex flex-wrap gap-2">
          {["React", "TypeScript", "Tailwind CSS", "Shadcn/UI", "Vite"].map((tag) => (
            <Badge key={tag} variant="secondary" className="cursor-pointer hover:bg-secondary/80 gap-1">
              {tag}
              <X className="h-3 w-3 opacity-60 hover:opacity-100" />
            </Badge>
          ))}
          <Badge variant="outline" className="cursor-pointer hover:bg-accent border-dashed">
            + Add Tag
          </Badge>
        </div>
      </Section>

      <Section title="Practical: Version & Change Indicator">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="outline">v2.1.0</Badge>
          <Badge variant="outline" className="bg-success-muted text-success border-success/20 hover:bg-success-muted">
            <ArrowUp className="mr-1 h-3 w-3" /> +12.5%
          </Badge>
          <Badge variant="secondary"><Zap className="mr-1 h-3 w-3" /> New</Badge>
          <Badge variant="destructive">Deprecated</Badge>
        </div>
      </Section>
    </>
  )
}
