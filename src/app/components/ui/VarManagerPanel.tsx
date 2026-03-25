import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus, Trash2, ChevronDown, X, Search,
  Variable, Braces, Hash, ToggleLeft, ListOrdered, FileJson,
  Clock, Calendar, Bot, Globe, Fingerprint, MessageCircle,
  Settings2,
} from 'lucide-react';

// ===========================
// Types
// ===========================

export type VarType = 'string' | 'number' | 'boolean' | 'array' | 'json';

export interface VariableDef {
  id: string;
  name: string;
  defaultValue: string;
  description: string;
  type: VarType;
  isSystem?: boolean;
}

// ===========================
// Constants
// ===========================

export const VAR_TYPE_CONFIG: Record<VarType, { label: string; icon: React.ElementType; color: string }> = {
  string: { label: 'String', icon: Braces, color: 'text-blue-500 bg-blue-500/10' },
  number: { label: 'Number', icon: Hash, color: 'text-amber-500 bg-amber-500/10' },
  boolean: { label: 'Boolean', icon: ToggleLeft, color: 'text-foreground/60 bg-foreground/[0.06]' },
  array: { label: 'Array', icon: ListOrdered, color: 'text-purple-500 bg-purple-500/10' },
  json: { label: 'JSON', icon: FileJson, color: 'text-orange-500 bg-orange-500/10' },
};

export const SYSTEM_VARIABLES: VariableDef[] = [
  { id: 'sys-1', name: 'current_date', defaultValue: '', description: '当前日期，格式 YYYY-MM-DD', type: 'string', isSystem: true },
  { id: 'sys-2', name: 'current_time', defaultValue: '', description: '当前时间，格式 HH:mm:ss', type: 'string', isSystem: true },
  { id: 'sys-3', name: 'model_name', defaultValue: '', description: '当前使用的模型名称', type: 'string', isSystem: true },
  { id: 'sys-4', name: 'conversation_id', defaultValue: '', description: '当前对话的唯一标识', type: 'string', isSystem: true },
  { id: 'sys-5', name: 'user_locale', defaultValue: '', description: '用户系统语言环境', type: 'string', isSystem: true },
  { id: 'sys-6', name: 'message_count', defaultValue: '', description: '当前对话的消息数量', type: 'number', isSystem: true },
];

export const SYSTEM_VAR_ICONS: Record<string, React.ElementType> = {
  current_date: Calendar,
  current_time: Clock,
  model_name: Bot,
  conversation_id: Fingerprint,
  user_locale: Globe,
  message_count: MessageCircle,
};

// ===========================
// Type Select Dropdown
// ===========================

