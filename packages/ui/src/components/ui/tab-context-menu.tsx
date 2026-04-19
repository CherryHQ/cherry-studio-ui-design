"use client"

import React, { useRef, useEffect } from 'react';
import { Pin, X, ChevronLeft } from 'lucide-react';
import { Button } from './button';

export interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  tabId: string;
}

export interface ContextMenuTab {
  id: string;
  title: string;
  icon: React.ElementType;
  closeable: boolean;
  pinned?: boolean;
  sidebarDocked?: boolean;
}

export function TabContextMenu({
  state,
  tab,
  onPin,
  onClose,
  onDock,
  onDismiss,
}: {
  state: ContextMenuState;
  tab: ContextMenuTab | undefined;
  onPin: (id: string) => void;
  onClose: (id: string) => void;
  onDock: (id: string) => void;
  onDismiss: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!state.visible) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onDismiss();
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDismiss();
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [state.visible, onDismiss]);

  if (!state.visible || !tab) return null;

  const isHome = tab.id === 'home';

  return (
    <div
      ref={ref}
      data-slot="tab-context-menu"
      role="menu"
      className="fixed z-[var(--z-sticky)] bg-popover border border-border rounded-[var(--radius-button)] shadow-popover p-0.5 min-w-[120px] text-xs tracking-[-0.14px]"
      style={{ left: state.x, top: state.y }}
    >
      {!isHome && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-1.5 px-2 py-[5px] text-xs"
          onClick={() => { onPin(state.tabId); onDismiss(); }}
        >
          <Pin size={11} />
          {tab.pinned ? '取消固定' : '固定标签页'}
        </Button>
      )}
      {tab.closeable && !isHome && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-1.5 px-2 py-[5px] text-xs"
          onClick={() => { onDock(state.tabId); onDismiss(); }}
        >
          <ChevronLeft size={11} />
          {tab.sidebarDocked ? '移回标签栏' : '移到侧边栏'}
        </Button>
      )}
      {tab.closeable && !isHome && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-1.5 px-2 py-[5px] text-xs"
          onClick={() => { onClose(state.tabId); onDismiss(); }}
        >
          <X size={11} />
          关闭标签页
        </Button>
      )}
      {isHome && (
        <div className="px-2.5 py-[5px] text-xs text-muted-foreground">首页（固定）</div>
      )}
    </div>
  );
}
