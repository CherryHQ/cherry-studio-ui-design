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
          <Badge variant="outline" className="bg-green-500/15 text-green-700 border-green-500/20 hover:bg-green-500/25 dark:text-green-400">
            <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-green-500 inline-block" /> Online
          </Badge>
          <Badge variant="outline" className="bg-yellow-500/15 text-yellow-700 border-yellow-500/20 hover:bg-yellow-500/25 dark:text-yellow-400">
            <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-yellow-500 inline-block" /> Away
          </Badge>
          <Badge variant="outline" className="bg-red-500/15 text-red-700 border-red-500/20 hover:bg-red-500/25 dark:text-red-400">
            <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-red-500 inline-block" /> Offline
          </Badge>
          <Badge variant="outline" className="bg-blue-500/15 text-blue-700 border-blue-500/20 hover:bg-blue-500/25 dark:text-blue-400">
            <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse inline-block" /> Syncing
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
          <Badge variant="outline" className="bg-green-500/15 text-green-700 border-green-500/20 hover:bg-green-500/25 dark:text-green-400">
            <ArrowUp className="mr-1 h-3 w-3" /> +12.5%
          </Badge>
          <Badge variant="secondary"><Zap className="mr-1 h-3 w-3" /> New</Badge>
          <Badge variant="destructive">Deprecated</Badge>
        </div>
      </Section>
    </>
  )
}
