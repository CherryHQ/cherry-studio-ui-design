import React, { useState } from "react"
import { Card, Input, Switch, Badge } from "@cherry-studio/ui"
import { Section } from "../components/Section"
import {
  Search, MessageSquare, Globe, Image, FileText,
  BookOpen, PenTool, Code, Bot, Settings
} from "lucide-react"

const apps = [
  { id: "chat", name: "Chat", icon: MessageSquare, color: "bg-accent-blue", enabled: true },
  { id: "translate", name: "Translate", icon: Globe, color: "bg-accent-emerald", enabled: true },
  { id: "image", name: "Image Gen", icon: Image, color: "bg-accent-purple", enabled: true },
  { id: "files", name: "Files", icon: FileText, color: "bg-accent-amber", enabled: true },
  { id: "knowledge", name: "Knowledge", icon: BookOpen, color: "bg-accent-cyan", enabled: true },
  { id: "notes", name: "Notes", icon: PenTool, color: "bg-accent-pink", enabled: true },
  { id: "code", name: "Code", icon: Code, color: "bg-accent-orange", enabled: false },
  { id: "agents", name: "Agents", icon: Bot, color: "bg-accent-indigo", enabled: false },
  { id: "settings", name: "Settings", icon: Settings, color: "bg-muted-foreground", enabled: true },
]

export function AppLauncherDemo() {
  const [search, setSearch] = useState("")
  const [manage, setManage] = useState(false)
  const [appState, setAppState] = useState(apps)

  const filtered = appState.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase()) &&
    (manage || a.enabled)
  )

  const toggleApp = (id: string) => {
    setAppState((prev) => prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a)))
  }

  return (
    <Section title="App Launcher" props={[
        { name: "apps", type: "AppItem[]", default: "[]", description: "List of available applications" },
        { name: "onSelect", type: "(appId: string) => void", default: "undefined", description: "Callback when an app is selected" },
        { name: "searchable", type: "boolean", default: "true", description: "Enable search filtering of apps" },
      ]} code={`// Compose with: Card, Input, Switch, Badge`}>
      <div className="max-w-sm rounded-xl border bg-background p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">New Tab</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Manage</span>
            <Switch checked={manage} onCheckedChange={setManage} className="scale-75" />
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search apps..."
            className="pl-8 h-8 text-xs"
          />
        </div>

        <div className="grid grid-cols-3 gap-2">
          {filtered.map((app) => (
            <Card
              key={app.id}
              className={`p-3 flex flex-col items-center gap-2 cursor-pointer hover:bg-accent/50 transition-colors relative ${
                !app.enabled ? "opacity-40" : ""
              }`}
            >
              <div className={`size-10 rounded-xl ${app.color} flex items-center justify-center`}>
                <app.icon className="size-5 text-primary-foreground" />
              </div>
              <span className="text-[10px] font-medium">{app.name}</span>
              {manage && (
                <div className="absolute top-1.5 right-1.5">
                  <Switch
                    checked={app.enabled}
                    onCheckedChange={() => toggleApp(app.id)}
                    className="scale-50"
                  />
                </div>
              )}
              {!app.enabled && !manage && (
                <Badge variant="secondary" className="absolute top-1 right-1 text-[7px] px-1">OFF</Badge>
              )}
            </Card>
          ))}
        </div>
      </div>
    </Section>
  )
}
