"use client"

import React, { useState, useRef, useEffect } from 'react';
import {
  Search, X, Filter, SortAsc, CalendarDays,
  MessageCircle, Eye, EyeOff, RotateCcw, GripVertical, Settings,
} from 'lucide-react';
import { Avatar, AvatarFallback } from "./avatar"
import { Button } from "./button"
import { Dialog, DialogContent } from "./dialog"
import { Input } from "./input"
import { Kbd } from "./kbd"
import { ScrollArea } from "./scroll-area"

export interface AppIconItem {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  bg: string;
}

export interface HistoryItem {
  id: string;
  label: string;
  desc: string;
  icon: React.ElementType;
  count: number;
  category: string;
}

export interface FileItem {
  id: string;
  label: string;
  desc: string;
  meta: string;
  icon: React.ElementType;
  category: string;
}

export interface QuickActionItem {
  id: string;
  label: string;
  icon: React.ElementType;
  shortcut: string;
}

export interface NewTabDialogLabels {
  searchPlaceholder?: string
  allFilter?: string
  recentSection?: string
  filesSection?: string
  quickActionsSection?: string
  manageHint?: string
  reset?: string
  show?: string
  hide?: string
  noResults?: string
  noResultsHint?: string
  clearFilter?: string
  helpSelect?: string
  helpOpen?: string
  helpNewTab?: string
  helpCopyLink?: string
  helpClose?: string
  manageApps?: string
}

