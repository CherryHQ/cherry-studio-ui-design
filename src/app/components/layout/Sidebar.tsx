import React, { useRef, useCallback, useState } from 'react';
import {
  X, ChevronRight, Settings, PinOff, LayoutGrid,
} from 'lucide-react';
// `LayoutGrid` is the 管理 icon used inside the right-click menu — kept
// here so the context-menu item icon doesn't drift from how the
// launchpad represents itself elsewhere.
import cherryLogoImg from "@/assets/cherry-icon.png";
import { Button, ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@cherry-studio/ui';
import { Tooltip } from '@/app/components/Tooltip';
import { BP_ICON, BP_FULL, getLayout } from '@/app/config/constants';
import type { MenuItem, Tab } from '@/app/types';
import { useCollab } from '@/features/collaboration/CollabContext';
import { useGlobalActions } from '@/app/context/GlobalActionContext';
import { resolveArtifactIcon } from '@/app/utils/artifactIcons';

function CherryLogo({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const s = size === 'sm' ? 'w-7 h-7' : 'w-8 h-8';
  return (
    <img src={cherryLogoImg} alt="Cherry Studio" className={`${s} rounded-lg flex-shrink-0 object-cover`} />
  );
}

export { CherryLogo };

// ===========================
// Shared internal components
// ===========================

/** Mini app icon — logo image or colored initial */
function MiniAppIcon({ tab, size = 'sm' }: { tab: Tab; size?: 'sm' | 'md' }) {
  const s = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  const fontSize = size === 'sm' ? 'text-xs' : 'text-xs';
  if (tab.miniAppLogoUrl) {
    return <img src={tab.miniAppLogoUrl} alt="" className={`${s} rounded-[var(--radius-dot)] object-cover flex-shrink-0`} />;
  }
  return (
    <div className={`${s} rounded-[var(--radius-dot)] flex items-center justify-center text-white ${fontSize} flex-shrink-0 ${tab.miniAppColor}`}>
      {tab.miniAppInitial}
    </div>
  );
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
  items: MenuItem[];
  activeItem: string;
  onItemClick: (id: string) => void;
  activeMiniAppTabs: Tab[];
  activeTabId?: string;
  onMiniAppTabClick?: (tabId: string) => void;
  isFloating?: boolean;
}) {
  const { unpinFromSidebar, openLaunchpad, openMiniApp, launchpadOpen, sidebarMiniapps, sidebarArtifacts } = useGlobalActions();
  // Newly-opened mini-apps live in the top tab bar only — we used to nest
  // them under the 小程序 menu item, but that double-surfaced the same
  // embed (left rail + top tabs) and confused which click did what.
  void activeMiniAppTabs;
  void activeTabId;
  void onMiniAppTabClick;
  return (
    <div className="px-2 space-y-0.5">
      {items.map((item) => {
        const isActive = activeItem === item.id;
        const Icon = item.icon;
        return (
          <div key={item.id}>
            <ContextMenu>
              <ContextMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onItemClick(item.id)}
                  className={`w-full justify-start gap-2.5 px-2.5 py-[7px] rounded-xl text-sm relative
                    ${isActive
                      ? 'bg-cherry-active-bg text-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                    }`}
                >
                  {isActive && (
                    <div className="absolute inset-0 rounded-xl border border-cherry-active-border pointer-events-none" />
                  )}
                  <Icon size={16} strokeWidth={1.6} />
                  <span className="truncate">{item.label}</span>
                </Button>
              </ContextMenuTrigger>
              {/* Override the default `--z-dropdown` (200) — the sidebar
                  sits at `--z-sticky` (300) and would otherwise occlude
                  its own right-click menu. `--z-popover` (600) puts the
                  menu cleanly above any sidebar chrome. */}
              <ContextMenuContent className="z-[var(--z-popover)]">
                <ContextMenuItem onSelect={() => unpinFromSidebar('function', item.id)}>
                  <PinOff size={14} strokeWidth={1.6} />
                  从菜单栏移除
                </ContextMenuItem>
                <ContextMenuItem onSelect={() => openLaunchpad(true)}>
                  <LayoutGrid size={14} strokeWidth={1.6} />
                  管理
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          </div>
        );
      })}

      {/* Pinned mini-apps — added from the launchpad's edit mode. Each
          opens the embed via openMiniApp, and right-click offers removal
          from the sidebar. */}
      {sidebarMiniapps.map((app) => (
        <ContextMenu key={`mini-${app.id}`}>
          <ContextMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => openMiniApp(app)}
              className="w-full justify-start gap-2.5 px-2.5 py-[7px] rounded-xl text-sm relative text-muted-foreground hover:text-foreground hover:bg-accent/50"
            >
              <div className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] text-white flex-shrink-0 ${app.color}`}>
                {app.initial}
              </div>
              <span className="truncate">{app.name}</span>
            </Button>
          </ContextMenuTrigger>
          <ContextMenuContent className="z-[var(--z-popover)]">
            <ContextMenuItem onSelect={() => unpinFromSidebar('miniapp', app.id)}>
              <PinOff size={14} strokeWidth={1.6} />
              从菜单栏移除
            </ContextMenuItem>
            <ContextMenuItem onSelect={() => openLaunchpad(true)}>
              <LayoutGrid size={14} strokeWidth={1.6} />
              管理
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      ))}

      {/* Pinned artifacts — generic FileText-style avatar, opens the
          html-preview tab via launchpadOpen which handles both static
          keys and runtime "pinned:<id>" keys. */}
      {sidebarArtifacts.map((a) => {
        const Icon = resolveArtifactIcon(a.iconName);
        return (
          <ContextMenu key={`art-${a.key}`}>
            <ContextMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => launchpadOpen(`html:${a.key}`)}
                className="w-full justify-start gap-2.5 px-2.5 py-[7px] rounded-xl text-sm relative text-muted-foreground hover:text-foreground hover:bg-accent/50"
              >
                <Icon size={16} strokeWidth={1.6} className="text-accent-violet flex-shrink-0" />
                <span className="truncate">{a.label}</span>
              </Button>
            </ContextMenuTrigger>
            <ContextMenuContent className="z-[var(--z-popover)]">
              <ContextMenuItem onSelect={() => unpinFromSidebar('artifact', a.key)}>
                <PinOff size={14} strokeWidth={1.6} />
                从菜单栏移除
              </ContextMenuItem>
              <ContextMenuItem onSelect={() => openLaunchpad(true)}>
                <LayoutGrid size={14} strokeWidth={1.6} />
                管理
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        );
      })}
    </div>
  );
}

/** Full-layout docked tabs list */
function FullDockedTabs({
  dockedTabs,
  activeTabId,
  onMiniAppTabClick,
  onStartSidebarDrag,
  onCloseDockedTab,
}: {
  dockedTabs: Tab[];
  activeTabId?: string;
  onMiniAppTabClick?: (tabId: string) => void;
  onStartSidebarDrag?: (e: React.MouseEvent, tabId: string) => void;
  onCloseDockedTab?: (tabId: string) => void;
}) {
  if (dockedTabs.length === 0) return null;
  return (
    <div className="px-2 mt-1 pt-1 border-t border-border/30 space-y-0.5">
      {dockedTabs.map(dt => {
        const DtIcon = dt.icon;
        const isActive = activeTabId === dt.id;
        return (
          <div
            key={dt.id}
            className={`group/dock flex items-center gap-2.5 px-2.5 py-[6px] rounded-xl text-sm transition-all duration-150 cursor-grab active:cursor-grabbing relative
              ${isActive ? 'bg-cherry-active-bg text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'}`}
            onClick={() => onMiniAppTabClick?.(dt.id)}
            onMouseDown={(e) => { e.stopPropagation(); onStartSidebarDrag?.(e, dt.id); }}
          >
            {isActive && (
              <div className="absolute inset-0 rounded-xl border border-cherry-active-border pointer-events-none" />
            )}
            {dt.miniAppId ? (
              <MiniAppIcon tab={dt} />
            ) : <DtIcon size={14} strokeWidth={1.6} className="flex-shrink-0" />}
            <span className="truncate flex-1">{dt.title}</span>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={(e) => { e.stopPropagation(); onCloseDockedTab?.(dt.id); }}
              className="w-4 h-4 flex items-center justify-center hover:bg-accent/50 opacity-0 group-hover/dock:opacity-100 transition-opacity flex-shrink-0"
            ><X size={9} /></Button>
          </div>
        );
      })}
    </div>
  );
}

/** Full-layout bottom section — horizontal avatar + icons */
function FullBottomSection({ onSettingsClick }: {
  onSettingsClick?: () => void;
  isDark?: boolean;
  onToggleTheme?: () => void;
}) {
  const { openUserInfo } = useCollab();
  return (
    <div className="px-2.5 py-2.5 space-y-1">
      <button
        onClick={openUserInfo}
        className="flex items-center gap-2.5 w-full rounded-lg px-1.5 py-1.5 -mx-1 text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-accent/30 transition-colors cursor-pointer"
        title="个人信息"
      >
        <div className="w-6 h-6 rounded-full overflow-hidden ring-1 ring-border flex-shrink-0">
          <div className="w-full h-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-[10px]">S</div>
        </div>
        <div className="flex-1 min-w-0 text-left">
          <div className="text-xs text-sidebar-foreground truncate">Siin</div>
          <div className="text-[10px] text-muted-foreground truncate">siin@gmail.com</div>
        </div>
      </button>

      {/* Bottom bar: settings shortcut */}
      <button
        onClick={() => onSettingsClick?.()}
        className="flex items-center gap-2.5 w-full rounded-lg px-1.5 py-1.5 -mx-1 text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-accent/40 transition-colors cursor-pointer"
        title="设置"
      >
        <Settings size={16} strokeWidth={1.6} className="flex-shrink-0" />
        <span className="text-xs truncate">设置</span>
      </button>
    </div>
  );
}

// ===========================
// Main Sidebar component
// ===========================

interface SidebarProps {
  width: number;
  setWidth: (w: number) => void;
  activeItem: string;
  onItemClick: (id: string) => void;
  onHoverChange: (visible: boolean) => void;
  onSearchClick: () => void;
  onSettingsClick?: () => void;
  items: MenuItem[];
  activeMiniAppTabs?: Tab[];
  activeTabId?: string;
  onMiniAppTabClick?: (tabId: string) => void;
  dockedTabs?: Tab[];
  onUndockTab?: (tabId: string) => void;
  onStartSidebarDrag?: (e: React.MouseEvent, tabId: string) => void;
  onCloseDockedTab?: (tabId: string) => void;
  isFloating?: boolean;
  onClose?: () => void;
  isDark?: boolean;
  onToggleTheme?: () => void;
}

export function Sidebar({
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
  onClose,
  isDark,
  onToggleTheme,
}: SidebarProps) {
  const isResizing = useRef(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const layout = getLayout(width);
  // Pinned mini-apps + artifacts need to surface in every layout
  // (icon / vertical-card / full). FullMenuItems pulls them itself; the
  // icon and vertical-card branches below pull from here.
  const {
    sidebarMiniapps, sidebarArtifacts,
    openMiniApp, launchpadOpen,
    unpinFromSidebar, openLaunchpad,
  } = useGlobalActions();

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const containerLeft = sidebarRef.current?.parentElement?.getBoundingClientRect().left ?? 0;

    const onMouseMove = (ev: MouseEvent) => {
      if (!isResizing.current) return;
      const newW = ev.clientX - containerLeft;
      if (newW < 15) setWidth(0);
      else if (newW < 90) setWidth(BP_ICON);
      else setWidth(Math.min(280, Math.max(BP_FULL, newW)));
    };
    const onMouseUp = () => {
      isResizing.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [setWidth]);

  // ===========================
  // Floating mode
  // ===========================
  if (isFloating) {
    const handleDismiss = () => onClose?.();
    return (
      <div
        className="absolute inset-0 z-[var(--z-overlay)]"
        onClick={handleDismiss}
      >
        <div
          className="absolute left-0 top-0 bottom-0 bg-sidebar/70 backdrop-blur-2xl backdrop-saturate-150 flex flex-col select-none shadow-2xl rounded-r-2xl animate-in slide-in-from-left-2 duration-200"
          style={{ width: BP_FULL }}
          onClick={(e) => e.stopPropagation()}
          onMouseLeave={() => {
            if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
            hoverTimeout.current = setTimeout(handleDismiss, 300);
          }}
          onMouseEnter={() => {
            if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
          }}
        >
          {/* Top area with traffic lights */}
          <div className="h-11 flex items-center px-4 flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-traffic-red border border-traffic-red-border" />
              <div className="w-3 h-3 rounded-full bg-traffic-yellow border border-traffic-yellow-border" />
              <div className="w-3 h-3 rounded-full bg-traffic-green border border-traffic-green-border" />
            </div>
          </div>

          {/* Logo area */}
          <div className="flex items-center h-14 px-4 gap-2.5 flex-shrink-0">
            <CherryLogo size="md" />
            <span className="text-sm text-sidebar-foreground truncate">Cherry Studio</span>
          </div>

          {/* Menu items */}
          <div className="flex-1 overflow-y-auto scrollbar-hide py-1">
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

          {/* Bottom section */}
          <div className="flex-shrink-0">
            <FullBottomSection onSettingsClick={onSettingsClick} />
          </div>
        </div>
      </div>
    );
  }

  // ===========================
  // Hidden mode (width ≈ 0)
  // ===========================
  if (layout === 'hidden') {
    return (
      <div
        ref={sidebarRef}
        className="w-0 h-full flex-shrink-0 relative"
      >
        {/* Hover trigger zone — shows floating sidebar */}
        <div
          className="absolute left-0 top-0 bottom-0 w-[6px] z-[var(--z-popover)]"
          onMouseEnter={() => {
            if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
            hoverTimeout.current = setTimeout(() => onHoverChange(true), 200);
          }}
          onMouseLeave={() => {
            if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
          }}
        >
          {/* Drag handle line */}
          <div
            onMouseDown={(e) => { onHoverChange(false); startResizing(e); }}
            className="w-full h-full cursor-col-resize group/handle"
          >
            <div className="w-[2px] h-full ml-[2px] opacity-0 group-hover/handle:opacity-100 bg-primary/30 transition-opacity rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  // ===========================
  // Normal visible modes (icon / vertical-card / full)
  // ===========================
  const actualWidth = layout === 'icon' ? BP_ICON : width;

  return (
    <div
      ref={sidebarRef}
      style={{ width: actualWidth }}
      className="h-full bg-sidebar flex flex-col flex-shrink-0 relative group/sidebar z-[var(--z-sticky)] select-none"
    >
      {/* Logo area */}
      <div className={`flex items-center flex-shrink-0 ${
        layout === 'full' ? 'h-14 px-4 gap-2.5' : 'h-14 justify-center'
      }`}>
        <CherryLogo size={layout === 'full' ? 'md' : 'sm'} />
        {layout === 'full' && (
          <span className="text-sm text-sidebar-foreground truncate">Cherry Studio</span>
        )}
      </div>

      {/* Menu items */}
      <div className="flex-1 overflow-y-auto scrollbar-hide py-1">
        {layout === 'icon' && (
          <div className="flex flex-col items-center gap-0.5 px-1.5">
            {items.map((item) => {
              const isActive = activeItem === item.id;
              const Icon = item.icon;
              const miniTabs = item.id === 'miniapp' ? (activeMiniAppTabs || []) : [];
              return (
                <div key={item.id} className="contents">
                  <Tooltip content={item.label}>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onItemClick(item.id)}
                      className={`relative
                        ${isActive
                          ? 'bg-cherry-active-bg text-foreground'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                        }`}
                    >
                      {isActive && (
                        <div className="absolute inset-0 rounded-md border border-cherry-active-border pointer-events-none" />
                      )}
                      <Icon size={18} strokeWidth={1.6} />
                    </Button>
                  </Tooltip>
                  {miniTabs.map(mt => (
                    <Tooltip key={mt.id} content={mt.title}>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => onMiniAppTabClick?.(mt.id)}
                        className={`w-7 h-7 relative
                          ${activeTabId === mt.id ? 'bg-cherry-active-bg' : 'hover:bg-accent/50'}`}
                      >
                        {activeTabId === mt.id && (
                          <div className="absolute inset-0 rounded-md border border-cherry-active-border pointer-events-none" />
                        )}
                        <MiniAppIcon tab={mt} size="md" />
                      </Button>
                    </Tooltip>
                  ))}
                </div>
              );
            })}

            {/* Pinned mini-apps */}
            {sidebarMiniapps.map((app) => (
              <ContextMenu key={`mini-${app.id}`}>
                <ContextMenuTrigger asChild>
                  <Tooltip content={app.name}>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => openMiniApp(app)}
                      className="text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    >
                      <div className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] text-white ${app.color}`}>
                        {app.initial}
                      </div>
                    </Button>
                  </Tooltip>
                </ContextMenuTrigger>
                <ContextMenuContent className="z-[var(--z-popover)]">
                  <ContextMenuItem onSelect={() => unpinFromSidebar('miniapp', app.id)}>
                    <PinOff size={14} strokeWidth={1.6} />
                    从菜单栏移除
                  </ContextMenuItem>
                  <ContextMenuItem onSelect={() => openLaunchpad(true)}>
                    <LayoutGrid size={14} strokeWidth={1.6} />
                    管理
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            ))}

            {/* Pinned artifacts */}
            {sidebarArtifacts.map((a) => {
              const Icon = resolveArtifactIcon(a.iconName);
              return (
                <ContextMenu key={`art-${a.key}`}>
                  <ContextMenuTrigger asChild>
                    <Tooltip content={a.label}>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => launchpadOpen(`html:${a.key}`)}
                        className="text-muted-foreground hover:text-foreground hover:bg-accent/50"
                      >
                        <Icon size={18} strokeWidth={1.6} className="text-accent-violet" />
                      </Button>
                    </Tooltip>
                  </ContextMenuTrigger>
                  <ContextMenuContent className="z-[var(--z-popover)]">
                    <ContextMenuItem onSelect={() => unpinFromSidebar('artifact', a.key)}>
                      <PinOff size={14} strokeWidth={1.6} />
                      从菜单栏移除
                    </ContextMenuItem>
                    <ContextMenuItem onSelect={() => openLaunchpad(true)}>
                      <LayoutGrid size={14} strokeWidth={1.6} />
                      管理
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              );
            })}
          </div>
        )}

        {layout === 'vertical-card' && (
          <div className="flex flex-col items-center gap-0 px-1">
            {items.map((item) => {
              const isActive = activeItem === item.id;
              const Icon = item.icon;
              const miniTabs = item.id === 'miniapp' ? (activeMiniAppTabs || []) : [];
              return (
                <div key={item.id} className="contents">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onItemClick(item.id)}
                    className={`w-full flex-col items-center gap-0.5 py-2 relative
                      ${isActive
                        ? 'bg-cherry-active-bg text-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                      }`}
                  >
                    {isActive && (
                      <div className="absolute inset-0 rounded-md border border-cherry-active-border pointer-events-none" />
                    )}
                    <Icon size={18} strokeWidth={1.6} />
                    <span className="text-xs leading-tight">{item.label}</span>
                  </Button>
                  {miniTabs.map(mt => (
                    <Button
                      variant="ghost"
                      size="sm"
                      key={mt.id}
                      onClick={() => onMiniAppTabClick?.(mt.id)}
                      className={`w-full flex-col items-center gap-0.5 py-1.5 relative
                        ${activeTabId === mt.id ? 'bg-cherry-active-bg' : 'hover:bg-accent/50'}`}
                    >
                      {activeTabId === mt.id && (
                        <div className="absolute inset-0 rounded-md border border-cherry-active-border pointer-events-none" />
                      )}
                      <MiniAppIcon tab={mt} size="md" />
                      <span className="text-xs leading-tight text-muted-foreground truncate max-w-[50px]">{mt.title}</span>
                    </Button>
                  ))}
                </div>
              );
            })}

            {/* Pinned mini-apps */}
            {sidebarMiniapps.map((app) => (
              <ContextMenu key={`mini-${app.id}`}>
                <ContextMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openMiniApp(app)}
                    className="w-full flex-col items-center gap-0.5 py-2 text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  >
                    <div className={`w-[18px] h-[18px] rounded-md flex items-center justify-center text-[10px] text-white ${app.color}`}>
                      {app.initial}
                    </div>
                    <span className="text-xs leading-tight truncate max-w-[50px]">{app.name}</span>
                  </Button>
                </ContextMenuTrigger>
                <ContextMenuContent className="z-[var(--z-popover)]">
                  <ContextMenuItem onSelect={() => unpinFromSidebar('miniapp', app.id)}>
                    <PinOff size={14} strokeWidth={1.6} />
                    从菜单栏移除
                  </ContextMenuItem>
                  <ContextMenuItem onSelect={() => openLaunchpad(true)}>
                    <LayoutGrid size={14} strokeWidth={1.6} />
                    管理
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            ))}

            {/* Pinned artifacts */}
            {sidebarArtifacts.map((a) => {
              const Icon = resolveArtifactIcon(a.iconName);
              return (
                <ContextMenu key={`art-${a.key}`}>
                  <ContextMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => launchpadOpen(`html:${a.key}`)}
                      className="w-full flex-col items-center gap-0.5 py-2 text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    >
                      <Icon size={18} strokeWidth={1.6} className="text-accent-violet" />
                      <span className="text-xs leading-tight truncate max-w-[50px]">{a.label}</span>
                    </Button>
                  </ContextMenuTrigger>
                  <ContextMenuContent className="z-[var(--z-popover)]">
                    <ContextMenuItem onSelect={() => unpinFromSidebar('artifact', a.key)}>
                      <PinOff size={14} strokeWidth={1.6} />
                      从菜单栏移除
                    </ContextMenuItem>
                    <ContextMenuItem onSelect={() => openLaunchpad(true)}>
                      <LayoutGrid size={14} strokeWidth={1.6} />
                      管理
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              );
            })}
          </div>
        )}

        {layout === 'full' && (
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
            {layout === 'icon' && (
              <div className="flex flex-col items-center gap-0.5 px-1.5 mt-1 pt-1 border-t border-border/30">
                {(dockedTabs || []).map(dt => {
                  const DtIcon = dt.icon;
                  const isActive = activeTabId === dt.id;
                  return (
                    <div key={dt.id} className="relative group/dock">
                      <Tooltip content={dt.title}>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => onMiniAppTabClick?.(dt.id)}
                          onMouseDown={(e) => { e.stopPropagation(); onStartSidebarDrag?.(e, dt.id); }}
                          className={`w-7 h-7 cursor-grab active:cursor-grabbing relative
                            ${isActive ? 'bg-cherry-active-bg' : 'hover:bg-accent/50'}`}
                        >
                          {isActive && (
                            <div className="absolute inset-0 rounded-md border border-cherry-active-border pointer-events-none" />
                          )}
                          {dt.miniAppId ? (
                            <MiniAppIcon tab={dt} size="md" />
                          ) : <DtIcon size={14} strokeWidth={1.6} />}
                        </Button>
                      </Tooltip>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={(e) => { e.stopPropagation(); onCloseDockedTab?.(dt.id); }}
                        className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-popover border border-border flex items-center justify-center text-muted-foreground hover:text-foreground opacity-0 group-hover/dock:opacity-100 transition-opacity z-10"
                      ><X size={7} /></Button>
                    </div>
                  );
                })}
              </div>
            )}
            {layout === 'vertical-card' && (
              <div className="flex flex-col items-center gap-0 px-1 mt-1 pt-1 border-t border-border/30">
                {(dockedTabs || []).map(dt => {
                  const DtIcon = dt.icon;
                  const isActive = activeTabId === dt.id;
                  return (
                    <div key={dt.id} className="relative group/dock w-full">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onMiniAppTabClick?.(dt.id)}
                        onMouseDown={(e) => { e.stopPropagation(); onStartSidebarDrag?.(e, dt.id); }}
                        className={`w-full flex-col items-center gap-0.5 py-1.5 cursor-grab active:cursor-grabbing relative
                          ${isActive ? 'bg-cherry-active-bg' : 'hover:bg-accent/50'}`}
                      >
                        {isActive && (
                          <div className="absolute inset-0 rounded-md border border-cherry-active-border pointer-events-none" />
                        )}
                        {dt.miniAppId ? (
                          <MiniAppIcon tab={dt} size="md" />
                        ) : <DtIcon size={18} strokeWidth={1.6} />}
                        <span className="text-xs leading-tight text-muted-foreground truncate max-w-[50px]">{dt.title}</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={(e) => { e.stopPropagation(); onCloseDockedTab?.(dt.id); }}
                        className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-popover border border-border flex items-center justify-center text-muted-foreground hover:text-foreground opacity-0 group-hover/dock:opacity-100 transition-opacity z-10"
                      ><X size={7} /></Button>
                    </div>
                  );
                })}
              </div>
            )}
            {layout === 'full' && (
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

      {/* Bottom section */}
      <div className="flex-shrink-0">
        {layout === 'icon' && (
          <div className="flex flex-col items-center gap-1 py-2 px-1.5">
            <Tooltip content="设置">
              <Button variant="ghost" size="icon-sm" onClick={onSettingsClick} className="text-muted-foreground hover:text-foreground hover:bg-accent/50">
                <Settings size={18} strokeWidth={1.6} />
              </Button>
            </Tooltip>
          </div>
        )}

        {layout === 'vertical-card' && (
          <div className="flex flex-col items-center gap-0 py-1.5 px-1">
            <Button variant="ghost" size="sm" onClick={onSettingsClick} className="w-full flex-col items-center gap-0.5 py-2 text-muted-foreground hover:text-foreground hover:bg-accent/50">
              <Settings size={18} strokeWidth={1.6} />
              <span className="text-xs leading-tight">设置</span>
            </Button>
          </div>
        )}

        {layout === 'full' && <FullBottomSection onSettingsClick={onSettingsClick} isDark={isDark} onToggleTheme={onToggleTheme} />}
      </div>

      {/* Resize handle */}
      <div
        onMouseDown={startResizing}
        className="absolute right-0 top-0 bottom-0 w-[3px] cursor-col-resize z-[var(--z-popover)] group/handle"
      >
        <div className="w-full h-full opacity-0 group-hover/handle:opacity-100 bg-primary/20 transition-opacity" />
      </div>
    </div>
  );
}