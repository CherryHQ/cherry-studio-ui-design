import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Tooltip } from '@/app/components/Tooltip';
import { FormRow, SectionHeader, SectionCard, Tabs, TabsList, TabsTrigger } from './shared';
import { Button, Input, Popover, PopoverTrigger, PopoverContent, Typography, Switch } from '@cherry-studio/ui';
import {
  Zap, Scissors, ShieldAlert, Languages, Search, FileText,
  Sparkles, Plus, Pencil, ChevronRight,
  X, Trash2, Check, Code2, Wand2, BookOpen,
  Lightbulb, ListChecks, Layers, Bot, MessageCircle, CircleHelp,
} from 'lucide-react';

// ===========================
// Types
// ===========================
type SubPage = 'trigger' | 'menu' | 'rules';

interface MenuItem {
  id: string;
  name: string;
  icon: string;
  prompt: string;
  enabled: boolean;
}

// ===========================
// Icon registry
// ===========================
const ACTION_ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  'message-circle': MessageCircle,
  'languages': Languages,
  'file-text': FileText,
  'lightbulb': Lightbulb,
  'sparkles': Sparkles,
  'search': Search,
  'wand': Wand2,
  'code': Code2,
  'book': BookOpen,
  'list-checks': ListChecks,
  'layers': Layers,
  'bot': Bot,
};

const ICON_OPTIONS = [
  { value: 'message-circle', label: '对话' },
  { value: 'languages', label: '翻译' },
  { value: 'file-text', label: '文档' },
  { value: 'lightbulb', label: '灵感' },
  { value: 'sparkles', label: '智能' },
  { value: 'search', label: '搜索' },
  { value: 'wand', label: '生成' },
  { value: 'code', label: '代码' },
  { value: 'book', label: '阅读' },
  { value: 'list-checks', label: '清单' },
  { value: 'layers', label: '层级' },
  { value: 'bot', label: '机器人' },
];

function getActionIcon(iconKey: string) {
  return ACTION_ICON_MAP[iconKey] || Sparkles;
}


