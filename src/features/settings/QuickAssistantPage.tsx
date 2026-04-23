import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Settings2, Cpu, ClipboardPaste, ChevronRight, ChevronDown, Check,
  MessageCircle, FileText, Sparkles, Info, Lightbulb,
  Plus, Trash2, Pencil, X, CornerDownLeft,
  Languages, ListChecks, Search, Wand2, Code2, BookOpen,
  CircleHelp, AtSign, Layers, Bot, Link2,
} from 'lucide-react';
import { Tooltip } from '@/app/components/Tooltip';
import { Button, Input, Textarea, Popover, PopoverTrigger, PopoverContent, Typography, Switch } from '@cherry-studio/ui';
import { FormRow, SectionHeader, SectionCard, Tabs, TabsList, TabsTrigger } from './shared';

// ===========================
// Types
// ===========================
type SubPage = 'general' | 'model' | 'context';

interface QuickAction {
  id: string;
  icon: string;
  label: string;
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
  return ACTION_ICON_MAP[iconKey] || MessageCircle;
}

// ===========================
// Default actions
// ===========================
const DEFAULT_ACTIONS: QuickAction[] = [
  { id: 'answer', icon: 'message-circle', label: '回答此问题', prompt: '请回答以下问题：', enabled: true },
  { id: 'translate', icon: 'languages', label: '文本翻译', prompt: '请将以下内容翻译为中文/英文：', enabled: true },
  { id: 'summarize', icon: 'file-text', label: '内容总结', prompt: '请总结以下内容的要点：', enabled: true },
  { id: 'explain', icon: 'lightbulb', label: '解释说明', prompt: '请用通俗易懂的语言解释以下内容：', enabled: true },
];


// ===========================
// AssistantPill
// ===========================
interface AssistantOption {
  value: string;
  label: string;
  icon: string;
  color: string;
  isDefault?: boolean;
}

const MOCK_ASSISTANTS: AssistantOption[] = [
  { value: 'default', label: '默认助手', icon: '✦', color: 'text-accent-emerald', isDefault: true },
  { value: 'mermaid', label: 'Mermaid 图表绘制专家', icon: '◆', color: 'text-accent-pink' },
  { value: 'translator', label: '翻译助手', icon: '◇', color: 'text-accent-indigo' },
  { value: 'wisdom', label: 'The Wisdom Alchemist V2', icon: '●', color: 'text-destructive' },
  { value: 'ztd', label: 'ZTD', icon: '◆', color: 'text-accent-blue' },
  { value: 'chatgpt', label: 'ChatGPT 导入', icon: '◆', color: 'text-accent-violet' },
  { value: 'coder', label: '代码助手', icon: '◇', color: 'text-accent-cyan' },
];

