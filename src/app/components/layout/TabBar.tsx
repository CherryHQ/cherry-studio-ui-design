import React, { useState } from 'react';
import {
  Plus, X, ChevronDown,
} from 'lucide-react';
import { Button, Popover, PopoverTrigger, PopoverContent } from '@cherry-studio/ui';
import { Tooltip } from '@/app/components/Tooltip';
import type { Tab } from '@/app/types';

interface TabBarProps {
  tabs: Tab[];
  activeTabId: string;
  onTabClick: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  onTabContext: (e: React.MouseEvent, tabId: string) => void;
  onNewTab: () => void;
  startTabDrag: (e: React.MouseEvent, tabId: string) => void;
}

export function TabBar({
  tabs,
  activeTabId,
  onTabClick,
  onTabClose,
  onTabContext,
  onNewTab,
  startTabDrag,
}: TabBarProps) {
  const pinnedTabs = tabs.filter(t => t.pinned && t.id !== 'home' && !t.sidebarDocked);
  const unpinnedTabs = tabs.filter(t => !t.pinned && t.id !== 'home' && !t.sidebarDocked);
  const [tabListOpen, setTabListOpen] = useState(false);

  return (
    <div className="h-11 bg-sidebar flex items-center select-none flex-shrink-0">
      {/* Traffic lights */}
      <div className="flex items-center gap-2 px-4 flex-shrink-0">
        <div className="w-3 h-3 rounded-full bg-traffic-red border border-traffic-red-border" />
        <div className="w-3 h-3 rounded-full bg-traffic-yellow border border-traffic-yellow-border" />
        <div className="w-3 h-3 rounded-full bg-traffic-green border border-traffic-green-border" />
      </div>

      {/* Tabs area */}
      <div className="flex-1 flex items-center gap-0.5 overflow-x-auto scrollbar-hide min-w-0 px-1">
        {/* Pinned tabs — grouped in a shared rounded container */}
        {pinnedTabs.length > 0 && (
          <div className="flex items-center bg-sidebar-accent/50 rounded-lg p-0.5 gap-0 flex-shrink-0">
            {pinnedTabs.map((tab) => {
              const isActive = tab.id === activeTabId;
              const Icon = tab.icon;
              return (
                <Tooltip key={tab.id} content={tab.title} side="bottom">
                  <div
                    onClick={() => onTabClick(tab.id)}
                    onContextMenu={(e) => onTabContext(e, tab.id)}
                    onMouseDown={(e) => { if (tab.closeable) startTabDrag(e, tab.id); }}
                    className={`w-7 h-7 rounded-md flex items-center justify-center cursor-pointer transition-all duration-150
                      ${isActive
                        ? 'bg-sidebar-accent text-sidebar-foreground'
                        : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground'
                      }`}
                  >
                    {tab.miniAppId ? (
                      tab.miniAppLogoUrl ? <img src={tab.miniAppLogoUrl} alt="" className="w-3.5 h-3.5 rounded-[var(--radius-dot)] object-cover" /> :
                      <div className={`w-3.5 h-3.5 rounded-[var(--radius-dot)] flex items-center justify-center text-white text-xs ${tab.miniAppColor}`}>{tab.miniAppInitial}</div>
                    ) : <Icon size={14} strokeWidth={1.6} />}
                  </div>
                </Tooltip>
              );
            })}
          </div>
        )}

        {/* Separator between pinned group and unpinned */}
        {unpinnedTabs.length > 0 && (
          <div className="w-px h-4 bg-border/30 mx-1 flex-shrink-0" />
        )}

        {/* Regular tabs — shrink when many */}
        {unpinnedTabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          const Icon = tab.icon;
          return (
            <div
              key={tab.id}
              onClick={() => onTabClick(tab.id)}
              onContextMenu={(e) => onTabContext(e, tab.id)}
              onMouseDown={(e) => { if (tab.closeable) startTabDrag(e, tab.id); }}
              className={`group relative flex items-center gap-1.5 h-[30px] rounded-md cursor-pointer transition-all duration-150 min-w-[40px] max-w-[160px]
                ${tab.closeable ? 'pl-2 pr-1' : 'px-2'}
                ${isActive
                  ? 'bg-sidebar-accent text-sidebar-foreground'
                  : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground'
                }`}
            >
              {tab.miniAppId ? (
                tab.miniAppLogoUrl ? <img src={tab.miniAppLogoUrl} alt="" className="w-3.5 h-3.5 rounded-[var(--radius-dot)] object-cover flex-shrink-0" /> :
                <div className={`w-3.5 h-3.5 rounded-[var(--radius-dot)] flex items-center justify-center text-white text-xs flex-shrink-0 ${tab.miniAppColor}`}>{tab.miniAppInitial}</div>
              ) : <Icon size={13} strokeWidth={1.6} className="flex-shrink-0" />}
              <span className="text-sm truncate">{tab.title}</span>
              {tab.closeable && (
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={(e) => { e.stopPropagation(); onTabClose(tab.id); }}
                  className={`w-[18px] h-[18px] rounded-sm hover:bg-accent/50 flex-shrink-0 ml-auto
                    ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                >
                  <X size={10} />
                </Button>
              )}
            </div>
          );
        })}

        <Button
          variant="ghost"
          size="icon-xs"
          onClick={onNewTab}
          className="w-7 h-7 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground flex-shrink-0 ml-0.5"
        >
          <Plus size={14} />
        </Button>
      </div>

      {/* Right: All tabs dropdown */}
      <div className="flex items-center px-2.5 flex-shrink-0">
        <Popover open={tabListOpen} onOpenChange={setTabListOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon-xs"
              className={`w-7 h-7 ${
                tabListOpen ? 'bg-sidebar-accent text-sidebar-foreground' : 'text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent'
              }`}
              title="全部标签页"
            >
              <ChevronDown size={15} strokeWidth={1.6} />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="p-0 w-[240px] overflow-hidden">
            <div className="px-3 py-2 border-b border-border/30">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">已打开的标签页 · {tabs.length}</span>
            </div>
            <div className="max-h-[300px] overflow-y-auto py-1 scrollbar-thin-xs">
              {tabs.filter(t => !t.sidebarDocked).map(tab => {
                const Icon = tab.icon;
                const isActive = tab.id === activeTabId;
                return (
                  <Button
                    key={tab.id}
                    variant="ghost"
                    size="xs"
                    onClick={() => { onTabClick(tab.id); setTabListOpen(false); }}
                    className={`w-full justify-start gap-2 px-3 py-[5px] font-normal ${
                      isActive ? 'bg-accent/50 text-foreground' : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                    }`}
                  >
                    {tab.miniAppId ? (
                      tab.miniAppLogoUrl ? <img src={tab.miniAppLogoUrl} alt="" className="w-3.5 h-3.5 rounded-[var(--radius-dot)] object-cover flex-shrink-0" /> :
                      <div className={`w-3.5 h-3.5 rounded-[var(--radius-dot)] flex items-center justify-center text-white text-xs flex-shrink-0 ${tab.miniAppColor}`}>{tab.miniAppInitial}</div>
                    ) : <Icon size={12} strokeWidth={1.6} className="flex-shrink-0" />}
                    <span className="truncate flex-1 text-left">{tab.title}</span>
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground flex-shrink-0" />}
                  </Button>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
