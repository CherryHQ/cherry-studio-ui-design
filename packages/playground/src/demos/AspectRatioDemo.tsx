import React from "react"
import { AspectRatio } from "@cherry-studio/ui"
import { Section } from "../components/Section"

export function AspectRatioDemo() {
  return (
    <Section title="Aspect Ratio">
      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-sm text-muted-foreground mb-2">16:9</p>
          <AspectRatio ratio={16 / 9} className="bg-muted rounded-lg flex items-center justify-center">
            <span className="text-sm text-muted-foreground">16:9</span>
          </AspectRatio>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-2">4:3</p>
          <AspectRatio ratio={4 / 3} className="bg-muted rounded-lg flex items-center justify-center">
            <span className="text-sm text-muted-foreground">4:3</span>
          </AspectRatio>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-2">1:1</p>
          <AspectRatio ratio={1} className="bg-muted rounded-lg flex items-center justify-center">
            <span className="text-sm text-muted-foreground">1:1</span>
          </AspectRatio>
        </div>
      </div>
    </Section>
  )
}
