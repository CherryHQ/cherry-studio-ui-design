import React, { useState } from 'react';
import {
  Monitor, MessageCircle, Zap,
  RotateCcw, ChevronRight, AlertTriangle, MessagesSquare,
} from 'lucide-react';
import { Button, SearchInput, EmptyState, Typography, Switch } from '@cherry-studio/ui';

// ===========================
// Types
// ===========================
type ShortcutCategoryId = 'window' | 'session' | 'message' | 'assistant';

interface ShortcutKey {
  id: string;
  label: string;
  keys: string[];
  enabled: boolean;
  conflict?: string;
}

interface ShortcutCategory {
  id: ShortcutCategoryId;
  label: string;
  icon: React.ReactNode;
  items: ShortcutKey[];
}

// ===========================
// Mock Data
// ===========================
const INITIAL_CATEGORIES: ShortcutCategory[] = [
  {
    id: 'window',
    label: '全局与窗口',
    icon: <Monitor size={13} />,
    items: [
      { id: 'w1', label: '显示/隐藏应用', keys: ['⌥', 'Space'], enabled: true },
      { id: 'w2', label: '打开设置', keys: ['⌘', ','], enabled: true },
      { id: 'w3', label: '切换侧边栏', keys: ['⌘', '\\'], enabled: true },
      { id: 'w4', label: '放大界面', keys: ['⌘', '+'], enabled: true },
      { id: 'w5', label: '缩小界面', keys: ['⌘', '-'], enabled: true },
      { id: 'w6', label: '重置缩放', keys: ['⌘', '0'], enabled: true, conflict: '与系统快捷键冲突' },
      { id: 'w7', label: '退出全屏', keys: ['Esc'], enabled: false },
      { id: 'w8', label: '切换深色/浅色', keys: ['⇧', '⌘', 'L'], enabled: true },
    ],
  },
  {
    id: 'session',
    label: '会话与话题',
    icon: <MessageCircle size={13} />,
    items: [
      { id: 's1', label: '新建对话', keys: ['⌘', 'N'], enabled: true },
      { id: 's2', label: '搜索对话', keys: ['⌘', 'K'], enabled: true },
      { id: 's3', label: '重命名话题', keys: ['⌘', 'E'], enabled: true },
      { id: 's4', label: '上一个话题', keys: ['⌘', '['], enabled: true },
      { id: 's5', label: '下一个话题', keys: ['⌘', ']'], enabled: true },
      { id: 's6', label: '关闭话题', keys: ['⌘', 'W'], enabled: true },
    ],
  },
  {
    id: 'message',
    label: '消息交互',
    icon: <MessagesSquare size={13} />,
    items: [
      { id: 'm1', label: '复制最后回复', keys: ['⌘', '⇧', 'C'], enabled: true },
      { id: 'm2', label: '编辑最后消息', keys: ['↑'], enabled: true },
      { id: 'm3', label: '搜索消息', keys: ['⌘', 'F'], enabled: true },
      { id: 'm4', label: '清空当前对话', keys: [], enabled: true },
    ],
  },
  {
    id: 'assistant',
    label: 'AI 助手工具',
    icon: <Zap size={13} />,
    items: [
      { id: 'a1', label: '唤起快捷助手', keys: ['⌘', 'E'], enabled: true },
      { id: 'a2', label: '划词翻译', keys: [], enabled: false },
      { id: 'a3', label: '划词解释', keys: ['⌘', '⇧', 'X'], enabled: true },
    ],
  },
];

