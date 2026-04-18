import React from "react"
import { ContactsCard } from "@cherry-studio/ui"
import { Section, type PropDef } from "../components/Section"

const contactsCardProps: PropDef[] = [
  { name: "name", type: "string", default: "-", description: "联系人姓名" },
  { name: "role", type: "string", default: "-", description: "角色/职位" },
  { name: "avatarUrl", type: "string", default: "-", description: "头像 URL" },
  { name: "avatarFallback", type: "string", default: "name[0]", description: "头像回退文字" },
  { name: "status", type: '"online" | "offline" | "busy" | "away"', default: "-", description: "在线状态" },
  { name: "onClick", type: "() => void", default: "-", description: "点击回调" },
]

const CONTACTS = [
  { name: "Alice Chen", role: "前端工程师", status: "online" as const },
  { name: "Bob Wang", role: "产品经理", status: "busy" as const },
  { name: "Carol Li", role: "设计师", status: "away" as const },
  { name: "David Zhang", role: "后端工程师", status: "offline" as const },
]

export function ContactsCardDemo() {
  return (
    <>
      <Section title="Contacts Card" props={contactsCardProps} code={`import { ContactsCard } from "@cherry-studio/ui"

<ContactsCard name="Alice Chen" role="前端工程师" status="online" />`}>
        <div className="space-y-2 max-w-xs">
          {CONTACTS.map(c => (
            <ContactsCard
              key={c.name}
              name={c.name}
              role={c.role}
              status={c.status}
              onClick={() => {}}
            />
          ))}
        </div>
      </Section>

      <Section title="Status Variants">
        <div className="grid grid-cols-2 gap-2 max-w-md">
          <ContactsCard name="Online User" status="online" role="在线" />
          <ContactsCard name="Busy User" status="busy" role="忙碌" />
          <ContactsCard name="Away User" status="away" role="离开" />
          <ContactsCard name="Offline User" status="offline" role="离线" />
        </div>
      </Section>

      <Section title="Without Status / Role">
        <div className="space-y-2 max-w-xs">
          <ContactsCard name="Just a Name" />
          <ContactsCard name="With Fallback" avatarFallback="WF" role="自定义回退" />
        </div>
      </Section>
    </>
  )
}
