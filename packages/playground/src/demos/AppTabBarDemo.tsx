import React, { useState } from "react"
import { AppTabBar, type AppTabBarTab } from "@cherry-studio/ui"
import { Section } from "../components/Section"
import { Home, MessageCircle, Compass, BookOpen } from "lucide-react"

const sampleTabs: AppTabBarTab[] = [
  { id: "home", title: "Home", icon: Home, closeable: false, pinned: true },
  { id: "chat-1", title: "New Chat", icon: MessageCircle, closeable: true },
  { id: "explore", title: "Explore", icon: Compass, closeable: true, pinned: true },
  { id: "library", title: "Library", icon: BookOpen, closeable: true },
]

export function AppTabBarDemo() {
  const [activeTab, setActiveTab] = useState("home")
  const [isDark, setIsDark] = useState(false)

  return (
    <>
      <Section title="AppTabBar" props={[
        { name: "tabs", type: "AppTabBarTab[]", description: "Tabs to display" },
        { name: "activeTabId", type: "string", description: "Active tab id" },
        { name: "isDark", type: "boolean", default: "false", description: "Dark mode state" },
        { name: "onTabClick", type: "(id: string) => void", description: "Tab click handler" },
        { name: "onToggleTheme", type: "() => void", description: "Theme toggle handler" },
        { name: "showTrafficLights", type: "boolean", default: "true", description: "Show macOS traffic lights" },
      ]} code={`import { AppTabBar } from "@cherry-studio/ui"

<AppTabBar
  tabs={tabs}
  activeTabId="home"
  isDark={false}
  onTabClick={(id) => setActiveTab(id)}
  onToggleTheme={() => setIsDark(!isDark)}
/>`}>
        <div className="border rounded-xl overflow-hidden bg-sidebar">
          <AppTabBar
            tabs={sampleTabs}
            activeTabId={activeTab}
            isDark={isDark}
            onTabClick={setActiveTab}
            onTabClose={() => {}}
            onTabContext={() => {}}
            onNewTab={() => {}}
            onToggleTheme={() => setIsDark(!isDark)}
            startTabDrag={() => {}}
            showTrafficLights={true}
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Active: <span className="font-medium text-foreground">{activeTab}</span>
          {" | "}Theme: <span className="font-medium text-foreground">{isDark ? "Dark" : "Light"}</span>
        </p>
      </Section>
    </>
  )
}
