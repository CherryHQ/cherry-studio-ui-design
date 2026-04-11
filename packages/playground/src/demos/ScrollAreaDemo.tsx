import React from "react"
import { ScrollArea, Separator } from "@cherry-studio/ui"
import { Section } from "../components/Section"

const tags = Array.from({ length: 50 }).map((_, i) => `Tag ${i + 1}`)

export function ScrollAreaDemo() {
  return (
    <Section title="Scroll Area">
      <ScrollArea className="h-72 w-48 rounded-md border">
        <div className="p-4">
          <h4 className="mb-4 text-sm font-medium leading-none">Tags</h4>
          {tags.map((tag, i) => (
            <React.Fragment key={tag}>
              <div className="text-sm">{tag}</div>
              {i < tags.length - 1 && <Separator className="my-2" />}
            </React.Fragment>
          ))}
        </div>
      </ScrollArea>
    </Section>
  )
}
