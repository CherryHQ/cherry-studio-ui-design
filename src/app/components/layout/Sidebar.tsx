import React, { useRef, useCallback } from 'react';
import {
  Search, X, ChevronRight, Settings2,
} from 'lucide-react';
import cherryLogoImg from "figma:asset/323a8e579278901c878705f686c0f633dc0f4c7d.png";
import { Tooltip } from '@/app/components/Tooltip';
import { BP_ICON, BP_VERTICAL_CARD, BP_FULL, getLayout } from '@/app/config/constants';
import type { MenuItem, Tab } from '@/app/types';

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
  const fontSize = size === 'sm' ? 'text-[6px]' : 'text-[6px]';
  if (tab.miniAppLogoUrl) {
    return <img src={tab.miniAppLogoUrl} alt="" className={`${s} rounded-[3px] object-cover flex-shrink-0`} />;
  }
  return (
    <div className={`${s} rounded-[3px] flex items-center justify-center text-white ${fontSize} flex-shrink-0`} style={{ background: tab.miniAppColor }}>
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
  return (
    <div className="px-2 space-y-0.5">
      {items.map((item) => {
        const isActive = activeItem === item.id;
        const Icon = item.icon;
        const miniTabs = item.id === 'miniapp' ? activeMiniAppTabs : [];
        return (
          <div key={item.id}>
            <button
              onClick={() => onItemClick(item.id)}
              className={`w-full flex items-center gap-2.5 px-2.5 py-[7px] rounded-xl text-[13px] transition-all duration-150 relative
                ${isActive
                  ? 'bg-cherry-active-bg text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/60'
                }`}
            >
              {isActive && (
                <div className="absolute inset-0 rounded-xl border border-cherry-active-border pointer-events-none" />
              )}
              <Icon size={16} strokeWidth={1.6} />
              <span className="truncate">{item.label}</span>
            </button>
            {miniTabs.map(mt => (
              <button
                key={mt.id}
                onClick={() => onMiniAppTabClick?.(mt.id)}
                className={`w-full flex items-center gap-2 pl-7 pr-2.5 py-[5px] rounded-xl text-[12px] transition-all duration-150 relative
                  ${activeTabId === mt.id ? 'bg-cherry-active-bg text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent/40'}`}
              >
                {activeTabId === mt.id && (
                  <div className="absolute inset-0 rounded-xl border border-cherry-active-border pointer-events-none" />
                )}
                <MiniAppIcon tab={mt} />
                <span className="truncate">{mt.title}</span>
              </button>
            ))}
          </div>
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
            className={`group/dock flex items-center gap-2.5 px-2.5 py-[6px] rounded-xl text-[12px] transition-all duration-150 cursor-grab active:cursor-grabbing relative
              ${isActive ? 'bg-cherry-active-bg text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent/40'}`}
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
            <button
              onClick={(e) => { e.stopPropagation(); onCloseDockedTab?.(dt.id); }}
              className="w-4 h-4 rounded-sm flex items-center justify-center hover:bg-foreground/10 opacity-0 group-hover/dock:opacity-100 transition-opacity flex-shrink-0"
            ><X size={9} /></button>
          </div>
        );
      })}
    </div>
  );
}

