import React from "react"
import { UserDropdown, Button, Avatar, AvatarFallback } from "@cherry-studio/ui"
import { Section, type PropDef } from "../components/Section"
import { CreditCard, Bell } from "lucide-react"

const userDropdownProps: PropDef[] = [
  { name: "name", type: "string", default: "-", description: "用户姓名" },
  { name: "email", type: "string", default: "-", description: "邮箱" },
  { name: "avatarUrl", type: "string", default: "-", description: "头像 URL" },
  { name: "onProfile", type: "() => void", default: "-", description: "个人主页回调" },
  { name: "onSettings", type: "() => void", default: "-", description: "设置回调" },
  { name: "onHelp", type: "() => void", default: "-", description: "帮助回调" },
  { name: "onSignOut", type: "() => void", default: "-", description: "登出回调" },
  { name: "extraItems", type: "MenuItem[]", default: "[]", description: "额外菜单项" },
]

export function UserDropdownDemo() {
  return (
    <>
      <Section title="User Dropdown" props={userDropdownProps} code={`import { UserDropdown } from "@cherry-studio/ui"

<UserDropdown
  name="Alice Chen"
  email="alice@example.com"
  onProfile={() => {}}
  onSettings={() => {}}
  onSignOut={() => {}}
/>`}>
        <div className="flex items-center gap-6">
          {/* Default trigger */}
          <UserDropdown
            name="Alice Chen"
            email="alice@example.com"
            onProfile={() => {}}
            onSettings={() => {}}
            onHelp={() => {}}
            onSignOut={() => {}}
          />

          {/* With extra items */}
          <UserDropdown
            name="Bob Wang"
            email="bob@company.com"
            onProfile={() => {}}
            onSettings={() => {}}
            onSignOut={() => {}}
            extraItems={[
              { label: "Billing", icon: CreditCard, onClick: () => {} },
              { label: "Notifications", icon: Bell, onClick: () => {} },
            ]}
          />
        </div>
      </Section>

      <Section title="Custom Trigger">
        <UserDropdown
          name="Carol Li"
          email="carol@studio.ai"
          onProfile={() => {}}
          onSettings={() => {}}
          onSignOut={() => {}}
        >
          <Button variant="outline" size="sm" className="gap-2">
            <Avatar className="size-5">
              <AvatarFallback className="text-xs">C</AvatarFallback>
            </Avatar>
            Carol Li
          </Button>
        </UserDropdown>
      </Section>
    </>
  )
}
