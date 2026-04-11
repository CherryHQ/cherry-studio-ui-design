import React from "react"
import { Badge } from "@cherry-studio/ui"
import { Section } from "../components/Section"

export function BadgeDemo() {
  return (
    <>
      <Section title="Variants">
        <div className="flex flex-wrap gap-3">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="outline">Outline</Badge>
        </div>
      </Section>
    </>
  )
}
