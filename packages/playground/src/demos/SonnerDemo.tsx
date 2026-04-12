import React from "react"
import { Button } from "@cherry-studio/ui"
import { toast } from "sonner"
import { Section, type PropDef } from "../components/Section"

export function SonnerDemo() {
  return (
    <>
      <Section title="Toast Types" install="npx shadcn@latest add sonner" props={[
        { name: "position", type: '"top-left" | "top-right" | "bottom-left" | "bottom-right" | "top-center" | "bottom-center"', default: '"bottom-right"', description: "Toast position" },
        { name: "richColors", type: "boolean", default: "false", description: "Use colored toasts" },
      ]} code={`import { toast } from "sonner"
import { Button } from "@cherry-studio/ui"

<Button onClick={() => toast("Event created")}>Default</Button>
<Button onClick={() => toast.success("Saved!")}>Success</Button>
<Button onClick={() => toast.error("Something went wrong")}>Error</Button>`}>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => toast("Event has been created")}>Default</Button>
          <Button variant="outline" onClick={() => toast.success("Successfully saved!")}>Success</Button>
          <Button variant="outline" onClick={() => toast.error("Something went wrong")}>Error</Button>
          <Button variant="outline" onClick={() => toast.warning("Please check your input")}>Warning</Button>
          <Button variant="outline" onClick={() => toast.info("New version available")}>Info</Button>
        </div>
      </Section>

      <Section title="With Description & Action">
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => toast("File uploaded", {
            description: "document.pdf was uploaded successfully.",
          })}>
            With Description
          </Button>
          <Button variant="outline" onClick={() => toast("Message deleted", {
            description: "The message has been moved to trash.",
            action: { label: "Undo", onClick: () => toast.success("Message restored") },
          })}>
            With Undo Action
          </Button>
          <Button variant="outline" onClick={() => toast("New model available", {
            description: "GPT-4o Turbo is now available in your account.",
            action: { label: "Try it", onClick: () => {} },
            cancel: { label: "Dismiss", onClick: () => {} },
          })}>
            With Cancel
          </Button>
        </div>
      </Section>

      <Section title="Promise / Async">
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() =>
            toast.promise(new Promise((r) => setTimeout(r, 2000)), {
              loading: "Saving changes...",
              success: "Changes saved!",
              error: "Failed to save",
            })
          }>
            Save (Success)
          </Button>
          <Button variant="outline" onClick={() =>
            toast.promise(new Promise((_, rej) => setTimeout(() => rej(new Error()), 2000)), {
              loading: "Connecting to API...",
              success: "Connected!",
              error: "Connection failed. Please check your API key.",
            })
          }>
            Connect (Error)
          </Button>
        </div>
      </Section>

      <Section title="Custom Duration & Rich Content">
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() =>
            toast("Quick notification", { duration: 1000 })
          }>
            1s Duration
          </Button>
          <Button variant="outline" onClick={() =>
            toast("Persistent toast", { duration: Infinity, action: { label: "Close", onClick: () => {} } })
          }>
            Persistent
          </Button>
          <Button variant="outline" onClick={() =>
            toast.success("Model switched", {
              description: "Now using Claude Opus 4 (200K context)",
            })
          }>
            Model Switch
          </Button>
          <Button variant="outline" onClick={() => {
            toast.loading("Indexing knowledge base...", { id: "kb-index" })
            setTimeout(() => toast.success("Knowledge base indexed!", { id: "kb-index" }), 2500)
          }}>
            Loading → Success
          </Button>
        </div>
      </Section>
    </>
  )
}
