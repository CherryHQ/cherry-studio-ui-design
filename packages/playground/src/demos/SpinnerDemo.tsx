import React from "react"
import { Spinner, Button } from "@cherry-studio/ui"
import { Section, type PropDef } from "../components/Section"

export function SpinnerDemo() {
  return (
    <>
      <Section title="Sizes" install="custom component" props={[
        { name: "className", type: "string", default: '"size-4 animate-spin"', description: "Size and animation via className" },
      ]} code={`import { Spinner } from "@cherry-studio/ui"

<Spinner className="size-3" />
<Spinner />
<Spinner className="size-6" />`}>
        <div className="flex items-center gap-6">
          <div className="text-center space-y-2">
            <Spinner className="size-3" />
            <p className="text-xs text-muted-foreground">Small</p>
          </div>
          <div className="text-center space-y-2">
            <Spinner />
            <p className="text-xs text-muted-foreground">Default</p>
          </div>
          <div className="text-center space-y-2">
            <Spinner className="size-6" />
            <p className="text-xs text-muted-foreground">Large</p>
          </div>
        </div>
      </Section>

      <Section title="With Text">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Spinner className="size-3" />
            <span className="text-sm text-muted-foreground">Loading...</span>
          </div>
          <div className="flex items-center gap-2">
            <Spinner className="size-3" />
            <span className="text-sm text-muted-foreground">Generating response...</span>
          </div>
        </div>
      </Section>

      <Section title="In Button">
        <div className="flex gap-3">
          <Button disabled>
            <Spinner className="size-3 mr-2" /> Saving...
          </Button>
          <Button variant="outline" disabled>
            <Spinner className="size-3 mr-2" /> Loading
          </Button>
        </div>
      </Section>

      <Section title="Full Page Loading">
        <div className="h-32 rounded-[12px] border flex items-center justify-center">
          <div className="text-center space-y-3">
            <Spinner className="size-6 mx-auto" />
            <p className="text-sm text-muted-foreground">Loading your workspace...</p>
          </div>
        </div>
      </Section>
    </>
  )
}
