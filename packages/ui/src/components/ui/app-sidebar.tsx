"use client"

import * as React from "react"
import { Search, X, ChevronRight, Settings2 } from "lucide-react"
import { cn } from "../../lib/utils"
import { Button } from "./button"
import { Avatar, AvatarFallback, AvatarImage } from "./avatar"
import { ScrollArea } from "./scroll-area"
import { Separator } from "./separator"
import { SimpleTooltip } from "./simple-tooltip"
import { Kbd } from "./kbd"

// ===========================
// Local types (extracted from app types)
// ===========================

export interface AppSidebarMenuItem {
  id: string
  label: string
  icon: React.ElementType
}

export interface AppSidebarTab {
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

export type AppSidebarLayout = "hidden" | "icon" | "vertical-card" | "full"

// ===========================
// Layout breakpoints
// ===========================

const BP_ICON = 50
const BP_VERTICAL_CARD = 65
const BP_FULL = 170

function getLayout(width: number): AppSidebarLayout {
  if (width < 20) return "hidden"
  if (width < 58) return "icon"
  if (width < 120) return "vertical-card"
  return "full"
}

// ===========================
// Shared internal components
// ===========================

/** Mini app icon — logo image or colored initial */
function MiniAppIcon({ tab, size = "sm" }: { tab: AppSidebarTab; size?: "sm" | "md" }) {
  const s = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4"
  const fontSize = size === "sm" ? "text-xs" : "text-xs"
  if (tab.miniAppLogoUrl) {
    return <img src={tab.miniAppLogoUrl} alt="" className={`${s} rounded-[var(--radius-kbd)] object-cover flex-shrink-0`} />
  }
  return (
    <div className={`${s} rounded-[var(--radius-kbd)] flex items-center justify-center text-primary-foreground ${fontSize} flex-shrink-0 ${tab.miniAppColor}`}>
      {tab.miniAppInitial}
    </div>
  )
}

/** Full-layout menu items list — reused by both normal and floating sidebar */
function FullMenuItems({
  items,
  activeItem,
  onItemClick,
  activeMiniAppTabs,
  activeTabId,
  onMiniAppTabClick,
  isFloating,
}: {
  items: AppSidebarMenuItem[]
  activeItem: string
  onItemClick: (id: string) => void
  activeMiniAppTabs: AppSidebarTab[]
  activeTabId?: string
  onMiniAppTabClick?: (tabId: string) => void
  isFloating?: boolean
}) {
  return (
    <div className="px-2 space-y-0.5">
      {items.map((item) => {
        const isActive = activeItem === item.id
        const Icon = item.icon
        const miniTabs = item.id === "miniapp" ? activeMiniAppTabs : []
        return (
          <div key={item.id}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onItemClick(item.id)}
              className={cn(
                "w-full justify-start gap-2.5 px-2.5 py-[7px] text-sm transition-all duration-[var(--duration-normal)] relative",
                isActive
                  ? "bg-cherry-active-bg text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
              )}
            >
              {isActive && (
                <div className="absolute inset-0 rounded-[inherit] border border-cherry-active-border pointer-events-none" />
              )}
              <Icon size={16} strokeWidth={1.6} className={isActive ? "drop-shadow-[0_0_4px_rgba(18,18,18,0.1)]" : undefined} />
              <span className="truncate">{item.label}</span>
            </Button>
            {miniTabs.map(mt => (
              <Button
                key={mt.id}
                variant="ghost"
                size="sm"
                onClick={() => onMiniAppTabClick?.(mt.id)}
                className={cn(
                  "w-full justify-start gap-2 pl-7 pr-2.5 py-[5px] text-xs transition-all duration-[var(--duration-normal)] relative",
                  activeTabId === mt.id ? "bg-cherry-active-bg text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
                )}
              >
                {activeTabId === mt.id && (
                  <div className="absolute inset-0 rounded-[inherit] border border-cherry-active-border pointer-events-none" />
                )}
                <MiniAppIcon tab={mt} />
                <span className="truncate">{mt.title}</span>
              </Button>
            ))}
          </div>
        )
      })}
    </div>
  )
}

