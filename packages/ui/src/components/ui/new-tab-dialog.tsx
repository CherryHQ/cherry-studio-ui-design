"use client"

import React, { useState, useRef, useEffect } from 'react';
import {
  Search, X, Filter, SortAsc, CalendarDays, ChevronDown,
  MessageCircle, Eye, EyeOff, RotateCcw, GripVertical, Settings,
} from 'lucide-react';
import { cn } from "../../lib/utils"
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
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [sortOrder, setSortOrder] = useState('最近');
  const [dateRange, setDateRange] = useState('全部时间');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
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

  // Flat list for highlight + preview
  type ResultItem = { id: string; label: string; desc: string; icon: React.ElementType; section: string; category?: string; meta?: string; count?: number };
  const allResults: ResultItem[] = [
    ...filteredRecent.map(item => ({ id: item.id, label: item.label, desc: item.desc, icon: item.icon, section: 'recent', category: item.category, count: item.count })),
    ...filteredFiles.map(item => ({ id: item.id, label: item.label, desc: item.desc, icon: item.icon, section: 'file', category: item.category, meta: item.meta })),
  ];
  const previewItem = allResults[highlightedIndex] || null;
  let globalIdx = -1;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent data-slot="new-tab-dialog" className="max-w-[820px] sm:max-w-[820px] p-0 overflow-hidden flex flex-col tracking-[-0.14px]" showCloseButton={false}>
        {/* Search input */}
        <div className="flex items-center gap-2 mx-4 mt-4 mb-2 px-3 h-10 rounded-xl bg-muted/30 border border-border/50">
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
          <Button variant="ghost" size="icon-sm" onClick={() => setShowFilters(v => !v)} className={cn("w-7 h-7 flex-shrink-0", showFilters ? "text-foreground bg-accent" : "text-muted-foreground hover:text-foreground")}><Filter size={14} /></Button>
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

        {/* Filter dropdowns — toggle via funnel button, hidden in manage mode */}
        {showFilters && !manageMode && <div className="flex items-center gap-2 px-4 py-2 border-b border-border/50">
          <div className="relative">
            <Button variant="ghost" size="xs" onClick={() => setOpenDropdown(openDropdown === 'type' ? null : 'type')} className="text-muted-foreground hover:text-foreground">
              <Filter size={11} /><span>{activeFilter === l.allFilter ? '类型' : activeFilter}</span><ChevronDown size={10} />
            </Button>
            {openDropdown === 'type' && (
              <div className="absolute top-full left-0 mt-1 bg-popover border border-border/50 rounded-xl shadow-lg py-1 min-w-[120px] z-10">
                {[l.allFilter, ...dialogFilterTabs].map(f => (
                  <button key={f} onClick={() => { setActiveFilter(f); setOpenDropdown(null); }}
                    className={cn("w-full text-left px-3 py-1.5 text-xs transition-colors", activeFilter === f ? 'text-foreground bg-accent/60' : 'text-muted-foreground hover:bg-accent/40 hover:text-foreground')}
                  >{f}</button>
                ))}
              </div>
            )}
          </div>
          <div className="relative">
            <Button variant="ghost" size="xs" onClick={() => setOpenDropdown(openDropdown === 'sort' ? null : 'sort')} className="text-muted-foreground hover:text-foreground">
              <SortAsc size={11} /><span>{sortOrder}</span><ChevronDown size={10} />
            </Button>
            {openDropdown === 'sort' && (
              <div className="absolute top-full left-0 mt-1 bg-popover border border-border/50 rounded-xl shadow-lg py-1 min-w-[100px] z-10">
                {['最近', '最早', '最多消息'].map(s => (
                  <button key={s} onClick={() => { setSortOrder(s); setOpenDropdown(null); }}
                    className={cn("w-full text-left px-3 py-1.5 text-xs transition-colors", sortOrder === s ? 'text-foreground bg-accent/60' : 'text-muted-foreground hover:bg-accent/40 hover:text-foreground')}
                  >{s}</button>
                ))}
              </div>
            )}
          </div>
          <div className="relative">
            <Button variant="ghost" size="xs" onClick={() => setOpenDropdown(openDropdown === 'date' ? null : 'date')} className="text-muted-foreground hover:text-foreground">
              <CalendarDays size={11} /><span>{dateRange}</span><ChevronDown size={10} />
            </Button>
            {openDropdown === 'date' && (
              <div className="absolute top-full left-0 mt-1 bg-popover border border-border/50 rounded-xl shadow-lg py-1 min-w-[120px] z-10">
                {['全部时间', '今天', '最近7天', '最近30天', '最近3个月'].map(d => (
                  <button key={d} onClick={() => { setDateRange(d); setOpenDropdown(null); }}
                    className={cn("w-full text-left px-3 py-1.5 text-xs transition-colors", dateRange === d ? 'text-foreground bg-accent/60' : 'text-muted-foreground hover:bg-accent/40 hover:text-foreground')}
                  >{d}</button>
                ))}
              </div>
            )}
          </div>
        </div>}

        {/* Content: left list + right preview */}
        <div className="flex flex-1 min-h-0">
          <ScrollArea className={cn("flex-1 max-h-[380px]", !manageMode && "border-r border-border/50")} role="list" aria-live="polite">
            {manageMode ? (
              <div className="px-3 pt-3 pb-2">
                <div className="flex items-center justify-between mb-3 px-1">
                  <span className="text-xs text-muted-foreground">{l.manageHint}</span>
                  <Button variant="ghost" size="xs" onClick={resetApps} className="text-xs text-muted-foreground hover:text-foreground">
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
                        className={`flex items-center gap-3 px-2 py-2 rounded-xl transition-all cursor-grab active:cursor-grabbing select-none
                          ${isHidden ? 'opacity-40' : ''}
                          ${isDragging ? 'opacity-50 scale-[0.98]' : ''}
                          ${isDragOver && !isDragging ? 'border-t-2 border-primary/50' : 'border-t-2 border-transparent'}
                          hover:bg-accent/50`}
                      >
                        <GripVertical size={14} className="text-muted-foreground/30 flex-shrink-0" />
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${app.bg} ${app.color}`}>
                          <Icon size={16} />
                        </div>
                        <span className="text-sm text-foreground flex-1">{app.label}</span>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={(e) => { e.stopPropagation(); toggleAppVisibility(app.id); }}
                          className={`w-7 h-7 ${isHidden ? 'text-muted-foreground/60 hover:text-foreground' : 'text-foreground/70 hover:text-foreground'}`}
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
                {filteredRecent.length > 0 && (
                  <div className="px-2 pt-3 pb-1">
                    <p className="text-xs text-muted-foreground/60 px-2 mb-1.5">{l.recentSection} · {filteredRecent.length}</p>
                    {filteredRecent.map((item, i) => {
                      globalIdx++;
                      const thisIdx = globalIdx;
                      const Icon = item.icon;
                      return (
                        <div
                          key={`r-${i}`}
                          onClick={() => onSelect(item.id)}
                          onMouseEnter={() => setHighlightedIndex(thisIdx)}
                          className={cn(
                            "flex items-center gap-3 px-2 py-2 rounded-xl transition-colors cursor-pointer",
                            highlightedIndex === thisIdx ? "bg-accent/60" : "hover:bg-accent/40"
                          )}
                        >
                          <div className="w-8 h-8 rounded-xl bg-accent/80 flex items-center justify-center flex-shrink-0">
                            <Icon size={14} className="text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-sm text-foreground truncate block">{item.label}</span>
                            <span className="text-xs text-muted-foreground/60 truncate block">{item.desc}</span>
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
                          key={`f-${i}`}
                          onClick={() => onSelect(item.id)}
                          onMouseEnter={() => setHighlightedIndex(thisIdx)}
                          className={cn(
                            "flex items-center gap-3 px-2 py-2 rounded-xl transition-colors cursor-pointer",
                            highlightedIndex === thisIdx ? "bg-accent/60" : "hover:bg-accent/40"
                          )}
                        >
                          <div className="w-8 h-8 rounded-xl bg-accent/80 flex items-center justify-center flex-shrink-0">
                            <Icon size={14} className="text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-sm text-foreground truncate block">
                              {item.label} <span className="text-muted-foreground/60">· {item.desc}</span>
                            </span>
                            <span className="text-xs text-muted-foreground/40 truncate block">{item.meta}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {filteredActions.length > 0 && (
                  <div className="px-2 pt-2 pb-2">
                    <p className="text-xs text-muted-foreground/60 px-2 mb-1.5">{l.quickActionsSection}</p>
                    {filteredActions.map((item, i) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={`a-${i}`}
                          onClick={() => onSelect(item.id)}
                          className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-accent/40 transition-colors cursor-pointer"
                        >
                          <div className="w-8 h-8 rounded-xl bg-accent/80 flex items-center justify-center flex-shrink-0">
                            <Icon size={14} className="text-muted-foreground" />
                          </div>
                          <span className="text-sm text-foreground flex-1">{item.label}</span>
                          <Kbd>{item.shortcut}</Kbd>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-14 px-4">
                <Search size={36} className="text-muted-foreground/20 mb-3" />
                <p className="text-sm text-foreground mb-1">{l.noResults}</p>
                <p className="text-xs text-muted-foreground text-center leading-relaxed">{l.noResultsHint}</p>
                <Button variant="outline" size="xs" onClick={() => { onSearchChange(''); setActiveFilter(l.allFilter); }} className="mt-4">
                  {l.clearFilter}
                </Button>
              </div>
            )}
          </ScrollArea>

          {/* Right: preview panel (hidden in manage mode) */}
          {!manageMode && <div className="w-[280px] flex-shrink-0 flex flex-col items-center justify-center px-6 py-8 max-h-[380px]">
            {previewItem ? (
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-accent/80 flex items-center justify-center mb-2">
                  <previewItem.icon size={20} className="text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground/50">{previewItem.category || (previewItem.section === 'recent' ? '对话' : '文件')}</p>
                  <p className="text-sm text-foreground font-medium">{previewItem.label}</p>
                  <p className="text-xs text-muted-foreground/60">{previewItem.desc}</p>
                </div>
              </div>
            ) : (
              <div className="text-xs text-muted-foreground/30">无预览</div>
            )}
          </div>}
        </div>

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
