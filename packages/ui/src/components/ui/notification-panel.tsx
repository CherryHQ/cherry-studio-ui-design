"use client"

import * as React from "react"
import { cn } from "../../lib/utils"
import { Tabs, TabsList, TabsTrigger } from "./tabs"
import { Badge } from "./badge"

export interface NotificationPanelProps {
  title?: string
  tabs?: { label: string; value: string; count?: number }[]
  activeTab?: string
  onTabChange?: (tab: string) => void
  children?: React.ReactNode
  className?: string
}

function NotificationPanel({
  title = "Notifications",
  tabs,
  activeTab,
  onTabChange,
  children,
  className,
}: NotificationPanelProps) {
  return (
    <div
      data-slot="notification-panel"
      role="region"
      aria-label="Notifications"
      className={cn(
        "w-[383px] rounded-[var(--radius-card)] border bg-popover shadow-popover backdrop-blur-[6px] tracking-tight",
        className
      )}
    >
      <div data-slot="notification-panel-header" className="px-4 pt-4 pb-2">
        <h3 className="text-[13px] font-semibold text-foreground">{title}</h3>
        {tabs && tabs.length > 0 && (
          <Tabs value={activeTab} onValueChange={onTabChange} className="mt-2">
            <TabsList variant="line" className="h-auto p-0 gap-1 border-0">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  data-slot="notification-panel-tab"
                  className="gap-1.5 px-2.5 py-1 text-xs h-auto"
                >
                  {tab.label}
                  {tab.count !== undefined && tab.count > 0 && (
                    <Badge variant={activeTab === tab.value ? "default" : "outline"} className="h-4 min-w-4 px-1 text-xs">
                      {tab.count}
                    </Badge>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}
      </div>
      <div data-slot="notification-panel-content" className="py-1">
        {children}
      </div>
    </div>
  )
}

export { NotificationPanel }
