import React from "react"
import { Button } from "@cherry-studio/ui"
import { toast } from "sonner"
import { Section } from "../components/Section"

export function SonnerDemo() {
  return (
    <Section title="Toast Notifications">
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" onClick={() => toast("Event has been created")}>Default</Button>
        <Button variant="outline" onClick={() => toast.success("Successfully saved!")}>Success</Button>
        <Button variant="outline" onClick={() => toast.error("Something went wrong")}>Error</Button>
        <Button variant="outline" onClick={() => toast.warning("Please check your input")}>Warning</Button>
        <Button variant="outline" onClick={() => toast.info("New version available")}>Info</Button>
        <Button variant="outline" onClick={() => toast("Event created", { description: "Monday, January 3rd at 6:00 PM", action: { label: "Undo", onClick: () => {} } })}>With Action</Button>
        <Button variant="outline" onClick={() => toast.promise(new Promise(r => setTimeout(r, 2000)), { loading: "Loading...", success: "Done!", error: "Error" })}>Promise</Button>
      </div>
    </Section>
  )
}