/** Full-layout docked tabs list */
function FullDockedTabs({
  dockedTabs,
  activeTabId,
  onMiniAppTabClick,
  onStartSidebarDrag,
  onCloseDockedTab,
}: {
  dockedTabs: AppSidebarTab[]
  activeTabId?: string
  onMiniAppTabClick?: (tabId: string) => void
  onStartSidebarDrag?: (e: React.MouseEvent, tabId: string) => void
  onCloseDockedTab?: (tabId: string) => void
}) {
  if (dockedTabs.length === 0) return null
  return (
    <>
    <Separator className="mx-2 mt-1 bg-border/30" />
    <div className="px-2 pt-1 space-y-0.5">
      {dockedTabs.map(dt => {
        const DtIcon = dt.icon
        const isActive = activeTabId === dt.id
        return (
          <div
            key={dt.id}
            className={cn(
              "group/dock flex items-center gap-2.5 px-2.5 py-[6px] rounded-[var(--radius-button)] text-xs tracking-[-0.12px] transition-all duration-[var(--duration-normal)] cursor-grab active:cursor-grabbing relative",
              isActive ? "bg-cherry-active-bg text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
            )}
            onClick={() => onMiniAppTabClick?.(dt.id)}
            onMouseDown={(e) => { e.stopPropagation(); onStartSidebarDrag?.(e, dt.id) }}
          >
            {isActive && (
              <div className="absolute inset-0 rounded-[var(--radius-button)] border border-cherry-active-border pointer-events-none" />
            )}
            {dt.miniAppId ? (
              <MiniAppIcon tab={dt} />
            ) : <DtIcon size={14} strokeWidth={1.6} className="flex-shrink-0" />}
            <span className="truncate flex-1">{dt.title}</span>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={(e) => { e.stopPropagation(); onCloseDockedTab?.(dt.id) }}
              aria-label="Close tab"
              className="w-4 h-4 hover:bg-foreground/10 opacity-0 group-hover/dock:opacity-100 transition-opacity flex-shrink-0"
            ><X size={12} /></Button>
          </div>
        )
      })}
    </div>
    </>
  )
}

// ===========================
// Logo component
// ===========================

export interface AppSidebarLogoProps {
  /** Logo image src */
  logoSrc?: string
  /** Logo alt text */
  logoAlt?: string
  /** Brand name text */
  brandName?: string
  size?: "sm" | "md"
}

function SidebarLogo({ logoSrc, logoAlt = "Logo", brandName, size = "md" }: AppSidebarLogoProps) {
  const s = size === "sm" ? "w-7 h-7" : "w-8 h-8"
  return (
    <>
      {logoSrc ? (
        <img src={logoSrc} alt={logoAlt} className={`${s} rounded-[var(--radius-button)] flex-shrink-0 object-cover`} />
      ) : (
        <div className={cn(s, "rounded-[var(--radius-button)] flex-shrink-0 bg-primary/10 flex items-center justify-center text-primary text-xs font-medium")}>
          {brandName?.charAt(0) ?? "C"}
        </div>
      )}
    </>
  )
}

