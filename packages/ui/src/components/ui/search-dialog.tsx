"use client"

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Search, X, Filter, MessageCircle, Settings,
} from 'lucide-react';
import { cn } from "@/lib/utils"
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

export function SearchDialog({ open, onClose, searchFilterTabs, searchRecentItems, searchFileItems, searchQuickActions, onSelect, labels: labelsProp }: SearchDialogProps) {
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
    helpClose: "关闭",
    allFilter: "全部",
    ...labelsProp,
  };
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState(l.allFilter);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setQuery('');
    setActiveFilter(l.allFilter);
    setHighlightedIndex(-1);
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

  // Build flat list of all results for keyboard navigation
  const allResults: { label: string; type?: string; section: string; index: number }[] = [
    ...filteredRecent.map((item, i) => ({ label: item.label, type: item.type, section: 'recent' as const, index: i })),
    ...filteredFiles.map((item, i) => ({ label: item.label, type: item.type, section: 'file' as const, index: i })),
    ...searchQuickActions.map((item, i) => ({ label: item.label, section: 'action' as const, index: i })),
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

  // Reset highlight when query or filter changes
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [query, activeFilter]);

  // Track global index for highlighting
  let globalIdx = -1;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent data-slot="search-dialog" className="max-w-[540px] p-0 top-[10%] translate-y-0 overflow-hidden flex flex-col tracking-[-0.14px]" showCloseButton={false}>
        {/* Search input */}
        <div className="flex items-center gap-2 px-4 h-12" onKeyDown={handleKeyDown}>
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
            <Button variant="ghost" size="icon-xs" onClick={() => setQuery('')} className="w-5 h-5 text-muted-foreground hover:text-foreground">
              <X size={12} />
            </Button>
          )}
          <Button variant="ghost" size="icon-sm" className="w-7 h-7 text-muted-foreground hover:text-foreground"><Filter size={14} /></Button>
        </div>

        <div className="border-b border-border" />

        {/* Filter pills */}
        <div className="flex items-center gap-1.5 px-4 py-2.5 overflow-x-auto [&::-webkit-scrollbar]:hidden">
          {searchFilterTabs.map(f => (
            <Button
              key={f}
              variant="ghost"
              size="xs"
              onClick={() => setActiveFilter(f)}
              className={`rounded-full px-3 whitespace-nowrap border ${
                activeFilter === f
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-accent/60 text-muted-foreground hover:bg-accent/80 hover:text-foreground'
              }`}
            >
              {f}
            </Button>
          ))}
        </div>

        {/* Results */}
        <ScrollArea className="max-h-[420px]" role="listbox" aria-live="polite">
          {/* Recent */}
          {filteredRecent.length > 0 && (
            <div className="px-4 pt-3 pb-1">
              <p className="text-xs text-muted-foreground mb-1.5">{l.recentSection} <span className="text-muted-foreground/60">{filteredRecent.length}</span></p>
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
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleSelect(item) } }}
                    className={cn(
                      "flex items-center gap-3 px-2 py-2 rounded-[var(--radius-button)] hover:bg-accent/60 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
                      highlightedIndex === thisIdx && "bg-accent/60"
                    )}
                  >
                    <div className="w-8 h-8 rounded-[var(--radius-button)] bg-accent/80 flex items-center justify-center flex-shrink-0">
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
              <p className="text-xs text-muted-foreground mb-1.5">{l.filesSection} <span className="text-muted-foreground/60">{filteredFiles.length}</span></p>
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
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleSelect(item) } }}
                    className={cn(
                      "flex items-center gap-3 px-2 py-2 rounded-[var(--radius-button)] hover:bg-accent/60 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
                      highlightedIndex === thisIdx && "bg-accent/60"
                    )}
                  >
                    <div className="w-8 h-8 rounded-[var(--radius-button)] bg-accent/80 flex items-center justify-center flex-shrink-0">
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
            <p className="text-xs text-muted-foreground mb-1.5">{l.quickActionsSection}</p>
            {searchQuickActions.map((item, i) => {
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
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleSelect(item) } }}
                  className={cn(
                    "flex items-center gap-3 px-2 py-2 rounded-[var(--radius-button)] hover:bg-accent/60 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
                    highlightedIndex === thisIdx && "bg-accent/60"
                  )}
                >
                  <div className="w-8 h-8 rounded-[var(--radius-button)] bg-accent/80 flex items-center justify-center flex-shrink-0">
                    <Icon size={15} className="text-muted-foreground" />
                  </div>
                  <span className="text-sm text-foreground flex-1">{item.label}</span>
                  <Kbd>{item.shortcut}</Kbd>
                </div>
              );
            })}
          </div>

          {/* No results */}
          {query && filteredRecent.length === 0 && filteredFiles.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <Search size={32} className="text-muted-foreground/30 mb-3" />
              <p className="text-sm text-foreground mb-1">{l.noResults}</p>
              <p className="text-xs text-muted-foreground text-center">{l.noResultsHint}</p>
              <Button variant="outline" size="sm" onClick={() => setQuery('')} className="mt-3">
                {l.clearFilter}
              </Button>
            </div>
          )}
        </ScrollArea>

        {/* Bottom bar */}
        <div className="flex items-center gap-4 px-4 py-2 border-t border-border/50 text-xs text-muted-foreground/60">
          <span className="flex items-center gap-1"><Kbd>↑↓</Kbd> {l.helpSelect}</span>
          <span className="flex items-center gap-1"><Kbd>↵</Kbd> {l.helpOpen}</span>
          <span className="flex items-center gap-1"><Kbd>⌘R</Kbd> {l.helpNewTab}</span>
          <span className="flex items-center gap-1"><Kbd>ESC</Kbd> {l.helpClose}</span>
          <span className="ml-auto"><Settings size={12} /></span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
