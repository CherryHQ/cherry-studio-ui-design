import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Tooltip } from '@/app/components/Tooltip';
import { Toggle } from './shared';
import {
  Zap, Scissors, ShieldAlert, Languages, Search, FileText,
  Sparkles, Plus, Pencil, ChevronRight, Info,
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
// Shared local UI
// ===========================
function SegmentedControl({ value, options, onChange, disabled }: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className={`flex bg-foreground/[0.04] rounded-lg p-[2px] border border-foreground/[0.06] ${disabled ? 'opacity-40 pointer-events-none' : ''}`}>
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-3 py-[4px] rounded-md text-[10px] transition-all duration-150 ${
            value === opt.value
              ? 'bg-cherry-primary text-white shadow-sm border border-cherry-primary'
              : 'text-foreground/40 hover:text-foreground/55 border border-transparent'
          }`}
          style={{ fontWeight: value === opt.value ? 500 : 400 }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function FormRow({ label, desc, children, disabled }: {
  label: string; desc?: string; children: React.ReactNode; disabled?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between gap-4 py-[5px] ${disabled ? 'opacity-40' : ''}`}>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="text-[11px] text-foreground/75" style={{ fontWeight: 400 }}>{label}</p>
          {desc && (
            <Tooltip content={desc} side="top">
              <span className="text-muted-foreground/25 hover:text-muted-foreground/50 transition-colors cursor-help flex-shrink-0">
                <Info size={11} />
              </span>
            </Tooltip>
          )}
        </div>
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <h4 className="text-[12px] text-foreground/70 mb-2" style={{ fontWeight: 500 }}>{title}</h4>;
}

function SectionCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-foreground/[0.03] border border-foreground/[0.06] rounded-2xl px-5 py-1 ${className || ''}`}>
      {children}
    </div>
  );
}

// ===========================
// Icon Picker
// ===========================
function IconPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const CurrentIcon = getActionIcon(value);

  useEffect(() => {
    if (!show) return;
    const h = (e: MouseEvent) => {
      if (ref.current?.contains(e.target as Node)) return;
      setShow(false);
    };
    setTimeout(() => document.addEventListener('mousedown', h), 0);
    return () => document.removeEventListener('mousedown', h);
  }, [show]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setShow(!show)}
        className="w-9 h-9 rounded-xl bg-foreground/[0.06] hover:bg-foreground/[0.1] flex items-center justify-center transition-colors flex-shrink-0"
      >
        <CurrentIcon size={16} className="text-foreground/50" />
      </button>
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 400 }}
            className="absolute top-full left-0 mt-1 bg-popover border border-border/60 rounded-xl shadow-2xl p-2 z-50 grid grid-cols-4 gap-1 w-[140px]"
          >
            {ICON_OPTIONS.map(opt => {
              const Icon = getActionIcon(opt.value);
              return (
                <button
                  key={opt.value}
                  onClick={() => { onChange(opt.value); setShow(false); }}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                    value === opt.value ? 'bg-cherry-active-bg text-cherry-primary' : 'text-foreground/40 hover:bg-foreground/[0.06] hover:text-foreground/60'
                  }`}
                  title={opt.label}
                >
                  <Icon size={13} />
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
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
  { id: 'trigger', label: '触发与显示', icon: <Zap size={13} />, iconColor: 'text-amber-400' },
  { id: 'menu', label: '功能菜单', icon: <Scissors size={13} />, iconColor: 'text-foreground/40' },
  { id: 'rules', label: '规则与过滤', icon: <ShieldAlert size={13} />, iconColor: 'text-red-400' },
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
      className="absolute inset-y-2 right-2 w-[280px] bg-background rounded-2xl shadow-2xl border border-border/50 flex flex-col overflow-hidden z-50"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-foreground/[0.06] flex-shrink-0">
        <div className="flex items-center gap-2">
          {isAdd ? <Plus size={14} className="text-cherry-primary" /> : <Pencil size={14} className="text-foreground/50" />}
          <h3 className="text-[13px] text-foreground/90" style={{ fontWeight: 500 }}>
            {isAdd ? '添加功能' : '编辑功能'}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="w-6 h-6 rounded-lg flex items-center justify-center text-foreground/35 hover:text-foreground/70 hover:bg-foreground/[0.06] transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:bg-border/20">
        {/* Icon + Name */}
        <div>
          <p className="text-[10px] text-foreground/40 mb-2" style={{ fontWeight: 500 }}>图标和名称</p>
          <div className="flex items-center gap-2.5">
            <IconPicker value={icon} onChange={setIcon} />
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              className="flex-1 bg-foreground/[0.05] border border-foreground/[0.08] rounded-xl px-3 py-[8px] text-[11px] text-foreground/70 outline-none focus:border-cherry-primary/30 transition-colors"
              placeholder="功能名称"
              autoFocus
              onKeyDown={e => { if (e.key === 'Enter' && canSave) handleSave(); if (e.key === 'Escape') onClose(); }}
            />
          </div>
        </div>

        {/* Prompt */}
        <div>
          <p className="text-[10px] text-foreground/40 mb-2" style={{ fontWeight: 500 }}>提示词模板</p>
          <div
            ref={promptRef}
            contentEditable
            onInput={handlePromptInput}
            data-placeholder={'可选，例如：请将以下文本翻译为中文：{{text}}'}
            className="w-full bg-foreground/[0.05] border border-foreground/[0.08] rounded-xl px-3 py-[8px] text-[11px] text-foreground/50 outline-none focus:border-cherry-primary/30 transition-colors min-h-[120px] whitespace-pre-wrap break-words empty:before:content-[attr(data-placeholder)] empty:before:text-foreground/15"
          />
          <p className="text-[9px] text-foreground/20 mt-1.5">{'使用 {{text}} 代表用户选中的文本'}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-2 px-5 py-3.5 border-t border-foreground/[0.06] flex-shrink-0">
        <button
          onClick={onClose}
          className="px-4 py-[5px] rounded-lg text-[11px] text-foreground/40 hover:text-foreground/60 hover:bg-foreground/[0.05] transition-colors"
        >
          取消
        </button>
        <button
          onClick={handleSave}
          disabled={!canSave}
          className={`px-4 py-[5px] rounded-lg text-[11px] text-white transition-colors ${
            canSave ? 'bg-cherry-primary hover:bg-cherry-primary-dark' : 'bg-foreground/15 cursor-not-allowed'
          }`}
        >
          {isAdd ? '添加' : '保存'}
        </button>
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
    <div className={`space-y-3 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="mb-1">
        <h3 className="text-[13px] text-foreground/90" style={{ fontWeight: 500 }}>触发与显示</h3>
        <p className="text-[10px] text-foreground/35 mt-1">配置划词工具栏的唤起方式和窗口行为。</p>
      </div>

      {/* Toolbar preview */}
      <SectionCard className="!px-4 !py-3">
        <SectionHeader title="工具栏预览" />
        <div className="bg-foreground/[0.03] border border-foreground/[0.06] rounded-xl overflow-hidden px-2.5 py-2 mb-2">
          {enabledItems.length > 0 ? (
            <div className="flex items-center gap-0.5">
              {enabledItems.map((item, i) => {
                const Icon = getActionIcon(item.icon);
                if (compact) {
                  return (
                    <Tooltip key={item.id} content={item.name} side="bottom">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-default ${
                          i === 0 ? 'bg-foreground/[0.06]' : 'hover:bg-foreground/[0.04]'
                        }`}
                      >
                        <Icon size={13} className={`${i === 0 ? 'text-foreground/55' : 'text-foreground/30'}`} />
                      </div>
                    </Tooltip>
                  );
                }
                return (
                  <div
                    key={item.id}
                    className={`flex items-center gap-1.5 px-2.5 py-[5px] rounded-lg transition-colors ${
                      i === 0 ? 'bg-foreground/[0.06]' : ''
                    }`}
                  >
                    <Icon size={11} className={`flex-shrink-0 ${i === 0 ? 'text-foreground/50' : 'text-foreground/25'}`} />
                    <span className={`text-[10px] ${i === 0 ? 'text-foreground/65' : 'text-foreground/35'}`} style={{ fontWeight: i === 0 ? 500 : 400 }}>
                      {item.name}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-2 text-center">
              <p className="text-[10px] text-foreground/20">暂无启用的功能</p>
            </div>
          )}
        </div>
      </SectionCard>

      <SectionCard>
        <div className="px-1">
          <SectionHeader title="工具栏行为" />
          <FormRow label="取词方式" desc="决定划词后如何唤起工具栏。">
            <SegmentedControl
              value={triggerMode}
              onChange={setTriggerMode}
              options={[
                { value: 'instant', label: '划词即现' },
                { value: 'hotkey', label: '按住快捷键' },
              ]}
            />
          </FormRow>
          <FormRow label="紧凑模式" desc="仅显示图标，不显示文字标签，节省屏幕空间。">
            <Toggle checked={compact} onChange={setCompact} />
          </FormRow>
        </div>
      </SectionCard>

      <SectionCard>
        <div className="px-1">
          <SectionHeader title="功能窗口" />
          <FormRow label="跟随工具栏" desc="窗口位置将跟随工具栏显示，禁用则在初始位置显示。">
            <Toggle checked={followToolbar} onChange={setFollowToolbar} />
          </FormRow>
          <FormRow label="自动关闭" desc="当窗口失去焦点时自动关闭。">
            <Toggle checked={autoClose} onChange={setAutoClose} />
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
    <div className={`space-y-3 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="mb-1">
        <h3 className="text-[13px] text-foreground/90" style={{ fontWeight: 500 }}>功能菜单</h3>
        <p className="text-[10px] text-foreground/35 mt-1">管理划词工具栏上的功能按钮，点击编辑或添加自定义功能。</p>
      </div>

      {/* Function list */}
      <SectionCard className="!px-3 !py-2">
        <div className="flex items-center justify-between px-2 py-2">
          <div className="flex items-center gap-1.5">
            <h4 className="text-[12px] text-foreground/70" style={{ fontWeight: 500 }}>功能列表</h4>
            <span className="text-[9px] text-foreground/25 bg-foreground/[0.04] px-1.5 py-[1px] rounded-md">{items.length}</span>
          </div>
          <button
            onClick={openAdd}
            className="w-6 h-6 rounded-lg flex items-center justify-center text-cherry-primary hover:bg-cherry-active-bg transition-colors"
            title="添加功能"
          >
            <Plus size={13} />
          </button>
        </div>

        <div className="pb-1">
          {items.map(item => {
            const Icon = getActionIcon(item.icon);
            const isDeleting = confirmDeleteId === item.id;
            return (
              <div
                key={item.id}
                className={`group flex items-center gap-2.5 px-3 py-[8px] rounded-xl transition-colors hover:bg-foreground/[0.03] ${
                  !item.enabled ? 'opacity-40' : ''
                }`}
              >
                <Icon size={13} className="text-foreground/40 flex-shrink-0" />
                <span className="text-[11px] text-foreground/65 flex-1 truncate">{item.name}</span>

                {/* Hover actions */}
                <div className="flex items-center gap-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  {isDeleting ? (
                    <div className="flex items-center gap-0.5">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="w-5 h-5 rounded-md flex items-center justify-center text-red-400 hover:bg-red-500/10 transition-colors"
                        title="确认删除"
                      >
                        <Check size={10} />
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="w-5 h-5 rounded-md flex items-center justify-center text-foreground/25 hover:text-foreground/50 hover:bg-foreground/[0.06] transition-colors"
                        title="取消"
                      >
                        <X size={9} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-0.5">
                      <button
                        onClick={() => openEdit(item)}
                        className="w-5 h-5 rounded-md flex items-center justify-center text-foreground/20 hover:text-foreground/50 hover:bg-foreground/[0.06] transition-colors"
                        title="编辑"
                      >
                        <Pencil size={10} />
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(item.id)}
                        className="w-5 h-5 rounded-md flex items-center justify-center text-foreground/20 hover:text-red-400 hover:bg-red-500/[0.06] transition-colors"
                        title="删除"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  )}
                </div>

                <Toggle checked={item.enabled} onChange={v => handleToggle(item.id, v)} />
              </div>
            );
          })}

          {items.length === 0 && (
            <div className="py-6 text-center">
              <Layers size={18} className="text-foreground/10 mx-auto mb-1.5" />
              <p className="text-[10px] text-foreground/25">暂无功能</p>
              <button
                onClick={openAdd}
                className="mt-2 flex items-center gap-1 px-3 py-[4px] rounded-lg text-[10px] text-cherry-primary hover:bg-cherry-active-bg transition-colors mx-auto"
              >
                <Plus size={11} />
                <span>添加第一个功能</span>
              </button>
            </div>
          )}
        </div>

        {/* Hint */}
        <div className="flex items-start gap-1.5 px-3 py-2.5 border-t border-foreground/[0.04]">
          <CircleHelp size={9} className="text-foreground/15 mt-[1px] flex-shrink-0" />
          <p className="text-[9px] text-foreground/20 leading-relaxed">
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
    <div className={`space-y-3 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="mb-1">
        <h3 className="text-[13px] text-foreground/90" style={{ fontWeight: 500 }}>规则与过滤</h3>
        <p className="text-[10px] text-foreground/35 mt-1">控制划词助手在哪些应用中生效，以及文本过滤条件。</p>
      </div>

      <SectionCard>
        <div className="px-1">
          <SectionHeader title="应用筛选" />
          <FormRow label="模式选择" desc="决定划词助手生效的应用范围。">
            <SegmentedControl
              value={filterMode}
              onChange={setFilterMode}
              options={[
                { value: 'all', label: '全部应用' },
                { value: 'blacklist', label: '黑名单' },
                { value: 'whitelist', label: '白名单' },
              ]}
            />
          </FormRow>
        </div>

        {filterMode !== 'all' && (
          <div className="px-1 pb-3">
            <div className="flex items-center gap-2 mb-2 mt-1">
              <div className="flex-1 flex items-center px-3 py-[6px] bg-foreground/[0.03] rounded-lg border border-dashed border-foreground/[0.1]">
                <input
                  value={inputVal}
                  onChange={e => setInputVal(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAdd()}
                  placeholder={`添加应用到${listLabel}...`}
                  className="flex-1 bg-transparent text-[10px] text-foreground/60 outline-none placeholder:text-foreground/20 min-w-0"
                />
              </div>
              {inputVal.trim() && (
                <button
                  onClick={handleAdd}
                  className="px-2.5 py-[5px] rounded-lg bg-cherry-primary text-white text-[10px] hover:bg-cherry-primary-dark transition-colors flex-shrink-0"
                >
                  添加
                </button>
              )}
            </div>

            {blacklist.length > 0 ? (
              <div className="space-y-1">
                {blacklist.map(app => (
                  <div key={app} className="flex items-center justify-between px-3 py-[6px] bg-foreground/[0.02] rounded-lg border border-foreground/[0.04]">
                    <span className="text-[10px] text-foreground/55">{app}</span>
                    <button
                      onClick={() => handleRemove(app)}
                      className="p-0.5 rounded text-foreground/15 hover:text-red-500/60 transition-colors"
                    >
                      <X size={9} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-4 text-center border border-dashed border-foreground/[0.06] rounded-lg">
                <p className="text-[10px] text-foreground/20">{listLabel}为空</p>
                <p className="text-[9px] text-foreground/12 mt-0.5">输入应用名称后按 Enter 添加</p>
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
              <input
                value={minLen}
                onChange={e => setMinLen(e.target.value)}
                className="w-full px-2.5 py-[5px] bg-foreground/[0.03] rounded-lg border border-foreground/[0.06] text-[10px] text-foreground/60 outline-none text-center min-w-0"
                style={{ fontFamily: 'ui-monospace, monospace' }}
              />
            </div>
          </FormRow>
          <FormRow label="排除代码块" desc="在 IDE 或代码编辑器中选中代码时不触发。">
            <Toggle checked={excludeCode} onChange={setExcludeCode} />
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
      <div className={`w-[160px] flex-shrink-0 flex flex-col border-r border-foreground/[0.05] min-h-0 transition-opacity duration-200 ${showFormPanel ? 'opacity-40 pointer-events-none' : ''}`}>
        <div className="px-3.5 pt-4 pb-2 flex items-center justify-between flex-shrink-0">
          <p className="text-[11px] text-foreground/40" style={{ fontWeight: 500 }}>划词助手</p>
          <Toggle checked={masterEnabled} onChange={setMasterEnabled} />
        </div>

        <div className="flex-1 overflow-y-auto px-2.5 pb-3 [&::-webkit-scrollbar]:w-[2px] [&::-webkit-scrollbar-thumb]:bg-border/20">
          <div className="space-y-[2px]">
            {NAV_ITEMS.map(item => {
              const isSelected = selectedId === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setSelectedId(item.id);
                    setShowFormPanel(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-[8px] rounded-xl transition-all text-left relative ${
                    isSelected
                      ? 'bg-cherry-active-bg'
                      : 'border border-transparent hover:bg-foreground/[0.03]'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute inset-0 rounded-xl border border-cherry-active-border pointer-events-none" />
                  )}
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className={`flex-shrink-0 ${isSelected ? 'text-foreground/50' : item.iconColor}`}>{item.icon}</span>
                    <span className={`text-[10px] truncate ${isSelected ? 'text-foreground/85' : 'text-foreground/55'}`} style={{ fontWeight: isSelected ? 500 : 400 }}>
                      {item.label}
                    </span>
                  </div>
                  <ChevronRight size={9} className={`flex-shrink-0 ${isSelected ? 'text-foreground/25' : 'text-foreground/10'}`} />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right content */}
      <div className={`flex-1 flex flex-col min-w-0 min-h-0 transition-opacity duration-200 ${showFormPanel ? 'opacity-40 pointer-events-none' : ''}`}>
        <div className="flex-1 overflow-y-auto px-6 py-5 [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:bg-border/20">
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
