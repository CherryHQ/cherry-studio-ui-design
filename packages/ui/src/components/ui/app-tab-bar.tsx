"use client"

import * as React from "react"
import { Sun, Moon, Plus, X, Home, Settings } from "lucide-react"
import { cn } from "../../lib/utils"
import { Separator } from "./separator"
import { Button } from "./button"
import { SimpleTooltip } from "./simple-tooltip"

// ===========================
// Local types (extracted from app types)
// ===========================

export interface AppTabBarTab {
  id: string
  title: string
  icon: React.ElementType
  closeable: boolean
  pinned?: boolean
  sidebarDocked?: boolean
  menuItemId?: string
  miniAppId?: string
  miniAppColor?: string
  miniAppInitial?: string
  miniAppUrl?: string
  miniAppLogoUrl?: string
}

export interface AppTabBarProps {
  tabs: AppTabBarTab[]
  activeTabId: string
  isDark: boolean
  onTabClick: (tabId: string) => void
  onTabClose: (tabId: string) => void
  onTabContext: (e: React.MouseEvent, tabId: string) => void
  onNewTab: () => void
  onToggleTheme: () => void
  onSettingsClick?: () => void
  startTabDrag: (e: React.MouseEvent, tabId: string) => void
  /** Label for settings tooltip */
  settingsLabel?: string
  /** Label for light mode tooltip */
  lightModeLabel?: string
  /** Label for dark mode tooltip */
  darkModeLabel?: string
  /** Show macOS-style traffic lights */
  showTrafficLights?: boolean
  className?: string
}

