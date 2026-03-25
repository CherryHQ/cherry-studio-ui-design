import React, { useState, useRef, useEffect } from 'react';
import {
  Search, X, Filter, MessageCircle, Settings,
} from 'lucide-react';
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
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  const filteredRecent = query
    ? searchRecentItems.filter(i => i.label.toLowerCase().includes(query.toLowerCase()))
    : searchRecentItems;
  const filteredFiles = query
    ? searchFileItems.filter(i => i.label.toLowerCase().includes(query.toLowerCase()))
    : searchFileItems;

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[10%]" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-[540px] bg-popover border border-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col">
        {/* Search input */}
        <div className="flex items-center gap-2 px-4 h-12">
          <Search size={16} className="text-muted-foreground flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="开始输入搜索..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="w-5 h-5 rounded flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
              <X size={12} />
            </button>
          )}
          <button className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"><Filter size={14} /></button>
        </div>

        {/* Filter pills */}
        <div className="flex items-center gap-1.5 px-4 py-2.5 overflow-x-auto [&::-webkit-scrollbar]:hidden">
          {searchFilterTabs.map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-colors
                ${activeFilter === f
                  ? 'bg-foreground text-background'
                  : 'bg-accent/60 text-muted-foreground hover:bg-accent hover:text-foreground'
                }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Results */}
        <div className="max-h-[420px] overflow-y-auto [&::-webkit-scrollbar]:hidden">
          {/* Recent */}
          {filteredRecent.length > 0 && (
            <div className="px-4 pt-3 pb-1">
              <p className="text-[11px] text-muted-foreground mb-1.5">最近 <span className="text-muted-foreground/60">{filteredRecent.length}</span></p>
              {filteredRecent.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-accent/60 transition-colors cursor-pointer">
                    <div className="w-8 h-8 rounded-lg bg-accent/80 flex items-center justify-center flex-shrink-0">
                      <Icon size={15} className="text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-foreground truncate">{item.label}</div>
                      <div className="text-[11px] text-muted-foreground truncate">{item.desc} · {item.time}</div>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground/60 flex-shrink-0">
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
              <p className="text-[11px] text-muted-foreground mb-1.5">文件 <span className="text-muted-foreground/60">{filteredFiles.length}</span></p>
              {filteredFiles.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-accent/60 transition-colors cursor-pointer">
                    <div className="w-8 h-8 rounded-lg bg-accent/80 flex items-center justify-center flex-shrink-0">
                      <Icon size={15} className="text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-foreground truncate">{item.label} <span className="text-muted-foreground">· {item.desc}</span></div>
                      <div className="text-[11px] text-muted-foreground truncate">{item.meta}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Quick Actions */}
          <div className="px-4 pt-2 pb-2">
            <p className="text-[11px] text-muted-foreground mb-1.5">快捷操作</p>
            {searchQuickActions.map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-accent/60 transition-colors cursor-pointer">
                  <div className="w-8 h-8 rounded-lg bg-accent/80 flex items-center justify-center flex-shrink-0">
                    <Icon size={15} className="text-muted-foreground" />
                  </div>
                  <span className="text-sm text-foreground flex-1">{item.label}</span>
                  <kbd className="text-[11px] text-muted-foreground/70 bg-accent/60 px-1.5 py-0.5 rounded">{item.shortcut}</kbd>
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
              <button onClick={() => setQuery('')} className="mt-3 px-3 py-1.5 text-xs border border-border rounded-lg text-foreground hover:bg-accent transition-colors">
                清除筛选
              </button>
            </div>
          )}
        </div>

        {/* Bottom bar */}
        <div className="flex items-center gap-4 px-4 py-2 border-t border-border/50 text-[11px] text-muted-foreground/60">
          <span className="flex items-center gap-1"><kbd className="bg-accent/60 px-1 rounded">↑↓</kbd> 选择</span>
          <span className="flex items-center gap-1"><kbd className="bg-accent/60 px-1 rounded">↵</kbd> 打开</span>
          <span className="flex items-center gap-1"><kbd className="bg-accent/60 px-1 rounded">⌘R</kbd> 在新标签打开</span>
          <span className="flex items-center gap-1"><kbd className="bg-accent/60 px-1 rounded">ESC</kbd> 关闭</span>
          <span className="ml-auto"><Settings size={12} /></span>
        </div>
      </div>
    </div>
  );
}