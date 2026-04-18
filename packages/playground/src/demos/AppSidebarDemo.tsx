import React, { useState } from "react"
import { AppSidebar, type AppSidebarMenuItem, type AppSidebarTab } from "@cherry-studio/ui"
import { Section } from "../components/Section"
import { MessageCircle, Search, Compass, BookOpen, Settings, Home } from "lucide-react"

const menuItems: AppSidebarMenuItem[] = [
  { id: "chat", label: "Chat", icon: MessageCircle },
  { id: "explore", label: "Explore", icon: Compass },
  { id: "search", label: "Search", icon: Search },
  { id: "library", label: "Library", icon: BookOpen },
]

const sampleTabs: AppSidebarTab[] = [
  { id: "home", title: "Home", icon: Home, closeable: false, pinned: true },
  { id: "chat-1", title: "New Chat", icon: MessageCircle, closeable: true, menuItemId: "chat" },
]

export function AppSidebarDemo() {
  const [activeItem, setActiveItem] = useState("chat")
  const [activeTab, setActiveTab] = useState("home")

  return (
    <>
      <Section title="AppSidebar" props={[
        { name: "menuItems", type: "AppSidebarMenuItem[]", description: "Navigation menu items" },
        { name: "tabs", type: "AppSidebarTab[]", description: "Open tabs displayed in sidebar" },
        { name: "activeItem", type: "string", description: "Currently active menu item id" },
        { name: "activeTabId", type: "string", description: "Currently active tab id" },
        { name: "onMenuItemClick", type: "(id: string) => void", description: "Menu item click handler" },
      ]} code={`import { AppSidebar } from "@cherry-studio/ui"

<AppSidebar
  menuItems={menuItems}
  tabs={tabs}
  activeItem="chat"
  activeTabId="home"
  onMenuItemClick={(id) => setActiveItem(id)}
/>`}>
        <div className="h-[420px] border rounded-[12px] overflow-hidden flex bg-background">
          <AppSidebar
            width={240}
            setWidth={() => {}}
            items={menuItems}
            activeItem={activeItem}
            activeTabId={activeTab}
            onItemClick={setActiveItem}
            onHoverChange={() => {}}
            onSearchClick={() => {}}
            onSettingsClick={() => {}}
            brandName="Cherry Studio"
          />
          <div className="flex-1 flex items-center justify-center text-muted-foreground/40 text-sm">
            Main content area
          </div>
        </div>
      </Section>
    </>
  )
}
