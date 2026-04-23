import React from 'react';
import {
  ExternalLink, ChevronLeft, ChevronRight, RotateCcw, Pin, Link, Copy
} from 'lucide-react';
import { Button } from '@cherry-studio/ui';
import { useGlobalActions } from '@/app/context/GlobalActionContext';
import type { Tab } from '@/app/types';

// ===========================
// Mini App Embed Page (browser-like view for opened mini app tab)
// ===========================
export function MiniAppEmbedPage({ tab }: { tab: Tab }) {
  const { pinTab: onPinTab } = useGlobalActions();
  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Browser-like toolbar */}
      <div className="h-10 flex items-center px-3 flex-shrink-0 border-b border-border/30">
        {/* Left: open externally */}
        <Button variant="ghost" size="icon-xs"><ExternalLink size={13} /></Button>
        <div className="flex-1" />
        {/* Right: nav + actions */}
        <div className="flex items-center gap-0.5">
          <Button variant="ghost" size="icon-xs" className="text-muted-foreground/40 cursor-not-allowed" disabled><ChevronLeft size={14} /></Button>
          <Button variant="ghost" size="icon-xs" className="text-muted-foreground/40 cursor-not-allowed" disabled><ChevronRight size={14} /></Button>
          <Button variant="ghost" size="icon-xs"><RotateCcw size={12} /></Button>
          <Button
            variant="ghost" size="icon-xs"
            onClick={() => onPinTab(tab.id)}
            className={tab.pinned ? 'text-foreground bg-accent' : ''}
          ><Pin size={12} /></Button>
          <Button variant="ghost" size="icon-xs"><Link size={12} /></Button>
          <Button variant="ghost" size="icon-xs"><Copy size={12} /></Button>
        </div>
      </div>
      {/* Content area */}
      <div className="flex-1 flex items-center justify-center bg-muted/10">
        <div className="text-center space-y-3">
          {tab.miniAppLogoUrl ? (
            <img src={tab.miniAppLogoUrl} alt="" className="w-16 h-16 rounded-2xl mx-auto object-cover" />
          ) : (
            <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-white text-xl ${tab.miniAppColor}`}>{tab.miniAppInitial}</div>
          )}
          <p className="text-sm text-foreground">{tab.title}</p>
          <p className="text-xs text-muted-foreground">{tab.miniAppUrl}</p>
          <p className="text-xs text-muted-foreground/40">由于安全策略限制，嵌入式预览不可用</p>
        </div>
      </div>
    </div>
  );
}
