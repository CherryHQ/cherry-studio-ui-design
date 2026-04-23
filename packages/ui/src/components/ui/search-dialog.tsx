"use client"

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Search, X, MessageCircle, Settings,
  SortAsc, CalendarDays, ChevronDown, Filter,
} from 'lucide-react';
import { cn } from "../../lib/utils"
import { Button } from "./button"
import { Dialog, DialogContent } from "./dialog"
import { Input } from "./input"
import { Kbd } from "./kbd"
import { ScrollArea } from "./scroll-area"

export interface SearchRecentItem {
  label: string;
  desc: string;
  icon: React.ElementType;
  time: string;
  count: number;
  type?: string;
}

export interface SearchFileItem {
  label: string;
  desc: string;
  meta: string;
  icon: React.ElementType;
  type?: string;
}

export interface SearchQuickAction {
  label: string;
  shortcut: string;
  icon: React.ElementType;
}

export interface SearchDialogLabels {
  searchPlaceholder?: string
  recentSection?: string
  filesSection?: string
  quickActionsSection?: string
  noResults?: string
  noResultsHint?: string
  clearFilter?: string
  helpSelect?: string
  helpOpen?: string
  helpNewTab?: string
  helpCopyLink?: string
  helpClose?: string
  allFilter?: string
}

export interface SearchDialogProps {
  open: boolean;
  onClose: () => void;
  searchFilterTabs: string[];
  searchRecentItems: SearchRecentItem[];
  searchFileItems: SearchFileItem[];
  searchQuickActions: SearchQuickAction[];
  onSelect?: (item: { label: string; type?: string }) => void;
  labels?: SearchDialogLabels;
}