export function NewTabDialog({ open, search, onSearchChange, onSelect, onClose, hiddenApps, setHiddenApps, appOrder, setAppOrder, dialogAppIcons, dialogFilterTabs, newTabHistoryItems, newTabFileItems, dialogQuickActions, labels: labelsProp }: {
  open: boolean; search: string; onSearchChange: (s: string) => void;
  onSelect: (menuItemId: string) => void; onClose: () => void;
  hiddenApps: Set<string>; setHiddenApps: React.Dispatch<React.SetStateAction<Set<string>>>;
  appOrder: string[]; setAppOrder: React.Dispatch<React.SetStateAction<string[]>>;
  dialogAppIcons: AppIconItem[];
  dialogFilterTabs: string[];
  newTabHistoryItems: HistoryItem[];
  newTabFileItems: FileItem[];
  dialogQuickActions: QuickActionItem[];
  labels?: NewTabDialogLabels;
}) {
  const l = {
    searchPlaceholder: "开始输入搜索...",
    allFilter: "全部",
    recentSection: "最近",
    filesSection: "文件",
    quickActionsSection: "快捷操作",
    manageHint: "管理快捷应用 · 拖拽排序，点击眼睛隐藏/显示",
    reset: "重置",
    show: "显示",
    hide: "隐藏",
    noResults: "未找到匹配结果",
    noResultsHint: "未能找到与搜索匹配的内容。请尝试调整关键词、筛选条件或检查是否有拼写错误。",
    clearFilter: "清除筛选",
    helpSelect: "选择",
    helpOpen: "打开",
    helpNewTab: "在新标签打开",
    helpCopyLink: "复制链接",
    helpClose: "关闭",
    manageApps: "管理快捷应用",
    ...labelsProp,
  };
  const inputRef = useRef<HTMLInputElement>(null);
  const [activeFilter, setActiveFilter] = useState<string>(l.allFilter);
  const [manageMode, setManageMode] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  useEffect(() => {
    if (!open) return;
    setActiveFilter(l.allFilter);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  const orderedApps = appOrder.map(id => dialogAppIcons.find(a => a.id === id)).filter((a): a is typeof dialogAppIcons[0] => !!a);
  const visibleApps = orderedApps.filter(app => !hiddenApps.has(app.id));
  const toggleAppVisibility = (id: string) => {
    setHiddenApps(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  const resetApps = () => {
    setHiddenApps(new Set());
    setAppOrder(dialogAppIcons.map(a => a.id));
  };

  const handleDragStart = (idx: number) => setDragIdx(idx);
  const handleDragOver = (e: React.DragEvent, idx: number) => { e.preventDefault(); setDragOverIdx(idx); };
  const handleDragEnd = () => {
    if (dragIdx !== null && dragOverIdx !== null && dragIdx !== dragOverIdx) {
      setAppOrder(prev => {
        const next = [...prev];
        const [moved] = next.splice(dragIdx, 1);
        next.splice(dragOverIdx, 0, moved);
        return next;
      });
    }
    setDragIdx(null);
    setDragOverIdx(null);
  };

  const matchSearch = (text: string) => !search || text.toLowerCase().includes(search.toLowerCase());
  const matchCategory = (cat: string) => activeFilter === l.allFilter || cat === activeFilter;

  const filteredRecent = newTabHistoryItems.filter(i => matchSearch(i.label + i.desc) && matchCategory(i.category));
  const filteredFiles = newTabFileItems.filter(i => matchSearch(i.label + i.desc) && matchCategory(i.category));
  const filteredActions = activeFilter === l.allFilter ? dialogQuickActions.filter(i => matchSearch(i.label)) : [];
  const hasResults = filteredRecent.length > 0 || filteredFiles.length > 0 || filteredActions.length > 0;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent data-slot="new-tab-dialog" className="max-w-[520px] p-0 top-[8%] translate-y-0 overflow-hidden flex flex-col tracking-[-0.14px]" showCloseButton={false}>
        {/* Search input */}
        <div className="flex items-center gap-2 px-4 h-12 border-b border-border">
          <Search size={16} className="text-muted-foreground flex-shrink-0" />
          <Input
            ref={inputRef}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={l.searchPlaceholder}
            aria-label="Search"
            className="flex-1 h-auto border-0 bg-transparent shadow-none px-0 py-0 focus-visible:ring-0 focus-visible:border-transparent placeholder:text-muted-foreground/60"
          />
          {search && (
            <Button variant="ghost" size="icon-xs" onClick={() => onSearchChange('')} className="w-5 h-5 text-muted-foreground hover:text-foreground">
              <X size={12} />
            </Button>
          )}
          <span className="text-xs text-muted-foreground/50 flex-shrink-0 select-none">Aa</span>
          <Button variant="ghost" size="icon-sm" className="w-7 h-7 text-muted-foreground hover:text-foreground flex-shrink-0"><Filter size={14} /></Button>
        </div>

        {/* Create new - App icons grid */}
        {visibleApps.length > 0 && (
        <div className="px-4 py-3 border-b border-border/50">
          <div className="flex flex-wrap gap-x-1 gap-y-2">
            {visibleApps.map((app) => {
              const Icon = app.icon;
              return (
                <Button
                  key={app.id}
                  variant="ghost"
                  onClick={() => onSelect(app.id)}
                  className="flex flex-col items-center gap-1.5 w-[52px] h-auto py-1 px-0 group hover:bg-accent/30"
                >
                  <div className={`w-9 h-9 rounded-[var(--radius-button)] flex items-center justify-center transition-all ${app.bg} ${app.color} group-hover:scale-105 group-active:scale-95`}>
                    <Icon size={17} strokeWidth={1.8} />
                  </div>
                  <span className="text-xs text-muted-foreground/70 group-hover:text-foreground leading-none">{app.label}</span>
                </Button>
              );
            })}
          </div>
        </div>
        )}

        {/* Filter pills */}
        <div className="flex items-center gap-1.5 px-4 py-2 border-b border-border/50 overflow-x-auto [&::-webkit-scrollbar]:hidden">
          {[l.allFilter, ...dialogFilterTabs].map(f => (
            <Button
              key={f}
              variant="ghost"
              size="xs"
              onClick={() => setActiveFilter(f)}
              className={`rounded-full px-2.5 whitespace-nowrap border ${
                activeFilter === f
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-transparent text-muted-foreground border-border hover:bg-accent/50 hover:text-foreground'
              }`}
            >
              {f}
            </Button>
          ))}
          <div className="flex-1" />
          <Button variant="ghost" size="icon-xs" className="text-muted-foreground/60 hover:text-muted-foreground"><SortAsc size={12} /></Button>
          <Button variant="ghost" size="icon-xs" className="text-muted-foreground/60 hover:text-muted-foreground"><CalendarDays size={12} /></Button>
        </div>

        {/* Content */}
        <ScrollArea className="max-h-[380px]" role="list" aria-live="polite">
          {manageMode ? (
            /* Manage Mode */
            <div className="px-3 pt-3 pb-2">
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-xs text-muted-foreground">{l.manageHint}</span>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={resetApps}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw size={11} />
                  {l.reset}
                </Button>
              </div>
              <div className="space-y-0.5">
                {orderedApps.map((app, idx) => {
                  const Icon = app.icon;
                  const isHidden = hiddenApps.has(app.id);
                  const isDragging = dragIdx === idx;
                  const isDragOver = dragOverIdx === idx;
                  return (
                    <div
                      key={app.id}
                      draggable
                      onDragStart={() => handleDragStart(idx)}
                      onDragOver={(e) => handleDragOver(e, idx)}
                      onDragEnd={handleDragEnd}
                      className={`flex items-center gap-3 px-2 py-2 rounded-[var(--radius-button)] transition-all cursor-grab active:cursor-grabbing select-none
                        ${isHidden ? 'opacity-40' : ''}
                        ${isDragging ? 'opacity-50 scale-[0.98]' : ''}
                        ${isDragOver && !isDragging ? 'border-t-2 border-primary/50' : 'border-t-2 border-transparent'}
                        hover:bg-accent/50`}
                    >
                      <GripVertical size={14} className="text-muted-foreground/30 flex-shrink-0" />
                      <div className={`w-8 h-8 rounded-[var(--radius-button)] flex items-center justify-center flex-shrink-0 ${app.bg} ${app.color}`}>
                        <Icon size={16} />
                      </div>
                      <span className="text-sm text-foreground flex-1">{app.label}</span>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={(e) => { e.stopPropagation(); toggleAppVisibility(app.id); }}
                        className={`w-7 h-7 ${
                          isHidden
                            ? 'text-muted-foreground/60 hover:text-foreground'
                            : 'text-foreground/70 hover:text-foreground'
                        }`}
                        title={isHidden ? l.show : l.hide}
                      >
                        {isHidden ? <EyeOff size={14} /> : <Eye size={14} />}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : hasResults ? (
            <div className="contents">
              {/* Recent */}
              {filteredRecent.length > 0 && (
                <div className="px-2 pt-3 pb-1">
                  <p className="text-xs text-muted-foreground/70 px-2 mb-1.5 tracking-wide uppercase">{l.recentSection} · {filteredRecent.length}</p>
                  {filteredRecent.map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <Button
                        key={`r-${i}`}
                        variant="ghost"
                        onClick={() => onSelect(item.id)}
                        className="w-full h-auto px-2 py-2 hover:bg-accent/60"
                      >
                        <Avatar className="w-8 h-8 flex-shrink-0">
                          <AvatarFallback className="bg-gradient-to-br from-accent to-accent/40">
                            <Icon size={14} className="text-muted-foreground" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0 text-left">
                          <span className="text-sm text-foreground truncate block">{item.label}</span>
                          <span className="text-xs text-muted-foreground/60 truncate block">{item.desc}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground/50 flex-shrink-0">
                          <MessageCircle size={10} />
                          <span>{item.count}</span>
                        </div>
                      </Button>
                    );
                  })}
                </div>
              )}

              {/* Files */}
              {filteredFiles.length > 0 && (
                <div className="px-2 pt-2 pb-1">
                  <p className="text-xs text-muted-foreground/70 px-2 mb-1.5 tracking-wide uppercase">{l.filesSection} · {filteredFiles.length}</p>
                  {filteredFiles.map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <Button
                        key={`f-${i}`}
                        variant="ghost"
                        onClick={() => onSelect(item.id)}
                        className="w-full h-auto px-2 py-2 hover:bg-accent/60"
                      >
                        <div className="w-8 h-8 rounded-[var(--radius-button)] bg-accent/80 flex items-center justify-center flex-shrink-0">
                          <Icon size={14} className="text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <span className="text-sm text-foreground truncate block">
                            {item.label} <span className="text-muted-foreground">· {item.desc}</span>
                          </span>
                          <span className="text-xs text-muted-foreground/60 truncate block">{item.meta}</span>
                        </div>
                      </Button>
                    );
                  })}
                </div>
              )}

              {/* Quick Actions */}
              {filteredActions.length > 0 && (
                <div className="px-2 pt-2 pb-2">
                  <p className="text-xs text-muted-foreground/70 px-2 mb-1.5 tracking-wide uppercase">{l.quickActionsSection}</p>
                  {filteredActions.map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <Button
                        key={`a-${i}`}
                        variant="ghost"
                        onClick={() => onSelect(item.id)}
                        className="w-full h-auto px-2 py-2 hover:bg-accent/60"
                      >
                        <div className="w-8 h-8 rounded-[var(--radius-button)] bg-accent/80 flex items-center justify-center flex-shrink-0">
                          <Icon size={14} className="text-muted-foreground" />
                        </div>
                        <span className="text-sm text-foreground flex-1 text-left">{item.label}</span>
                        <Kbd>{item.shortcut}</Kbd>
                      </Button>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-14 px-4">
              <Search size={36} className="text-muted-foreground/20 mb-3" />
              <p className="text-sm text-foreground mb-1">{l.noResults}</p>
              <p className="text-xs text-muted-foreground text-center leading-relaxed">
                {l.noResultsHint}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => { onSearchChange(''); setActiveFilter(l.allFilter); }}
                className="mt-4"
              >
                {l.clearFilter}
              </Button>
            </div>
          )}
        </ScrollArea>

        {/* Bottom bar */}
        <div className="flex items-center gap-3 px-4 py-2 border-t border-border/50 text-xs text-muted-foreground/50">
          <span className="flex items-center gap-1"><Kbd>↑↓</Kbd> {l.helpSelect}</span>
          <span className="flex items-center gap-1"><Kbd>↵</Kbd> {l.helpOpen}</span>
          <span className="flex items-center gap-1"><Kbd>⌘R</Kbd> {l.helpNewTab}</span>
          <span className="flex items-center gap-1"><Kbd>⌘L</Kbd> {l.helpCopyLink}</span>
          <span className="flex items-center gap-1"><Kbd>ESC</Kbd> {l.helpClose}</span>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => setManageMode(!manageMode)}
            className={`ml-auto ${manageMode ? 'text-foreground bg-accent' : 'hover:text-muted-foreground'}`}
            title={l.manageApps}
          >
            <Settings size={12} />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
