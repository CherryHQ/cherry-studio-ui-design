import React from "react"
import { Alert, AlertDescription, AlertTitle } from "@cherry-studio/ui"
import { Section, type PropDef } from "../components/Section"
import { AlertCircle, CheckCircle, Info, AlertTriangle, Terminal, Rocket } from "lucide-react"

export function AlertDemo() {
  return (
    <>
      <Section title="Default" install="npx shadcn@latest add alert" props={[
        { name: "variant", type: '"default" | "destructive"', default: '"default"', description: "Visual style variant" },
        { name: "className", type: "string", default: "undefined", description: "Additional CSS classes" },
      ]} code={`import { Alert, AlertDescription, AlertTitle } from "@cherry-studio/ui"
import { Terminal } from "lucide-react"

<Alert>
  <Terminal className="h-4 w-4" />
  <AlertTitle>Heads up!</AlertTitle>
  <AlertDescription>You can add components using the CLI.</AlertDescription>
</Alert>`}>
        <div className="max-w-lg space-y-4">
          <Alert>
            <Terminal className="h-4 w-4" />
            <AlertTitle>Heads up!</AlertTitle>
            <AlertDescription>You can add components to your project using the CLI.</AlertDescription>
          </Alert>
        </div>
      </Section>

      <Section title="Destructive">
        <div className="max-w-lg space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>Your session has expired. Please log in again.</AlertDescription>
          </Alert>
        </div>
      </Section>

      <Section title="Custom Styled Variants">
        <div className="max-w-lg space-y-4">
          <Alert className="border-green-500/30 bg-green-500/5 text-green-700 dark:text-green-400 [&>svg]:text-green-600">
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>Your changes have been saved successfully.</AlertDescription>
          </Alert>

          <Alert className="border-yellow-500/30 bg-yellow-500/5 text-yellow-700 dark:text-yellow-400 [&>svg]:text-yellow-600">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>Your API key will expire in 3 days. Please renew it.</AlertDescription>
          </Alert>

          <Alert className="border-blue-500/30 bg-blue-500/5 text-blue-700 dark:text-blue-400 [&>svg]:text-blue-600">
            <Info className="h-4 w-4" />
            <AlertTitle>Information</AlertTitle>
            <AlertDescription>A new version of Cherry Studio is available. Update to get the latest features.</AlertDescription>
          </Alert>
        </div>
      </Section>

      <Section title="Without Title">
        <div className="max-w-lg space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>This alert has no title, only a description.</AlertDescription>
          </Alert>
        </div>
      </Section>

      <Section title="Practical: Feature Announcement">
        <div className="max-w-lg">
          <Alert className="border-primary/30 bg-primary/5">
            <Rocket className="h-4 w-4 text-primary" />
            <AlertTitle>New: AI Agents</AlertTitle>
            <AlertDescription>
              Autonomous AI agents can now execute multi-step tasks. Try creating your first agent in the Agent tab.
            </AlertDescription>
          </Alert>
        </div>
      </Section>
    </>
  )
}
