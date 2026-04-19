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
import { Button, Input, Popover, PopoverTrigger, PopoverContent } from '@cherry-studio/ui';
import { Toggle } from './shared';

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
// SegmentedControl
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
        <Button
          key={opt.value}
          variant="ghost"
          size="xs"
          onClick={() => onChange(opt.value)}
          className={`px-3 py-[4px] rounded-md text-xs h-auto transition-all duration-150 ${
            value === opt.value
              ? 'bg-cherry-primary text-white shadow-sm border border-cherry-primary font-medium'
              : 'text-foreground/40 hover:text-foreground/55 border border-transparent font-normal'
          }`}
        >
          {opt.label}
        </Button>
      ))}
    </div>
  );
}

// ===========================
// FormRow
// ===========================
function FormRow({ label, desc, children, disabled }: {
  label: string; desc?: string; children: React.ReactNode; disabled?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between gap-4 py-[5px] ${disabled ? 'opacity-40' : ''}`}>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="text-xs text-foreground/75 font-normal">{label}</p>
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

// ===========================
// SectionHeader / SectionCard
// ===========================
function SectionHeader({ title }: { title: string }) {
  return <h4 className="text-sm text-foreground/70 mb-2 font-medium">{title}</h4>;
}

function SectionCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-foreground/[0.03] border border-foreground/[0.06] rounded-2xl px-5 py-1 ${className || ''}`}>
      {children}
    </div>
  );
}

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
  { value: 'default', label: '默认助手', icon: '✦', color: '#10b981', isDefault: true },
  { value: 'mermaid', label: 'Mermaid 图表绘制专家', icon: '◆', color: '#f43f5e' },
  { value: 'translator', label: '翻译助手', icon: '◇', color: '#6366f1' },
  { value: 'wisdom', label: 'The Wisdom Alchemist V2', icon: '●', color: '#ef4444' },
  { value: 'ztd', label: 'ZTD', icon: '◆', color: '#3b82f6' },
  { value: 'chatgpt', label: 'ChatGPT 导入', icon: '◆', color: '#8b5cf6' },
  { value: 'coder', label: '代码助手', icon: '◇', color: '#06b6d4' },
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
      <Button
        ref={triggerRef}
        variant="ghost"
        size="sm"
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 px-3 py-[6px] h-auto rounded-full bg-foreground/[0.06] hover:bg-foreground/[0.09] text-xs"
      >
        <span style={{ color: selected?.color }} className="text-xs flex-shrink-0">{selected?.icon}</span>
        <span className="text-foreground/70 truncate">{selected?.label || '选择助手'}</span>
        {selected?.isDefault && (
          <span className="text-[9px] text-cherry-primary flex-shrink-0">默认</span>
        )}
        <ChevronDown size={10} className={`text-foreground/30 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </Button>

      {open && createPortal(
        <div
          className="fixed z-[9999] bg-popover border border-border/60 rounded-2xl shadow-2xl p-1.5"
          style={{ top: pos.top, left: pos.left, width: Math.max(pos.width, 220) }}
          onMouseDown={e => e.stopPropagation()}
        >
          <div className="max-h-[220px] overflow-y-auto [&::-webkit-scrollbar]:w-[2px] [&::-webkit-scrollbar-thumb]:bg-border/20">
            {MOCK_ASSISTANTS.map(a => (
              <Button
                key={a.value}
                variant="ghost"
                size="sm"
                onClick={() => { onChange(a.value); setOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-[6px] h-auto rounded-xl text-xs justify-start ${
                  value === a.value ? 'bg-foreground/[0.06]' : 'hover:bg-foreground/[0.04]'
                }`}
              >
                <span style={{ color: a.color }} className="text-xs flex-shrink-0">{a.icon}</span>
                <span className="text-foreground/70 truncate flex-1 text-left">{a.label}</span>
                {a.isDefault && <span className="text-[9px] text-cherry-primary flex-shrink-0">默认</span>}
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
  const [show, setShow] = useState(false);
  const CurrentIcon = getActionIcon(value);

  return (
    <Popover open={show} onOpenChange={setShow}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon-sm"
          className="w-9 h-9 rounded-xl bg-foreground/[0.06] hover:bg-foreground/[0.1] border-0 flex-shrink-0"
        >
          <CurrentIcon size={16} className="text-foreground/50" />
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
              onClick={() => { onChange(opt.value); setShow(false); }}
              className={`w-7 h-7 rounded-lg ${
                value === opt.value ? 'bg-cherry-active-bg text-cherry-primary' : 'text-foreground/40 hover:bg-foreground/[0.06] hover:text-foreground/60'
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
        <div className="absolute inset-0 z-50 flex">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/20"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%', opacity: 0.8 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0.8 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="absolute inset-y-2 right-2 w-[300px] bg-background rounded-2xl shadow-2xl border border-border/50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-foreground/[0.06] flex-shrink-0">
              <div className="flex items-center gap-2">
                <Layers size={14} className="text-foreground/50" />
                <h3 className="text-sm text-foreground/90 font-medium">功能管理</h3>
                <span className="text-[9px] text-foreground/25 bg-foreground/[0.04] px-1.5 py-[1px] rounded-md">{actions.length}</span>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon-xs" onClick={onAdd} className="text-cherry-primary hover:bg-cherry-active-bg" title="添加功能">
                  <Plus size={14} />
                </Button>
                <Button variant="ghost" size="icon-xs" onClick={onClose} className="text-foreground/35 hover:text-foreground/70">
                  <X size={14} />
                </Button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-2 py-2 [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:bg-border/20">
              {actions.map(action => {
                const Icon = getActionIcon(action.icon);
                const isConfirmDelete = confirmDeleteId === action.id;
                return (
                  <div
                    key={action.id}
                    className={`group flex items-center gap-2.5 px-3 py-[9px] rounded-xl transition-colors hover:bg-foreground/[0.03] ${
                      !action.enabled ? 'opacity-40' : ''
                    }`}
                  >
                    <Icon size={14} className="text-foreground/40 flex-shrink-0" />
                    <span className="text-xs text-foreground/70 flex-1 truncate">{action.label}</span>

                    {/* Hover actions: edit + delete */}
                    <div className="flex items-center gap-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon-xs" onClick={() => onEdit(action)} className="w-5 h-5 text-foreground/20 hover:text-foreground/50" title="编辑">
                        <Pencil size={10} />
                      </Button>
                      {isConfirmDelete ? (
                        <div className="flex items-center gap-0.5">
                          <Button variant="ghost" size="icon-xs" onClick={() => deleteAction(action.id)} className="w-5 h-5 text-destructive hover:bg-destructive/10" title="确认删除">
                            <Check size={10} />
                          </Button>
                          <Button variant="ghost" size="icon-xs" onClick={() => setConfirmDeleteId(null)} className="w-5 h-5 text-foreground/25 hover:text-foreground/50" title="取消">
                            <X size={9} />
                          </Button>
                        </div>
                      ) : (
                        <Button variant="ghost" size="icon-xs" onClick={() => setConfirmDeleteId(action.id)} className="w-5 h-5 text-foreground/20 hover:text-destructive hover:bg-destructive/[0.06]" title="删除">
                          <Trash2 size={10} />
                        </Button>
                      )}
                    </div>

                    {/* Toggle */}
                    <Toggle checked={action.enabled} onChange={() => toggleAction(action.id)} />
                  </div>
                );
              })}

              {actions.length === 0 && (
                <div className="py-8 text-center">
                  <Layers size={22} className="text-foreground/10 mx-auto mb-2" />
                  <p className="text-xs text-foreground/25">暂无快捷功能</p>
                  <Button variant="ghost" size="xs" onClick={onAdd} className="mt-2 text-xs text-cherry-primary hover:bg-cherry-active-bg mx-auto">
                    <Plus size={11} />
                    <span>添加第一个功能</span>
                  </Button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-start gap-2 px-5 py-3 border-t border-foreground/[0.06] flex-shrink-0">
              <CircleHelp size={10} className="text-foreground/20 mt-[1px] flex-shrink-0" />
              <p className="text-[9px] text-foreground/25 leading-relaxed">
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
        <div className="absolute inset-0 z-50 flex">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/20"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%', opacity: 0.8 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0.8 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="absolute inset-y-2 right-2 w-[300px] bg-background rounded-2xl shadow-2xl border border-border/50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-foreground/[0.06] flex-shrink-0">
              <div className="flex items-center gap-2">
                {isAdd ? <Plus size={14} className="text-cherry-primary" /> : <Pencil size={14} className="text-foreground/50" />}
                <h3 className="text-sm text-foreground/90 font-medium">
                  {isAdd ? '添加功能' : '编辑功能'}
                </h3>
              </div>
              <Button variant="ghost" size="icon-xs" onClick={onClose} className="text-foreground/35 hover:text-foreground/70">
                <X size={14} />
              </Button>
            </div>

            {/* Form */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:bg-border/20">
              {/* Icon + Name */}
              <div>
                <p className="text-xs text-foreground/40 mb-2 font-medium">图标和名称</p>
                <div className="flex items-center gap-2.5">
                  <IconPicker value={icon} onChange={setIcon} />
                  <Input
                    value={label}
                    onChange={e => setLabel(e.target.value)}
                    className="flex-1 bg-foreground/[0.05] border border-foreground/[0.08] rounded-xl px-3 py-[8px] text-xs text-foreground/70 focus:border-cherry-primary/30"
                    placeholder="功能名称，例如：代码审查"
                    autoFocus
                    onKeyDown={e => { if (e.key === 'Enter' && canSave) handleSave(); if (e.key === 'Escape') onClose(); }}
                  />
                </div>
              </div>

              {/* Prompt */}
              <div>
                <p className="text-xs text-foreground/40 mb-2 font-medium">提示词模板</p>
                <textarea
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  className="w-full bg-foreground/[0.05] border border-foreground/[0.08] rounded-xl px-3 py-[8px] text-xs text-foreground/50 outline-none focus:border-cherry-primary/30 resize-none transition-colors"
                  placeholder="可选，例如：请审查以下代码并给出改进建议："
                  rows={3}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 px-5 py-3.5 border-t border-foreground/[0.06] flex-shrink-0">
              <Button variant="ghost" size="xs" onClick={onClose} className="text-foreground/40 hover:text-foreground/60">
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
    <div className={`space-y-3 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="mb-1">
        <h3 className="text-sm text-foreground/90 font-medium">常规设置</h3>
        <p className="text-xs text-foreground/35 mt-1">管理快捷助手的唤起方式和基础行为。</p>
      </div>

      <SectionCard>
        <div className="px-1">
          <SectionHeader title="启动与唤起" />
          <FormRow label="启用快捷助手" desc="开启后可通过全局快捷键或托盘图标唤起助手窗口。">
            <Toggle checked={true} onChange={() => {}} />
          </FormRow>
          <FormRow label="点击托盘图标启动" desc="单击系统托盘区的 Cherry 图标时直接唤出助手，而非主界面。">
            <Toggle checked={trayLaunch} onChange={setTrayLaunch} />
          </FormRow>
          <FormRow label="失去焦点自动隐藏" desc="当点击助手窗口以外的区域时，自动折叠窗口。">
            <Toggle checked={autoHide} onChange={setAutoHide} />
          </FormRow>
          <FormRow label="启动时读取剪贴板" desc="唤起助手时，自动将剪贴板中的最新内容填充到输入框中。">
            <Toggle checked={clipboardRead} onChange={setClipboardRead} />
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
    <div className={`space-y-3 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="mb-1">
        <h3 className="text-sm text-foreground/90 font-medium">功能配置</h3>
        <p className="text-xs text-foreground/35 mt-1">配置快捷助手使用的助手角色，并管理弹窗中可用的快捷功能。</p>
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
          <Button variant="ghost" size="xs" onClick={onOpenManagePanel} className="text-foreground/40 hover:text-foreground/60">
            <Layers size={10} />
            <span>功能管理</span>
          </Button>
        </div>

        {/* Preview card */}
        <div className="bg-foreground/[0.03] border border-foreground/[0.06] rounded-2xl overflow-hidden p-2">
          {/* Input bar */}
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-foreground/[0.03]">
            <Sparkles size={14} className="text-cherry-primary/40 flex-shrink-0" />
            <span className="text-xs text-foreground/25 flex-1 truncate">{inputPlaceholder}</span>
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
                    isFirst ? 'bg-foreground/[0.06]' : ''
                  }`}
                >
                  <Icon size={13} className={`flex-shrink-0 ${isFirst ? 'text-foreground/50' : 'text-foreground/30'}`} />
                  <span
                    className={`text-xs flex-1 truncate ${isFirst ? 'text-foreground/80 font-medium' : 'text-foreground/50 font-normal'}`}
                  >
                    {action.label}
                  </span>
                  {isFirst && <CornerDownLeft size={10} className="text-foreground/15 flex-shrink-0" />}
                </div>
              );
            })}
          </div>

          {enabledActions.length === 0 && (
            <div className="px-3 py-4 text-center">
              <p className="text-xs text-foreground/20">暂无启用的功能</p>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between px-3 py-2 mt-1 border-t border-foreground/[0.04]">
            <div className="flex items-center gap-1.5 text-foreground/15">
              <AtSign size={9} />
              <span className="text-[9px]">按 ESC 关闭</span>
            </div>
            <Link2 size={10} className="text-foreground/15" />
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
    <div className={`space-y-3 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="mb-1">
        <h3 className="text-sm text-foreground/90 font-medium">上下文</h3>
        <p className="text-xs text-foreground/35 mt-1">控制快捷助手如何获取和处理上下文信息。</p>
      </div>

      <SectionCard>
        <div className="px-1">
          <SectionHeader title="输入来源" />
          <FormRow label="启动时读取剪贴板" desc="唤起助手时，自动将剪贴板中的最新内容填充到输入框中。">
            <Toggle checked={clipboardRead} onChange={setClipboardRead} />
          </FormRow>
          <FormRow label="读取选中文本" desc="自动识别当前选中的文本作为输入内容。">
            <Toggle checked={selectedText} onChange={setSelectedText} />
          </FormRow>
        </div>
      </SectionCard>

      <SectionCard>
        <div className="px-1">
          <SectionHeader title="上下文长度" />
          <FormRow label="上下文窗口" desc="控制发送给模型的历史对话轮数，更长的上下文会增加 Token 消耗。">
            <SegmentedControl
              value={contextLength}
              onChange={setContextLength}
              options={[
                { value: 'short', label: '短' },
                { value: 'medium', label: '中' },
                { value: 'long', label: '长' },
              ]}
            />
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
      <div className="w-[160px] flex-shrink-0 flex flex-col border-r border-foreground/[0.05] min-h-0">
        <div className="px-3.5 pt-4 pb-2 flex items-center justify-between flex-shrink-0">
          <p className="text-xs text-foreground/50 font-medium">快捷助手</p>
          <Toggle checked={masterEnabled} onChange={setMasterEnabled} />
        </div>

        <div className="flex-1 overflow-y-auto px-2.5 pb-3 [&::-webkit-scrollbar]:w-[2px] [&::-webkit-scrollbar-thumb]:bg-border/20">
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
                      : 'border border-transparent hover:bg-foreground/[0.03]'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute inset-0 rounded-xl border border-cherry-active-border pointer-events-none" />
                  )}
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className={`flex-shrink-0 ${isSelected ? 'text-foreground/50' : 'text-foreground/35'}`}>{item.icon}</span>
                    <span className={`text-xs truncate ${isSelected ? 'text-foreground/85 font-medium' : 'text-foreground/55 font-normal'}`}>
                      {item.label}
                    </span>
                  </div>
                  <ChevronRight size={9} className={`flex-shrink-0 ${isSelected ? 'text-foreground/25' : 'text-foreground/10'}`} />
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right content */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 relative">
        <div className="flex-1 overflow-y-auto px-6 py-5 [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:bg-border/20">
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