/** Full-layout bottom section */
function FullBottomSection({
  onSettingsClick,
  settingsLabel = "设置",
  user,
}: {
  onSettingsClick?: () => void
  settingsLabel?: string
  user?: AppSidebarUser
}) {
  return (
    <div className="px-2 py-2 space-y-1">
      <Button variant="ghost" size="sm" onClick={onSettingsClick} className="w-full justify-start gap-2.5 px-2.5 py-[7px] text-sm text-muted-foreground hover:text-foreground hover:bg-accent/60">
        <Settings2 size={16} strokeWidth={1.6} />
        <span>{settingsLabel}</span>
      </Button>
      {user && (
        <div className="flex items-center gap-2.5 px-2.5 py-1.5 cursor-pointer rounded-[var(--radius-button)] hover:bg-accent/60 transition-colors">
          <Avatar className="w-7 h-7 ring-[1px] ring-border flex-shrink-0">
            {user.avatarUrl ? (
              <AvatarImage src={user.avatarUrl} alt="" />
            ) : (
              <AvatarFallback className="bg-gradient-to-br from-accent-blue to-accent-indigo text-primary-foreground text-xs">
                {user.name?.charAt(0) ?? "U"}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="text-sm tracking-[-0.14px] text-sidebar-foreground truncate">{user.name}</div>
            {user.email && <div className="text-xs text-muted-foreground truncate">{user.email}</div>}
          </div>
          <ChevronRight size={14} className="text-muted-foreground flex-shrink-0" />
        </div>
      )}
    </div>
  )
}

// ===========================
// Main AppSidebar component
// ===========================

export interface AppSidebarUser {
  name: string
  email?: string
  avatarUrl?: string
}

export interface AppSidebarProps {
  width: number
  setWidth: (w: number) => void
  activeItem: string
  onItemClick: (id: string) => void
  onHoverChange: (visible: boolean) => void
  onSearchClick: () => void
  onSettingsClick?: () => void
  items: AppSidebarMenuItem[]
  activeMiniAppTabs?: AppSidebarTab[]
  activeTabId?: string
  onMiniAppTabClick?: (tabId: string) => void
  dockedTabs?: AppSidebarTab[]
  onUndockTab?: (tabId: string) => void
  onStartSidebarDrag?: (e: React.MouseEvent, tabId: string) => void
  onCloseDockedTab?: (tabId: string) => void
  isFloating?: boolean
  onDismiss?: () => void
  /** Logo configuration */
  logoSrc?: string
  logoAlt?: string
  brandName?: string
  /** Search label */
  searchLabel?: string
  /** Settings label */
  settingsLabel?: string
  /** User info for bottom section */
  user?: AppSidebarUser
  /** Traffic light dots (macOS style) */
  showTrafficLights?: boolean
  className?: string
}

export function AppSidebar({
  width,
  setWidth,
  activeItem,
  onItemClick,
  onHoverChange,
  onSearchClick,
  onSettingsClick,
  items,
  activeMiniAppTabs,
  activeTabId,
  onMiniAppTabClick,
  dockedTabs,
  onUndockTab,
  onStartSidebarDrag,
  onCloseDockedTab,
  isFloating,
  onDismiss,
  logoSrc,
  logoAlt,
  brandName = "Cherry Studio",
  searchLabel = "搜索",
  settingsLabel = "设置",
  user,
  showTrafficLights = false,
  className,
}: AppSidebarProps) {
  const isResizing = React.useRef(false)
  const sidebarRef = React.useRef<HTMLDivElement>(null)
  const hoverTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const layout = getLayout(width)

  const startResizing = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    isResizing.current = true
    document.body.style.cursor = "col-resize"
    document.body.style.userSelect = "none"

    const containerLeft = sidebarRef.current?.parentElement?.getBoundingClientRect().left ?? 0

    const onMouseMove = (ev: MouseEvent) => {
      if (!isResizing.current) return
      const newW = ev.clientX - containerLeft
      if (newW < 15) setWidth(0)
      else if (newW < 42) setWidth(BP_ICON)
      else if (newW < 90) setWidth(BP_VERTICAL_CARD)
      else setWidth(Math.min(280, Math.max(BP_FULL, newW)))
    }
    const onMouseUp = () => {
      isResizing.current = false
      document.body.style.cursor = ""
      document.body.style.userSelect = ""
      document.removeEventListener("mousemove", onMouseMove)
      document.removeEventListener("mouseup", onMouseUp)
    }
    document.addEventListener("mousemove", onMouseMove)
    document.addEventListener("mouseup", onMouseUp)
  }, [setWidth])

  // Cleanup resize listeners on unmount
  React.useEffect(() => {
    return () => {
      isResizing.current = false
      document.body.style.cursor = ""
      document.body.style.userSelect = ""
    }
  }, [])

  // ===========================
  // Floating mode
  // ===========================
  if (isFloating) {
    const handleDismiss = () => onDismiss?.()
    return (
      <div
        data-slot="app-sidebar"
        className="absolute inset-0 z-[var(--z-overlay)]"
        onClick={handleDismiss}
      >
        <div
          role="navigation"
          aria-label="Main sidebar"
          className={cn(
            "absolute left-0 top-0 bottom-0 bg-sidebar/70 backdrop-blur-[6px] backdrop-saturate-150 flex flex-col select-none shadow-popover rounded-r-[var(--radius-panel)] animate-in slide-in-from-left-2 duration-[var(--duration-slow)]",
            className
          )}
          style={{ width: BP_FULL }}
          onClick={(e) => e.stopPropagation()}
          onMouseLeave={() => {
            if (hoverTimeout.current) clearTimeout(hoverTimeout.current)
            hoverTimeout.current = setTimeout(handleDismiss, 300)
          }}
          onMouseEnter={() => {
            if (hoverTimeout.current) clearTimeout(hoverTimeout.current)
          }}
        >
          {/* Top area with traffic lights */}
          {showTrafficLights && (
            <div className="h-11 flex items-center px-4 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-traffic-red border border-traffic-red-border" />
                <div className="w-3 h-3 rounded-full bg-traffic-yellow border border-traffic-yellow-border" />
                <div className="w-3 h-3 rounded-full bg-traffic-green border border-traffic-green-border" />
              </div>
            </div>
          )}

          {/* Logo area */}
          <div className="flex items-center h-14 px-4 gap-2.5 flex-shrink-0">
            <SidebarLogo logoSrc={logoSrc} logoAlt={logoAlt} brandName={brandName} size="md" />
            <span className="text-sm tracking-[-0.14px] text-sidebar-foreground truncate">{brandName}</span>
          </div>

          {/* Search */}
          <div className="px-3 py-2 flex-shrink-0">
            <div role="button" tabIndex={0} onClick={() => { onSearchClick(); handleDismiss() }} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSearchClick(); handleDismiss() } }} className="flex items-center gap-2 px-2.5 py-1.5 rounded-[var(--radius-control)] bg-sidebar-accent/50 text-muted-foreground text-xs cursor-pointer hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
              <Search size={13} />
              <span className="flex-1">{searchLabel}</span>
              <Kbd>⌘K</Kbd>
            </div>
          </div>

          {/* Menu items */}
          <ScrollArea className="flex-1">
            <div className="py-1">
              <FullMenuItems
                items={items}
                activeItem={activeItem}
                onItemClick={onItemClick}
                activeMiniAppTabs={activeMiniAppTabs || []}
                activeTabId={activeTabId}
                onMiniAppTabClick={onMiniAppTabClick}
                isFloating
              />
              <FullDockedTabs
                dockedTabs={dockedTabs || []}
                activeTabId={activeTabId}
                onMiniAppTabClick={onMiniAppTabClick}
                onStartSidebarDrag={onStartSidebarDrag}
                onCloseDockedTab={onCloseDockedTab}
              />
            </div>
          </ScrollArea>

          {/* Bottom section */}
          <div className="flex-shrink-0">
            <FullBottomSection onSettingsClick={onSettingsClick} settingsLabel={settingsLabel} user={user} />
          </div>
        </div>
      </div>
    )
  }

  // ===========================
  // Hidden mode (width ~ 0)
  // ===========================
  if (layout === "hidden") {
    return (
      <div
        ref={sidebarRef}
        data-slot="app-sidebar"
        className="w-0 h-full flex-shrink-0 relative"
      >
        {/* Hover trigger zone — shows floating sidebar */}
        <div
          className="absolute left-0 top-0 bottom-0 w-[6px] z-[var(--z-sticky)]"
          onMouseEnter={() => {
            if (hoverTimeout.current) clearTimeout(hoverTimeout.current)
            hoverTimeout.current = setTimeout(() => onHoverChange(true), 200)
          }}
          onMouseLeave={() => {
            if (hoverTimeout.current) clearTimeout(hoverTimeout.current)
          }}
        >
          {/* Drag handle line */}
          <div
            onMouseDown={(e) => { onHoverChange(false); startResizing(e) }}
            className="w-full h-full cursor-col-resize group/handle"
          >
            <div className="w-[2px] h-full ml-[2px] opacity-0 group-hover/handle:opacity-100 bg-primary/30 transition-opacity rounded-full" />
          </div>
        </div>
      </div>
    )
  }

  // ===========================
  // Normal visible modes (icon / vertical-card / full)
  // ===========================
  const actualWidth = layout === "icon" ? BP_ICON : layout === "vertical-card" ? BP_VERTICAL_CARD : width

  return (
    <div
      ref={sidebarRef}
      data-slot="app-sidebar"
      role="navigation"
      aria-label="Main sidebar"
      style={{ width: actualWidth }}
      className={cn(
        "h-full bg-sidebar flex flex-col flex-shrink-0 relative group/sidebar z-[var(--z-sticky)] select-none rounded-[var(--radius-panel)]",
        className
      )}
    >
      {/* Logo area */}
      <div className={cn(
        "flex items-center flex-shrink-0",
        layout === "full" ? "h-14 px-4 gap-2.5" : "h-14 justify-center"
      )}>
        <SidebarLogo logoSrc={logoSrc} logoAlt={logoAlt} brandName={brandName} size={layout === "full" ? "md" : "sm"} />
        {layout === "full" && (
          <span className="text-sm tracking-[-0.14px] text-sidebar-foreground truncate">{brandName}</span>
        )}
      </div>

      {/* Search */}
      {layout === "full" ? (
        <div className="px-3 py-2 flex-shrink-0">
          <div role="button" tabIndex={0} onClick={onSearchClick} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSearchClick() } }} className="flex items-center gap-2 px-2.5 py-1.5 rounded-[var(--radius-control)] bg-sidebar-accent text-muted-foreground text-xs cursor-pointer hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
            <Search size={13} />
            <span className="flex-1">{searchLabel}</span>
            <Kbd>⌘K</Kbd>
          </div>
        </div>
      ) : (
        <div className="flex justify-center py-1.5 flex-shrink-0">
          <SimpleTooltip content={searchLabel} side="right" sideOffset={8} delayDuration={400}>
            <Button variant="ghost" size="icon-sm" onClick={onSearchClick} className="text-muted-foreground hover:text-foreground hover:bg-accent/60">
              <Search size={16} strokeWidth={1.6} />
            </Button>
          </SimpleTooltip>
        </div>
      )}

      {/* Menu items */}
      <ScrollArea className="flex-1">
        <div className="py-1">
        {layout === "icon" && (
          <div className="flex flex-col items-center gap-0.5 px-1.5">
            {items.map((item) => {
              const isActive = activeItem === item.id
              const Icon = item.icon
              const miniTabs = item.id === "miniapp" ? (activeMiniAppTabs || []) : []
              return (
                <div key={item.id} className="contents">
                  <SimpleTooltip content={item.label} side="right" sideOffset={8} delayDuration={400}>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onItemClick(item.id)}
                      className={cn(
                        "transition-all duration-[var(--duration-normal)] relative",
                        isActive
                          ? "bg-cherry-active-bg text-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
                      )}
                    >
                      {isActive && (
                        <div className="absolute inset-0 rounded-[inherit] border border-cherry-active-border pointer-events-none" />
                      )}
                      <Icon size={18} strokeWidth={1.6} className={isActive ? "drop-shadow-[0_0_4px_rgba(18,18,18,0.1)]" : undefined} />
                    </Button>
                  </SimpleTooltip>
                  {miniTabs.map(mt => (
                    <SimpleTooltip key={mt.id} content={mt.title} side="right" sideOffset={8} delayDuration={400}>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => onMiniAppTabClick?.(mt.id)}
                        className={cn(
                          "w-7 h-7 transition-all duration-[var(--duration-normal)] relative",
                          activeTabId === mt.id ? "bg-cherry-active-bg" : "hover:bg-accent/50"
                        )}
                      >
                        {activeTabId === mt.id && (
                          <div className="absolute inset-0 rounded-[inherit] border border-cherry-active-border pointer-events-none" />
                        )}
                        <MiniAppIcon tab={mt} size="md" />
                      </Button>
                    </SimpleTooltip>
                  ))}
                </div>
              )
            })}
          </div>
        )}

        {layout === "vertical-card" && (
          <div className="flex flex-col items-center gap-0 px-1">
            {items.map((item) => {
              const isActive = activeItem === item.id
              const Icon = item.icon
              const miniTabs = item.id === "miniapp" ? (activeMiniAppTabs || []) : []
              return (
                <div key={item.id} className="contents">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onItemClick(item.id)}
                    className={cn(
                      "w-full flex-col gap-0.5 py-2 transition-all duration-[var(--duration-normal)] relative",
                      isActive
                        ? "bg-cherry-active-bg text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    )}
                  >
                    {isActive && (
                      <div className="absolute inset-0 rounded-[inherit] border border-cherry-active-border pointer-events-none" />
                    )}
                    <Icon size={18} strokeWidth={1.6} className={isActive ? "drop-shadow-[0_0_4px_rgba(18,18,18,0.1)]" : undefined} />
                    <span className="text-xs leading-tight tracking-[-0.12px]">{item.label}</span>
                  </Button>
                  {miniTabs.map(mt => (
                    <Button
                      key={mt.id}
                      variant="ghost"
                      size="sm"
                      onClick={() => onMiniAppTabClick?.(mt.id)}
                      className={cn(
                        "w-full flex-col gap-0.5 py-1.5 transition-all duration-[var(--duration-normal)] relative",
                        activeTabId === mt.id ? "bg-cherry-active-bg" : "hover:bg-accent/40"
                      )}
                    >
                      {activeTabId === mt.id && (
                        <div className="absolute inset-0 rounded-[inherit] border border-cherry-active-border pointer-events-none" />
                      )}
                      <MiniAppIcon tab={mt} size="md" />
                      <span className="text-xs leading-tight tracking-[-0.12px] text-muted-foreground truncate max-w-[50px]">{mt.title}</span>
                    </Button>
                  ))}
                </div>
              )
            })}
          </div>
        )}

        {layout === "full" && (
          <FullMenuItems
            items={items}
            activeItem={activeItem}
            onItemClick={onItemClick}
            activeMiniAppTabs={activeMiniAppTabs || []}
            activeTabId={activeTabId}
            onMiniAppTabClick={onMiniAppTabClick}
          />
        )}

        {/* Docked tabs */}
        {(dockedTabs || []).length > 0 && (
          <div>
            {layout === "icon" && (<>
              <Separator className="mx-1.5 mt-1 bg-border/30" />
              <div className="flex flex-col items-center gap-0.5 px-1.5 pt-1">
                {(dockedTabs || []).map(dt => {
                  const DtIcon = dt.icon
                  const isActive = activeTabId === dt.id
                  return (
                    <div key={dt.id} className="relative group/dock">
                      <SimpleTooltip content={dt.title} side="right" sideOffset={8} delayDuration={400}>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => onMiniAppTabClick?.(dt.id)}
                          onMouseDown={(e) => { e.stopPropagation(); onStartSidebarDrag?.(e, dt.id) }}
                          className={cn(
                            "w-7 h-7 transition-all duration-[var(--duration-normal)] cursor-grab active:cursor-grabbing relative",
                            isActive ? "bg-cherry-active-bg" : "hover:bg-accent/50"
                          )}
                        >
                          {isActive && (
                            <div className="absolute inset-0 rounded-[inherit] border border-cherry-active-border pointer-events-none" />
                          )}
                          {dt.miniAppId ? (
                            <MiniAppIcon tab={dt} size="md" />
                          ) : <DtIcon size={14} strokeWidth={1.6} />}
                        </Button>
                      </SimpleTooltip>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={(e) => { e.stopPropagation(); onCloseDockedTab?.(dt.id) }}
                        className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-popover border border-border text-muted-foreground hover:text-foreground opacity-0 group-hover/dock:opacity-100 transition-opacity z-10"
                      ><X size={7} /></Button>
                    </div>
                  )
                })}
              </div>
            </>)}
            {layout === "vertical-card" && (<>
              <Separator className="mx-1 mt-1 bg-border/30" />
              <div className="flex flex-col items-center gap-0 px-1 pt-1">
                {(dockedTabs || []).map(dt => {
                  const DtIcon = dt.icon
                  const isActive = activeTabId === dt.id
                  return (
                    <div key={dt.id} className="relative group/dock w-full">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onMiniAppTabClick?.(dt.id)}
                        onMouseDown={(e) => { e.stopPropagation(); onStartSidebarDrag?.(e, dt.id) }}
                        className={cn(
                          "w-full flex-col gap-0.5 py-1.5 transition-all duration-[var(--duration-normal)] cursor-grab active:cursor-grabbing relative",
                          isActive ? "bg-cherry-active-bg" : "hover:bg-accent/40"
                        )}
                      >
                        {isActive && (
                          <div className="absolute inset-0 rounded-[inherit] border border-cherry-active-border pointer-events-none" />
                        )}
                        {dt.miniAppId ? (
                          <MiniAppIcon tab={dt} size="md" />
                        ) : <DtIcon size={18} strokeWidth={1.6} />}
                        <span className="text-xs leading-tight tracking-[-0.12px] text-muted-foreground truncate max-w-[50px]">{dt.title}</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={(e) => { e.stopPropagation(); onCloseDockedTab?.(dt.id) }}
                        className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-popover border border-border text-muted-foreground hover:text-foreground opacity-0 group-hover/dock:opacity-100 transition-opacity z-10"
                      ><X size={7} /></Button>
                    </div>
                  )
                })}
              </div>
            </>)}
            {layout === "full" && (
              <FullDockedTabs
                dockedTabs={dockedTabs || []}
                activeTabId={activeTabId}
                onMiniAppTabClick={onMiniAppTabClick}
                onStartSidebarDrag={onStartSidebarDrag}
                onCloseDockedTab={onCloseDockedTab}
              />
            )}
          </div>
        )}
        </div>
      </ScrollArea>

      {/* Bottom section */}
      <div className="flex-shrink-0">
        {layout === "icon" && (
          <div className="flex flex-col items-center gap-1 py-2 px-1.5">
            <SimpleTooltip content={settingsLabel} side="right" sideOffset={8} delayDuration={400}>
              <Button variant="ghost" size="icon-sm" onClick={onSettingsClick} className="text-muted-foreground hover:text-foreground hover:bg-accent/60">
                <Settings2 size={18} strokeWidth={1.6} />
              </Button>
            </SimpleTooltip>
            {user && (
              <Avatar className="w-7 h-7 ring-[1px] ring-border">
                {user.avatarUrl ? (
                  <AvatarImage src={user.avatarUrl} alt="" />
                ) : (
                  <AvatarFallback className="bg-gradient-to-br from-accent-blue to-accent-indigo text-primary-foreground text-xs">
                    {user.name?.charAt(0) ?? "U"}
                  </AvatarFallback>
                )}
              </Avatar>
            )}
          </div>
        )}

        {layout === "vertical-card" && (
          <div className="flex flex-col items-center gap-0 py-1.5 px-1">
            <Button variant="ghost" size="sm" onClick={onSettingsClick} className="w-full flex-col gap-0.5 py-2 text-muted-foreground hover:text-foreground hover:bg-accent/50">
              <Settings2 size={18} strokeWidth={1.6} />
              <span className="text-xs leading-tight tracking-[-0.12px]">{settingsLabel}</span>
            </Button>
            {user && (
              <Avatar className="w-7 h-7 ring-[1px] ring-border mt-1">
                {user.avatarUrl ? (
                  <AvatarImage src={user.avatarUrl} alt="" />
                ) : (
                  <AvatarFallback className="bg-gradient-to-br from-accent-blue to-accent-indigo text-primary-foreground text-xs">
                    {user.name?.charAt(0) ?? "U"}
                  </AvatarFallback>
                )}
              </Avatar>
            )}
          </div>
        )}

        {layout === "full" && <FullBottomSection onSettingsClick={onSettingsClick} settingsLabel={settingsLabel} user={user} />}
      </div>

      {/* Resize handle */}
      <div
        onMouseDown={startResizing}
        className="absolute right-0 top-0 bottom-0 w-[3px] cursor-col-resize z-[var(--z-sticky)] group/handle"
      >
        <div className="w-full h-full opacity-0 group-hover/handle:opacity-100 bg-primary/20 transition-opacity" />
      </div>
    </div>
  )
}
