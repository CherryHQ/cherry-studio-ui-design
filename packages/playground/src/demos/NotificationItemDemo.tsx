import React from "react"
import { NotificationItem } from "@cherry-studio/ui"
import { Section } from "../components/Section"
import { Bell, MessageCircle, Star, CheckCircle } from "lucide-react"

export function NotificationItemDemo() {
  return (
    <>
      <Section title="NotificationItem Variants" props={[
        { name: "title", type: "string", description: "Notification title" },
        { name: "description", type: "string", description: "Notification body text" },
        { name: "time", type: "string", description: "Relative timestamp" },
        { name: "read", type: "boolean", default: "false", description: "Whether notification is read" },
        { name: "avatar", type: "ReactNode", description: "Avatar content" },
        { name: "badgeIcon", type: "ReactNode", description: "Small badge icon overlay" },
        { name: "onClick", type: "() => void", description: "Click handler" },
      ]} code={`import { NotificationItem } from "@cherry-studio/ui"

<NotificationItem
  title="New message"
  description="You have a new message from Alice."
  time="5m ago"
  avatar={<MessageCircle size={18} />}
  badgeIcon={<Bell size={9} />}
/>`}>
        <div className="max-w-md border rounded-[12px] overflow-hidden bg-popover divide-y divide-border/50">
          <NotificationItem
            title="Unread with badge"
            description="This notification is unread and has a badge icon."
            time="Just now"
            avatar={<Star size={18} className="text-accent-amber" />}
            badgeIcon={<Bell size={9} />}
            onClick={() => {}}
          />
          <NotificationItem
            title="Unread without badge"
            description="This notification is unread but has no badge."
            time="10m ago"
            avatar={<MessageCircle size={18} className="text-primary" />}
            onClick={() => {}}
          />
          <NotificationItem
            title="Read notification"
            description="This notification has already been read."
            time="2h ago"
            read
            avatar={<CheckCircle size={18} className="text-muted-foreground" />}
            onClick={() => {}}
          />
        </div>
      </Section>
    </>
  )
}
