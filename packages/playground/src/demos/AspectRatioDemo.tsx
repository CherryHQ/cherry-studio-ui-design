import React from "react"
import { AspectRatio } from "@cherry-studio/ui"
import { Section, type PropDef } from "../components/Section"

export function AspectRatioDemo() {
  return (
    <>
      <Section title="Aspect Ratio" install="npx shadcn@latest add aspect-ratio" props={[
          { name: "ratio", type: "number", description: "Width/height ratio e.g. 16/9" },
        ]} code={`import { AspectRatio } from "@cherry-studio/ui"

<AspectRatio ratio={16 / 9}>
  <img src="/image.jpg" alt="photo" className="rounded-xl object-cover" />
</AspectRatio>`}>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">16:9</p>
            <AspectRatio ratio={16 / 9} className="bg-muted rounded-xl flex items-center justify-center">
              <span className="text-sm text-muted-foreground">16:9</span>
            </AspectRatio>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-2">4:3</p>
            <AspectRatio ratio={4 / 3} className="bg-muted rounded-xl flex items-center justify-center">
              <span className="text-sm text-muted-foreground">4:3</span>
            </AspectRatio>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-2">1:1</p>
            <AspectRatio ratio={1} className="bg-muted rounded-xl flex items-center justify-center">
              <span className="text-sm text-muted-foreground">1:1</span>
            </AspectRatio>
          </div>
        </div>
      </Section>

      <Section title="More Ratios" code={`<AspectRatio ratio={21 / 9}>Ultra-wide 21:9</AspectRatio>
<AspectRatio ratio={9 / 16}>Portrait 9:16</AspectRatio>`}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">21:9 Ultra-wide</p>
            <AspectRatio ratio={21 / 9} className="bg-muted rounded-xl flex items-center justify-center">
              <span className="text-sm text-muted-foreground">21:9</span>
            </AspectRatio>
          </div>
          <div className="max-w-40">
            <p className="text-sm text-muted-foreground mb-2">9:16 Portrait</p>
            <AspectRatio ratio={9 / 16} className="bg-muted rounded-xl flex items-center justify-center">
              <span className="text-sm text-muted-foreground">9:16</span>
            </AspectRatio>
          </div>
        </div>
      </Section>
    </>
  )
}
