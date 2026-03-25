import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useGlobalActions } from '@/app/context/GlobalActionContext';
import {
  ArrowLeft, ChevronDown, ChevronRight, FolderOpen, Share2, Download,
  Bot, Circle, Columns2,
  Sparkles, Plus, ArrowUp,
  FileText, Zap, Search as SearchIcon, BookOpen, History,
  MessageCirclePlus,
  Code2, Folder, Tag,
  X,
  Check,
  Edit3, Clock,
  Workflow, Cable, Layers,
  Compass, Wrench, PenTool,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Tooltip } from '@/app/components/Tooltip';
import { FileExplorer } from './FileExplorer';
import { ArtifactViewer } from './ArtifactViewer';
import { EmptyState } from '@/app/components/ui/EmptyState';
import { ChatPanel } from './ChatPanel';
import type { AgentChatMessage, AgentSession, AgentSessionData } from '@/app/types/agent';
import type { ModelCapability } from '@/app/types/chat';
import { SessionHistoryPage } from './SessionHistoryPage';
import {
  MOCK_SESSIONS, MODELS, SESSION_DATA_MAP, EMPTY_SESSION_DATA,
  DEFAULT_INITIAL_FILES, AGENT_MODEL_CAPABILITY_LABELS,
} from '@/app/mock';

// Backward-compatible aliases
type ChatMessage = AgentChatMessage;
type SessionData = AgentSessionData;
type AgentModelCapability = ModelCapability;
import {
  AGENT_PROVIDER_COLORS,
  AGENT_CAP_ICONS, AGENT_CAP_TAG_ICONS, ALL_AGENT_CAPABILITIES,
  RUN_MODE_LABELS, CAP_TAB_CONFIG,
  BUILTIN_TOOLS_CATALOG, MCP_CATALOG, SKILLS_CATALOG,
  BUILTIN_TOOL_CATEGORIES, AGENT_TAGS,
  AVAILABLE_AGENTS,
  type AgentCapTab as CapTab,
  type AgentBuiltinTool as BuiltinTool,
  type AgentMcpService as McpService,
  type AgentSkillItem as AgentSkill,
} from '@/app/config/agentTools';

// ===========================
// Agent Picker Dropdown
// ===========================