/** Full-layout bottom section */
function FullBottomSection({ onSettingsClick }: { onSettingsClick?: () => void }) {
  return (
    <div className="px-2 py-2 space-y-1">
      <button onClick={onSettingsClick} className="w-full flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg text-[13px] text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors">
        <Settings2 size={16} strokeWidth={1.6} />
        <span>设置</span>
      </button>
      <div className="flex items-center gap-2.5 px-2.5 py-1.5 cursor-pointer rounded-lg hover:bg-accent/60 transition-colors">
        <div className="w-7 h-7 rounded-full overflow-hidden ring-1 ring-border flex-shrink-0">
          <div className="w-full h-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-[10px]">S</div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] text-sidebar-foreground truncate">Siin</div>
          <div className="text-[10px] text-muted-foreground truncate">siin@gmail.com</div>
        </div>
        <ChevronRight size={14} className="text-muted-foreground flex-shrink-0" />
      </div>
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
  onDismiss?: () => void;
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
  onDismiss,
}: SidebarProps) {
  const isResizing = useRef(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const layout = getLayout(width);

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
      else if (newW < 42) setWidth(BP_ICON);
      else if (newW < 90) setWidth(BP_VERTICAL_CARD);
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
    const handleDismiss = () => onDismiss?.();
    return (
      <div
        className="absolute inset-0 z-40"
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

          {/* Search */}
          <div className="px-3 py-2 flex-shrink-0">
            <div onClick={() => { onSearchClick(); handleDismiss(); }} className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-sidebar-accent/50 text-muted-foreground text-xs cursor-pointer hover:bg-accent transition-colors">
              <Search size={13} />
              <span>搜索</span>
            </div>
          </div>

          {/* Menu items */}
          <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden py-1">
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
          className="absolute left-0 top-0 bottom-0 w-[6px] z-50"
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
  const actualWidth = layout === 'icon' ? BP_ICON : layout === 'vertical-card' ? BP_VERTICAL_CARD : width;

  return (
    <div
      ref={sidebarRef}
      style={{ width: actualWidth }}
      className="h-full bg-sidebar flex flex-col flex-shrink-0 relative group/sidebar z-20 select-none"
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

      {/* Search */}
      {layout === 'full' ? (
        <div className="px-3 py-2 flex-shrink-0">
          <div onClick={onSearchClick} className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-sidebar-accent text-muted-foreground text-xs cursor-pointer hover:bg-accent transition-colors">
            <Search size={13} />
            <span>搜索</span>
          </div>
        </div>
      ) : (
        <div className="flex justify-center py-1.5 flex-shrink-0">
          <Tooltip content="搜索">
            <button onClick={onSearchClick} className="w-9 h-9 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors">
              <Search size={16} strokeWidth={1.6} />
            </button>
          </Tooltip>
        </div>
      )}

      {/* Menu items */}
      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden py-1">
        {layout === 'icon' && (
          <div className="flex flex-col items-center gap-0.5 px-1.5">
            {items.map((item) => {
              const isActive = activeItem === item.id;
              const Icon = item.icon;
              const miniTabs = item.id === 'miniapp' ? (activeMiniAppTabs || []) : [];
              return (
                <div key={item.id} className="contents">
                  <Tooltip content={item.label}>
                    <button
                      onClick={() => onItemClick(item.id)}
                      className={`w-9 h-9 rounded-md flex items-center justify-center transition-all duration-150 relative
                        ${isActive
                          ? 'bg-cherry-active-bg text-foreground'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent/60'
                        }`}
                    >
                      {isActive && (
                        <div className="absolute inset-0 rounded-md border border-cherry-active-border pointer-events-none" />
                      )}
                      <Icon size={18} strokeWidth={1.6} />
                    </button>
                  </Tooltip>
                  {miniTabs.map(mt => (
                    <Tooltip key={mt.id} content={mt.title}>
                      <button
                        onClick={() => onMiniAppTabClick?.(mt.id)}
                        className={`w-7 h-7 rounded-md flex items-center justify-center transition-all duration-150 relative
                          ${activeTabId === mt.id ? 'bg-cherry-active-bg' : 'hover:bg-accent/50'}`}
                      >
                        {activeTabId === mt.id && (
                          <div className="absolute inset-0 rounded-md border border-cherry-active-border pointer-events-none" />
                        )}
                        <MiniAppIcon tab={mt} size="md" />
                      </button>
                    </Tooltip>
                  ))}
                </div>
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
                  <button
                    onClick={() => onItemClick(item.id)}
                    className={`w-full flex flex-col items-center gap-0.5 py-2 rounded-md transition-all duration-150 relative
                      ${isActive
                        ? 'bg-cherry-active-bg text-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                      }`}
                  >
                    {isActive && (
                      <div className="absolute inset-0 rounded-md border border-cherry-active-border pointer-events-none" />
                    )}
                    <Icon size={18} strokeWidth={1.6} />
                    <span className="text-[9px] leading-tight">{item.label}</span>
                  </button>
                  {miniTabs.map(mt => (
                    <button
                      key={mt.id}
                      onClick={() => onMiniAppTabClick?.(mt.id)}
                      className={`w-full flex flex-col items-center gap-0.5 py-1.5 rounded-md transition-all duration-150 relative
                        ${activeTabId === mt.id ? 'bg-cherry-active-bg' : 'hover:bg-accent/40'}`}
                    >
                      {activeTabId === mt.id && (
                        <div className="absolute inset-0 rounded-md border border-cherry-active-border pointer-events-none" />
                      )}
                      <MiniAppIcon tab={mt} size="md" />
                      <span className="text-[8px] leading-tight text-muted-foreground truncate max-w-[50px]">{mt.title}</span>
                    </button>
                  ))}
                </div>
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
                        <button
                          onClick={() => onMiniAppTabClick?.(dt.id)}
                          onMouseDown={(e) => { e.stopPropagation(); onStartSidebarDrag?.(e, dt.id); }}
                          className={`w-7 h-7 rounded-md flex items-center justify-center transition-all duration-150 cursor-grab active:cursor-grabbing relative
                            ${isActive ? 'bg-cherry-active-bg' : 'hover:bg-accent/50'}`}
                        >
                          {isActive && (
                            <div className="absolute inset-0 rounded-md border border-cherry-active-border pointer-events-none" />
                          )}
                          {dt.miniAppId ? (
                            <MiniAppIcon tab={dt} size="md" />
                          ) : <DtIcon size={14} strokeWidth={1.6} />}
                        </button>
                      </Tooltip>
                      <button
                        onClick={(e) => { e.stopPropagation(); onCloseDockedTab?.(dt.id); }}
                        className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-popover border border-border flex items-center justify-center text-muted-foreground hover:text-foreground opacity-0 group-hover/dock:opacity-100 transition-opacity z-10"
                      ><X size={7} /></button>
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
                      <button
                        onClick={() => onMiniAppTabClick?.(dt.id)}
                        onMouseDown={(e) => { e.stopPropagation(); onStartSidebarDrag?.(e, dt.id); }}
                        className={`w-full flex flex-col items-center gap-0.5 py-1.5 rounded-md transition-all duration-150 cursor-grab active:cursor-grabbing relative
                          ${isActive ? 'bg-cherry-active-bg' : 'hover:bg-accent/40'}`}
                      >
                        {isActive && (
                          <div className="absolute inset-0 rounded-md border border-cherry-active-border pointer-events-none" />
                        )}
                        {dt.miniAppId ? (
                          <MiniAppIcon tab={dt} size="md" />
                        ) : <DtIcon size={18} strokeWidth={1.6} />}
                        <span className="text-[8px] leading-tight text-muted-foreground truncate max-w-[50px]">{dt.title}</span>
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); onCloseDockedTab?.(dt.id); }}
                        className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-popover border border-border flex items-center justify-center text-muted-foreground hover:text-foreground opacity-0 group-hover/dock:opacity-100 transition-opacity z-10"
                      ><X size={7} /></button>
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
              <button onClick={onSettingsClick} className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors">
                <Settings2 size={18} strokeWidth={1.6} />
              </button>
            </Tooltip>
            <div className="w-7 h-7 rounded-full overflow-hidden ring-1 ring-border">
              <div className="w-full h-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-[10px]">S</div>
            </div>
          </div>
        )}

        {layout === 'vertical-card' && (
          <div className="flex flex-col items-center gap-0 py-1.5 px-1">
            <button onClick={onSettingsClick} className="w-full flex flex-col items-center gap-0.5 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors">
              <Settings2 size={18} strokeWidth={1.6} />
              <span className="text-[9px] leading-tight">设置</span>
            </button>
            <div className="w-7 h-7 rounded-full overflow-hidden ring-1 ring-border mt-1">
              <div className="w-full h-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-[10px]">S</div>
            </div>
          </div>
        )}

        {layout === 'full' && <FullBottomSection onSettingsClick={onSettingsClick} />}
      </div>

      {/* Resize handle */}
      <div
        onMouseDown={startResizing}
        className="absolute right-0 top-0 bottom-0 w-[3px] cursor-col-resize z-50 group/handle"
      >
        <div className="w-full h-full opacity-0 group-hover/handle:opacity-100 bg-primary/20 transition-opacity" />
      </div>
    </div>
  );
}