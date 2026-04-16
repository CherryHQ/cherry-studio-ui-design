import React, { useState } from "react"
import { SettingsModal, Button, type SettingsSection } from "@cherry-studio/ui"
import { Section } from "../components/Section"
import { User, Palette, Bell, Shield, Keyboard } from "lucide-react"

const sections: SettingsSection[] = [
  { id: "profile", label: "Profile", icon: <User size={14} /> },
  { id: "appearance", label: "Appearance", icon: <Palette size={14} /> },
  { id: "notifications", label: "Notifications", icon: <Bell size={14} /> },
  { id: "security", label: "Security", icon: <Shield size={14} /> },
  { id: "shortcuts", label: "Shortcuts", icon: <Keyboard size={14} /> },
]

export function SettingsModalDemo() {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState("profile")

  return (
    <>
      <Section title="SettingsModal" props={[
        { name: "open", type: "boolean", description: "Whether the modal is open" },
        { name: "onOpenChange", type: "(open: boolean) => void", description: "Open state handler" },
        { name: "title", type: "string", default: '"Settings"', description: "Modal title" },
        { name: "sections", type: "SettingsSection[]", description: "Sidebar navigation sections" },
        { name: "activeSection", type: "string", description: "Currently active section id" },
        { name: "onSectionChange", type: "(id: string) => void", description: "Section change handler" },
        { name: "children", type: "ReactNode", description: "Content for the active section" },
      ]} code={`import { SettingsModal } from "@cherry-studio/ui"

<SettingsModal
  open={open}
  onOpenChange={setOpen}
  sections={sections}
  activeSection="profile"
  onSectionChange={setActive}
>
  <div>Section content here</div>
</SettingsModal>`}>
        <Button onClick={() => setOpen(true)}>Open Settings</Button>
        <SettingsModal
          open={open}
          onOpenChange={setOpen}
          title="Settings"
          sections={sections}
          activeSection={active}
          onSectionChange={setActive}
        >
          <div className="p-6">
            <h4 className="text-sm font-medium mb-2 capitalize">{active}</h4>
            <p className="text-xs text-muted-foreground">
              Settings content for the "{active}" section would go here.
            </p>
          </div>
        </SettingsModal>
      </Section>
    </>
  )
}