function AgentPicker({
  selectedAgent,
  onSelectAgent,
  onCreateNew,
  onAvatarClick,
}: {
  selectedAgent: typeof AVAILABLE_AGENTS[0];
  onSelectAgent: (agent: typeof AVAILABLE_AGENTS[0]) => void;
  onCreateNew: () => void;
  onAvatarClick?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    return AVAILABLE_AGENTS.filter(a => {
      const matchSearch = !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.desc.toLowerCase().includes(search.toLowerCase());
      const matchTag = !activeTag || a.tags.includes(activeTag);
      return matchSearch && matchTag;
    });
  }, [search, activeTag]);

  const handleOpen = () => {
    setOpen(!open);
    if (!open) { setSearch(''); setActiveTag(null); }
  };

  return (
    <div className="relative flex items-center">
      {/* Avatar — opens agent info panel */}
      <Tooltip content={"\u667a\u80fd\u4f53\u4fe1\u606f"} side="bottom">
        <button
          onClick={(e) => { e.stopPropagation(); onAvatarClick?.(); }}
          className="w-6 h-6 rounded-lg bg-gradient-to-br from-accent/30 to-accent/10 border border-border/20 flex items-center justify-center text-[12px] flex-shrink-0 hover:from-accent/50 hover:to-accent/25 hover:border-border/40 transition-all duration-150 active:scale-95 mr-1"
        >
          {selectedAgent.avatar}
        </button>
      </Tooltip>

      {/* Name + Chevron — opens picker dropdown */}
      <button
        onClick={handleOpen}
        className={`flex items-center gap-1 px-1.5 py-[4px] rounded-md text-[10.5px] transition-all duration-100 ${
          open ? 'bg-accent/25 text-foreground' : 'text-foreground/75 hover:text-foreground hover:bg-accent/15'
        }`}
      >
        <span className="truncate max-w-[160px]">{selectedAgent.name}</span>
        <ChevronDown size={8} className={`text-muted-foreground/50 flex-shrink-0 transition-transform duration-100 ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <div>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -3 }}
              transition={{ duration: 0.1 }}
              className="absolute top-full left-0 mt-1 z-50 bg-popover border border-border/40 rounded-lg shadow-xl shadow-black/10 min-w-[260px]"
              onAnimationComplete={() => searchRef.current?.focus()}
            >
              {/* Search */}
              <div className="px-2 pt-2 pb-1">
                <div className="flex items-center gap-1.5 px-2 py-[5px] rounded-md bg-accent/15 border border-border/20">
                  <SearchIcon size={10} className="text-muted-foreground/40 flex-shrink-0" />
                  <input
                    ref={searchRef}
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder={"\u641c\u7d22\u667a\u80fd\u4f53..."}
                    className="flex-1 bg-transparent text-[10px] text-foreground placeholder:text-muted-foreground/30 outline-none min-w-0"
                  />
                  {search && (
                    <button onClick={() => setSearch('')} className="text-muted-foreground/30 hover:text-muted-foreground/60">
                      <X size={8} />
                    </button>
                  )}
                </div>
              </div>

              {/* Tags */}
              <div className="px-2 pb-1.5">
                <div className="flex items-center gap-1 flex-wrap">
                  <Tag size={8} className="text-muted-foreground/30 flex-shrink-0" />
                  {AGENT_TAGS.map(tag => (
                    <button
                      key={tag}
                      onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                      className={`px-1.5 py-px rounded-full text-[8px] transition-all ${
                        activeTag === tag
                          ? 'bg-foreground/10 text-foreground/70 border border-border/40'
                          : 'bg-accent/20 text-muted-foreground/50 border border-transparent hover:bg-accent/40 hover:text-muted-foreground/70'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-px bg-border/20 mx-1" />

              {/* Agent list */}
              <div className="p-1.5 max-h-[240px] overflow-y-auto">
                {filtered.length === 0 ? (
                  <div className="px-2.5 py-3 text-center text-[9px] text-muted-foreground/40">{"\u65e0\u5339\u914d\u7ed3\u679c"}</div>
                ) : (
                  filtered.map(a => (
                    <button
                      key={a.id}
                      onClick={() => { onSelectAgent(a); setOpen(false); }}
                      className={`flex items-center gap-2 w-full px-2 py-[5px] rounded-lg text-[10.5px] transition-all duration-75 mb-px ${
                        selectedAgent.id === a.id
                          ? 'bg-accent/30 text-foreground ring-1 ring-border/30'
                          : 'text-foreground/75 hover:text-foreground hover:bg-accent/15'
                      }`}
                    >
                      <span className="text-[11px] flex-shrink-0">{a.avatar}</span>
                      <div className="flex flex-col items-start min-w-0 flex-1">
                        <span className="truncate text-[10.5px]">{a.name}</span>
                        <span className="text-[9px] text-muted-foreground/45">{a.desc}</span>
                      </div>
                      {selectedAgent.id === a.id && (
                        <Check size={9} className="text-cherry-primary flex-shrink-0" />
                      )}
                    </button>
                  ))
                )}
              </div>

              <div className="h-px bg-border/25 mx-1" />
              <div className="p-1">
                <button
                  onClick={() => { setOpen(false); onCreateNew(); }}
                  className="flex items-center gap-2 w-full px-2.5 py-[6px] rounded-md text-[10.5px] text-muted-foreground hover:text-foreground hover:bg-accent/20 transition-colors"
                >
                  <Plus size={10} className="flex-shrink-0" />
                  <span>{"\u53bb\u8d44\u6e90\u5e93\u521b\u5efa"}</span>
                  <ChevronRight size={9} className="ml-auto text-muted-foreground/40" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ===========================
// New Session Empty State
// ===========================

function NewSessionEmpty({ onSendMessage }: { onSendMessage: (text: string) => void }) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [input, setInput] = useState('');

  const suggestions = [
    { icon: Zap, label: '\u521b\u5efa React \u5168\u6808\u9879\u76ee', desc: 'Vite + TypeScript + Tailwind CSS' },
    { icon: SearchIcon, label: 'AI \u6846\u67b6\u6280\u672f\u9009\u578b\u8c03\u7814', desc: '\u591a\u7ef4\u5bf9\u6bd4 + \u57fa\u51c6\u6d4b\u8bd5 + \u62a5\u544a\u8f93\u51fa' },
    { icon: BookOpen, label: '\u6784\u5efa Dashboard \u770b\u677f', desc: 'Recharts \u56fe\u8868 + \u5b9e\u65f6\u6570\u636e\u6d41' },
    { icon: FileText, label: '\u5b9e\u73b0\u7528\u6237\u8ba4\u8bc1\u7cfb\u7edf', desc: 'JWT + OAuth + Prisma + PostgreSQL' },
  ];

  const handleSend = () => {
    if (input.trim()) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  };

  return (
    <div className="flex flex-col h-full w-full items-center justify-center">
      <div className="w-full max-w-[620px] px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex flex-col items-center w-full"
        >
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cherry-primary/18 via-cherry-primary-hover/10 to-teal-500/8 border border-cherry-active-border flex items-center justify-center mb-4 shadow-lg shadow-cherry-shadow-sm"
          >
            <Sparkles size={18} strokeWidth={1.2} className="text-cherry-text-muted" />
          </motion.div>
          <h2 className="text-[13px] text-foreground/90 tracking-[-0.02em]">{"\u9700\u8981\u6211\u5e2e\u4f60\u6784\u5efa\u4ec0\u4e48\uff1f"}</h2>
          <p className="text-[10px] text-muted-foreground/45 text-center leading-[1.6] mt-1.5 mb-5">
            {"\u63cf\u8ff0\u4f60\u60f3\u8981\u6784\u5efa\u7684\u5185\u5bb9\uff0cAI \u5c06\u4e3a\u4f60\u5b8c\u6210\u5168\u8fc7\u7a0b"}
          </p>

          {/* Input area — centered */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="w-full mb-5"
          >
            <div className="relative rounded-2xl border border-border/40 bg-card/80 shadow-sm shadow-black/5 focus-within:border-border/70 focus-within:shadow-md focus-within:shadow-black/8 transition-all duration-200">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                placeholder={"\u8bf7\u8f93\u5165\u4f60\u60f3\u8981\u4e86\u89e3\u7684\u95ee\u9898"}
                rows={1}
                autoFocus
                className="w-full bg-transparent text-[12px] text-foreground placeholder:text-muted-foreground/35 outline-none resize-none min-h-[44px] max-h-[120px] leading-[1.6] px-4 pt-3.5 pb-[38px]"
              />
              <div className="absolute bottom-[8px] left-3 right-3 flex items-center justify-between">
                <div className="flex items-center gap-0.5">
                  <Tooltip content={"\u6dfb\u52a0"} side="top"><button className="p-[4px] rounded-lg text-muted-foreground/40 hover:text-muted-foreground/70 hover:bg-accent/15 transition-colors">
                    <Plus size={13} />
                  </button></Tooltip>
                  <Tooltip content={"\u4ee3\u7801"} side="top"><button className="p-[4px] rounded-lg text-muted-foreground/40 hover:text-muted-foreground/70 hover:bg-accent/15 transition-colors">
                    <Code2 size={12} />
                  </button></Tooltip>
                  <Tooltip content={"\u6dfb\u52a0\u6587\u4ef6\u5939"} side="top"><button className="p-[4px] rounded-lg text-muted-foreground/40 hover:text-muted-foreground/70 hover:bg-accent/15 transition-colors">
                    <Folder size={12} />
                  </button></Tooltip>
                </div>
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-150 ${
                    input.trim()
                      ? 'bg-cherry-primary text-white hover:bg-cherry-primary-hover active:scale-[0.92] shadow-sm shadow-cherry-shadow'
                      : 'bg-accent/50 text-muted-foreground/25 cursor-not-allowed'
                  }`}
                >
                  <ArrowUp size={13} strokeWidth={2} />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Suggestions — below input, horizontal grid */}
          <div className="grid grid-cols-2 gap-2 w-full">
            {suggestions.map((s, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.15 + i * 0.03 }}
                onClick={() => onSendMessage(s.label)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-border/20 hover:border-border/40 bg-card/30 hover:bg-card/60 transition-all duration-150 text-left group"
              >
                <div className="w-6 h-6 rounded-md bg-accent/20 flex items-center justify-center flex-shrink-0 group-hover:bg-cherry-active-bg transition-colors">
                  <s.icon size={11} strokeWidth={1.5} className="text-muted-foreground/50 group-hover:text-cherry-primary transition-colors" />
                </div>
                <div className="flex flex-col gap-0 min-w-0">
                  <span className="text-[10.5px] text-foreground/65 group-hover:text-foreground/85 transition-colors truncate">{s.label}</span>
                  <span className="text-[9px] text-muted-foreground/35 leading-[1.3] truncate">{s.desc}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ===========================
// Compact Session Selector (single line)
// ===========================

function CompactSessionSelector({
  sessions,
  activeSession,
  onSelectSession,
  onOpenHistory,
}: {
  sessions: AgentSession[];
  activeSession: AgentSession | undefined;
  onSelectSession: (id: string) => void;
  onOpenHistory: () => void;
}) {
  const [open, setOpen] = useState(false);
  const recentSessions = sessions.slice(0, 6);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 px-2 py-[4px] rounded-md text-[10.5px] transition-all duration-100 max-w-[200px] ${
          open ? 'bg-accent/25 text-foreground' : 'text-foreground/75 hover:text-foreground hover:bg-accent/15'
        }`}
      >
        <Bot size={11} className="text-muted-foreground flex-shrink-0" />
        <span className="truncate">
          {activeSession ? activeSession.title : '\u65b0\u4f1a\u8bdd'}
        </span>
        <ChevronDown size={8} className={`text-muted-foreground/50 flex-shrink-0 transition-transform duration-100 ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <div>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -3 }}
              transition={{ duration: 0.1 }}
              className="absolute top-full left-0 mt-1 z-50 bg-popover border border-border/40 rounded-lg shadow-xl shadow-black/10 p-1 min-w-[240px] max-w-[280px]"
            >
              {recentSessions.map(s => (
                <button
                  key={s.id}
                  onClick={() => { onSelectSession(s.id); setOpen(false); }}
                  className={`flex items-center gap-2 w-full px-2 py-[5px] rounded-lg text-[10.5px] transition-all duration-75 mb-px ${
                    activeSession?.id === s.id
                      ? 'bg-accent/30 text-foreground ring-1 ring-border/30'
                      : 'text-foreground/75 hover:text-foreground hover:bg-accent/15'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-[3px] flex items-center justify-center flex-shrink-0 ${
                    activeSession?.id === s.id ? 'bg-foreground/10' : 'bg-accent/30'
                  }`}>
                    <Bot size={8} className="text-muted-foreground" />
                  </div>
                  <span className="flex-1 truncate">{s.title}</span>
                  {s.status === 'active' && (
                    <span className="w-[5px] h-[5px] rounded-full bg-cherry-primary flex-shrink-0" />
                  )}
                  <span className="text-[9px] text-muted-foreground/55 flex-shrink-0">{s.timestamp}</span>
                </button>
              ))}

              <div className="h-px bg-border/25 my-1" />
              <button
                onClick={() => { setOpen(false); onOpenHistory(); }}
                className="flex items-center gap-2 w-full px-2.5 py-[6px] rounded-md text-[10.5px] text-muted-foreground hover:text-foreground hover:bg-accent/20 transition-colors"
              >
                <History size={10} className="flex-shrink-0" />
                <span>{"\u67e5\u770b\u5168\u90e8\u5386\u53f2\u8bb0\u5f55"}</span>
                <ChevronRight size={9} className="ml-auto text-muted-foreground/40" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ===========================
// Capability Toggle Switch (mini)
// ===========================

function CapToggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`w-[28px] h-[16px] rounded-full flex-shrink-0 transition-colors duration-150 relative ${
        checked ? 'bg-cherry-primary' : 'bg-muted-foreground/20'
      }`}
    >
      <motion.span
        animate={{ x: checked ? 13 : 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="absolute top-[2px] w-[12px] h-[12px] rounded-full bg-white shadow-sm"
      />
    </button>
  );
}

// ===========================
// Add Capability Panel (slide-over inside info panel)
// ===========================

function AddCapabilityPanel({ tab, existingIds, onAdd, onClose, onBrowse }: {
  tab: CapTab;
  existingIds: Set<string>;
  onAdd: (id: string) => void;
  onClose: () => void;
  onBrowse: () => void;
}) {
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => { searchRef.current?.focus(); }, []);

  const catalog = useMemo(() => {
    if (tab === 'tools') return BUILTIN_TOOLS_CATALOG.filter(t => !existingIds.has(t.id));
    if (tab === 'mcp') return MCP_CATALOG.filter(m => !existingIds.has(m.id));
    return SKILLS_CATALOG.filter(s => !existingIds.has(s.id));
  }, [tab, existingIds]);

  const filtered = useMemo(() => {
    return catalog.filter((item: any) => {
      const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase()) || item.desc.toLowerCase().includes(search.toLowerCase());
      const matchCat = !activeCat || (item.category && item.category === activeCat);
      return matchSearch && matchCat;
    });
  }, [catalog, search, activeCat]);

  const grouped = useMemo(() => {
    if (tab !== 'tools') return null;
    const map = new Map<string, typeof filtered>();
    for (const item of filtered) {
      const cat = (item as any).category || '\u5176\u4ed6';
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(item);
    }
    return map;
  }, [tab, filtered]);

  const tabLabel = tab === 'tools' ? '\u5185\u7f6e\u5de5\u5177' : tab === 'mcp' ? 'MCP Server' : 'Skill';

  return (
    <motion.div
      initial={{ x: 30, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 30, opacity: 0 }}
      transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
      className="absolute inset-0 z-10 bg-background flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 h-[38px] flex-shrink-0 border-b border-border/10">
        <button onClick={onClose} className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-accent/15 transition-colors">
          <ArrowLeft size={12} />
        </button>
        <span className="text-[11px] text-foreground">{"\u6dfb\u52a0"}{tabLabel}</span>
        <span className="text-[9px] text-muted-foreground/40 ml-auto">{catalog.length} {"\u9879\u53ef\u7528"}</span>
      </div>

      {/* Search */}
      <div className="px-3 pt-2.5 pb-1.5">
        <div className="flex items-center gap-1.5 px-2.5 py-[5px] rounded-lg bg-accent/15 border border-border/15">
          <SearchIcon size={10} className="text-muted-foreground/40 flex-shrink-0" />
          <input
            ref={searchRef}
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={`\u641c\u7d22${tabLabel}...`}
            className="flex-1 bg-transparent text-[10px] text-foreground placeholder:text-muted-foreground/30 outline-none min-w-0"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-muted-foreground/30 hover:text-muted-foreground/60">
              <X size={8} />
            </button>
          )}
        </div>
      </div>

      {/* Category pills for tools */}
      {tab === 'tools' && (
        <div className="px-3 pb-1.5 flex items-center gap-1 flex-wrap">
          {BUILTIN_TOOL_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCat(activeCat === cat ? null : cat)}
              className={`px-1.5 py-px rounded-full text-[8.5px] transition-all border ${
                activeCat === cat
                  ? 'bg-foreground/8 text-foreground/70 border-border/40'
                  : 'bg-accent/15 text-muted-foreground/50 border-transparent hover:bg-accent/30'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Item list */}
      <div className="flex-1 overflow-y-auto px-3 pb-3 [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:bg-border/25 [&::-webkit-scrollbar-thumb]:rounded-full">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <SearchIcon size={16} className="text-muted-foreground/20 mb-2" />
            <span className="text-[10px] text-muted-foreground/40">{"\u65e0\u5339\u914d\u7ed3\u679c"}</span>
          </div>
        ) : tab === 'tools' && grouped ? (
          Array.from(grouped.entries()).map(([cat, items]) => (
            <div key={cat} className="mb-3">
              <div className="text-[9px] text-muted-foreground/45 mb-1.5 px-0.5">{cat}</div>
              <div className="space-y-0.5">
                {items.map((item: any) => (
                  <div key={item.id} className="flex items-center gap-2 px-2.5 py-[7px] rounded-lg hover:bg-accent/15 transition-colors group">
                    <Wrench size={10} className="text-muted-foreground/40 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] text-foreground/75 truncate">{item.name}</div>
                      <div className="text-[9px] text-muted-foreground/40 truncate">{item.desc}</div>
                    </div>
                    <button onClick={() => onAdd(item.id)}
                      className="p-[3px] rounded text-[10px] text-muted-foreground/30 hover:text-cherry-primary hover:bg-cherry-active-bg transition-colors opacity-0 group-hover:opacity-100">
                      <Plus size={11} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="space-y-0.5">
            {filtered.map((item: any) => (
              <div key={item.id} className="flex items-center gap-2 px-2.5 py-[7px] rounded-lg hover:bg-accent/15 transition-colors group">
                {tab === 'mcp' ? (
                  <Cable size={10} className="text-blue-500/40 flex-shrink-0" />
                ) : (
                  <Zap size={10} className="text-amber-500/40 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] text-foreground/75 truncate">{item.name}</div>
                  <div className="text-[9px] text-muted-foreground/40 truncate">
                    {tab === 'mcp' ? item.author : item.desc}
                  </div>
                </div>
                <button onClick={() => onAdd(item.id)}
                  className="p-[3px] rounded text-[10px] text-muted-foreground/30 hover:text-cherry-primary hover:bg-cherry-active-bg transition-colors opacity-0 group-hover:opacity-100">
                  <Plus size={11} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom actions */}
      <div className="px-3 pb-3 pt-1.5 border-t border-border/10 space-y-1.5">
        <button
          onClick={onBrowse}
          className="flex items-center gap-2 w-full px-2.5 py-[7px] rounded-lg text-[10px] text-foreground/60 hover:text-foreground hover:bg-accent/15 transition-colors"
        >
          <Compass size={11} className="text-muted-foreground/50" />
          <span>{"\u53bb\u63a2\u7d22\u6d4f\u89c8"}</span>
          <ChevronRight size={9} className="ml-auto text-muted-foreground/30" />
        </button>
        <button
          className="flex items-center gap-2 w-full px-2.5 py-[7px] rounded-lg text-[10px] text-foreground/60 hover:text-foreground hover:bg-accent/15 transition-colors"
        >
          <PenTool size={10} className="text-muted-foreground/50" />
          <span>{"\u624b\u52a8\u6dfb\u52a0"}</span>
          <ChevronRight size={9} className="ml-auto text-muted-foreground/30" />
        </button>
      </div>
    </motion.div>
  );
}

// ===========================
// Agent Info Panel (floating right panel)
// ===========================

function AgentInfoPanel({ agent, onClose, onEdit }: {
  agent: typeof AVAILABLE_AGENTS[0];
  onClose: () => void;
  onEdit: () => void;
}) {
  const [promptExpanded, setPromptExpanded] = useState(false);
  const [capTab, setCapTab] = useState<CapTab>('tools');
  const [showAddPanel, setShowAddPanel] = useState(false);
  const modeInfo = RUN_MODE_LABELS[agent.runMode] || RUN_MODE_LABELS.auto;
  const builtinTools = agent.builtinTools || [];
  const mcpServices = agent.mcpServices || [];
  const skills = agent.skills || [];
  const tags = agent.tags || [];

  const toolsByCategory = useMemo(() => {
    const map = new Map<string, BuiltinTool[]>();
    for (const t of builtinTools) {
      if (!map.has(t.category)) map.set(t.category, []);
      map.get(t.category)!.push(t);
    }
    return map;
  }, [builtinTools]);

  const enabledToolCount = builtinTools.filter(t => t.enabled).length;
  const connectedMcpCount = mcpServices.filter(m => m.status === 'connected').length;
  const enabledSkillCount = skills.filter(s => s.enabled).length;

  const existingIds = useMemo(() => {
    if (capTab === 'tools') return new Set(builtinTools.map(t => t.id));
    if (capTab === 'mcp') return new Set(mcpServices.map(m => m.id));
    return new Set(skills.map(s => s.id));
  }, [capTab, builtinTools, mcpServices, skills]);

  const handleAddItem = useCallback((_id: string) => {
    // Mock: just close add panel (real app would add to agent)
    setShowAddPanel(false);
  }, []);

  return (
    <motion.div
      initial={{ x: 40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 40, opacity: 0 }}
      transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
      className="absolute top-2 right-2 bottom-2 z-40 bg-background rounded-xl border border-border/25 shadow-2xl shadow-black/12 flex flex-col overflow-hidden"
      style={{ width: 340 }}
    >
      {/* Add panel overlay */}
      <AnimatePresence>
        {showAddPanel && (
          <AddCapabilityPanel
            tab={capTab}
            existingIds={existingIds}
            onAdd={handleAddItem}
            onClose={() => setShowAddPanel(false)}
            onBrowse={onEdit}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between px-4 h-[38px] flex-shrink-0">
        <div className="flex items-center gap-2">
          <Bot size={12} className="text-muted-foreground" />
          <span className="text-[11px] text-foreground">{"\u667a\u80fd\u4f53\u4fe1\u606f"}</span>
        </div>
        <div className="flex items-center gap-0.5">
          <Tooltip content={"\u5728\u8d44\u6e90\u5e93\u4e2d\u7f16\u8f91"} side="bottom">
            <button onClick={onEdit} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/15 transition-colors">
              <Edit3 size={11} />
            </button>
          </Tooltip>
          <button onClick={onClose} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/15 transition-colors">
            <X size={12} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:bg-border/25 [&::-webkit-scrollbar-thumb]:rounded-full">
        <div className="p-4 space-y-3.5">
          {/* Avatar + Name + Desc */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/30 to-accent/10 border border-border/20 flex items-center justify-center text-[20px] flex-shrink-0">
              {agent.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-[13px] text-foreground mb-0.5">{agent.name}</h3>
              <p className="text-[10px] text-muted-foreground/60 leading-[1.5]">{agent.desc}</p>
              <div className="flex items-center gap-2 text-[9px] text-muted-foreground/45 mt-1.5">
                <Clock size={9} />
                <span>{"\u6700\u8fd1\u4f7f\u7528"} {agent.updatedAt}</span>
              </div>
            </div>
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {tags.map(t => (
                <span key={t} className="px-1.5 py-[2px] rounded text-[9px] bg-accent/30 text-foreground/70">{t}</span>
              ))}
            </div>
          )}

          {/* Info rows */}
          <div className="space-y-[6px]">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-muted-foreground/70">{"\u9ed8\u8ba4\u6a21\u578b"}</span>
              <div className="flex items-center gap-1.5 px-2 py-[3px] rounded-md bg-accent/20">
                <Sparkles size={9} className="text-muted-foreground/50" />
                <span className="text-foreground/80">{agent.model}</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-muted-foreground/70">{"\u8fd0\u884c\u6a21\u5f0f"}</span>
              <div className="flex items-center gap-1.5">
                <Workflow size={9} className={modeInfo.color} />
                <span className={modeInfo.color}>{modeInfo.label}</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-muted-foreground/70">{"\u6700\u5927\u8f6e\u6b21"}</span>
              <span className="text-foreground/70 tabular-nums">{agent.maxRounds}</span>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-muted-foreground/70">{"\u5de5\u4f5c\u76ee\u5f55"}</span>
              <span className="text-foreground/60 font-mono text-[9px]">{agent.workDir}</span>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-muted-foreground/70">{"\u81ea\u52a8\u6279\u51c6"}</span>
              <span className={agent.autoApprove ? 'text-cherry-primary' : 'text-muted-foreground/50'}>
                {agent.autoApprove ? '\u5df2\u5f00\u542f' : '\u5df2\u5173\u95ed'}
              </span>
            </div>
          </div>

          {/* System prompt — collapsible */}
          <div className="rounded-lg bg-muted/15 overflow-hidden">
            <button onClick={() => setPromptExpanded(!promptExpanded)}
              className="flex items-center gap-2 w-full px-3 py-2 text-[10.5px] text-foreground/80 hover:bg-accent/10 transition-colors">
              <FileText size={10} className="text-muted-foreground flex-shrink-0" />
              <span className="flex-1 text-left">{"\u7cfb\u7edf\u63d0\u793a\u8bcd"}</span>
              <motion.div animate={{ rotate: promptExpanded ? 90 : 0 }} transition={{ duration: 0.1 }}>
                <ChevronRight size={10} className="text-muted-foreground/50" />
              </motion.div>
            </button>
            <AnimatePresence initial={false}>
              {promptExpanded && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.15 }} className="overflow-hidden">
                  <div className="px-3 pb-3">
                    <pre className="text-[10px] text-foreground/60 leading-[1.7] whitespace-pre-wrap mt-1 font-sans">{agent.systemPrompt}</pre>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ===== Capability Extensions — 3 Tabs ===== */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-1.5">
                <Layers size={10} className="text-muted-foreground" />
                <span className="text-[10.5px] text-foreground/70">{"\u80fd\u529b\u6269\u5c55"}</span>
              </div>
              <Tooltip content={`\u6dfb\u52a0${capTab === 'tools' ? '\u5185\u7f6e\u5de5\u5177' : capTab === 'mcp' ? 'MCP Server' : 'Skill'}`} side="left">
                <button
                  onClick={() => setShowAddPanel(true)}
                  className="p-[3px] rounded text-muted-foreground/40 hover:text-foreground/70 hover:bg-accent/20 transition-colors"
                >
                  <Plus size={11} />
                </button>
              </Tooltip>
            </div>

            {/* Tab bar */}
            <div className="flex items-center gap-0 mb-2.5 border-b border-border/15">
              {CAP_TAB_CONFIG.map(t => {
                const count = t.key === 'tools' ? `${enabledToolCount}/${builtinTools.length}`
                  : t.key === 'mcp' ? `${connectedMcpCount}/${mcpServices.length}`
                  : `${enabledSkillCount}/${skills.length}`;
                const active = capTab === t.key;
                return (
                  <button
                    key={t.key}
                    onClick={() => setCapTab(t.key)}
                    className={`relative px-2.5 pb-[7px] pt-[3px] text-[10px] transition-colors ${
                      active ? 'text-foreground' : 'text-muted-foreground/50 hover:text-muted-foreground/80'
                    }`}
                  >
                    <span>{t.label}</span>
                    <span className={`ml-1 text-[9px] ${active ? 'text-muted-foreground/60' : 'text-muted-foreground/30'}`}>{count}</span>
                    {active && (
                      <motion.div
                        layoutId="cap-tab-indicator"
                        className="absolute bottom-0 left-1 right-1 h-[1.5px] bg-cherry-primary rounded-full"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Tab content */}
            <div className="min-h-[60px]">
              {/* === Built-in Tools Tab === */}
              {capTab === 'tools' && (
                builtinTools.length === 0 ? (
                  <div className="flex flex-col items-center py-5 text-center">
                    <Wrench size={16} className="text-muted-foreground/15 mb-1.5" />
                    <span className="text-[9.5px] text-muted-foreground/35">{"\u672a\u6dfb\u52a0\u5185\u7f6e\u5de5\u5177"}</span>
                    <button onClick={() => setShowAddPanel(true)} className="text-[9px] text-cherry-text-muted hover:text-cherry-primary mt-1 transition-colors">{"+ \u6dfb\u52a0\u5de5\u5177"}</button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {Array.from(toolsByCategory.entries()).map(([cat, items]) => {
                      const catEnabled = items.filter(t => t.enabled).length;
                      return (
                        <div key={cat}>
                          <div className="flex items-center justify-between mb-1 px-0.5">
                            <span className="text-[9px] text-muted-foreground/45">{cat}</span>
                            <span className="text-[8px] text-muted-foreground/30">{catEnabled}/{items.length}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
                            {items.map(tool => (
                              <div key={tool.id} className="flex items-center gap-2 px-2 py-[6px] rounded-md hover:bg-accent/10 transition-colors group">
                                <Wrench size={10} className={`flex-shrink-0 ${tool.enabled ? 'text-foreground/50' : 'text-muted-foreground/25'}`} />
                                <div className="flex-1 min-w-0">
                                  <div className={`text-[9.5px] truncate ${tool.enabled ? 'text-foreground/70' : 'text-muted-foreground/35'}`}>{tool.name}</div>
                                  <div className="text-[8px] text-muted-foreground/30 truncate">{tool.desc}</div>
                                </div>
                                <CapToggle checked={tool.enabled} onChange={() => {}} />
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              )}

              {/* === MCP Tab === */}
              {capTab === 'mcp' && (
                mcpServices.length === 0 ? (
                  <div className="flex flex-col items-center py-5 text-center">
                    <Cable size={16} className="text-muted-foreground/15 mb-1.5" />
                    <span className="text-[9.5px] text-muted-foreground/35">{"\u672a\u6dfb\u52a0 MCP Server"}</span>
                    <button onClick={() => setShowAddPanel(true)} className="text-[9px] text-cherry-text-muted hover:text-cherry-primary mt-1 transition-colors">{"+ \u6dfb\u52a0 MCP"}</button>
                  </div>
                ) : (
                  <div className="space-y-0.5">
                    {mcpServices.map(svc => (
                      <div key={svc.id} className="flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg hover:bg-accent/10 transition-colors group">
                        <div className="w-6 h-6 rounded-md bg-accent/20 flex items-center justify-center flex-shrink-0">
                          <Cable size={11} className="text-blue-500/60" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[10px] text-foreground/75 truncate">{svc.name}</div>
                          <div className="text-[8.5px] text-muted-foreground/35 truncate">{svc.desc}</div>
                        </div>
                        <span className={`w-[6px] h-[6px] rounded-full flex-shrink-0 ${
                          svc.status === 'connected' ? 'bg-cherry-primary' : 'bg-muted-foreground/25'
                        }`} />
                      </div>
                    ))}
                  </div>
                )
              )}

              {/* === Skills Tab === */}
              {capTab === 'skills' && (
                skills.length === 0 ? (
                  <div className="flex flex-col items-center py-5 text-center">
                    <Zap size={16} className="text-muted-foreground/15 mb-1.5" />
                    <span className="text-[9.5px] text-muted-foreground/35">{"\u672a\u6dfb\u52a0 Skill"}</span>
                    <button onClick={() => setShowAddPanel(true)} className="text-[9px] text-cherry-text-muted hover:text-cherry-primary mt-1 transition-colors">{"+ \u6dfb\u52a0 Skill"}</button>
                  </div>
                ) : (
                  <div className="space-y-0.5">
                    {skills.map(skill => (
                      <div key={skill.id} className="flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg hover:bg-accent/10 transition-colors">
                        <Zap size={10} className={`flex-shrink-0 ${skill.enabled ? 'text-amber-500/60' : 'text-muted-foreground/25'}`} />
                        <div className="flex-1 min-w-0">
                          <div className={`text-[10px] truncate ${skill.enabled ? 'text-foreground/75' : 'text-muted-foreground/40'}`}>{skill.name}</div>
                          <div className="text-[8.5px] text-muted-foreground/35 truncate">{skill.desc}</div>
                        </div>
                        <CapToggle checked={skill.enabled} onChange={() => {}} />
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-[9px] text-muted-foreground/40 pt-2 border-t border-border/10">
            <span>{"\u521b\u5efa\u4e8e"} {agent.createdAt}</span>
            <span>ID: {agent.id}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ===========================
// Agent Run Page
// ===========================

export function AgentRunPage({ onBack }: { onBack?: () => void } = {}) {
  const { navigateToLibrary: _navLib, changeTabTitle: onTabTitleChange, openSettings: onOpenSettings } = useGlobalActions();
  const onNavigateToLibrary = () => _navLib('agent');
  const [sessions, setSessions] = useState<AgentSession[]>(MOCK_SESSIONS);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [localMessages, setLocalMessages] = useState<Record<string, ChatMessage[]>>({});
  const [selectedFile, setSelectedFile] = useState<string | null>('src/App.tsx');
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [selectedModel, setSelectedModel] = useState(MODELS[0]);
  const [mdlSearch, setMdlSearch] = useState('');
  const [activeProvider, setActiveProvider] = useState<string>(() => MODELS[0].provider);
  const [mdlCapFilter, setMdlCapFilter] = useState<AgentModelCapability | null>(null);
  const mdlSearchRef = useRef<HTMLInputElement>(null);
  const MODEL_PROVIDERS = useMemo(() => Array.from(new Set(MODELS.map(m => m.provider))), []);
  const providerModels = useMemo(() => {
    return MODELS.filter(m => {
      const matchProvider = m.provider === activeProvider;
      const matchSearch = !mdlSearch || m.name.toLowerCase().includes(mdlSearch.toLowerCase());
      const matchCap = !mdlCapFilter || m.capabilities.includes(mdlCapFilter);
      return matchProvider && matchSearch && matchCap;
    });
  }, [activeProvider, mdlSearch, mdlCapFilter]);
  const [showExplorer, setShowExplorer] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(AVAILABLE_AGENTS[0]);
  const [previewMaximized, setPreviewMaximized] = useState(false);
  const [showAgentInfo, setShowAgentInfo] = useState(false);

  const sessionData: SessionData = useMemo(() => {
    if (!activeSessionId) return EMPTY_SESSION_DATA;
    return SESSION_DATA_MAP[activeSessionId] || EMPTY_SESSION_DATA;
  }, [activeSessionId]);

  const messages = localMessages[activeSessionId || ''] ?? sessionData.messages;
  const hasMessages = messages.length > 0;
  const activeSession = sessions.find(s => s.id === activeSessionId);

  // Sync session name to tab title
  useEffect(() => {
    if (onTabTitleChange) {
      onTabTitleChange(activeSession ? activeSession.title : '\u5de5\u4f5c');
    }
  }, [activeSession, onTabTitleChange]);

  const fileContent = selectedFile ? (sessionData.fileContents[selectedFile] || null) : null;

  const handleSelectFile = useCallback((path: string) => {
    setSelectedFile(path);
  }, []);

  const handleSelectSession = useCallback((id: string) => {
    setActiveSessionId(id);
    const data = SESSION_DATA_MAP[id];
    if (data) {
      setSelectedFile(null);
      setShowPreview(true);
      setShowExplorer(true);
      const firstKey = Object.keys(data.fileContents)[0] || null;
      setSelectedFile(firstKey);
    } else {
      setSelectedFile(null);
      setShowPreview(true);
      setShowExplorer(true);
    }
  }, []);

  const handleNewSession = useCallback(() => {
    setActiveSessionId(null);
    setShowPreview(false);
    setShowExplorer(false);
    setSelectedFile(null);
  }, []);

  const handleDeleteSession = useCallback((id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    if (activeSessionId === id) {
      setActiveSessionId(null);
      setShowPreview(false);
      setShowExplorer(false);
    }
  }, [activeSessionId]);

  const handleUpdateSession = useCallback((id: string, updates: Partial<AgentSession>) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  }, []);

  const handleSendMessage = useCallback((text: string) => {
    const ts = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

    // Auto-create session if none active
    let key = activeSessionId || '';
    if (!activeSessionId) {
      const newId = `new-${Date.now()}`;
      const newSession: AgentSession = {
        id: newId,
        title: text.slice(0, 40),
        agentName: '\u5168\u6808\u5de5\u7a0b\u5e08',
        lastMessage: text,
        timestamp: ts,
        messageCount: 1,
        status: 'active',
      };
      setSessions(prev => [newSession, ...prev]);
      setActiveSessionId(newId);
      key = newId;
    }

    const addMsg = (msg: ChatMessage) => {
      setLocalMessages(prev => ({
        ...prev,
        [key]: [...(prev[key] ?? sessionData.messages), msg],
      }));
    };

    if (!localMessages[key] && !SESSION_DATA_MAP[key]) {
      setLocalMessages(prev => ({ ...prev, [key]: [] }));
    }

    const userMsg: ChatMessage = { id: `m${Date.now()}`, role: 'user', content: text, timestamp: ts };
    setLocalMessages(prev => ({
      ...prev,
      [key]: [...(prev[key] ?? []), userMsg],
    }));

    if (key.startsWith('new-')) {
      setSessions(prev => prev.map(s =>
        s.id === key
          ? { ...s, title: text.slice(0, 40), lastMessage: text, messageCount: (s.messageCount || 0) + 1 }
          : s
      ));
    }

    setTimeout(() => {
      addMsg({ id: `m${Date.now() + 1}`, role: 'agent', thinking: '\u6b63\u5728\u5206\u6790\u9700\u6c42\u5e76\u89c4\u5212\u5b9e\u73b0\u65b9\u6848...', timestamp: ts });
    }, 600);
    setTimeout(() => {
      addMsg({ id: `m${Date.now() + 2}`, role: 'agent', toolCall: { name: '\u5206\u6790\u9879\u76ee\u7ed3\u6784', status: 'running' }, timestamp: ts });
    }, 1200);
    setTimeout(() => {
      addMsg({ id: `m${Date.now() + 3}`, role: 'agent', content: '\u6536\u5230\uff0c\u6b63\u5728\u4e3a\u4f60\u5904\u7406\u4e2d...', timestamp: ts });
    }, 2200);
  }, [activeSessionId, sessionData.messages, localMessages]);

  const handleResolveUI = useCallback((msgId: string, value: string) => {
    const key = activeSessionId || '';
    setLocalMessages(prev => {
      const msgs = prev[key] ?? sessionData.messages;
      return {
        ...prev,
        [key]: msgs.map(m => {
          if (m.id === msgId && m.generativeUI) {
            return { ...m, generativeUI: { ...m.generativeUI, resolved: true, resolvedValue: value } };
          }
          return m;
        }),
      };
    });
  }, [activeSessionId, sessionData.messages]);

  if (MODELS.length === 0) {
    return (
      <div className="flex flex-col h-full bg-background select-none relative">
        <EmptyState
          preset="no-model"
          description={"\u8bf7\u5148\u524d\u5f80\u8bbe\u7f6e\u9875\u9762\u6dfb\u52a0\u6a21\u578b\u670d\u52a1\u5546\u5e76\u542f\u7528\u6a21\u578b\uff0c\u624d\u80fd\u5f00\u59cb\u5de5\u4f5c"}
          actionLabel={"\u524d\u5f80\u8bbe\u7f6e"}
          onAction={onOpenSettings}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background select-none relative">
      {/* ===== Header ===== */}
      <header className="flex items-center justify-between px-3 border-b border-transparent flex-shrink-0 h-[40px]">
        <div className="flex items-center gap-1.5">
          {onBack && (
            <button onClick={onBack}
              className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-accent/20 transition-colors">
              <ArrowLeft size={13} />
            </button>
          )}

          {/* Agent picker — always visible */}
          <AgentPicker
            selectedAgent={selectedAgent}
            onSelectAgent={setSelectedAgent}
            onCreateNew={() => onNavigateToLibrary?.()}
            onAvatarClick={() => setShowAgentInfo(true)}
          />

          {/* Model picker — always visible */}
          <div className="w-px h-3.5 bg-border/25" />
          <div className="relative">
            <button onClick={() => { setShowModelPicker(!showModelPicker); if (!showModelPicker) { setMdlSearch(''); setMdlCapFilter(null); setActiveProvider(selectedModel.provider); } }}
              className={`flex items-center gap-1 px-1.5 py-[3px] rounded text-[9.5px] transition-all duration-100 ${
                showModelPicker
                  ? 'bg-accent/25 text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/15'
              }`}>
              <span>{selectedModel.name}</span>
              <ChevronDown size={7} className={`text-muted-foreground/50 transition-transform duration-100 ${showModelPicker ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {showModelPicker && (
                <div>
                  <div className="fixed inset-0 z-40" onClick={() => setShowModelPicker(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: -3 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -3 }}
                    transition={{ duration: 0.1 }}
                    className="absolute top-full left-0 mt-1 z-50 bg-popover border border-border/40 rounded-lg shadow-xl shadow-black/8 w-[360px]"
                    onAnimationComplete={() => mdlSearchRef.current?.focus()}
                  >
                    {/* Search */}
                    <div className="px-2 pt-2 pb-1.5">
                      <div className="flex items-center gap-1.5 px-2 py-[5px] rounded-md bg-accent/15 border border-border/20">
                        <SearchIcon size={10} className="text-muted-foreground/40 flex-shrink-0" />
                        <input ref={mdlSearchRef} value={mdlSearch} onChange={e => setMdlSearch(e.target.value)}
                          placeholder={"\u641c\u7d22\u6a21\u578b..."}
                          className="flex-1 bg-transparent text-[10px] text-foreground placeholder:text-muted-foreground/30 outline-none min-w-0" />
                        {mdlSearch && <button onClick={() => setMdlSearch('')} className="text-muted-foreground/30 hover:text-muted-foreground/60"><X size={8} /></button>}
                      </div>
                    </div>
                    {/* Tag filters */}
                    <div className="px-2.5 pb-1 pt-0.5 flex items-center gap-1 flex-wrap">
                      {ALL_AGENT_CAPABILITIES.map(cap => {
                        const Icon = AGENT_CAP_TAG_ICONS[cap];
                        const active = mdlCapFilter === cap;
                        return (
                          <button key={cap} onClick={() => setMdlCapFilter(active ? null : cap)}
                            className={`flex items-center gap-1 px-1.5 py-[2px] rounded-full text-[9px] transition-all border ${
                              active
                                ? 'bg-foreground/8 text-foreground/80 border-border/50'
                                : 'bg-accent/15 text-muted-foreground/55 border-transparent hover:bg-accent/30 hover:text-muted-foreground/75'
                            }`}>
                            <Icon size={9} />
                            <span>{AGENT_MODEL_CAPABILITY_LABELS[cap]}</span>
                          </button>
                        );
                      })}
                    </div>
                    <div className="h-px bg-border/20" />
                    {/* Two-column: providers | models */}
                    <div className="flex h-[240px]">
                      {/* Left: providers */}
                      <div className="w-[110px] border-r border-border/20 py-1 overflow-y-auto flex-shrink-0">
                        {MODEL_PROVIDERS.map(p => {
                          const count = MODELS.filter(m => m.provider === p && (!mdlCapFilter || m.capabilities.includes(mdlCapFilter))).length;
                          const provColor = AGENT_PROVIDER_COLORS[p] || 'bg-gray-400';
                          return (
                            <button key={p} onClick={() => setActiveProvider(p)}
                              className={`flex items-center gap-1.5 w-full px-2.5 py-[6px] text-[10px] transition-all duration-75 ${
                                activeProvider === p
                                  ? 'bg-accent/30 text-foreground'
                                  : 'text-foreground/60 hover:text-foreground hover:bg-accent/15'
                              }`}>
                              <span className={`w-[6px] h-[6px] rounded-full flex-shrink-0 ${provColor}`} />
                              <span className="truncate flex-1">{p}</span>
                              <span className="text-[8px] text-muted-foreground/40 flex-shrink-0">{count}</span>
                            </button>
                          );
                        })}
                      </div>
                      {/* Right: models (single select only) */}
                      <div className="flex-1 py-1 px-1.5 overflow-y-auto">
                        {providerModels.length === 0 ? (
                          <div className="px-2.5 py-3 text-center text-[9px] text-muted-foreground/40">{"\u65e0\u5339\u914d\u7ed3\u679c"}</div>
                        ) : (
                          providerModels.map(m => {
                            const selected = selectedModel.id === m.id;
                            return (
                              <button key={m.id} onClick={() => { setSelectedModel(m); setShowModelPicker(false); }}
                                className={`flex items-center gap-2 w-full px-2 py-[5px] rounded-lg text-[10px] transition-all duration-75 mb-px ${
                                  selected ? 'bg-accent/30 ring-1 ring-border/30' : 'text-foreground/70 hover:text-foreground hover:bg-accent/15'
                                }`}>
                                <span className={`flex-1 text-left truncate ${selected ? 'text-foreground' : ''}`}>{m.name}</span>
                                <div className="flex items-center gap-[3px] flex-shrink-0">
                                  {m.capabilities.map(cap => {
                                    const ci = AGENT_CAP_ICONS[cap];
                                    const CapIcon = ci.icon;
                                    return <CapIcon key={cap} size={10} className={`${ci.color}/40`} />;
                                  })}
                                </div>
                                {selected && <Check size={9} className="text-cherry-primary flex-shrink-0 ml-0.5" />}
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* WorkDir — always visible */}
          <div className="w-px h-3.5 bg-border/25" />
          <button className="flex items-center gap-1.5 px-1.5 py-0.5 rounded text-[9.5px] text-muted-foreground hover:text-foreground/80 hover:bg-accent/15 transition-colors font-mono">
            <FolderOpen size={9} />
            {sessionData.workDir || '~/projects'}
          </button>

          {/* Session-specific controls — only when working */}
          {hasMessages && (
            <div className="flex items-center gap-1.5">
              <div className="w-px h-3.5 bg-border/25" />

              <CompactSessionSelector
                sessions={sessions}
                activeSession={activeSession}
                onSelectSession={handleSelectSession}
                onOpenHistory={() => setShowHistory(true)}
              />

              {sessionData.workDir && (
                <div className="flex items-center gap-1.5">
                  <div className="w-px h-3.5 bg-border/25" />
                  <div className="flex items-center gap-1 text-[9px] text-cherry-primary-dark">
                    <Circle size={5} className="fill-cherry-primary" />
                    {activeSession?.status === 'active' ? '\u8fd0\u884c\u4e2d' : '\u5df2\u5b8c\u6210'}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-0.5">
          {hasMessages && (
            <Tooltip content={"\u65b0\u5efa\u4f1a\u8bdd"} side="bottom"><button onClick={handleNewSession}
              className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-accent/15 transition-colors">
              <MessageCirclePlus size={13} />
            </button></Tooltip>
          )}

          {/* History — always visible */}
          <Tooltip content={"\u5386\u53f2\u8bb0\u5f55"} side="bottom"><button onClick={() => setShowHistory(true)}
            className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-accent/15 transition-colors">
            <History size={13} />
          </button></Tooltip>

          {/* Show preview panel — when preview is hidden */}
          {!showPreview && (
            <div className="flex items-center gap-0.5">
              <div className="w-px h-3.5 bg-border/25 mx-0.5" />
              <Tooltip content={"\u663e\u793a\u9884\u89c8\u9762\u677f"} side="bottom"><button onClick={() => { setShowPreview(true); setShowExplorer(true); }}
                className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-accent/15 transition-colors">
                <Columns2 size={12} />
              </button></Tooltip>
            </div>
          )}

          {hasMessages && (
            <div className="flex items-center gap-0.5">
              <div className="w-px h-3.5 bg-border/25 mx-0.5" />
              <Tooltip content={"\u5bfc\u51fa"} side="bottom"><button className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-accent/15 transition-colors">
                <Download size={11} />
              </button></Tooltip>
              <Tooltip content={"\u5206\u4eab"} side="bottom"><button className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-accent/15 transition-colors">
                <Share2 size={11} />
              </button></Tooltip>
            </div>
          )}
        </div>
      </header>

      {/* ===== Main Content ===== */}
      <div className="flex flex-1 min-h-0 pl-2">
        <AnimatePresence initial={false}>
          {showPreview && (
            <motion.div
              initial={{ opacity: 0, marginLeft: -8 }}
              animate={{ opacity: 1, marginLeft: 0 }}
              exit={{ opacity: 0, marginLeft: -8 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              className="flex flex-1 min-w-0 my-1.5 mr-1 rounded-2xl border border-border/40 bg-card/50 shadow-sm shadow-black/5 overflow-hidden"
            >
              <AnimatePresence initial={false}>
                {showExplorer && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 200, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
                    className="border-r border-border/25 flex-shrink-0 overflow-hidden"
                  >
                    <FileExplorer
                      files={sessionData.files.length > 0 ? sessionData.files : DEFAULT_INITIAL_FILES}
                      outputFiles={sessionData.outputFiles}
                      selectedFile={selectedFile}
                      onSelectFile={handleSelectFile}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex-1 min-w-0 overflow-hidden">
                <ArtifactViewer
                  fileContent={fileContent}
                  fileName={selectedFile}
                  previewUrl={null}
                  hasArtifact={!!sessionData.previewHtml || !!fileContent}
                  previewHtml={sessionData.previewHtml}
                  showExplorer={showExplorer}
                  onToggleExplorer={() => setShowExplorer(!showExplorer)}
                  showPreview={showPreview}
                  onTogglePreview={() => setShowPreview(!showPreview)}
                  maximized={previewMaximized}
                  onToggleMaximize={() => setPreviewMaximized(!previewMaximized)}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!previewMaximized && (
          !hasMessages ? (
            <div
              className={`overflow-hidden ${showPreview ? 'flex-shrink-0' : 'flex-1'}`}
              style={showPreview ? { width: 330 } : undefined}
            >
              <NewSessionEmpty onSendMessage={handleSendMessage} />
            </div>
          ) : (
            <div
              className={`overflow-hidden ${showPreview ? 'flex-shrink-0' : 'flex-1'}`}
              style={showPreview ? { width: 330 } : undefined}
            >
              <ChatPanel
                messages={messages}
                steps={sessionData.steps}
                onSendMessage={handleSendMessage}
                onResolveUI={handleResolveUI}
                onAvatarClick={() => setShowAgentInfo(true)}
              />
            </div>
          )
        )}
      </div>

      {/* ===== History Overlay ===== */}
      <AnimatePresence>
        {showHistory && (
          <SessionHistoryPage
            sessions={sessions}
            activeSessionId={activeSessionId}
            onSelectSession={handleSelectSession}
            onDeleteSession={handleDeleteSession}
            onUpdateSession={handleUpdateSession}
            onClose={() => setShowHistory(false)}
          />
        )}
      </AnimatePresence>

      {/* ===== Agent Info Overlay ===== */}
      <AnimatePresence>
        {showAgentInfo && (
          <AgentInfoPanel
            agent={selectedAgent}
            onClose={() => setShowAgentInfo(false)}
            onEdit={() => onNavigateToLibrary?.()}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
