import React, { useState } from "react"
import { ErrorBoundary, Button } from "@cherry-studio/ui"
import { Section } from "../components/Section"

function BuggyComponent({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error("Something went wrong in BuggyComponent!")
  }
  return (
    <div className="p-6 text-center text-sm text-muted-foreground">
      Component rendered successfully. Click the button to trigger an error.
    </div>
  )
}

export function ErrorBoundaryDemo() {
  const [key, setKey] = useState(0)
  const [shouldThrow, setShouldThrow] = useState(false)

  const triggerError = () => {
    setShouldThrow(true)
    setKey(prev => prev + 1)
  }

  const reset = () => {
    setShouldThrow(false)
    setKey(prev => prev + 1)
  }

  return (
    <>
      <Section title="ErrorBoundary" props={[
        { name: "children", type: "ReactNode", description: "Child components to protect" },
        { name: "fallback", type: "ReactNode", description: "Custom fallback UI (optional)" },
        { name: "className", type: "string", description: "CSS class for the error card" },
      ]} code={`import { ErrorBoundary } from "@cherry-studio/ui"

<ErrorBoundary>
  <MyComponent />
</ErrorBoundary>`}>
        <div className="max-w-md space-y-3">
          <div className="flex gap-2">
            <Button size="sm" variant="destructive" onClick={triggerError}>
              Trigger Error
            </Button>
            <Button size="sm" variant="outline" onClick={reset}>
              Reset
            </Button>
          </div>
          <div className="border rounded-[12px] overflow-hidden bg-background h-[280px]">
            <ErrorBoundary key={key}>
              <BuggyComponent shouldThrow={shouldThrow} />
            </ErrorBoundary>
          </div>
        </div>
      </Section>
    </>
  )
}