function AssistantPill({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });

  useEffect(() => {
    if (!open) return;
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) {
      setPos({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    }
    const h = (e: MouseEvent) => {
      if (triggerRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    setTimeout(() => document.addEventListener('mousedown', h), 0);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  const selected = MOCK_ASSISTANTS.find(a => a.value === value);

  return (
    <div className="min-w-0">
      <Button size="inline"
        ref={triggerRef}
        variant="ghost"
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 px-3 py-[6px] rounded-full bg-muted/50 hover:bg-accent/50 text-xs"
      >
        <span className={`text-xs flex-shrink-0 ${selected?.color}`}>{selected?.icon}</span>
        <span className="text-foreground truncate">{selected?.label || '选择助手'}</span>
        {selected?.isDefault && (
          <span className="text-xs text-cherry-primary flex-shrink-0">默认</span>
        )}
        <ChevronDown size={10} className={`text-muted-foreground/40 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </Button>

      {open && createPortal(
        <div
          className="popover-panel z-[var(--z-tooltip)]"
          style={{ top: pos.top, left: pos.left, width: Math.max(pos.width, 220) }}
          onMouseDown={e => e.stopPropagation()}
        >
          <div className="max-h-[220px] overflow-y-auto scrollbar-thin-xs">
            {MOCK_ASSISTANTS.map(a => (
              <Button size="inline"
                key={a.value}
                variant="ghost"
                onClick={() => { onChange(a.value); setOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-[6px] rounded-xl text-xs justify-start ${
                  value === a.value ? 'bg-muted/50' : 'hover:bg-accent/50'
                }`}
              >
                <span className={`text-xs flex-shrink-0 ${a.color}`}>{a.icon}</span>
                <span className="text-foreground truncate flex-1 text-left">{a.label}</span>
                {a.isDefault && <span className="text-xs text-cherry-primary flex-shrink-0">默认</span>}
                {value === a.value && <Check size={11} className="text-cherry-primary flex-shrink-0" />}
              </Button>
            ))}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

// ===========================
// Icon Picker (standalone)
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
// Actions Management Panel (floating, full management)
// ===========================
function ActionsManagePanel({ open, onClose, actions, setActions, onAdd, onEdit }: {
  open: boolean;
  onClose: () => void;
  actions: QuickAction[];
  setActions: React.Dispatch<React.SetStateAction<QuickAction[]>>;
  onAdd: () => void;
  onEdit: (action: QuickAction) => void;
}) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) setConfirmDeleteId(null);
  }, [open]);

  const toggleAction = (id: string) => {
    setActions(prev => prev.map(a =>
      a.id === id ? { ...a, enabled: !a.enabled } : a
    ));
  };

  const deleteAction = (id: string) => {
    setActions(prev => prev.filter(a => a.id !== id));
    setConfirmDeleteId(null);
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="absolute inset-0 z-[var(--z-popover)] flex">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-foreground/20"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%', opacity: 0.8 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0.8 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="settings-panel w-[300px]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/30 flex-shrink-0">
              <div className="flex items-center gap-2">
                <Layers size={14} className="text-muted-foreground/60" />
                <Typography variant="subtitle">功能管理</Typography>
                <span className="text-xs text-muted-foreground/40 bg-muted/50 px-1.5 py-[1px] rounded-md">{actions.length}</span>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon-xs" onClick={onAdd} className="text-cherry-primary hover:bg-cherry-active-bg" title="添加功能">
                  <Plus size={14} />
                </Button>
                <Button variant="ghost" size="icon-xs" onClick={onClose} className="text-muted-foreground/40 hover:text-foreground">
                  <X size={14} />
                </Button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-2 py-2 scrollbar-thin">
              {actions.map(action => {
                const Icon = getActionIcon(action.icon);
                const isConfirmDelete = confirmDeleteId === action.id;
                return (
                  <div
                    key={action.id}
                    className={`group flex items-center gap-2.5 px-3 py-[9px] rounded-xl transition-colors hover:bg-accent/50 ${
                      !action.enabled ? 'opacity-40' : ''
                    }`}
                  >
                    <Icon size={14} className="text-muted-foreground/60 flex-shrink-0" />
                    <span className="text-sm text-foreground flex-1 truncate">{action.label}</span>

                    {/* Hover actions: edit + delete */}
                    <div className="flex items-center gap-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon-xs" onClick={() => onEdit(action)} className="text-muted-foreground/50 hover:text-foreground" title="编辑">
                        <Pencil size={10} />
                      </Button>
                      {isConfirmDelete ? (
                        <div className="flex items-center gap-0.5">
                          <Button variant="ghost" size="icon-xs" onClick={() => deleteAction(action.id)} className="text-destructive hover:bg-destructive/10" title="确认删除">
                            <Check size={10} />
                          </Button>
                          <Button variant="ghost" size="icon-xs" onClick={() => setConfirmDeleteId(null)} className="text-muted-foreground/40 hover:text-foreground" title="取消">
                            <X size={9} />
                          </Button>
                        </div>
                      ) : (
                        <Button variant="ghost" size="icon-xs" onClick={() => setConfirmDeleteId(action.id)} className="text-muted-foreground/50 hover:text-destructive hover:bg-destructive/[0.06]" title="删除">
                          <Trash2 size={10} />
                        </Button>
                      )}
                    </div>

                    {/* Toggle */}
                    <Switch size="sm" checked={action.enabled} onCheckedChange={() => toggleAction(action.id)} />
                  </div>
                );
              })}

              {actions.length === 0 && (
                <div className="py-8 text-center">
                  <Layers size={22} className="text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground/40">暂无快捷功能</p>
                  <Button variant="ghost" size="xs" onClick={onAdd} className="mt-2 text-xs text-cherry-primary hover:bg-cherry-active-bg mx-auto">
                    <Plus size={11} />
                    <span>添加第一个功能</span>
                  </Button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-start gap-2 px-5 py-3 border-t border-border/30 flex-shrink-0">
              <CircleHelp size={10} className="text-muted-foreground/40 mt-[1px] flex-shrink-0" />
              <p className="text-xs text-muted-foreground/40 leading-relaxed">
                功能项将按列表顺序显示在快捷助手弹窗中。第一项默认被高亮选中，按回车即可执行。
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ===========================
// Add / Edit Action Form Panel (floating)
// ===========================
function ActionFormPanel({ open, onClose, action, onSave }: {
  open: boolean;
  onClose: () => void;
  action: QuickAction | null; // null = add mode
  onSave: (data: { icon: string; label: string; prompt: string }) => void;
}) {
  const [icon, setIcon] = useState('sparkles');
  const [label, setLabel] = useState('');
  const [prompt, setPrompt] = useState('');

  useEffect(() => {
    if (open) {
      if (action) {
        setIcon(action.icon);
        setLabel(action.label);
        setPrompt(action.prompt);
      } else {
        setIcon('sparkles');
        setLabel('');
        setPrompt('');
      }
    }
  }, [open, action]);

  const isAdd = !action;
  const canSave = label.trim().length > 0;

  const handleSave = () => {
    if (!canSave) return;
    onSave({ icon, label: label.trim(), prompt: prompt.trim() || `请${label.trim()}：` });
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="absolute inset-0 z-[var(--z-popover)] flex">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-foreground/20"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%', opacity: 0.8 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0.8 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="settings-panel w-[300px]"
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
                    value={label}
                    onChange={e => setLabel(e.target.value)}
                    className="flex-1 bg-muted/50 border border-border/50 rounded-xl px-3 py-[8px] text-xs text-foreground focus:border-cherry-primary/30"
                    placeholder="功能名称，例如：代码审查"
                    autoFocus
                    onKeyDown={e => { if (e.key === 'Enter' && canSave) handleSave(); if (e.key === 'Escape') onClose(); }}
                  />
                </div>
              </div>

              {/* Prompt */}
              <div>
                <p className="text-xs text-muted-foreground/60 mb-2 font-medium">提示词模板</p>
                <Textarea
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  className="w-full bg-muted/50 border border-border/50 rounded-xl px-3 py-[8px] text-xs text-muted-foreground/60 outline-none focus:border-cherry-primary/30 resize-none transition-colors"
                  placeholder="可选，例如：请审查以下代码并给出改进建议："
                  rows={3}
                />
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
        </div>
      )}
    </AnimatePresence>
  );
}

// ===========================
// Nav config
// ===========================
const NAV_ITEMS: { id: SubPage; label: string; icon: React.ReactNode }[] = [
  { id: 'general', label: '常规设置', icon: <Settings2 size={13} /> },
  { id: 'model', label: '功能配置', icon: <Cpu size={13} /> },
  { id: 'context', label: '上下文', icon: <ClipboardPaste size={13} /> },
];

// ===========================
// Panel: General
// ===========================
function GeneralPanel({ disabled }: { disabled: boolean }) {
  const [trayLaunch, setTrayLaunch] = useState(true);
  const [autoHide, setAutoHide] = useState(true);
  const [clipboardRead, setClipboardRead] = useState(true);

  return (
    <div className={`space-y-3 ${disabled ? 'opacity-30 pointer-events-none' : ''}`}>
      <div className="mb-1">
        <Typography variant="subtitle">常规设置</Typography>
        <p className="text-xs text-muted-foreground/40 mt-1">管理快捷助手的唤起方式和基础行为。</p>
      </div>

      <SectionCard>
        <div className="px-1">
          <SectionHeader title="启动与唤起" />
          <FormRow label="启用快捷助手" desc="开启后可通过全局快捷键或托盘图标唤起助手窗口。">
            <Switch size="sm" checked={true} onCheckedChange={() => {}} />
          </FormRow>
          <FormRow label="点击托盘图标启动" desc="单击系统托盘区的 Cherry 图标时直接唤出助手，而非主界面。">
            <Switch size="sm" checked={trayLaunch} onCheckedChange={setTrayLaunch} />
          </FormRow>
          <FormRow label="失去焦点自动隐藏" desc="当点击助手窗口以外的区域时，自动折叠窗口。">
            <Switch size="sm" checked={autoHide} onCheckedChange={setAutoHide} />
          </FormRow>
          <FormRow label="启动时读取剪贴板" desc="唤起助手时，自动将剪贴板中的最新内容填充到输入框中。">
            <Switch size="sm" checked={clipboardRead} onCheckedChange={setClipboardRead} />
          </FormRow>
        </div>
      </SectionCard>
    </div>
  );
}

// ===========================
// Panel: Model Config (pure visual preview)
// ===========================
function ModelPanel({ disabled, actions, onOpenManagePanel }: {
  disabled: boolean;
  actions: QuickAction[];
  onOpenManagePanel: () => void;
}) {
  const [selectedAssistant, setSelectedAssistant] = useState('default');

  const selectedInfo = MOCK_ASSISTANTS.find(a => a.value === selectedAssistant);
  const assistantName = selectedInfo?.label || '默认助手';

  const inputPlaceholder = `询问 ${assistantName} 获取帮助...`;

  const enabledActions = actions.filter(a => a.enabled);

  return (
    <div className={`space-y-3 ${disabled ? 'opacity-30 pointer-events-none' : ''}`}>
      <div className="mb-1">
        <Typography variant="subtitle">功能配置</Typography>
        <p className="text-xs text-muted-foreground/40 mt-1">配置快捷助手使用的助手角色，并管理弹窗中可用的快捷功能。</p>
      </div>

      <SectionCard>
        <div className="px-1">
          <SectionHeader title="助手配置" />
          <FormRow label="使用助手" desc="选择一个助手角色作为快捷助手的对话引擎，助手包含预设的 Prompt 和插件能力。">
            <AssistantPill value={selectedAssistant} onChange={setSelectedAssistant} />
          </FormRow>
        </div>
      </SectionCard>

      {/* Preview — pure visual */}
      <SectionCard className="!px-4 !py-4">
        <div className="flex items-center justify-between mb-3">
          <SectionHeader title="界面预览 (Preview)" />
          <Button variant="ghost" size="xs" onClick={onOpenManagePanel} className="text-muted-foreground/60 hover:text-foreground">
            <Layers size={10} />
            <span>功能管理</span>
          </Button>
        </div>

        {/* Preview card */}
        <div className="bg-muted/30 border border-border/50 rounded-2xl overflow-hidden p-2">
          {/* Input bar */}
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-muted/30">
            <Sparkles size={14} className="text-cherry-primary/40 flex-shrink-0" />
            <span className="text-xs text-muted-foreground/40 flex-1 truncate">{inputPlaceholder}</span>
          </div>

          {/* Action list — read-only */}
          <div className="mt-1">
            {enabledActions.map((action, i) => {
              const Icon = getActionIcon(action.icon);
              const isFirst = i === 0;
              return (
                <div
                  key={action.id}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-colors ${
                    isFirst ? 'bg-muted/50' : ''
                  }`}
                >
                  <Icon size={13} className={`flex-shrink-0 ${isFirst ? 'text-muted-foreground/60' : 'text-muted-foreground/40'}`} />
                  <span
                    className={`text-xs flex-1 truncate ${isFirst ? 'text-foreground font-medium' : 'text-muted-foreground/60 font-normal'}`}
                  >
                    {action.label}
                  </span>
                  {isFirst && <CornerDownLeft size={10} className="text-muted-foreground/40 flex-shrink-0" />}
                </div>
              );
            })}
          </div>

          {enabledActions.length === 0 && (
            <div className="px-3 py-4 text-center">
              <p className="text-xs text-muted-foreground/40">暂无启用的功能</p>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between px-3 py-2 mt-1 border-t border-border/30">
            <div className="flex items-center gap-1.5 text-muted-foreground/50">
              <AtSign size={9} />
              <span className="text-xs">按 ESC 关闭</span>
            </div>
            <Link2 size={10} className="text-muted-foreground/40" />
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

// ===========================
// Panel: Context
// ===========================
function ContextPanel({ disabled }: { disabled: boolean }) {
  const [clipboardRead, setClipboardRead] = useState(true);
  const [selectedText, setSelectedText] = useState(true);
  const [contextLength, setContextLength] = useState('medium');

  return (
    <div className={`space-y-3 ${disabled ? 'opacity-30 pointer-events-none' : ''}`}>
      <div className="mb-1">
        <Typography variant="subtitle">上下文</Typography>
        <p className="text-xs text-muted-foreground/40 mt-1">控制快捷助手如何获取和处理上下文信息。</p>
      </div>

      <SectionCard>
        <div className="px-1">
          <SectionHeader title="输入来源" />
          <FormRow label="启动时读取剪贴板" desc="唤起助手时，自动将剪贴板中的最新内容填充到输入框中。">
            <Switch size="sm" checked={clipboardRead} onCheckedChange={setClipboardRead} />
          </FormRow>
          <FormRow label="读取选中文本" desc="自动识别当前选中的文本作为输入内容。">
            <Switch size="sm" checked={selectedText} onCheckedChange={setSelectedText} />
          </FormRow>
        </div>
      </SectionCard>

      <SectionCard>
        <div className="px-1">
          <SectionHeader title="上下文长度" />
          <FormRow label="上下文窗口" desc="控制发送给模型的历史对话轮数，更长的上下文会增加 Token 消耗。">
            <Tabs value={contextLength} onValueChange={setContextLength}>
              <TabsList>
                <TabsTrigger value="short">短</TabsTrigger>
                <TabsTrigger value="medium">中</TabsTrigger>
                <TabsTrigger value="long">长</TabsTrigger>
              </TabsList>
            </Tabs>
          </FormRow>
        </div>
      </SectionCard>
    </div>
  );
}

// ===========================
// Main: QuickAssistantPage
// ===========================
export function QuickAssistantPage() {
  const [selectedId, setSelectedId] = useState<SubPage>('general');
  const [masterEnabled, setMasterEnabled] = useState(true);
  const [actions, setActions] = useState<QuickAction[]>(DEFAULT_ACTIONS);

  // Floating panels state
  const [showManagePanel, setShowManagePanel] = useState(false);
  const [showFormPanel, setShowFormPanel] = useState(false);
  const [editingAction, setEditingAction] = useState<QuickAction | null>(null);

  const openAddForm = () => {
    setEditingAction(null);
    setShowFormPanel(true);
    setShowManagePanel(false);
  };

  const openEditForm = (action: QuickAction) => {
    setEditingAction(action);
    setShowFormPanel(true);
    setShowManagePanel(false);
  };

  const handleSaveAction = (data: { icon: string; label: string; prompt: string }) => {
    if (editingAction) {
      // Edit existing
      setActions(prev => prev.map(a =>
        a.id === editingAction.id ? { ...a, ...data } : a
      ));
    } else {
      // Add new
      setActions(prev => [...prev, {
        id: `action-${Date.now()}`,
        ...data,
        enabled: true,
      }]);
    }
  };

  const renderPanel = () => {
    switch (selectedId) {
      case 'general': return <GeneralPanel disabled={!masterEnabled} />;
      case 'model': return (
        <ModelPanel
          disabled={!masterEnabled}
          actions={actions}
          onOpenManagePanel={() => setShowManagePanel(true)}
        />
      );
      case 'context': return <ContextPanel disabled={!masterEnabled} />;
      default: return null;
    }
  };

  return (
    <div className="flex h-full min-h-0">
      {/* Left nav */}
      <div className="w-[160px] flex-shrink-0 flex flex-col border-r border-border/30 min-h-0">
        <div className="px-3.5 pt-4 pb-2 flex items-center justify-between flex-shrink-0">
          <p className="text-xs text-muted-foreground/60 font-medium">快捷助手</p>
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
                    setShowManagePanel(false);
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
                    <span className={`flex-shrink-0 ${isSelected ? 'text-muted-foreground/60' : 'text-muted-foreground/40'}`}>{item.icon}</span>
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
      <div className="flex-1 flex flex-col min-w-0 min-h-0 relative">
        <div className="flex-1 overflow-y-auto px-6 py-5 scrollbar-thin">
          {renderPanel()}
        </div>

        {/* Management panel (toggle + edit + delete) */}
        <ActionsManagePanel
          open={showManagePanel}
          onClose={() => setShowManagePanel(false)}
          actions={actions}
          setActions={setActions}
          onAdd={openAddForm}
          onEdit={openEditForm}
        />

        {/* Add / Edit form panel */}
        <ActionFormPanel
          open={showFormPanel}
          onClose={() => setShowFormPanel(false)}
          action={editingAction}
          onSave={handleSaveAction}
        />
      </div>
    </div>
  );
}
