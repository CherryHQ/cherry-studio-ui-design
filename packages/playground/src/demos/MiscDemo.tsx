import React from "react"
import { Separator, Kbd, Spinner, Alert, AlertDescription, AlertTitle } from "@cherry-studio/ui"
import { Section } from "../components/Section"
import { Terminal, AlertCircle } from "lucide-react"

export function MiscDemo() {
  return (
    <>
      <Section title="Separator">
        <div className="space-y-4 max-w-sm">
          <div>
            <div className="space-y-1">
              <h4 className="text-sm font-medium leading-none">Cherry Studio</h4>
              <p className="text-sm text-muted-foreground">An AI-powered development environment.</p>
            </div>
            <Separator className="my-4" />
            <div className="flex h-5 items-center space-x-4 text-sm">
              <div>Blog</div>
              <Separator orientation="vertical" />
              <div>Docs</div>
              <Separator orientation="vertical" />
              <div>Source</div>
            </div>
          </div>
        </div>
      </Section>

      <Section title="Kbd (Keyboard)">
        <div className="flex flex-wrap gap-2 items-center">
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
          <span className="text-sm text-muted-foreground mx-2">or</span>
          <Kbd>Ctrl</Kbd>
          <span className="text-sm text-muted-foreground">+</span>
          <Kbd>Shift</Kbd>
          <span className="text-sm text-muted-foreground">+</span>
          <Kbd>P</Kbd>
        </div>
      </Section>

      <Section title="Spinner">
        <div className="flex items-center gap-6">
          <Spinner />
          <Spinner className="text-primary" />
          <Spinner className="h-8 w-8" />
        </div>
      </Section>

      <Section title="Alert">
        <div className="space-y-4 max-w-lg">
          <Alert>
            <Terminal className="h-4 w-4" />
            <AlertTitle>Heads up!</AlertTitle>
            <AlertDescription>You can add components to your app using the CLI.</AlertDescription>
          </Alert>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>Your session has expired. Please log in again.</AlertDescription>
          </Alert>
        </div>
      </Section>
    </>
  )
}