export function AppTabBar({
  tabs,
  activeTabId,
  isDark,
  onTabClick,
  onTabClose,
  onTabContext,
  onNewTab,
  onToggleTheme,
  onSettingsClick,
  startTabDrag,
  settingsLabel = "设置",
  lightModeLabel = "浅模式",
  darkModeLabel = "深色模式",
  showTrafficLights = true,
  className,
}: AppTabBarProps) {
  const homeTab = tabs.find(t => t.id === "home")
  const pinnedTabs = tabs.filter(t => t.pinned && t.id !== "home" && !t.sidebarDocked)
  const unpinnedTabs = tabs.filter(t => !t.pinned && t.id !== "home" && !t.sidebarDocked)

  return (
    <div data-slot="app-tab-bar" className={cn("h-11 bg-sidebar flex items-center select-none flex-shrink-0", className)}>
      {/* Traffic lights */}
      {showTrafficLights && (
        <div className="flex items-center gap-2 px-4 flex-shrink-0">
          <div className="w-3 h-3 rounded-full bg-traffic-red border border-traffic-red-border" />
          <div className="w-3 h-3 rounded-full bg-traffic-yellow border border-traffic-yellow-border" />
          <div className="w-3 h-3 rounded-full bg-traffic-green border border-traffic-green-border" />
        </div>
      )}

      {/* Tabs area */}
      <div role="tablist" aria-label="Open tabs" className="flex-1 flex items-center gap-0.5 overflow-x-auto [&::-webkit-scrollbar]:hidden min-w-0 px-1">
        {/* Home tab — always first, standalone icon */}
        {homeTab && (
          <SimpleTooltip content={homeTab.title} side="bottom" sideOffset={8} delayDuration={400}>
            <Button
              variant="ghost"
              role="tab"
              aria-selected={activeTabId === homeTab.id}
              onClick={() => onTabClick(homeTab.id)}
              onContextMenu={(e) => onTabContext(e, homeTab.id)}
              className={cn(
                "w-8 h-8 p-0 rounded-[var(--radius-control)] flex items-center justify-center transition-all duration-[var(--duration-normal)] flex-shrink-0",
                activeTabId === homeTab.id
                  ? "bg-sidebar-accent text-sidebar-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
              )}
            >
              <Home size={14} strokeWidth={1.6} />
            </Button>
          </SimpleTooltip>
        )}

        {/* Separator after home if there are pinned tabs */}
        {pinnedTabs.length > 0 && (
          <Separator orientation="vertical" className="h-4 bg-border/50 mx-0.5 flex-shrink-0" />
        )}

        {/* Pinned tabs — grouped in a shared rounded container */}
        {pinnedTabs.length > 0 && (
          <div className="flex items-center bg-sidebar-accent/50 rounded-[var(--radius-button)] p-0.5 gap-0 flex-shrink-0">
            {pinnedTabs.map((tab) => {
              const isActive = tab.id === activeTabId
              const Icon = tab.icon
              return (
                <SimpleTooltip key={tab.id} content={tab.title} side="bottom" sideOffset={8} delayDuration={400}>
                  <Button
                    variant="ghost"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => onTabClick(tab.id)}
                    onContextMenu={(e) => onTabContext(e, tab.id)}
                    onMouseDown={(e) => { if (tab.closeable) startTabDrag(e, tab.id) }}
                    className={cn(
                      "w-7 h-7 p-0 rounded-[var(--radius-control)] flex items-center justify-center transition-all duration-[var(--duration-normal)]",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-foreground"
                        : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
                    )}
                  >
                    {tab.miniAppId ? (
                      tab.miniAppLogoUrl ? <img src={tab.miniAppLogoUrl} alt="" className="w-3.5 h-3.5 rounded-[var(--radius-dot)] object-cover" /> :
                      <div className="w-3.5 h-3.5 rounded-[var(--radius-dot)] flex items-center justify-center text-primary-foreground text-xs" style={{ background: tab.miniAppColor }}>{tab.miniAppInitial}</div>
                    ) : <Icon size={14} strokeWidth={1.6} />}
                  </Button>
                </SimpleTooltip>
              )
            })}
          </div>
        )}

        {/* Separator between pinned group and unpinned */}
        {unpinnedTabs.length > 0 && (
          <Separator orientation="vertical" className="h-4 bg-border/50 mx-1 flex-shrink-0" />
        )}

        {/* Regular tabs — shrink when many */}
        {unpinnedTabs.map((tab) => {
          const isActive = tab.id === activeTabId
          const Icon = tab.icon
          return (
            <div key={tab.id} className="group relative flex items-center">
              <Button
                variant="ghost"
                role="tab"
                aria-selected={isActive}
                onClick={() => onTabClick(tab.id)}
                onContextMenu={(e) => onTabContext(e, tab.id)}
                onMouseDown={(e) => { if (tab.closeable) startTabDrag(e, tab.id) }}
                className={cn(
                  "relative flex items-center gap-1.5 h-[30px] rounded-[var(--radius-control)] transition-all duration-[var(--duration-normal)] min-w-[40px] max-w-[160px] font-normal",
                  tab.closeable ? "pl-2 pr-6" : "px-2",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                )}
              >
                {tab.miniAppId ? (
                  tab.miniAppLogoUrl ? <img src={tab.miniAppLogoUrl} alt="" className="w-3.5 h-3.5 rounded-[var(--radius-dot)] object-cover flex-shrink-0" /> :
                  <div className="w-3.5 h-3.5 rounded-[var(--radius-dot)] flex items-center justify-center text-primary-foreground text-xs flex-shrink-0" style={{ background: tab.miniAppColor }}>{tab.miniAppInitial}</div>
                ) : <Icon size={13} strokeWidth={1.6} className="flex-shrink-0" />}
                <span className="text-xs tracking-[-0.14px] truncate">{tab.title}</span>
              </Button>
              {tab.closeable && (
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={(e) => { e.stopPropagation(); onTabClose(tab.id) }}
                  aria-label="Close tab"
                  className={cn(
                    "absolute right-1 w-[18px] h-[18px] hover:bg-foreground/10 flex-shrink-0",
                    isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  )}
                >
                  <X size={10} />
                </Button>
              )}
            </div>
          )
        })}

        <Button
          variant="ghost"
          size="icon-xs"
          onClick={onNewTab}
          aria-label="New tab"
          className="w-7 h-7 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground flex-shrink-0 ml-0.5"
        >
          <Plus size={14} />
        </Button>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1 px-2.5 flex-shrink-0">
        <SimpleTooltip content={settingsLabel} side="bottom" sideOffset={8} delayDuration={400}>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={onSettingsClick}
            className="w-7 h-7 text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <Settings size={15} strokeWidth={1.6} />
          </Button>
        </SimpleTooltip>
        <SimpleTooltip content={isDark ? lightModeLabel : darkModeLabel} side="bottom" sideOffset={8} delayDuration={400}>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={onToggleTheme}
            className="w-7 h-7 text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent"
          >
            {isDark ? <Sun size={15} strokeWidth={1.6} /> : <Moon size={15} strokeWidth={1.6} />}
          </Button>
        </SimpleTooltip>
      </div>
    </div>
  )
}
