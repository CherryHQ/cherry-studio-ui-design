import React from 'react';
import type { Tab } from '@/app/types';

interface DragGhostProps {
  tabId: string;
  x: number;
  y: number;
  overSidebar: boolean;
  tabs: Tab[];
}

export function DragGhost({ tabId, x, y, overSidebar, tabs }: DragGhostProps) {
  const ghostTab = tabs.find(t => t.id === tabId);
  if (!ghostTab) return null;
  const GIcon = ghostTab.icon;

  return (
    <div
      className={`fixed z-[500] pointer-events-none transition-shadow duration-100 ${overSidebar ? 'opacity-70 scale-95' : 'opacity-90'}`}
      style={{ left: x - 50, top: y - 16 }}
    >
      <div className={`flex items-center gap-1.5 h-8 px-2.5 rounded-lg border shadow-xl text-xs whitespace-nowrap
        ${overSidebar
          ? 'bg-primary/10 border-primary/40 text-primary'
          : 'bg-popover border-border text-popover-foreground'
        }`}>
        {ghostTab.miniAppId ? (
          ghostTab.miniAppLogoUrl ? <img src={ghostTab.miniAppLogoUrl} alt="" className="w-3.5 h-3.5 rounded-[3px] object-cover" /> :
          <div className="w-3.5 h-3.5 rounded-[3px] flex items-center justify-center text-white text-[6px]" style={{ background: ghostTab.miniAppColor }}>{ghostTab.miniAppInitial}</div>
        ) : <GIcon size={13} strokeWidth={1.6} />}
        <span>{ghostTab.title}</span>
      </div>
    </div>
  );
}
