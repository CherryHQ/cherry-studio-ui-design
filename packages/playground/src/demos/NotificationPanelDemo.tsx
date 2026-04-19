import React, { useState } from "react"
import { NotificationPanel, NotificationItem } from "@cherry-studio/ui"
import { Section } from "../components/Section"
import { Bell, MessageCircle, Settings, Star } from "lucide-react"

const tabs = [
  { label: "All", value: "all", count: 5 },
  { label: "Unread", value: "unread", count: 3 },
  { label: "Mentions", value: "mentions", count: 1 },
]

export function NotificationPanelDemo() {
  const [activeTab, setActiveTab] = useState("all")

  return (
    <>
      <Section title="NotificationPanel" props={[
        { name: "title", type: "string", default: '"Notifications"', description: "Panel title" },
        { name: "tabs", type: "{ label, value, count }[]", description: "Filter tabs" },
        { name: "activeTab", type: "string", description: "Active tab value" },
        { name: "onTabChange", type: "(tab: string) => void", description: "Tab change handler" },
        { name: "children", type: "ReactNode", description: "NotificationItem elements" },
      ]} code={`import { NotificationPanel, NotificationItem } from "@cherry-studio/ui"

<NotificationPanel tabs={tabs} activeTab="all" onTabChange={setActiveTab}>
  <NotificationItem title="New message" time="2m ago" />
</NotificationPanel>`}>
        <div className="max-w-md">
          <NotificationPanel
            title="Notifications"
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          >
            <NotificationItem
              title="New model available"
              description="GPT-4o is now available in your workspace."
              time="2m ago"
              avatar={<Star size={18} className="text-accent-amber" />}
              badgeIcon={<Bell size={9} />}
            />
            <NotificationItem
              title="Chat shared with you"
              description="Alice shared 'React Hooks Deep Dive' conversation."
              time="1h ago"
              avatar={<MessageCircle size={18} className="text-primary" />}
            />
            <NotificationItem
              title="Settings updated"
              description="Your API key has been rotated successfully."
              time="3h ago"
              read
              avatar={<Settings size={18} className="text-muted-foreground" />}
            />
          </NotificationPanel>
        </div>
      </Section>
    </>
  )
}
