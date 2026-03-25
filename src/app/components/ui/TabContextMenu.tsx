import React, { useRef, useEffect } from 'react';
import { Pin, X, ChevronLeft } from 'lucide-react';
import type { ContextMenuState, Tab } from '@/app/types';

export function TabContextMenu({
  state,
  tab,
  onPin,
  onClose,
  onDock,
  onDismiss,
}: {
  state: ContextMenuState;
  tab: Tab | undefined;
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
      className="fixed z-[300] bg-popover border border-border rounded-lg shadow-xl p-0.5 min-w-[120px] text-[11px]"
      style={{ left: state.x, top: state.y }}
    >
      {!isHome && (
        <button
          className="w-full flex items-center gap-1.5 px-2 py-[5px] text-[11px] text-popover-foreground hover:bg-accent rounded-md transition-colors text-left"
          onClick={() => { onPin(state.tabId); onDismiss(); }}
        >
          <Pin size={11} />
          {tab.pinned ? '取消固定' : '固定标签页'}
        </button>
      )}
      {tab.closeable && !isHome && (
        <button
          className="w-full flex items-center gap-1.5 px-2 py-[5px] text-[11px] text-popover-foreground hover:bg-accent rounded-md transition-colors text-left"
          onClick={() => { onDock(state.tabId); onDismiss(); }}
        >
          <ChevronLeft size={11} />
          {tab.sidebarDocked ? '移回标签栏' : '移到侧边栏'}
        </button>
      )}
      {tab.closeable && !isHome && (
        <button
          className="w-full flex items-center gap-1.5 px-2 py-[5px] text-[11px] text-popover-foreground hover:bg-accent rounded-md transition-colors text-left"
          onClick={() => { onClose(state.tabId); onDismiss(); }}
        >
          <X size={11} />
          关闭标签页
        </button>
      )}
      {isHome && (
        <div className="px-2.5 py-[5px] text-[11px] text-muted-foreground">首页（固定）</div>
      )}
    </div>
  );
}