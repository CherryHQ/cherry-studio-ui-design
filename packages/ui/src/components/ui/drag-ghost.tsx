"use client"

import React from 'react';

export interface DragGhostTab {
  id: string;
  title: string;
  icon: React.ElementType;
  miniAppId?: string;
  miniAppColor?: string;
  miniAppInitial?: string;
  miniAppLogoUrl?: string;
}

interface DragGhostProps {
  tabId: string;
  x: number;
  y: number;
  overSidebar: boolean;
  tabs: DragGhostTab[];
}

export function DragGhost({ tabId, x, y, overSidebar, tabs }: DragGhostProps) {
  const ghostTab = tabs.find(t => t.id === tabId);
  if (!ghostTab) return null;
  const GIcon = ghostTab.icon;

  return (
    <div
      data-slot="drag-ghost"
      aria-hidden="true"
      className={`fixed z-[var(--z-drag)] pointer-events-none transition-shadow duration-[var(--duration-fast)] tracking-[-0.14px] ${overSidebar ? 'opacity-70 scale-95' : 'opacity-90'}`}
      style={{ left: x - 50, top: y - 16 }}
    >
      <div className={`flex items-center gap-1.5 h-8 px-2.5 rounded-[var(--radius-button)] border shadow-popover text-xs whitespace-nowrap
        ${overSidebar
          ? 'bg-primary/10 border-primary/40 text-primary'
          : 'bg-popover border-border text-popover-foreground'
        }`}>
        {ghostTab.miniAppId ? (
          ghostTab.miniAppLogoUrl ? <img src={ghostTab.miniAppLogoUrl} alt="" className="w-3.5 h-3.5 rounded-[var(--radius-dot)] object-cover" /> :
          <div className="w-3.5 h-3.5 rounded-[var(--radius-dot)] flex items-center justify-center text-primary-foreground text-xs" style={{ background: ghostTab.miniAppColor }}>{ghostTab.miniAppInitial}</div>
        ) : <GIcon size={13} strokeWidth={1.6} />}
        <span>{ghostTab.title}</span>
      </div>
    </div>
  );
}