export function SearchDialog({
  open, onClose, searchFilterTabs, searchRecentItems, searchFileItems, searchQuickActions,
  onSelect, labels: labelsProp,
}: SearchDialogProps) {
  const l = {
    searchPlaceholder: "开始输入搜索...",
    recentSection: "最近",
    filesSection: "文件",
    quickActionsSection: "快捷操作",
    noResults: "未找到匹配结果",
    noResultsHint: "尝试调整关键词、筛选条件或检查是否有拼写错误。",
    clearFilter: "清除筛选",
    helpSelect: "选择",
    helpOpen: "打开",
    helpNewTab: "在新标签打开",
    helpCopyLink: "复制链接",
    helpClose: "关闭",
    allFilter: "全部",
    ...labelsProp,
  };
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState(l.allFilter);
  const [sortOrder, setSortOrder] = useState('最近');
  const [dateRange, setDateRange] = useState('全部时间');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setQuery('');
    setActiveFilter(l.allFilter);
    setHighlightedIndex(0);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  const filteredRecent = searchRecentItems.filter(i =>
    (!query || i.label.toLowerCase().includes(query.toLowerCase())) &&
    (activeFilter === l.allFilter || i.type === activeFilter)
  );
  const filteredFiles = searchFileItems.filter(i =>
    (!query || i.label.toLowerCase().includes(query.toLowerCase())) &&
    (activeFilter === l.allFilter || i.type === activeFilter)
  );

  type ResultItem = { label: string; desc: string; type?: string; section: string; icon: React.ElementType; meta?: string; time?: string; count?: number };
  const allResults: ResultItem[] = [
    ...filteredRecent.map(item => ({ label: item.label, desc: item.desc, type: item.type, section: 'recent', icon: item.icon, time: item.time, count: item.count })),
    ...filteredFiles.map(item => ({ label: item.label, desc: item.desc, type: item.type, section: 'file', icon: item.icon, meta: item.meta })),
  ];

  const handleSelect = useCallback((item: { label: string; type?: string }) => {
    onSelect?.(item);
    onClose();
  }, [onSelect, onClose]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const total = allResults.length;
    if (!total) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev + 1) % total);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev - 1 + total) % total);
    } else if (e.key === 'Enter' && highlightedIndex >= 0 && highlightedIndex < total) {
      e.preventDefault();
      handleSelect(allResults[highlightedIndex]);
    }
  };

  useEffect(() => {
    setHighlightedIndex(0);
  }, [query, activeFilter]);

  const previewItem = allResults[highlightedIndex] || null;
  let globalIdx = -1;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent data-slot="search-dialog" className="max-w-[820px] sm:max-w-[820px] p-0 overflow-hidden flex flex-col tracking-[-0.14px]" showCloseButton={false}>
        {/* Search input */}
        <div className="flex items-center gap-2 mx-4 mt-4 mb-2 px-3 h-10 rounded-xl bg-muted/30 border border-border/50">
          <Search size={16} className="text-muted-foreground flex-shrink-0" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={l.searchPlaceholder}
            aria-label="Search"
            className="flex-1 h-auto border-0 bg-transparent shadow-none px-0 py-0 focus-visible:ring-0 focus-visible:border-transparent placeholder:text-muted-foreground/60"
          />
          {query && (
            <Button variant="ghost" size="icon-xs" onClick={() => setQuery('')} className="text-muted-foreground hover:text-foreground">
              <X size={12} />
            </Button>
          )}
          <Button variant="ghost" size="icon-xs" onClick={() => setShowFilters(v => !v)} className={cn("flex-shrink-0", showFilters ? "text-foreground bg-accent" : "text-muted-foreground/40 hover:text-foreground")}>
            <Filter size={14} />
          </Button>
        </div>

        {/* Filter dropdowns — toggle via funnel button */}
        {showFilters && <div className="flex items-center gap-2 px-4 py-2 border-b border-border/50">
          {/* Type filter */}
          <div className="relative">
            <Button
              variant="ghost"
              size="xs"
              onClick={() => setOpenDropdown(openDropdown === 'type' ? null : 'type')}
              className="text-muted-foreground hover:text-foreground"
            >
              <Filter size={11} />
              <span>{activeFilter === l.allFilter ? '类型' : activeFilter}</span>
              <ChevronDown size={10} />
            </Button>
            {openDropdown === 'type' && (
              <div className="absolute top-full left-0 mt-1 bg-popover border border-border/50 rounded-xl shadow-lg py-1 min-w-[120px] z-10">
                {[l.allFilter, ...searchFilterTabs].map(f => (
                  <button
                    key={f}
                    onClick={() => { setActiveFilter(f); setOpenDropdown(null); }}
                    className={cn(
                      "w-full text-left px-3 py-1.5 text-xs transition-colors",
                      activeFilter === f ? 'text-foreground bg-accent/60' : 'text-muted-foreground hover:bg-accent/40 hover:text-foreground'
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sort order */}
          <div className="relative">
            <Button
              variant="ghost"
              size="xs"
              onClick={() => setOpenDropdown(openDropdown === 'sort' ? null : 'sort')}
              className="text-muted-foreground hover:text-foreground"
            >
              <SortAsc size={11} />
              <span>{sortOrder}</span>
              <ChevronDown size={10} />
            </Button>
            {openDropdown === 'sort' && (
              <div className="absolute top-full left-0 mt-1 bg-popover border border-border/50 rounded-xl shadow-lg py-1 min-w-[100px] z-10">
                {['最近', '最早', '最多消息'].map(s => (
                  <button
                    key={s}
                    onClick={() => { setSortOrder(s); setOpenDropdown(null); }}
                    className={cn(
                      "w-full text-left px-3 py-1.5 text-xs transition-colors",
                      sortOrder === s ? 'text-foreground bg-accent/60' : 'text-muted-foreground hover:bg-accent/40 hover:text-foreground'
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Date range */}
          <div className="relative">
            <Button
              variant="ghost"
              size="xs"
              onClick={() => setOpenDropdown(openDropdown === 'date' ? null : 'date')}
              className="text-muted-foreground hover:text-foreground"
            >
              <CalendarDays size={11} />
              <span>{dateRange}</span>
              <ChevronDown size={10} />
            </Button>
            {openDropdown === 'date' && (
              <div className="absolute top-full left-0 mt-1 bg-popover border border-border/50 rounded-xl shadow-lg py-1 min-w-[120px] z-10">
                {['全部时间', '今天', '最近7天', '最近30天', '最近3个月'].map(d => (
                  <button
                    key={d}
                    onClick={() => { setDateRange(d); setOpenDropdown(null); }}
                    className={cn(
                      "w-full text-left px-3 py-1.5 text-xs transition-colors",
                      dateRange === d ? 'text-foreground bg-accent/60' : 'text-muted-foreground hover:bg-accent/40 hover:text-foreground'
                    )}
                  >
                    {d}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>}

        {/* Main: left list + right preview */}
        <div className="flex flex-1 min-h-0">
          {/* Left: results */}
          <ScrollArea className="flex-1 max-h-[420px] border-r border-border/50">
            {filteredRecent.length > 0 && (
              <div className="px-2 pt-3 pb-1">
                <p className="text-xs text-muted-foreground/60 px-2 mb-1.5">{l.recentSection} · {filteredRecent.length}</p>
                {filteredRecent.map((item, i) => {
                  globalIdx++;
                  const thisIdx = globalIdx;
                  const Icon = item.icon;
                  return (
                    <div
                      key={i}
                      role="option"
                      tabIndex={0}
                      aria-selected={highlightedIndex === thisIdx}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setHighlightedIndex(thisIdx)}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleSelect(item) } }}
                      className={cn(
                        "flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-accent/60 transition-colors cursor-pointer",
                        highlightedIndex === thisIdx && "bg-accent/60"
                      )}
                    >
                      <div className="w-8 h-8 rounded-xl bg-accent/80 flex items-center justify-center flex-shrink-0">
                        <Icon size={15} className="text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-foreground truncate">{item.label}</div>
                        <div className="text-xs text-muted-foreground/60 truncate">{item.desc}</div>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground/40 flex-shrink-0">
                        <MessageCircle size={10} />
                        <span>{item.count}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {filteredFiles.length > 0 && (
              <div className="px-2 pt-2 pb-1">
                <p className="text-xs text-muted-foreground/60 px-2 mb-1.5">{l.filesSection} · {filteredFiles.length}</p>
                {filteredFiles.map((item, i) => {
                  globalIdx++;
                  const thisIdx = globalIdx;
                  const Icon = item.icon;
                  return (
                    <div
                      key={i}
                      role="option"
                      tabIndex={0}
                      aria-selected={highlightedIndex === thisIdx}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setHighlightedIndex(thisIdx)}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleSelect(item) } }}
                      className={cn(
                        "flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-accent/60 transition-colors cursor-pointer",
                        highlightedIndex === thisIdx && "bg-accent/60"
                      )}
                    >
                      <div className="w-8 h-8 rounded-xl bg-accent/80 flex items-center justify-center flex-shrink-0">
                        <Icon size={15} className="text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-foreground truncate">{item.label} <span className="text-muted-foreground/60">· {item.desc}</span></div>
                        <div className="text-xs text-muted-foreground/40 truncate">{item.meta}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {query && filteredRecent.length === 0 && filteredFiles.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <Search size={32} className="text-muted-foreground/30 mb-3" />
                <p className="text-sm text-foreground mb-1">{l.noResults}</p>
                <p className="text-xs text-muted-foreground text-center">{l.noResultsHint}</p>
                <Button variant="outline" size="xs" onClick={() => setQuery('')} className="mt-3">
                  {l.clearFilter}
                </Button>
              </div>
            )}
          </ScrollArea>

          {/* Right: preview */}
          <div className="w-[280px] flex-shrink-0 flex flex-col items-center justify-center px-6 py-8 max-h-[420px]">
            {previewItem ? (
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-accent/80 flex items-center justify-center mb-2">
                  <previewItem.icon size={20} className="text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground/50">{previewItem.type || (previewItem.section === 'recent' ? '对话' : '文件')}</p>
                  <p className="text-sm text-foreground font-medium">{previewItem.label}</p>
                  <p className="text-xs text-muted-foreground/60">{previewItem.desc}</p>
                </div>
              </div>
            ) : (
              <div className="text-xs text-muted-foreground/30">无预览</div>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex items-center gap-3 px-4 py-2 border-t border-border/50 text-xs text-muted-foreground/50">
          <span className="flex items-center gap-1"><Kbd>↑↓</Kbd> {l.helpSelect}</span>
          <span className="flex items-center gap-1"><Kbd>↵</Kbd> {l.helpOpen}</span>
          <span className="flex items-center gap-1"><Kbd>⌘R</Kbd> {l.helpNewTab}</span>
          <span className="flex items-center gap-1"><Kbd>⌘L</Kbd> {l.helpCopyLink}</span>
          <span className="flex items-center gap-1"><Kbd>ESC</Kbd> {l.helpClose}</span>
          <span className="ml-auto"><Settings size={12} /></span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
