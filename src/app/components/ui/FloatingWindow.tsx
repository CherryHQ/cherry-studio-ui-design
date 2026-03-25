import React, { useState, useRef } from 'react';
import { ArrowRight, X } from 'lucide-react';
import type { DetachedWindow } from '@/app/types';

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
      className="fixed bg-background border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col z-[100]"
      style={{ left: pos.x, top: pos.y, width: win.width, height: win.height }}
    >
      <div
        className="h-9 bg-accent/50 border-b border-border flex items-center px-3 gap-2 cursor-move select-none flex-shrink-0"
        onMouseDown={onTitleMouseDown}
      >
        {win.tab.miniAppId ? (
          win.tab.miniAppLogoUrl ? <img src={win.tab.miniAppLogoUrl} alt="" className="w-3.5 h-3.5 rounded-[3px] object-cover" /> :
          <div className="w-3.5 h-3.5 rounded-[3px] flex items-center justify-center text-white text-[6px]" style={{ background: win.tab.miniAppColor }}>{win.tab.miniAppInitial}</div>
        ) : <Icon size={13} className="text-muted-foreground" />}
        <span className="text-xs text-foreground flex-1 truncate">{win.tab.title}</span>
        <button
          onClick={() => onReattach(win)}
          className="w-5 h-5 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          title="重新附加到标签栏"
        >
          <ArrowRight size={11} />
        </button>
        <button
          onClick={() => onClose(win.id)}
          className="w-5 h-5 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <X size={11} />
        </button>
      </div>
      <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm p-4">
        <div className="text-center">
          {win.tab.miniAppId ? (
            win.tab.miniAppLogoUrl ? <img src={win.tab.miniAppLogoUrl} alt="" className="w-8 h-8 rounded-lg mx-auto mb-2 object-cover opacity-60" /> :
            <div className="w-8 h-8 rounded-lg mx-auto mb-2 flex items-center justify-center text-white text-sm opacity-60" style={{ background: win.tab.miniAppColor }}>{win.tab.miniAppInitial}</div>
          ) : <Icon size={32} className="mx-auto mb-2 opacity-30" />}
          <p>{win.tab.title}</p>
          <p className="text-xs text-muted-foreground/60 mt-1">独立窗口</p>
        </div>
      </div>
    </div>
  );
}
