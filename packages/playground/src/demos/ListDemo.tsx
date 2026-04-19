import React from "react"
import {
  Item, ItemGroup, ItemSeparator, ItemMedia, ItemContent, ItemTitle, ItemDescription, ItemActions,
  Avatar, AvatarFallback, Button, Switch, Checkbox, Separator, SectionHeader, ScrollArea,
} from "@cherry-studio/ui"
import { Section } from "../components/Section"
import { ChevronRight, Settings, Bell, Shield, Palette, Globe, User, Mail, Lock, Smartphone } from "lucide-react"

export function ListDemo() {
  const [checks, setChecks] = React.useState<Record<string, boolean>>({ a: true, c: true })
  const [switches, setSwitches] = React.useState<Record<string, boolean>>({ notif: true, dark: false })

  return (
    <>
      {/* Simple list */}
      <Section
        title="Simple List"
        props={[
          { name: "variant", type: '"default"|"outline"|"muted"', default: '"default"', description: "Item style variant" },
          { name: "size", type: '"default"|"sm"', default: '"default"', description: "Item size" },
        ]}
        code={`import { Item, ItemGroup, ItemContent, ItemTitle, ItemActions } from "@cherry-studio/ui"

<ItemGroup>
  <Item>
    <ItemContent><ItemTitle>Settings</ItemTitle></ItemContent>
    <ItemActions><ChevronRight /></ItemActions>
  </Item>
</ItemGroup>`}
      >
        <div className="max-w-sm border rounded-[var(--radius-card)]">
          <ItemGroup>
            {["常规设置", "模型配置", "快捷键", "数据管理", "关于"].map((label) => (
              <Item key={label} className="cursor-pointer hover:bg-accent/30">
                <ItemContent><ItemTitle>{label}</ItemTitle></ItemContent>
                <ItemActions><ChevronRight className="h-4 w-4 text-muted-foreground" /></ItemActions>
              </Item>
            ))}
          </ItemGroup>
        </div>
      </Section>

      {/* List with icons */}
      <Section title="With Icons & Description">
        <div className="max-w-sm border rounded-[var(--radius-card)]">
          <ItemGroup>
            {[
              { icon: <Settings className="h-4 w-4" />, emoji: "⚙️", title: "通用", desc: "语言、主题、启动选项" },
              { icon: <Bell className="h-4 w-4" />, emoji: "🔔", title: "通知", desc: "消息提醒和声音设置" },
              { icon: <Shield className="h-4 w-4" />, emoji: "🛡️", title: "隐私", desc: "数据收集和安全选项" },
              { icon: <Palette className="h-4 w-4" />, emoji: "🎨", title: "外观", desc: "字体、颜色和布局" },
            ].map((item) => (
              <Item key={item.title} className="cursor-pointer hover:bg-accent/30">
                <ItemMedia variant="icon">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-sm">{item.emoji}</AvatarFallback>
                  </Avatar>
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>{item.title}</ItemTitle>
                  <ItemDescription>{item.desc}</ItemDescription>
                </ItemContent>
                <ItemActions><ChevronRight className="h-4 w-4 text-muted-foreground" /></ItemActions>
              </Item>
            ))}
          </ItemGroup>
        </div>
      </Section>

      {/* List with actions */}
      <Section title="With Actions (Switch)">
        <div className="max-w-sm border rounded-[var(--radius-card)]">
          <ItemGroup>
            {[
              { id: "notif", icon: <Bell className="h-4 w-4" />, title: "推送通知", desc: "接收消息推送提醒" },
              { id: "dark", icon: <Palette className="h-4 w-4" />, title: "深色模式", desc: "切换深色/浅色主题" },
              { id: "auto", icon: <Globe className="h-4 w-4" />, title: "自动更新", desc: "有新版本时自动更新" },
            ].map((item) => (
              <Item key={item.id}>
                <ItemMedia variant="icon">{item.icon}</ItemMedia>
                <ItemContent>
                  <ItemTitle>{item.title}</ItemTitle>
                  <ItemDescription>{item.desc}</ItemDescription>
                </ItemContent>
                <ItemActions>
                  <Switch
                    checked={switches[item.id] ?? false}
                    onCheckedChange={(v) => setSwitches((prev) => ({ ...prev, [item.id]: v }))}
                  />
                </ItemActions>
              </Item>
            ))}
          </ItemGroup>
        </div>
      </Section>

      {/* Selectable list */}
      <Section title="Selectable List (Checkbox)">
        <div className="max-w-sm border rounded-[var(--radius-card)]">
          <ItemGroup>
            {[
              { id: "a", label: "GPT-4o" },
              { id: "b", label: "Claude 3.5 Sonnet" },
              { id: "c", label: "Gemini Pro" },
              { id: "d", label: "Llama 3.1" },
            ].map((item) => (
              <Item
                key={item.id}
                size="sm"
                className="cursor-pointer hover:bg-accent/30"
                onClick={() => setChecks((prev) => ({ ...prev, [item.id]: !prev[item.id] }))}
              >
                <Checkbox checked={checks[item.id] ?? false} className="pointer-events-none" />
                <ItemContent><ItemTitle>{item.label}</ItemTitle></ItemContent>
              </Item>
            ))}
          </ItemGroup>
        </div>
      </Section>

      {/* Grouped list */}
      <Section title="Grouped List">
        <div className="max-w-sm border rounded-[var(--radius-card)] p-2">
          <SectionHeader title="账户" />
          <ItemGroup>
            <Item size="sm"><ItemMedia variant="icon"><User className="h-4 w-4" /></ItemMedia><ItemContent><ItemTitle>个人资料</ItemTitle></ItemContent></Item>
            <Item size="sm"><ItemMedia variant="icon"><Mail className="h-4 w-4" /></ItemMedia><ItemContent><ItemTitle>邮箱设置</ItemTitle></ItemContent></Item>
            <Item size="sm"><ItemMedia variant="icon"><Lock className="h-4 w-4" /></ItemMedia><ItemContent><ItemTitle>修改密码</ItemTitle></ItemContent></Item>
          </ItemGroup>
          <Separator className="my-2" />
          <SectionHeader title="设备" />
          <ItemGroup>
            <Item size="sm"><ItemMedia variant="icon"><Smartphone className="h-4 w-4" /></ItemMedia><ItemContent><ItemTitle>已登录设备</ItemTitle></ItemContent></Item>
            <Item size="sm"><ItemMedia variant="icon"><Shield className="h-4 w-4" /></ItemMedia><ItemContent><ItemTitle>安全设置</ItemTitle></ItemContent></Item>
          </ItemGroup>
        </div>
      </Section>
    </>
  )
}