// ===========================
// Keycap display
// ===========================
function Keycaps({ keys, isRecording, hasConflict }: {
  keys: string[];
  isRecording?: boolean;
  hasConflict?: boolean;
}) {
  if (isRecording) {
    return (
      <span className="inline-flex items-center h-[20px] px-2.5 rounded-md border border-border bg-muted/30">
        <span className="text-xs text-muted-foreground animate-pulse font-medium">录制中...</span>
      </span>
    );
  }

  if (keys.length === 0) {
    return (
      <span className="inline-flex items-center h-[20px] px-2 rounded-md border border-dashed border-border/50 cursor-pointer hover:border-border/50 transition-colors">
        <span className="text-xs text-muted-foreground/50">未设置</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-[2px]">
      {keys.map((key, i) => (
        <span key={i} className="inline-flex items-center gap-[2px]">
          <kbd
            className={`inline-flex items-center justify-center min-w-[20px] h-[20px] px-[5px] rounded-[var(--radius-dot)] text-xs font-mono leading-none font-medium border ${
              hasConflict
                ? 'bg-destructive/5 border-destructive/20 text-destructive/70 shadow-[0_1px_0_0] shadow-destructive/10'
                : 'bg-muted/30 border-border/50 text-muted-foreground/60 shadow-[0_1px_0_0] shadow-foreground/[0.04]'
            }`}
          >
            {key}
          </kbd>
        </span>
      ))}
    </span>
  );
}

// ===========================
// Shortcut Row — compact
// ===========================
function ShortcutRow({
  item, isRecording, onStartRecording, onReset, on}: {
  item: ShortcutKey;
  isRecording: boolean;
  onStartRecording: () => void;
  onReset: () => void;
  onToggle: (v: boolean) => void;
}) {
  return (
    <div className={`flex items-center gap-3 py-[6px] px-1 group ${!item.enabled ? 'opacity-35' : ''} transition-opacity`}>
      {/* Label */}
      <div className="flex-1 min-w-0 flex items-center gap-1.5">
        <span className="text-sm text-muted-foreground truncate">{item.label}</span>
        {item.conflict && !isRecording && (
          <AlertTriangle size={8} className="text-destructive/50 flex-shrink-0" />
        )}
      </div>

      {/* Keycaps */}
      <Button variant="ghost" onClick={onStartRecording} size="inline" className="focus:outline-none flex-shrink-0 p-0">
        <Keycaps keys={item.keys} isRecording={isRecording} hasConflict={!!item.conflict} />
      </Button>

      {/* Reset — show on hover */}
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={onReset}
        className="flex items-center justify-center text-muted-foreground/40 group-hover:text-foreground hover:!text-muted-foreground/60 transition-colors flex-shrink-0"
        title="重置"
      >
        <RotateCcw size={8} />
      </Button>

      {/* Toggle */}
      <Switch size="sm" checked={item.enabled} onCheckedChange={onToggle} />
    </div>
  );
}

// ===========================
// Main
// ===========================
export function ShortcutsPage() {
  const [categories, setCategories] = useState<ShortcutCategory[]>(INITIAL_CATEGORIES);
  const [selectedId, setSelectedId] = useState<ShortcutCategoryId>('window');
  const [recordingId, setRecordingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedCategory = categories.find(c => c.id === selectedId)!;

  const updateItem = (catId: ShortcutCategoryId, itemId: string, update: Partial<ShortcutKey>) => {
    setCategories(prev => prev.map(cat =>
      cat.id === catId
        ? { ...cat, items: cat.items.map(item => item.id === itemId ? { ...item, ...update } : item) }
        : cat
    ));
  };

  const handleToggle = (itemId: string, val: boolean) => updateItem(selectedId, itemId, { enabled: val });

  const handleReset = (itemId: string) => {
    const origItem = INITIAL_CATEGORIES.find(c => c.id === selectedId)?.items.find(i => i.id === itemId);
    if (origItem) updateItem(selectedId, itemId, { keys: origItem.keys, enabled: origItem.enabled, conflict: origItem.conflict });
  };

  const handleResetGroup = () => {
    const orig = INITIAL_CATEGORIES.find(c => c.id === selectedId);
    if (orig) setCategories(prev => prev.map(cat => cat.id === selectedId ? { ...orig } : cat));
  };

  const batchToggle = (val: boolean) => {
    setCategories(prev => prev.map(cat =>
      cat.id === selectedId ? { ...cat, items: cat.items.map(item => ({ ...item, enabled: val })) } : cat
    ));
  };

  const filteredItems = searchQuery.trim()
    ? selectedCategory.items.filter(item =>
        item.label.includes(searchQuery) || item.keys.join('').includes(searchQuery)
      )
    : selectedCategory.items;

  return (
    <div className="flex h-full min-h-0">
      {/* Left nav */}
      <div className="w-[140px] flex-shrink-0 flex flex-col border-r border-border/30 min-h-0">
        <div className="px-3 pt-4 pb-2 flex-shrink-0">
          <p className="text-xs text-muted-foreground/40 font-medium">快捷键分组</p>
        </div>
        <div className="flex-1 overflow-y-auto px-2 pb-3 scrollbar-thin-xs">
          <div className="space-y-[1px]">
            {categories.map(cat => {
              const sel = selectedId === cat.id;
              return (
                <Button size="inline"
                  variant="ghost"
                  key={cat.id}
                  onClick={() => { setSelectedId(cat.id); setRecordingId(null); }}
                  className={`w-full flex items-center justify-between px-2.5 py-[7px] transition-all text-left relative ${
                    sel ? 'bg-cherry-active-bg' : 'border border-transparent hover:bg-accent/50'
                  }`}
                >
                  {sel && (
                    <div className="absolute inset-0 rounded-lg border border-cherry-active-border pointer-events-none" />
                  )}
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    <span className={`flex-shrink-0 ${sel ? 'text-muted-foreground/60' : 'text-muted-foreground/40'}`}>{cat.icon}</span>
                    <span className={`text-sm truncate ${sel ? 'text-foreground font-medium' : 'text-muted-foreground/60'}`}>
                      {cat.label}
                    </span>
                  </div>
                  <ChevronRight size={8} className={`flex-shrink-0 ${sel ? 'text-muted-foreground/50' : 'text-muted-foreground/50'}`} />
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right content */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        {/* Header row */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2 flex-shrink-0">
          <Typography variant="subtitle">{selectedCategory.label}</Typography>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="xs" onClick={() => batchToggle(true)} className="px-2 text-muted-foreground/40 hover:text-foreground transition-colors">全部启用</Button>
            <Button variant="ghost" size="xs" onClick={() => batchToggle(false)} className="px-2 text-muted-foreground/40 hover:text-foreground transition-colors">全部禁用</Button>
            <Button variant="ghost" size="xs" onClick={handleResetGroup} className="flex items-center gap-0.5 px-2 text-muted-foreground/60 hover:text-foreground transition-colors">
              <RotateCcw size={7} />
              <span>重置</span>
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="px-5 pb-1 flex-shrink-0">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="搜索..."
            iconSize={10}
            wrapperClassName="flex items-center gap-2 px-3 py-[5px] bg-muted/30 border border-border/50 rounded-lg"
          />
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-5 pt-1 pb-4 scrollbar-thin">
          {filteredItems.length === 0 ? (
            <EmptyState preset="no-result" title="没有匹配的快捷键" compact />
          ) : (
            <div className="divide-y divide-border/50">
              {filteredItems.map(item => (
                <ShortcutRow
                  key={item.id}
                  item={item}
                  isRecording={recordingId === item.id}
                  onStartRecording={() => setRecordingId(prev => prev === item.id ? null : item.id)}
                  onReset={() => handleReset(item.id)}
                  onToggle={v => handleToggle(item.id, v)}
                />
              ))}
            </div>
          )}

          {recordingId && (
            <div className="mt-2 flex items-center gap-2 px-3 py-[6px] bg-muted/30 border border-border/50 rounded-lg">
              <div className="w-1 h-1 rounded-full bg-muted0 animate-pulse flex-shrink-0" />
              <p className="text-xs text-muted-foreground/60 flex-1">请按下组合键。Esc 取消。</p>
              <Button
                variant="ghost"
                size="xs"
                onClick={() => setRecordingId(null)}
                className="px-2 text-muted-foreground/40 hover:text-foreground transition-colors flex-shrink-0"
              >
                取消
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