function TypeSelect({ value, onChange }: { value: VarType; onChange: (t: VarType) => void }) {
  const [open, setOpen] = useState(false);
  const tc = VAR_TYPE_CONFIG[value];
  const Icon = tc.icon;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 w-full px-2 py-1.5 rounded-lg border border-border/15 bg-accent/10 text-[10px] text-foreground hover:border-border/30 transition-all"
      >
        <Icon size={9} className={tc.color.split(' ')[0]} />
        <span className="flex-1 text-left truncate">{tc.label}</span>
        <ChevronDown size={8} className="text-muted-foreground/30" />
      </button>
      <AnimatePresence>
        {open && (
          <div>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="absolute top-full left-0 mt-1 z-50 bg-popover border border-border/30 rounded-xl shadow-xl p-1 min-w-[100px]"
            >
              {(Object.keys(VAR_TYPE_CONFIG) as VarType[]).map(t => {
                const cfg = VAR_TYPE_CONFIG[t];
                const TIcon = cfg.icon;
                return (
                  <button
                    key={t}
                    onClick={() => { onChange(t); setOpen(false); }}
                    className={`flex items-center gap-2 w-full px-2 py-[5px] rounded-md text-[10px] transition-colors ${
                      value === t ? 'bg-accent text-foreground' : 'text-muted-foreground/60 hover:text-foreground hover:bg-accent/40'
                    }`}
                  >
                    <TIcon size={10} className={cfg.color.split(' ')[0]} />
                    <span>{cfg.label}</span>
                  </button>
                );
              })}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ===========================
// VarManagerPanel
// ===========================

export function VarManagerPanel({ systemVars, userVars, onClose, onInsert, onAdd, onUpdate, onUpdateType, onRemove, position = 'right', noBackdrop = false, positionStyle }: {
  systemVars: VariableDef[];
  userVars: VariableDef[];
  onClose: () => void;
  onInsert: (name: string) => void;
  onAdd: () => string;
  onUpdate: (id: string, field: keyof VariableDef, value: string) => void;
  onUpdateType: (id: string, type: VarType) => void;
  onRemove: (id: string) => void;
  position?: 'left' | 'right';
  noBackdrop?: boolean;
  positionStyle?: React.CSSProperties;
}) {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'system' | 'custom'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleAdd = () => {
    const newId = onAdd();
    setEditingId(newId);
    if (activeTab === 'system') {
      setActiveTab('custom');
    }
  };

  const filteredSystem = systemVars.filter(v =>
    v.name.includes(search.toLowerCase()) || v.description.includes(search.toLowerCase())
  );
  const filteredUser = userVars.filter(v =>
    v.name.includes(search.toLowerCase()) || v.description.includes(search.toLowerCase())
  );

  const showSystem = activeTab === 'all' || activeTab === 'system';
  const showCustom = activeTab === 'all' || activeTab === 'custom';

  return (
    <div>
      {/* Backdrop */}
      {!noBackdrop && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-[500] bg-black/15"
          onClick={onClose}
        />
      )}
      {/* Drawer Panel */}
      <motion.div
        initial={{ opacity: 0, x: position === 'left' ? -40 : 40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: position === 'left' ? -40 : 40 }}
        transition={{ type: 'spring', stiffness: 400, damping: 34 }}
        className={`absolute z-[501] top-2 bottom-2 w-[320px] bg-popover rounded-2xl border border-border/25 shadow-2xl shadow-black/20 flex flex-col overflow-hidden ${
          !positionStyle ? (position === 'left' ? 'left-2' : 'right-2') : ''
        }`}
        style={positionStyle}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-shrink-0 px-5 pt-5 pb-3 border-b border-border/15">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-violet-500/10 flex items-center justify-center">
                <Variable size={14} className="text-violet-500" />
              </div>
              <div>
                <h3 className="text-[13px] text-foreground" style={{ fontWeight: 500 }}>变量管理</h3>
                <p className="text-[9px] text-muted-foreground/60">{systemVars.length + userVars.length} 个变量</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground/40 hover:text-foreground hover:bg-accent/40 transition-colors"
            >
              <X size={14} />
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/35" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="搜索变量名或描述..."
              className="w-full pl-7 pr-3 py-1.5 rounded-lg border border-border/20 bg-accent/10 text-[10px] text-foreground placeholder:text-muted-foreground/30 outline-none focus:border-border/40 transition-all"
            />
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1">
            {([
              { id: 'all', label: '全部', count: systemVars.length + userVars.length },
              { id: 'system', label: '系统变量', count: systemVars.length },
              { id: 'custom', label: '自定义', count: userVars.length },
            ] as const).map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] transition-all ${
                  activeTab === tab.id
                    ? 'bg-accent/60 text-foreground'
                    : 'text-muted-foreground/50 hover:text-foreground hover:bg-accent/25'
                }`}
              >
                <span>{tab.label}</span>
                <span className="text-[8px] text-muted-foreground/35">{tab.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-3 [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:bg-border/30 [&::-webkit-scrollbar-thumb]:rounded-full">
          {/* System Variables */}
          {showSystem && filteredSystem.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-[9px] text-muted-foreground/40 uppercase tracking-wider">系统变量</span>
                <div className="flex-1 h-px bg-border/10" />
              </div>
              <div className="space-y-1">
                {filteredSystem.map(v => {
                  const SysIcon = SYSTEM_VAR_ICONS[v.name] || Variable;
                  return (
                    <div
                      key={v.id}
                      className="group flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-accent/20 transition-colors cursor-pointer"
                      onClick={() => onInsert(v.name)}
                    >
                      <div className="w-7 h-7 rounded-lg bg-teal-500/10 flex items-center justify-center flex-shrink-0">
                        <SysIcon size={12} className="text-teal-400/60" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-foreground font-mono">{v.name}</span>
                          <span className={`text-[8px] px-1.5 py-px rounded-full ${VAR_TYPE_CONFIG[v.type].color}`}>
                            {VAR_TYPE_CONFIG[v.type].label}
                          </span>
                        </div>
                        <p className="text-[9px] text-muted-foreground/45 mt-0.5 truncate">{v.description}</p>
                      </div>
                      <span className="text-[8px] text-teal-500/50 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">插入</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Custom Variables */}
          {showCustom && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-[9px] text-muted-foreground/40 uppercase tracking-wider">自定义变量</span>
                <div className="flex-1 h-px bg-border/10" />
                <button
                  onClick={handleAdd}
                  className="flex items-center gap-0.5 text-[9px] text-violet-500/60 hover:text-violet-500 transition-colors"
                >
                  <Plus size={9} />
                  <span>添加</span>
                </button>
              </div>
              <div className="space-y-1">
                {filteredUser.length === 0 && (
                  <div className="text-center py-6">
                    <Variable size={20} className="text-muted-foreground/15 mx-auto mb-2" />
                    <p className="text-[10px] text-muted-foreground/35">暂无自定义变量</p>
                    <button onClick={handleAdd} className="text-[10px] text-violet-500/60 hover:text-violet-500 mt-1 transition-colors">创建变量</button>
                  </div>
                )}
                {filteredUser.map(v => {
                  const tc = VAR_TYPE_CONFIG[v.type];
                  const TypeIcon = tc.icon;
                  const isEditing = editingId === v.id;

                  return (
                    <div key={v.id}>
                      <div
                        className={`group flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors cursor-pointer ${
                          isEditing ? 'bg-accent/30' : 'hover:bg-accent/20'
                        }`}
                        onClick={() => {
                          if (!isEditing) onInsert(v.name);
                        }}
                      >
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${tc.color.split(' ')[1] || 'bg-accent/30'}`}>
                          <TypeIcon size={12} className={tc.color.split(' ')[0]} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-foreground font-mono">{v.name || '未命名'}</span>
                            <span className={`text-[8px] px-1.5 py-px rounded-full ${tc.color}`}>
                              {tc.label}
                            </span>
                            {v.defaultValue && (
                              <span className="text-[8px] text-muted-foreground/30 font-mono">= {v.defaultValue}</span>
                            )}
                          </div>
                          <p className="text-[9px] text-muted-foreground/45 mt-0.5 truncate">{v.description || '无描述'}</p>
                        </div>
                        <div className="flex items-center gap-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => setEditingId(isEditing ? null : v.id)}
                            className="w-5 h-5 rounded-md flex items-center justify-center text-muted-foreground/30 hover:text-foreground hover:bg-accent/40 transition-colors"
                          >
                            <Settings2 size={9} />
                          </button>
                          <button
                            onClick={() => onRemove(v.id)}
                            className="w-5 h-5 rounded-md flex items-center justify-center text-muted-foreground/30 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                          >
                            <Trash2 size={9} />
                          </button>
                        </div>
                      </div>
                      {/* Inline edit */}
                      <AnimatePresence>
                        {isEditing && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="px-3 pb-2 pt-1 space-y-2 ml-9">
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="text-[8px] text-muted-foreground/35 mb-0.5 block">变量名</label>
                                  <input
                                    value={v.name}
                                    onChange={e => onUpdate(v.id, 'name', e.target.value)}
                                    className="w-full px-2 py-1 rounded-lg border border-border/15 bg-accent/10 text-[10px] text-foreground outline-none focus:border-border/40 transition-all font-mono"
                                    onClick={e => e.stopPropagation()}
                                  />
                                </div>
                                <div>
                                  <label className="text-[8px] text-muted-foreground/35 mb-0.5 block">类型</label>
                                  <div onClick={e => e.stopPropagation()}>
                                    <TypeSelect value={v.type} onChange={t => onUpdateType(v.id, t)} />
                                  </div>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="text-[8px] text-muted-foreground/35 mb-0.5 block">默认值</label>
                                  <input
                                    value={v.defaultValue}
                                    onChange={e => onUpdate(v.id, 'defaultValue', e.target.value)}
                                    placeholder="默认值"
                                    className="w-full px-2 py-1 rounded-lg border border-border/15 bg-accent/10 text-[10px] text-foreground outline-none focus:border-border/40 transition-all"
                                    onClick={e => e.stopPropagation()}
                                  />
                                </div>
                                <div>
                                  <label className="text-[8px] text-muted-foreground/35 mb-0.5 block">描述</label>
                                  <input
                                    value={v.description}
                                    onChange={e => onUpdate(v.id, 'description', e.target.value)}
                                    placeholder="变量描述..."
                                    className="w-full px-2 py-1 rounded-lg border border-border/15 bg-accent/10 text-[10px] text-muted-foreground/60 outline-none focus:border-border/40 transition-all"
                                    onClick={e => e.stopPropagation()}
                                  />
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-5 py-3 border-t border-border/15">
          <button
            onClick={handleAdd}
            className="flex items-center justify-center gap-1.5 w-full px-3 py-2 rounded-xl bg-violet-500/10 text-violet-500 text-[10px] hover:bg-violet-500/15 transition-colors border border-violet-500/15"
          >
            <Plus size={10} />
            <span>添加自定义变量</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}