"use client"

import React, { useState, useRef } from 'react';
import { ArrowRight, X } from 'lucide-react';
import { Button } from './button';

export interface FloatingWindowTab {
  id: string;
  title: string;
  icon: React.ElementType;
  miniAppId?: string;
  miniAppColor?: string;
  miniAppInitial?: string;
  miniAppLogoUrl?: string;
}

export interface DetachedWindow {
  id: string;
  tab: FloatingWindowTab;
  x: number;
  y: number;
  width: number;
  height: number;
}

export function FloatingWindow({
  win,
  onClose,
  onReattach,
}: {
  win: DetachedWindow;
  onClose: (id: string) => void;
  onReattach: (win: DetachedWindow) => void;
}) {
  const [pos, setPos] = useState({ x: win.x, y: win.y });
  const dragRef = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(null);

  const onTitleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    dragRef.current = { startX: e.clientX, startY: e.clientY, originX: pos.x, originY: pos.y };
    const onMove = (ev: MouseEvent) => {
      if (!dragRef.current) return;
      setPos({
        x: dragRef.current.originX + (ev.clientX - dragRef.current.startX),
        y: dragRef.current.originY + (ev.clientY - dragRef.current.startY),
      });
    };
    const onUp = () => {
      dragRef.current = null;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  const Icon = win.tab.icon;

  return (
    <div
      data-slot="floating-window"
      role="dialog"
      aria-label={win.tab.title}
      className="fixed bg-background border border-border rounded-[var(--radius-button)] shadow-popover overflow-hidden flex flex-col z-[var(--z-floating)] tracking-[-0.14px]"
      style={{ left: pos.x, top: pos.y, width: win.width, height: win.height }}
    >
      <div
        className="h-9 bg-accent/50 border-b border-border flex items-center px-3 gap-2 cursor-move select-none flex-shrink-0"
        onMouseDown={onTitleMouseDown}
      >
        {win.tab.miniAppId ? (
          win.tab.miniAppLogoUrl ? <img src={win.tab.miniAppLogoUrl} alt="" className="w-3.5 h-3.5 rounded-[var(--radius-dot)] object-cover" /> :
          <div className="w-3.5 h-3.5 rounded-[var(--radius-dot)] flex items-center justify-center text-primary-foreground text-xs" style={{ background: win.tab.miniAppColor }}>{win.tab.miniAppInitial}</div>
        ) : <Icon size={13} className="text-muted-foreground" />}
        <span className="text-xs text-foreground flex-1 truncate">{win.tab.title}</span>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => onReattach(win)}
          className="w-5 h-5 text-muted-foreground hover:text-foreground"
          title="重新附加到标签栏"
        >
          <ArrowRight size={11} />
        </Button>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => onClose(win.id)}
          className="w-5 h-5 text-muted-foreground hover:text-foreground"
        >
          <X size={11} />
        </Button>
      </div>
      <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm p-4">
        <div className="text-center">
          {win.tab.miniAppId ? (
            win.tab.miniAppLogoUrl ? <img src={win.tab.miniAppLogoUrl} alt="" className="w-8 h-8 rounded-[var(--radius-button)] mx-auto mb-2 object-cover opacity-60" /> :
            <div className="w-8 h-8 rounded-[var(--radius-button)] mx-auto mb-2 flex items-center justify-center text-primary-foreground text-sm opacity-60" style={{ background: win.tab.miniAppColor }}>{win.tab.miniAppInitial}</div>
          ) : <Icon size={32} className="mx-auto mb-2 opacity-30" />}
          <p>{win.tab.title}</p>
          <p className="text-xs text-muted-foreground/60 mt-1">独立窗口</p>
        </div>
      </div>
    </div>
  );
}
