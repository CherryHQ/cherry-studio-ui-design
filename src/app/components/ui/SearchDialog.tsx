import React, { useState, useRef, useEffect } from 'react';
import {
  Search, X, Filter, MessageCircle, Settings,
} from 'lucide-react';
import { Button, Input, Dialog, DialogContent, DialogTitle } from '@cherry-studio/ui';
import {
  searchFilterTabs, searchRecentItems, searchFileItems, searchQuickActions,
} from '@/app/config/constants';

export function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('全部');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setQuery('');
    setActiveFilter('全部');
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  const filteredRecent = query
    ? searchRecentItems.filter(i => i.label.toLowerCase().includes(query.toLowerCase()))
    : searchRecentItems;
  const filteredFiles = query
    ? searchFileItems.filter(i => i.label.toLowerCase().includes(query.toLowerCase()))
    : searchFileItems;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="w-full max-w-[540px] p-0 gap-0 overflow-hidden flex flex-col" showCloseButton={false}>
        <DialogTitle className="sr-only">搜索</DialogTitle>
        {/* Search input */}
        <div className="flex items-center gap-2 px-4 h-12">
          <Search size={16} className="text-muted-foreground flex-shrink-0" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="开始输入搜索..."
            className="flex-1 border-0 bg-transparent h-auto p-0 shadow-none focus-visible:ring-0"
          />
          {query && (
            <Button variant="ghost" size="icon-xs" onClick={() => setQuery('')} className="text-muted-foreground hover:text-foreground">
              <X size={12} />
            </Button>
          )}
          <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-foreground hover:bg-accent"><Filter size={14} /></Button>
        </div>

        {/* Filter pills */}
        <div className="flex items-center gap-1.5 px-4 py-2.5 overflow-x-auto [&::-webkit-scrollbar]:hidden">
          {searchFilterTabs.map(f => (
            <Button
              key={f}
              variant="ghost"
              size="xs"
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-1 h-auto rounded-full text-xs whitespace-nowrap
                ${activeFilter === f
                  ? 'bg-foreground text-background hover:bg-foreground/90'
                  : 'bg-accent/60 text-muted-foreground hover:bg-accent hover:text-foreground'
                }`}
            >
              {f}
            </Button>
          ))}
        </div>

        {/* Results */}
        <div className="max-h-[420px] overflow-y-auto [&::-webkit-scrollbar]:hidden">
          {/* Recent */}
          {filteredRecent.length > 0 && (
            <div className="px-4 pt-3 pb-1">
              <p className="text-xs text-muted-foreground mb-1.5">最近 <span className="text-muted-foreground/60">{filteredRecent.length}</span></p>
              {filteredRecent.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-accent/60 transition-colors cursor-pointer">
                    <div className="w-8 h-8 rounded-lg bg-accent/80 flex items-center justify-center flex-shrink-0">
                      <Icon size={15} className="text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-foreground truncate">{item.label}</div>
                      <div className="text-xs text-muted-foreground truncate">{item.desc} · {item.time}</div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground/60 flex-shrink-0">
                      <MessageCircle size={10} />
                      <span>{item.count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Files */}
          {filteredFiles.length > 0 && (
            <div className="px-4 pt-2 pb-1">
              <p className="text-xs text-muted-foreground mb-1.5">文件 <span className="text-muted-foreground/60">{filteredFiles.length}</span></p>
              {filteredFiles.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-accent/60 transition-colors cursor-pointer">
                    <div className="w-8 h-8 rounded-lg bg-accent/80 flex items-center justify-center flex-shrink-0">
                      <Icon size={15} className="text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-foreground truncate">{item.label} <span className="text-muted-foreground">· {item.desc}</span></div>
                      <div className="text-xs text-muted-foreground truncate">{item.meta}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Quick Actions */}
          <div className="px-4 pt-2 pb-2">
            <p className="text-xs text-muted-foreground mb-1.5">快捷操作</p>
            {searchQuickActions.map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-accent/60 transition-colors cursor-pointer">
                  <div className="w-8 h-8 rounded-lg bg-accent/80 flex items-center justify-center flex-shrink-0">
                    <Icon size={15} className="text-muted-foreground" />
                  </div>
                  <span className="text-sm text-foreground flex-1">{item.label}</span>
                  <kbd className="text-xs text-muted-foreground/70 bg-accent/60 px-1.5 py-0.5 rounded">{item.shortcut}</kbd>
                </div>
              );
            })}
          </div>

          {/* No results */}
          {query && filteredRecent.length === 0 && filteredFiles.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <Search size={32} className="text-muted-foreground/30 mb-3" />
              <p className="text-sm text-foreground mb-1">未找到匹配结果</p>
              <p className="text-xs text-muted-foreground text-center">尝试调整关键词、筛选条件或检查是否有拼写错误。</p>
              <Button variant="outline" size="sm" onClick={() => setQuery('')} className="mt-3">
                清除筛选
              </Button>
            </div>
          )}
        </div>

        {/* Bottom bar */}
        <div className="flex items-center gap-4 px-4 py-2 border-t border-border/50 text-xs text-muted-foreground/60">
          <span className="flex items-center gap-1"><kbd className="bg-accent/60 px-1 rounded">↑↓</kbd> 选择</span>
          <span className="flex items-center gap-1"><kbd className="bg-accent/60 px-1 rounded">↵</kbd> 打开</span>
          <span className="flex items-center gap-1"><kbd className="bg-accent/60 px-1 rounded">⌘R</kbd> 在新标签打开</span>
          <span className="flex items-center gap-1"><kbd className="bg-accent/60 px-1 rounded">ESC</kbd> 关闭</span>
          <span className="ml-auto"><Settings size={12} /></span>
        </div>
      </DialogContent>
    </Dialog>
  );
}