// ===========================
// Icon Picker
// ===========================
function IconPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [showPopover, setShowPopover] = useState(false);
  const CurrentIcon = getActionIcon(value);

  return (
    <Popover open={showPopover} onOpenChange={setShowPopover}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon-sm"
          className="w-9 h-9 rounded-xl bg-muted/50 hover:bg-accent border-0 flex-shrink-0"
        >
          <CurrentIcon size={16} className="text-muted-foreground/60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="grid grid-cols-4 gap-1 w-[140px] p-2">
        {ICON_OPTIONS.map(opt => {
          const Icon = getActionIcon(opt.value);
          return (
            <Button
              key={opt.value}
              variant="ghost"
              size="icon-xs"
              onClick={() => { onChange(opt.value); setShowPopover(false); }}
              className={`w-7 h-7 rounded-lg ${
                value === opt.value ? 'bg-cherry-active-bg text-cherry-primary' : 'text-muted-foreground/60 hover:bg-accent/50 hover:text-foreground'
              }`}
              title={opt.label}
            >
              <Icon size={13} />
            </Button>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}

// ===========================
// Mock Data
// ===========================
const INITIAL_MENU_ITEMS: MenuItem[] = [
  { id: 'translate', name: '翻译', icon: 'languages', prompt: '请将以下文本翻译为中文/英文：', enabled: true },
  { id: 'search', name: '搜索', icon: 'search', prompt: '请搜索以下内容的相关信息：', enabled: true },
  { id: 'summarize', name: '总结', icon: 'file-text', prompt: '请总结这段文本的核心要点：', enabled: true },
  { id: 'explain-code', name: '代码解释', icon: 'code', prompt: '请解释这段代码的功能和逻辑：', enabled: false },
];

// ===========================
// Nav config
// ===========================
const NAV_ITEMS: { id: SubPage; label: string; icon: React.ReactNode; iconColor: string }[] = [
  { id: 'trigger', label: '触发与显示', icon: <Zap size={13} />, iconColor: 'text-warning' },
  { id: 'menu', label: '功能菜单', icon: <Scissors size={13} />, iconColor: 'text-muted-foreground/60' },
  { id: 'rules', label: '规则与过滤', icon: <ShieldAlert size={13} />, iconColor: 'text-destructive' },
];

// ===========================
// Edit Form Panel (sidebar floating)
// ===========================
function EditFormPanel({ open, onClose, item, onSave }: {
  open: boolean;
  onClose: () => void;
  item: MenuItem | null;
  onSave: (data: { name: string; icon: string; prompt: string }) => void;
}) {
  const [icon, setIcon] = useState('sparkles');
  const [name, setName] = useState('');
  const [prompt, setPrompt] = useState('');
  const promptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      if (item) {
        setIcon(item.icon);
        setName(item.name);
        setPrompt(item.prompt);
      } else {
        setIcon('sparkles');
        setName('');
        setPrompt('');
      }
    }
  }, [open, item]);

  useEffect(() => {
    if (open && promptRef.current) {
      promptRef.current.textContent = item?.prompt || '';
    }
  }, [open, item]);

  const isAdd = !item;
  const canSave = name.trim().length > 0;

  const handleSave = () => {
    if (!canSave) return;
    onSave({ icon, name: name.trim(), prompt: prompt.trim() || `请${name.trim()}：` });
    onClose();
  };

  const handlePromptInput = () => {
    if (promptRef.current) {
      setPrompt(promptRef.current.textContent || '');
    }
  };

  if (!open) return null;

  return (
    <motion.div
      initial={{ x: '100%', opacity: 0.8 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0.8 }}
      transition={{ type: 'spring', damping: 28, stiffness: 320 }}
      className="settings-panel w-[280px] z-[var(--z-dropdown)]"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/30 flex-shrink-0">
        <div className="flex items-center gap-2">
          {isAdd ? <Plus size={14} className="text-cherry-primary" /> : <Pencil size={14} className="text-muted-foreground/60" />}
          <Typography variant="subtitle">
            {isAdd ? '添加功能' : '编辑功能'}
          </Typography>
        </div>
        <Button variant="ghost" size="icon-xs" onClick={onClose} className="text-muted-foreground/40 hover:text-foreground">
          <X size={14} />
        </Button>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 scrollbar-thin">
        {/* Icon + Name */}
        <div>
          <p className="text-xs text-muted-foreground/60 mb-2 font-medium">图标和名称</p>
          <div className="flex items-center gap-2.5">
            <IconPicker value={icon} onChange={setIcon} />
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              className="flex-1 bg-muted/50 border border-border/50 rounded-xl px-3 py-[8px] text-xs text-foreground focus:border-cherry-primary/30"
              placeholder="功能名称"
              autoFocus
              onKeyDown={e => { if (e.key === 'Enter' && canSave) handleSave(); if (e.key === 'Escape') onClose(); }}
            />
          </div>
        </div>

        {/* Prompt */}
        <div>
          <p className="text-xs text-muted-foreground/60 mb-2 font-medium">提示词模板</p>
          <div
            ref={promptRef}
            contentEditable
            onInput={handlePromptInput}
            data-placeholder={'可选，例如：请将以下文本翻译为中文：{{text}}'}
            className="w-full bg-muted/50 border border-border/50 rounded-xl px-3 py-[8px] text-xs text-muted-foreground/60 outline-none focus:border-cherry-primary/30 transition-colors min-h-[120px] whitespace-pre-wrap break-words empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/50"
          />
          <p className="text-xs text-muted-foreground/50 mt-1.5">{'使用 {{text}} 代表用户选中的文本'}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-2 px-5 py-3.5 border-t border-border/30 flex-shrink-0">
        <Button variant="ghost" size="xs" onClick={onClose} className="text-muted-foreground/60 hover:text-foreground">
          取消
        </Button>
        <Button
          size="xs"
          onClick={handleSave}
          disabled={!canSave}
          className={`text-white ${
            canSave ? 'bg-cherry-primary hover:bg-cherry-primary-dark' : 'bg-foreground/15 cursor-not-allowed'
          }`}
        >
          {isAdd ? '添加' : '保存'}
        </Button>
      </div>
    </motion.div>
  );
}

// ===========================
// Panel: Trigger & Display
// ===========================
function TriggerPanel({ disabled, enabledItems, compact, setCompact }: {
  disabled: boolean;
  enabledItems: MenuItem[];
  compact: boolean;
  setCompact: (v: boolean) => void;
}) {
  const [triggerMode, setTriggerMode] = useState('instant');
  const [followToolbar, setFollowToolbar] = useState(true);
  const [autoClose, setAutoClose] = useState(true);

  return (
    <div className={`space-y-3 ${disabled ? 'opacity-30 pointer-events-none' : ''}`}>
      <div className="mb-1">
        <Typography variant="subtitle">触发与显示</Typography>
        <p className="text-xs text-muted-foreground/40 mt-1">配置划词工具栏的唤起方式和窗口行为。</p>
      </div>

      {/* Toolbar preview */}
      <SectionCard className="!px-4 !py-3">
        <SectionHeader title="工具栏预览" />
        <div className="bg-muted/30 border border-border/50 rounded-xl overflow-hidden px-2.5 py-2 mb-2">
          {enabledItems.length > 0 ? (
            <div className="flex items-center gap-0.5">
              {enabledItems.map((item, i) => {
                const Icon = getActionIcon(item.icon);
                if (compact) {
                  return (
                    <Tooltip key={item.id} content={item.name} side="bottom">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-default ${
                          i === 0 ? 'bg-muted/50' : 'hover:bg-accent/50'
                        }`}
                      >
                        <Icon size={13} className={`${i === 0 ? 'text-muted-foreground' : 'text-muted-foreground/40'}`} />
                      </div>
                    </Tooltip>
                  );
                }
                return (
                  <div
                    key={item.id}
                    className={`flex items-center gap-1.5 px-2.5 py-[5px] rounded-lg transition-colors ${
                      i === 0 ? 'bg-muted/50' : ''
                    }`}
                  >
                    <Icon size={11} className={`flex-shrink-0 ${i === 0 ? 'text-muted-foreground/60' : 'text-muted-foreground/40'}`} />
                    <span className={`text-xs ${i === 0 ? 'text-muted-foreground font-medium' : 'text-muted-foreground/40 font-normal'}`}>
                      {item.name}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-2 text-center">
              <p className="text-xs text-muted-foreground/40">暂无启用的功能</p>
            </div>
          )}
        </div>
      </SectionCard>

      <SectionCard>
        <div className="px-1">
          <SectionHeader title="工具栏行为" />
          <FormRow label="取词方式" desc="决定划词后如何唤起工具栏。">
            <Tabs value={triggerMode} onValueChange={setTriggerMode}>
              <TabsList>
                <TabsTrigger value="instant">划词即现</TabsTrigger>
                <TabsTrigger value="hotkey">按住快捷键</TabsTrigger>
              </TabsList>
            </Tabs>
          </FormRow>
          <FormRow label="紧凑模式" desc="仅显示图标，不显示文字标签，节省屏幕空间。">
            <Switch size="sm" checked={compact} onCheckedChange={setCompact} />
          </FormRow>
        </div>
      </SectionCard>

      <SectionCard>
        <div className="px-1">
          <SectionHeader title="功能窗口" />
          <FormRow label="跟随工具栏" desc="窗口位置将跟随工具栏显示，禁用则在初始位置显示。">
            <Switch size="sm" checked={followToolbar} onCheckedChange={setFollowToolbar} />
          </FormRow>
          <FormRow label="自动关闭" desc="当窗口失去焦点时自动关闭。">
            <Switch size="sm" checked={autoClose} onCheckedChange={setAutoClose} />
          </FormRow>
        </div>
      </SectionCard>
    </div>
  );
}

// ===========================
// Panel: Function Menu (inline list + sidebar edit)
// ===========================
function MenuPanel({ disabled, showFormPanel, setShowFormPanel, editingItem, setEditingItem, items, setItems }: {
  disabled: boolean;
  showFormPanel: boolean;
  setShowFormPanel: (v: boolean) => void;
  editingItem: MenuItem | null;
  setEditingItem: (v: MenuItem | null) => void;
  items: MenuItem[];
  setItems: React.Dispatch<React.SetStateAction<MenuItem[]>>;
}) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleToggle = (id: string, val: boolean) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, enabled: val } : i));
  };

  const handleDelete = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
    setConfirmDeleteId(null);
  };

  const openAdd = () => {
    setEditingItem(null);
    setShowFormPanel(true);
  };

  const openEdit = (item: MenuItem) => {
    setEditingItem(item);
    setShowFormPanel(true);
  };

  const handleSaveForm = (data: { name: string; icon: string; prompt: string }) => {
    if (editingItem) {
      setItems(prev => prev.map(i => i.id === editingItem.id ? { ...i, ...data } : i));
    } else {
      setItems(prev => [...prev, {
        id: `custom-${Date.now()}`,
        name: data.name,
        icon: data.icon,
        prompt: data.prompt,
        enabled: true,
      }]);
    }
  };

  const enabledItems = items.filter(i => i.enabled);

  return (
    <div className={`space-y-3 ${disabled ? 'opacity-30 pointer-events-none' : ''}`}>
      <div className="mb-1">
        <Typography variant="subtitle">功能菜单</Typography>
        <p className="text-xs text-muted-foreground/40 mt-1">管理划词工具栏上的功能按钮，点击编辑或添加自定义功能。</p>
      </div>

      {/* Function list */}
      <SectionCard className="!px-3 !py-2">
        <div className="flex items-center justify-between px-2 py-2">
          <div className="flex items-center gap-1.5">
            <h4 className="text-sm text-foreground font-medium">功能列表</h4>
            <span className="text-xs text-muted-foreground/40 bg-muted/50 px-1.5 py-[1px] rounded-md">{items.length}</span>
          </div>
          <Button variant="ghost" size="icon-xs" onClick={openAdd} className="text-cherry-primary hover:bg-cherry-active-bg" title="添加功能">
            <Plus size={13} />
          </Button>
        </div>

        <div className="pb-1">
          {items.map(item => {
            const Icon = getActionIcon(item.icon);
            const isDeleting = confirmDeleteId === item.id;
            return (
              <div
                key={item.id}
                className={`group flex items-center gap-2.5 px-3 py-[8px] rounded-xl transition-colors hover:bg-accent/50 ${
                  !item.enabled ? 'opacity-40' : ''
                }`}
              >
                <Icon size={13} className="text-muted-foreground/60 flex-shrink-0" />
                <span className="text-sm text-muted-foreground flex-1 truncate">{item.name}</span>

                {/* Hover actions */}
                <div className="flex items-center gap-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  {isDeleting ? (
                    <div className="flex items-center gap-0.5">
                      <Button variant="ghost" size="icon-xs" onClick={() => handleDelete(item.id)} className="text-destructive hover:bg-destructive/10" title="确认删除">
                        <Check size={10} />
                      </Button>
                      <Button variant="ghost" size="icon-xs" onClick={() => setConfirmDeleteId(null)} className="text-muted-foreground/40 hover:text-foreground" title="取消">
                        <X size={9} />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-0.5">
                      <Button variant="ghost" size="icon-xs" onClick={() => openEdit(item)} className="text-muted-foreground/50 hover:text-foreground" title="编辑">
                        <Pencil size={10} />
                      </Button>
                      <Button variant="ghost" size="icon-xs" onClick={() => setConfirmDeleteId(item.id)} className="text-muted-foreground/50 hover:text-destructive hover:bg-destructive/[0.06]" title="删除">
                        <Trash2 size={10} />
                      </Button>
                    </div>
                  )}
                </div>

                <Switch size="sm" checked={item.enabled} onCheckedChange={v => handleToggle(item.id, v)} />
              </div>
            );
          })}

          {items.length === 0 && (
            <div className="py-6 text-center">
              <Layers size={18} className="text-muted-foreground/40 mx-auto mb-1.5" />
              <p className="text-xs text-muted-foreground/40">暂无功能</p>
              <Button variant="ghost" size="xs" onClick={openAdd} className="mt-2 text-xs text-cherry-primary hover:bg-cherry-active-bg mx-auto">
                <Plus size={11} />
                <span>添加第一个功能</span>
              </Button>
            </div>
          )}
        </div>

        {/* Hint */}
        <div className="flex items-start gap-1.5 px-3 py-2.5 border-t border-border/30">
          <CircleHelp size={9} className="text-muted-foreground/40 mt-[1px] flex-shrink-0" />
          <p className="text-xs text-muted-foreground/50 leading-relaxed">
            功能按顺序显示在划词工具栏中。Hover 行可编辑或删除。
          </p>
        </div>
      </SectionCard>
    </div>
  );
}

// ===========================
// Panel: Rules & Filtering
// ===========================
function RulesPanel({ disabled }: { disabled: boolean }) {
  const [filterMode, setFilterMode] = useState('blacklist');
  const [blacklist, setBlacklist] = useState<string[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [minLen, setMinLen] = useState('2');
  const [excludeCode, setExcludeCode] = useState(false);

  const handleAdd = () => {
    if (!inputVal.trim() || blacklist.includes(inputVal.trim())) return;
    setBlacklist(prev => [...prev, inputVal.trim()]);
    setInputVal('');
  };

  const handleRemove = (app: string) => {
    setBlacklist(prev => prev.filter(a => a !== app));
  };

  const listLabel = filterMode === 'blacklist' ? '黑名单' : '白名单';

  return (
    <div className={`space-y-3 ${disabled ? 'opacity-30 pointer-events-none' : ''}`}>
      <div className="mb-1">
        <Typography variant="subtitle">规则与过滤</Typography>
        <p className="text-xs text-muted-foreground/40 mt-1">控制划词助手在哪些应用中生效，以及文本过滤条件。</p>
      </div>

      <SectionCard>
        <div className="px-1">
          <SectionHeader title="应用筛选" />
          <FormRow label="模式选择" desc="决定划词助手生效的应用范围。">
            <Tabs value={filterMode} onValueChange={setFilterMode}>
              <TabsList>
                <TabsTrigger value="all">全部应用</TabsTrigger>
                <TabsTrigger value="blacklist">黑名单</TabsTrigger>
                <TabsTrigger value="whitelist">白名单</TabsTrigger>
              </TabsList>
            </Tabs>
          </FormRow>
        </div>

        {filterMode !== 'all' && (
          <div className="px-1 pb-3">
            <div className="flex items-center gap-2 mb-2 mt-1">
              <div className="flex-1 flex items-center px-3 py-[6px] bg-muted/30 rounded-lg border border-dashed border-border/50">
                <Input
                  value={inputVal}
                  onChange={e => setInputVal(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAdd()}
                  placeholder={`添加应用到${listLabel}...`}
                  className="flex-1 bg-transparent text-xs text-muted-foreground placeholder:text-muted-foreground/60 min-w-0 border-0 h-auto p-0 focus-visible:ring-0"
                />
              </div>
              {inputVal.trim() && (
                <Button size="xs" onClick={handleAdd} className="flex-shrink-0">
                  添加
                </Button>
              )}
            </div>

            {blacklist.length > 0 ? (
              <div className="space-y-1">
                {blacklist.map(app => (
                  <div key={app} className="flex items-center justify-between px-3 py-[6px] bg-muted/30 rounded-lg border border-border/50">
                    <span className="text-xs text-muted-foreground">{app}</span>
                    <Button variant="ghost" size="icon-xs" onClick={() => handleRemove(app)} className="text-muted-foreground/50 hover:text-destructive/60">
                      <X size={9} />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-4 text-center border border-dashed border-border/50 rounded-lg">
                <p className="text-xs text-muted-foreground/40">{listLabel}为空</p>
                <p className="text-xs text-muted-foreground/40 mt-0.5">输入应用名称后按 Enter 添加</p>
              </div>
            )}
          </div>
        )}
      </SectionCard>

      <SectionCard>
        <div className="px-1">
          <SectionHeader title="文本过滤" />
          <FormRow label="最少选中字符" desc="低于该字数时不触发划词工具栏。">
            <div className="w-[60px]">
              <Input
                value={minLen}
                onChange={e => setMinLen(e.target.value)}
                className="w-full px-2.5 py-[5px] bg-muted/30 rounded-lg border border-border/50 text-xs text-muted-foreground text-center min-w-0 font-mono h-auto"
              />
            </div>
          </FormRow>
          <FormRow label="排除代码块" desc="在 IDE 或代码编辑器中选中代码时不触发。">
            <Switch size="sm" checked={excludeCode} onCheckedChange={setExcludeCode} />
          </FormRow>
        </div>
      </SectionCard>
    </div>
  );
}

// ===========================
// Main: SelectionAssistantPage
// ===========================
export function SelectionAssistantPage() {
  const [selectedId, setSelectedId] = useState<SubPage>('trigger');
  const [masterEnabled, setMasterEnabled] = useState(true);
  const [compact, setCompact] = useState(true);

  // Menu items state lifted here so sidebar panel can overlay correctly
  const [items, setItems] = useState<MenuItem[]>(INITIAL_MENU_ITEMS);
  const [showFormPanel, setShowFormPanel] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  const enabledItems = items.filter(i => i.enabled);

  const renderPanel = () => {
    switch (selectedId) {
      case 'trigger': return <TriggerPanel disabled={!masterEnabled} enabledItems={enabledItems} compact={compact} setCompact={setCompact} />;
      case 'menu': return (
        <MenuPanel
          disabled={!masterEnabled}
          showFormPanel={showFormPanel}
          setShowFormPanel={setShowFormPanel}
          editingItem={editingItem}
          setEditingItem={setEditingItem}
          items={items}
          setItems={setItems}
        />
      );
      case 'rules': return <RulesPanel disabled={!masterEnabled} />;
      default: return null;
    }
  };

  return (
    <div className="relative flex h-full min-h-0">
      {/* Left nav */}
      <div className={`w-[160px] flex-shrink-0 flex flex-col border-r border-border/30 min-h-0 transition-opacity duration-200 ${showFormPanel ? 'opacity-40 pointer-events-none' : ''}`}>
        <div className="px-3.5 pt-4 pb-2 flex items-center justify-between flex-shrink-0">
          <p className="text-xs text-muted-foreground/60 font-medium">划词助手</p>
          <Switch size="sm" checked={masterEnabled} onCheckedChange={setMasterEnabled} />
        </div>

        <div className="flex-1 overflow-y-auto px-2.5 pb-3 scrollbar-thin-xs">
          <div className="space-y-[2px]">
            {NAV_ITEMS.map(item => {
              const isSelected = selectedId === item.id;
              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedId(item.id);
                    setShowFormPanel(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-[8px] h-auto rounded-xl transition-all text-left relative ${
                    isSelected
                      ? 'bg-cherry-active-bg'
                      : 'border border-transparent hover:bg-accent/50'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute inset-0 rounded-xl border border-cherry-active-border pointer-events-none" />
                  )}
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className={`flex-shrink-0 ${isSelected ? 'text-muted-foreground/60' : item.iconColor}`}>{item.icon}</span>
                    <span className={`text-sm truncate ${isSelected ? 'text-foreground font-medium' : 'text-muted-foreground font-normal'}`}>
                      {item.label}
                    </span>
                  </div>
                  <ChevronRight size={9} className={`flex-shrink-0 ${isSelected ? 'text-muted-foreground/40' : 'text-muted-foreground/50'}`} />
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right content */}
      <div className={`flex-1 flex flex-col min-w-0 min-h-0 transition-opacity duration-200 ${showFormPanel ? 'opacity-40 pointer-events-none' : ''}`}>
        <div className="flex-1 overflow-y-auto px-6 py-5 scrollbar-thin">
          {renderPanel()}
        </div>
      </div>

      {/* Sidebar edit panel rendered at page level for correct positioning */}
      {selectedId === 'menu' && (
        <EditFormPanel
          open={showFormPanel}
          onClose={() => setShowFormPanel(false)}
          item={editingItem}
          onSave={(data) => {
            if (editingItem) {
              setItems(prev => prev.map(i => i.id === editingItem.id ? { ...i, ...data } : i));
            } else {
              setItems(prev => [...prev, {
                id: `custom-${Date.now()}`,
                name: data.name,
                icon: data.icon,
                prompt: data.prompt,
                enabled: true,
              }]);
            }
          }}
        />
      )}
    </div>
  );
}
