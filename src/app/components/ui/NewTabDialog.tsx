import React, { useState, useRef, useEffect } from 'react';
import {
  Search, X, SortAsc, CalendarDays, ChevronDown, ListFilter,
  MessageCircle, Eye, EyeOff, RotateCcw, GripVertical, Settings,
  Link2, ExternalLink,
} from 'lucide-react';
import { Button, Input, Dialog, DialogContent } from '@cherry-studio/ui';
import {
  dialogAppIcons, dialogFilterTabs,
  newTabHistoryItems, newTabFileItems, dialogQuickActions,
} from '@/app/config/constants';

export function NewTabDialog({ open, search, onSearchChange, onSelect, onClose, hiddenApps, setHiddenApps, appOrder, setAppOrder }: {
  open: boolean; search: string; onSearchChange: (s: string) => void;
  onSelect: (menuItemId: string) => void; onClose: () => void;
  hiddenApps: Set<string>; setHiddenApps: React.Dispatch<React.SetStateAction<Set<string>>>;
  appOrder: string[]; setAppOrder: React.Dispatch<React.SetStateAction<string[]>>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [activeFilter, setActiveFilter] = useState<string>('全部');
  const [manageMode, setManageMode] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<{ label: string; desc: string; icon: React.ComponentType<any>; category?: string; count?: number; meta?: string } | null>(null);
  const [openDropdown, setOpenDropdown] = useState<'type' | 'sort' | 'time' | null>(null);
  const [activeSort, setActiveSort] = useState('最近');
  const [activeTime, setActiveTime] = useState('全部时间');
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  useEffect(() => {
    if (!open) return;
    setActiveFilter('全部');
    setHoveredItem(newTabHistoryItems[0] || null);
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
  const matchCategory = (cat: string) => activeFilter === '全部' || cat === activeFilter;

  const filteredRecent = newTabHistoryItems.filter(i => matchSearch(i.label + i.desc) && matchCategory(i.category));
  const filteredFiles = newTabFileItems.filter(i => matchSearch(i.label + i.desc) && matchCategory(i.category));
  const filteredActions = activeFilter === '全部' ? dialogQuickActions.filter(i => matchSearch(i.label)) : [];
  const hasResults = filteredRecent.length > 0 || filteredFiles.length > 0 || filteredActions.length > 0;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="w-full max-w-[780px] sm:max-w-[780px] p-0 gap-0 overflow-hidden flex flex-col">
        {/* Search input */}
        <div className="flex items-center gap-2 px-4 h-12 border-b border-border">
          <Search size={16} className="text-muted-foreground flex-shrink-0" />
          <Input
            ref={inputRef}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="开始输入搜索..."
            className="flex-1 border-0 bg-transparent h-auto p-0 shadow-none focus-visible:ring-0"
          />
          {search && (
            <Button variant="ghost" size="icon-xs" onClick={() => onSearchChange('')} className="text-muted-foreground hover:text-foreground">
              <X size={12} />
            </Button>
          )}
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
                  size="xs"
                  onClick={() => onSelect(app.id)}
                  className="flex flex-col items-center gap-1.5 w-[52px] h-auto rounded-lg group hover:bg-accent/30"
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${app.bg} ${app.color} group-hover:scale-105 group-active:scale-95`}>
                    <Icon size={17} strokeWidth={1.8} />
                  </div>
                  <span className="text-xs text-muted-foreground/70 group-hover:text-foreground transition-colors leading-none">{app.label}</span>
                </Button>
              );
            })}
          </div>
        </div>
        )}

        {/* Filter bar */}
        <div className="flex items-center gap-1 px-4 py-2 border-b border-border/50">
          {/* Type dropdown */}
          <div className="relative">
            <Button variant="ghost" size="xs" onClick={() => setOpenDropdown(openDropdown === 'type' ? null : 'type')}
              className="gap-1 text-muted-foreground hover:text-foreground">
              <ListFilter size={12} />
              <span>{activeFilter === '全部' ? '类型' : activeFilter}</span>
              <ChevronDown size={10} className="text-muted-foreground/50" />
            </Button>
            {openDropdown === 'type' && (
              <div className="absolute top-full left-0 mt-1 z-50 bg-popover border border-border/40 rounded-lg shadow-xl p-1 min-w-[120px]">
                {['全部', ...dialogFilterTabs].map(f => (
                  <Button key={f} variant="ghost" size="xs"
                    onClick={() => { setActiveFilter(f); setOpenDropdown(null); }}
                    className={`w-full justify-start text-xs h-auto py-1.5 px-2 ${
                      activeFilter === f ? 'bg-accent text-foreground' : 'text-muted-foreground hover:text-foreground'
                    }`}>
                    {f}
                  </Button>
                ))}
              </div>
            )}
          </div>
          {/* Sort dropdown */}
          <div className="relative">
            <Button variant="ghost" size="xs" onClick={() => setOpenDropdown(openDropdown === 'sort' ? null : 'sort')}
              className="gap-1 text-muted-foreground hover:text-foreground">
              <SortAsc size={12} />
              <span>{activeSort}</span>
              <ChevronDown size={10} className="text-muted-foreground/50" />
            </Button>
            {openDropdown === 'sort' && (
              <div className="absolute top-full left-0 mt-1 z-50 bg-popover border border-border/40 rounded-lg shadow-xl p-1 min-w-[120px]">
                {['最近', '最早', '最多消息', '按名称'].map(s => (
                  <Button key={s} variant="ghost" size="xs"
                    onClick={() => { setActiveSort(s); setOpenDropdown(null); }}
                    className={`w-full justify-start text-xs h-auto py-1.5 px-2 ${
                      activeSort === s ? 'bg-accent text-foreground' : 'text-muted-foreground hover:text-foreground'
                    }`}>
                    {s}
                  </Button>
                ))}
              </div>
            )}
          </div>
          {/* Time dropdown */}
          <div className="relative">
            <Button variant="ghost" size="xs" onClick={() => setOpenDropdown(openDropdown === 'time' ? null : 'time')}
              className="gap-1 text-muted-foreground hover:text-foreground">
              <CalendarDays size={12} />
              <span>{activeTime}</span>
              <ChevronDown size={10} className="text-muted-foreground/50" />
            </Button>
            {openDropdown === 'time' && (
              <div className="absolute top-full left-0 mt-1 z-50 bg-popover border border-border/40 rounded-lg shadow-xl p-1 min-w-[120px]">
                {['全部时间', '今天', '最近一周', '最近一月', '最近三月'].map(t => (
                  <Button key={t} variant="ghost" size="xs"
                    onClick={() => { setActiveTime(t); setOpenDropdown(null); }}
                    className={`w-full justify-start text-xs h-auto py-1.5 px-2 ${
                      activeTime === t ? 'bg-accent text-foreground' : 'text-muted-foreground hover:text-foreground'
                    }`}>
                    {t}
                  </Button>
                ))}
              </div>
            )}
          </div>
          {/* Click outside to close dropdown */}
          {openDropdown && <div className="fixed inset-0 z-40" onClick={() => setOpenDropdown(null)} />}
        </div>

        {/* Content — list + preview */}
        <div className="flex flex-1 min-h-0 max-h-[480px]">
          {/* Left: list */}
          <div className="flex-1 min-w-0 overflow-y-auto [&::-webkit-scrollbar]:hidden">
            {manageMode ? (
              /* Manage Mode */
              <div className="px-3 pt-3 pb-2">
                <div className="flex items-center justify-between mb-3 px-1">
                  <span className="text-xs text-muted-foreground">管理快捷应用 · 拖拽排序，点击眼睛隐藏/显示</span>
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={resetApps}
                    className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
                  >
                    <RotateCcw size={11} />
                    重置
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
                        className={`flex items-center gap-3 px-2 py-2 rounded-lg transition-all cursor-grab active:cursor-grabbing select-none
                          ${isHidden ? 'opacity-40' : ''}
                          ${isDragging ? 'opacity-50 scale-[0.98]' : ''}
                          ${isDragOver && !isDragging ? 'border-t-2 border-primary/50' : 'border-t-2 border-transparent'}
                          hover:bg-accent/50`}
                      >
                        <GripVertical size={14} className="text-muted-foreground/30 flex-shrink-0" />
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${app.bg} ${app.color}`}>
                          <Icon size={16} />
                        </div>
                        <span className="text-sm text-foreground flex-1">{app.label}</span>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={(e) => { e.stopPropagation(); toggleAppVisibility(app.id); }}
                          className={`${
                            isHidden
                              ? 'text-muted-foreground/40 hover:text-foreground hover:bg-accent'
                              : 'text-foreground/70 hover:text-foreground hover:bg-accent'
                          }`}
                          title={isHidden ? '显示' : '隐藏'}
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
                    <p className="text-xs text-muted-foreground/70 px-2 mb-1.5 tracking-wide uppercase">最近 · {filteredRecent.length}</p>
                    {filteredRecent.map((item, i) => {
                      const Icon = item.icon;
                      return (
                        <Button variant="ghost" size="xs"
                          key={`r-${i}`}
                          onClick={() => onSelect(item.id)}
                          onMouseEnter={() => setHoveredItem(item)}
                          className={`w-full flex items-center gap-3 px-2 py-2 h-auto rounded-lg justify-start ${
                            hoveredItem?.label === item.label ? 'bg-accent/60' : 'hover:bg-accent/60'
                          }`}
                        >
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-accent/40 flex items-center justify-center flex-shrink-0">
                            <Icon size={14} className="text-muted-foreground" />
                          </div>
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
                    <p className="text-xs text-muted-foreground/70 px-2 mb-1.5 tracking-wide uppercase">文件 · {filteredFiles.length}</p>
                    {filteredFiles.map((item, i) => {
                      const Icon = item.icon;
                      return (
                        <Button variant="ghost" size="xs"
                          key={`f-${i}`}
                          onClick={() => onSelect(item.id)}
                          onMouseEnter={() => setHoveredItem(item)}
                          className={`w-full flex items-center gap-3 px-2 py-2 h-auto rounded-lg justify-start ${
                            hoveredItem?.label === item.label ? 'bg-accent/60' : 'hover:bg-accent/60'
                          }`}
                        >
                          <div className="w-8 h-8 rounded-lg bg-accent/80 flex items-center justify-center flex-shrink-0">
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
                    <p className="text-xs text-muted-foreground/70 px-2 mb-1.5 tracking-wide uppercase">快捷操作</p>
                    {filteredActions.map((item, i) => {
                      const Icon = item.icon;
                      return (
                        <Button variant="ghost" size="xs"
                          key={`a-${i}`}
                          onClick={() => onSelect(item.id)}
                          className="w-full flex items-center gap-3 px-2 py-2 h-auto rounded-lg hover:bg-accent/60 justify-start"
                        >
                          <div className="w-8 h-8 rounded-lg bg-accent/80 flex items-center justify-center flex-shrink-0">
                            <Icon size={14} className="text-muted-foreground" />
                          </div>
                          <span className="text-sm text-foreground flex-1 text-left">{item.label}</span>
                          <kbd className="text-xs text-muted-foreground/50 bg-accent/60 px-1.5 py-0.5 rounded">{item.shortcut}</kbd>
                        </Button>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-14 px-4">
                <Search size={36} className="text-muted-foreground/20 mb-3" />
                <p className="text-sm text-foreground mb-1">未找到匹配结果</p>
                <p className="text-xs text-muted-foreground text-center leading-relaxed">
                  未能找到与搜索匹配的内容。<br />请尝试调整关键词、筛选条件或检查是否有拼写错误。
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { onSearchChange(''); setActiveFilter('全部'); }}
                  className="mt-4"
                >
                  清除筛选
                </Button>
              </div>
            )}
          </div>

          {/* Right: preview panel */}
          {!manageMode && (
            <div className="w-[38%] flex-shrink-0 border-l border-border/30 p-3 overflow-y-auto">
              {hoveredItem ? (() => {
                const PreviewIcon = hoveredItem.icon;
                return (
                  <div className="rounded-xl bg-accent/10 border border-border/15 p-4 h-full flex flex-col">
                    {/* Top: icon + actions */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-9 h-9 rounded-lg bg-accent/25 flex items-center justify-center">
                        <PreviewIcon size={18} className="text-muted-foreground" />
                      </div>
                      <div className="flex items-center gap-0.5">
                        <Button variant="ghost" size="icon-xs" className="text-muted-foreground/40 hover:text-muted-foreground">
                          <Link2 size={12} />
                        </Button>
                        <Button variant="ghost" size="icon-xs" className="text-muted-foreground/40 hover:text-muted-foreground">
                          <ExternalLink size={12} />
                        </Button>
                      </div>
                    </div>
                    {/* Meta */}
                    {hoveredItem.category && (
                      <span className="text-[9px] text-muted-foreground/45 mb-1">{hoveredItem.category}</span>
                    )}
                    <h3 className="text-base font-medium text-foreground mb-1">{hoveredItem.label}</h3>
                    <p className="text-xs text-muted-foreground/55 leading-relaxed mb-3">{hoveredItem.desc}</p>
                    {hoveredItem.meta && (
                      <p className="text-xs text-muted-foreground/40 mb-3">{hoveredItem.meta}</p>
                    )}
                    {/* Placeholder content */}
                    <div className="flex-1 space-y-2.5 mt-auto">
                      <div className="h-2 bg-accent/15 rounded-full w-full" />
                      <div className="h-2 bg-accent/15 rounded-full w-[90%]" />
                      <div className="h-2 bg-accent/15 rounded-full w-[70%]" />
                      <div className="h-2 bg-accent/15 rounded-full w-[50%]" />
                    </div>
                  </div>
                );
              })() : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground/30">
                  <Search size={24} className="mb-2" />
                  <span className="text-xs">悬停查看预览</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom bar */}
        <div className="flex items-center gap-3 px-4 py-2 border-t border-border/50 text-xs text-muted-foreground/50">
          <span className="flex items-center gap-1"><kbd className="bg-accent/60 px-1 rounded">↑↓</kbd> 选择</span>
          <span className="flex items-center gap-1"><kbd className="bg-accent/60 px-1 rounded">↵</kbd> 打开</span>
          <span className="flex items-center gap-1"><kbd className="bg-accent/60 px-1 rounded">⌘R</kbd> 在新标签打开</span>
          <span className="flex items-center gap-1"><kbd className="bg-accent/60 px-1 rounded">⌘L</kbd> 复制链接</span>
          <span className="flex items-center gap-1"><kbd className="bg-accent/60 px-1 rounded">ESC</kbd> 关闭</span>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => setManageMode(!manageMode)}
            className={`ml-auto ${manageMode ? 'text-foreground bg-accent' : 'hover:text-muted-foreground'}`}
            title="管理快捷应用"
          >
            <Settings size={12} />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}