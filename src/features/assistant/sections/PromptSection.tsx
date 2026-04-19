import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Plus, Trash2, ChevronDown, ChevronRight,
  Variable, MessageCircle, X, Search,
  Braces, Hash, ToggleLeft, ListOrdered, FileJson,
  Clock, Calendar, Bot, Globe, Fingerprint,
  Settings2, GripHorizontal,
  BookOpen, Wrench, FileText, Database, Code, Image,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@cherry-studio/ui';
import {
  VarManagerPanel, SYSTEM_VARIABLES, SYSTEM_VAR_ICONS, VAR_TYPE_CONFIG,
  type VariableDef, type VarType,
} from '@/app/components/ui/VarManagerPanel';

// ===========================
// Types
// ===========================

type BadgeKind = 'system' | 'custom' | 'kb' | 'mcp';
type SlashTab = 'var' | 'kb' | 'mcp';

interface KBItem {
  id: string;
  name: string;
  description: string;
  docCount: number;
}

interface MCPTool {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
}

interface FewShotExample {
  id: string;
  user: string;
  assistant: string;
}

// ===========================
// Constants
// ===========================

const MOCK_KB_ITEMS: KBItem[] = [
  { id: 'kb-1', name: '产品文档', description: '产品功能说明与使用手册', docCount: 42 },
  { id: 'kb-2', name: 'API 参考手册', description: 'RESTful API 接口文档', docCount: 128 },
  { id: 'kb-3', name: '用户指南', description: '面向终端用户的操作指南', docCount: 35 },
  { id: 'kb-4', name: '常见问题 FAQ', description: '高频问题与解答集合', docCount: 86 },
  { id: 'kb-5', name: '技术架构文档', description: '系统架构设计与技术选型', docCount: 19 },
];

const MOCK_MCP_TOOLS: MCPTool[] = [
  { id: 'mcp-1', name: 'web_search', description: '联网搜索实时信息', icon: Search },
  { id: 'mcp-2', name: 'code_interpreter', description: '执行代码并返回结果', icon: Code },
  { id: 'mcp-3', name: 'file_reader', description: '读取和解析文件内容', icon: FileText },
  { id: 'mcp-4', name: 'image_gen', description: '根据描述生成图片', icon: Image },
  { id: 'mcp-5', name: 'database_query', description: '查询数据库获取数据', icon: Database },
];

const SLASH_TABS: { id: SlashTab; label: string; icon: React.ElementType }[] = [
  { id: 'var', label: '变量', icon: Variable },
  { id: 'kb', label: '知识库', icon: BookOpen },
  { id: 'mcp', label: 'MCP', icon: Wrench },
];

// ===========================
// Badge styles per kind
// ===========================

const BADGE_STYLES: Record<BadgeKind, string> = {
  system: 'display:inline-flex;align-items:center;gap:2px;padding:1px 7px;margin:0 2px;border-radius:5px;background:rgba(20,184,166,0.13);color:rgb(94,234,212);font-size:10px;line-height:1.6;cursor:default;user-select:all;vertical-align:baseline;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;white-space:nowrap;',
  custom: 'display:inline-flex;align-items:center;gap:2px;padding:1px 7px;margin:0 2px;border-radius:5px;background:rgba(139,92,246,0.13);color:rgb(167,139,250);font-size:10px;line-height:1.6;cursor:default;user-select:all;vertical-align:baseline;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;white-space:nowrap;',
  kb: 'display:inline-flex;align-items:center;gap:2px;padding:1px 7px;margin:0 2px;border-radius:5px;background:rgba(59,130,246,0.13);color:rgb(147,197,253);font-size:10px;line-height:1.6;cursor:default;user-select:all;vertical-align:baseline;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;white-space:nowrap;',
  mcp: 'display:inline-flex;align-items:center;gap:2px;padding:1px 7px;margin:0 2px;border-radius:5px;background:rgba(245,158,11,0.13);color:rgb(252,211,77);font-size:10px;line-height:1.6;cursor:default;user-select:all;vertical-align:baseline;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;white-space:nowrap;',
};

// ===========================
// Regex helpers (no regex literals per project constraint)
// ===========================

const RE_AMP = new RegExp('&', 'g');
const RE_LT = new RegExp('<', 'g');
const RE_GT = new RegExp('>', 'g');
const RE_DBL_BRACE = new RegExp(String.fromCharCode(92) + '{' + String.fromCharCode(92) + '{(' + String.fromCharCode(92) + 'w+)' + String.fromCharCode(92) + '}' + String.fromCharCode(92) + '}', 'g');
const RE_DBL_BRACKET = new RegExp(String.fromCharCode(92) + '[' + String.fromCharCode(92) + '[(.+?)' + String.fromCharCode(92) + ']' + String.fromCharCode(92) + ']', 'g');
const RE_ESCAPED_ANGLE = new RegExp('&lt;&lt;(.+?)&gt;&gt;', 'g');
const RE_NEWLINE = new RegExp(String.fromCharCode(10), 'g');
const RE_MATCH_BRACE = new RegExp(String.fromCharCode(92) + '{' + String.fromCharCode(92) + '{[' + String.fromCharCode(92) + 'w]+' + String.fromCharCode(92) + '}' + String.fromCharCode(92) + '}', 'g');
const RE_MATCH_BRACKET = new RegExp(String.fromCharCode(92) + '[' + String.fromCharCode(92) + '[.+?' + String.fromCharCode(92) + ']' + String.fromCharCode(92) + ']', 'g');
const RE_MATCH_ANGLE = new RegExp('<<.+?>>', 'g');
const RE_STRIP_BRACE = new RegExp(String.fromCharCode(92) + '{' + String.fromCharCode(92) + '{' + String.fromCharCode(92) + 'w+' + String.fromCharCode(92) + '}' + String.fromCharCode(92) + '}', 'g');
const RE_STRIP_BRACKET = new RegExp(String.fromCharCode(92) + '[' + String.fromCharCode(92) + '[.+?' + String.fromCharCode(92) + ']' + String.fromCharCode(92) + ']', 'g');
const RE_STRIP_ANGLE = new RegExp('<<.+?>>', 'g');

// ===========================
// DOM helpers
// ===========================

function rawToHTML(text: string): string {
  if (!text) return '<br>';
  const escaped = text
    .replace(RE_AMP, '&amp;')
    .replace(RE_LT, '&lt;')
    .replace(RE_GT, '&gt;');
  // Match {{var}}, [[kb]], <<mcp>>
  const withBadges = escaped
    .replace(RE_DBL_BRACE, (_: string, name: string) => {
      const kind = SYSTEM_VARIABLES.some(v => v.name === name) ? 'system' : 'custom';
      const icon = kind === 'system' ? '⚙ ' : '✦ ';
      return `<span contenteditable="false" data-var="${name}" data-kind="${kind}" style="${BADGE_STYLES[kind]}">${icon}${name}</span>`;
    })
    .replace(RE_DBL_BRACKET, (_: string, name: string) => {
      return `<span contenteditable="false" data-kb="${name}" data-kind="kb" style="${BADGE_STYLES.kb}">📖 ${name}</span>`;
    })
    .replace(RE_ESCAPED_ANGLE, (_: string, name: string) => {
      return `<span contenteditable="false" data-mcp="${name}" data-kind="mcp" style="${BADGE_STYLES.mcp}">⚡ ${name}</span>`;
    });
  const withBreaks = withBadges.replace(RE_NEWLINE, '<br>');
  return withBreaks || '<br>';
}

function domToRaw(el: HTMLElement): string {
  let t = '';
  for (const node of Array.from(el.childNodes)) {
    if (node.nodeType === Node.TEXT_NODE) {
      t += node.textContent || '';
    } else if (node instanceof HTMLElement) {
      if (node.dataset.var) {
        t += `{{${node.dataset.var}}}`;
      } else if (node.dataset.kb) {
        t += `[[${node.dataset.kb}]]`;
      } else if (node.dataset.mcp) {
        t += `<<${node.dataset.mcp}>>`;
      } else if (node.tagName === 'BR') {
        t += '\n';
      } else if (node.tagName === 'DIV' || node.tagName === 'P') {
        if (t && !t.endsWith('\n')) t += '\n';
        t += domToRaw(node);
      } else {
        t += domToRaw(node);
      }
    }
  }
  return t;
}

function createBadgeElement(name: string, kind: BadgeKind): HTMLSpanElement {
  const span = document.createElement('span');
  span.contentEditable = 'false';
  if (kind === 'kb') {
    span.dataset.kb = name;
    span.textContent = `📖 ${name}`;
  } else if (kind === 'mcp') {
    span.dataset.mcp = name;
    span.textContent = `⚡ ${name}`;
  } else {
    span.dataset.var = name;
    const icon = kind === 'system' ? '⚙ ' : '✦ ';
    span.textContent = `${icon}${name}`;
  }
  span.dataset.kind = kind;
  span.setAttribute('style', BADGE_STYLES[kind]);
  return span;
}

// ===========================
// Main Prompt Section
// ===========================

export function PromptSection({ hideFewShot }: { hideFewShot?: boolean } = {}) {
  const [systemPrompt, setSystemPrompt] = useState(
    `你是一个专业的 AI 助手。请遵循以下规则：\n\n1. 始终使用中文回复\n2. 回答简洁、准确\n3. 如果不确定，请如实告知\n4. 使用 {{user_name}} 来称呼用户`
  );

  const [variables, setVariables] = useState<VariableDef[]>([
    { id: 'v1', name: 'user_name', defaultValue: '用户', description: '用户的称呼', type: 'string' },
    { id: 'v2', name: 'language', defaultValue: '中文', description: '输出语言', type: 'string' },
    { id: 'v3', name: 'max_tokens', defaultValue: '2048', description: '最大输出长度', type: 'number' },
  ]);

  const [fewShots, setFewShots] = useState<FewShotExample[]>([
    { id: 'fs1', user: '你好，请帮我写一段自我介绍', assistant: '你好！我来帮你写一段自我介绍。请告诉我你的姓名、职业和想要突出的特点。' },
  ]);

  const [fsOpen, setFsOpen] = useState(true);

  // Variable panel & slash command
  const [showVarPanel, setShowVarPanel] = useState(false);
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashSearch, setSlashSearch] = useState('');
  const [slashPos, setSlashPos] = useState({ top: 0, left: 0 });
  const [slashIndex, setSlashIndex] = useState(0);
  const [slashTab, setSlashTab] = useState<SlashTab>('var');

  // Editor
  const editorRef = useRef<HTMLDivElement>(null);
  const slashMenuRef = useRef<HTMLDivElement>(null);
  const slashNodeRef = useRef<Text | null>(null);
  const slashOffsetRef = useRef(0);
  const lastRangeRef = useRef<Range | null>(null);
  const isComposing = useRef(false);
  const [editorHeight, setEditorHeight] = useState(220);
  const [editorEmpty, setEditorEmpty] = useState(false);
  const showSlashRef = useRef(false);

  // All variables (system + user)
  const allVariables = [...SYSTEM_VARIABLES, ...variables];

  // Filtered items per slash tab
  const filteredSlashVars = allVariables.filter(v =>
    v.name.toLowerCase().includes(slashSearch.toLowerCase()) ||
    v.description.toLowerCase().includes(slashSearch.toLowerCase())
  );
  const filteredSlashKB = MOCK_KB_ITEMS.filter(k =>
    k.name.toLowerCase().includes(slashSearch.toLowerCase()) ||
    k.description.toLowerCase().includes(slashSearch.toLowerCase())
  );
  const filteredSlashMCP = MOCK_MCP_TOOLS.filter(m =>
    m.name.toLowerCase().includes(slashSearch.toLowerCase()) ||
    m.description.toLowerCase().includes(slashSearch.toLowerCase())
  );

  // Current tab item count for keyboard nav
  const currentTabItems = slashTab === 'var' ? filteredSlashVars : slashTab === 'kb' ? filteredSlashKB : filteredSlashMCP;

  // Variables handlers
  const addVariable = () => {
    const newId = `v-${Date.now()}`;
    setVariables(prev => [...prev, { id: newId, name: '', defaultValue: '', description: '', type: 'string' }]);
    return newId;
  };
  const updateVariable = (id: string, field: keyof VariableDef, value: string) => {
    setVariables(prev => prev.map(v => v.id === id ? { ...v, [field]: value } : v));
  };
  const updateVariableType = (id: string, type: VarType) => {
    setVariables(prev => prev.map(v => v.id === id ? { ...v, type } : v));
  };
  const removeVariable = (id: string) => {
    setVariables(prev => prev.filter(v => v.id !== id));
  };

  // Few-shot handlers
  const addFewShot = () => {
    setFewShots(prev => [...prev, { id: `fs-${Date.now()}`, user: '', assistant: '' }]);
  };
  const updateFewShot = (id: string, field: 'user' | 'assistant', value: string) => {
    setFewShots(prev => prev.map(fs => fs.id === id ? { ...fs, [field]: value } : fs));
  };
  const removeFewShot = (id: string) => {
    setFewShots(prev => prev.filter(fs => fs.id !== id));
  };

  // ===========================
  // Editor initialization
  // ===========================

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = rawToHTML(systemPrompt);
      setEditorEmpty(!systemPrompt.trim());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===========================
  // Sync raw text from DOM
  // ===========================

  const syncFromDOM = useCallback(() => {
    const el = editorRef.current;
    if (!el) return '';
    const raw = domToRaw(el);
    setSystemPrompt(raw);
    setEditorEmpty(!raw.replace(RE_NEWLINE, '').trim());
    return raw;
  }, []);

  // ===========================
  // Save selection on blur / selection change
  // ===========================

  const saveSelection = useCallback(() => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && editorRef.current?.contains(sel.anchorNode)) {
      lastRangeRef.current = sel.getRangeAt(0).cloneRange();
    }
  }, []);

  useEffect(() => {
    document.addEventListener('selectionchange', saveSelection);
    return () => document.removeEventListener('selectionchange', saveSelection);
  }, [saveSelection]);

  // ===========================
  // Slash menu helpers
  // ===========================

  const dismissSlash = useCallback(() => {
    setShowSlashMenu(false);
    showSlashRef.current = false;
    setSlashSearch('');
    slashNodeRef.current = null;
    slashOffsetRef.current = 0;
    setSlashIndex(0);
  }, []);

  // ===========================
  // Insert badge into editor (generic)
  // ===========================

  const insertBadge = useCallback((name: string, kind: BadgeKind) => {
    const el = editorRef.current;
    if (!el) return;
    el.focus();

    const sel = window.getSelection();
    if (!sel) return;

    // If from slash menu, delete the /search text
    if (showSlashRef.current && slashNodeRef.current) {
      try {
        const range = document.createRange();
        const startOff = Math.max(0, slashOffsetRef.current - 1);
        range.setStart(slashNodeRef.current, startOff);
        const currentRange = sel.rangeCount > 0 ? sel.getRangeAt(0) : null;
        if (currentRange) {
          range.setEnd(currentRange.startContainer, currentRange.startOffset);
        } else {
          range.setEnd(slashNodeRef.current, slashNodeRef.current.length);
        }
        range.deleteContents();
        sel.removeAllRanges();
        sel.addRange(range);
      } catch {
        // fallback
      }
    } else if (!el.contains(sel.anchorNode) && lastRangeRef.current) {
      sel.removeAllRanges();
      sel.addRange(lastRangeRef.current);
    }

    // Insert badge
    const badge = createBadgeElement(name, kind);

    if (sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      range.deleteContents();
      range.insertNode(badge);
    } else {
      el.appendChild(badge);
    }

    // Add a space after badge for cursor
    const space = document.createTextNode('\u00A0');
    badge.after(space);

    // Move cursor after space
    const newRange = document.createRange();
    newRange.setStartAfter(space);
    newRange.collapse(true);
    sel.removeAllRanges();
    sel.addRange(newRange);

    // Sync
    syncFromDOM();
    dismissSlash();
  }, [syncFromDOM, dismissSlash]);

  // Convenience: insert variable
  const insertVariable = useCallback((varName: string) => {
    const kind = SYSTEM_VARIABLES.some(v => v.name === varName) ? 'system' : 'custom';
    insertBadge(varName, kind);
  }, [insertBadge]);

  // ===========================
  // Handle slash menu item selection
  // ===========================

  const handleSlashSelect = useCallback(() => {
    if (slashTab === 'var') {
      const item = filteredSlashVars[slashIndex];
      if (item) insertVariable(item.name);
    } else if (slashTab === 'kb') {
      const item = filteredSlashKB[slashIndex];
      if (item) insertBadge(item.name, 'kb');
    } else {
      const item = filteredSlashMCP[slashIndex];
      if (item) insertBadge(item.name, 'mcp');
    }
  }, [slashTab, slashIndex, filteredSlashVars, filteredSlashKB, filteredSlashMCP, insertVariable, insertBadge]);

  // ===========================
  // Editor input handler
  // ===========================

  const handleEditorInput = useCallback(() => {
    if (isComposing.current) return;
    const el = editorRef.current;
    if (!el) return;

    syncFromDOM();

    // Slash detection
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);

    if (showSlashRef.current && slashNodeRef.current) {
      if (range.startContainer === slashNodeRef.current) {
        const text = slashNodeRef.current.textContent || '';
        const searchText = text.slice(slashOffsetRef.current, range.startOffset);
        if (searchText.includes(' ') || searchText.includes('\n') || range.startOffset < slashOffsetRef.current) {
          dismissSlash();
        } else {
          setSlashSearch(searchText);
          setSlashIndex(0);
        }
      } else {
        dismissSlash();
      }
    } else {
      if (range.startContainer.nodeType === Node.TEXT_NODE) {
        const text = range.startContainer.textContent || '';
        const offset = range.startOffset;
        if (offset > 0 && text[offset - 1] === '/') {
          const before = offset > 1 ? text[offset - 2] : '';
          if (!before || before === ' ' || before === '\n' || before === '\u00A0') {
            try {
              const tempRange = document.createRange();
              tempRange.setStart(range.startContainer, offset - 1);
              tempRange.setEnd(range.startContainer, offset);
              const rect = tempRange.getBoundingClientRect();
              const editorRect = el.getBoundingClientRect();

              slashNodeRef.current = range.startContainer as Text;
              slashOffsetRef.current = offset;

              setSlashPos({
                top: rect.bottom - editorRect.top + 4,
                left: rect.left - editorRect.left,
              });
              setShowSlashMenu(true);
              showSlashRef.current = true;
              setSlashSearch('');
              setSlashIndex(0);
              setSlashTab('var');
            } catch {
              // ignore
            }
          }
        }
      }
    }
  }, [syncFromDOM, dismissSlash]);

  // ===========================
  // Editor keydown handler
  // ===========================

  const handleEditorKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (showSlashRef.current) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSlashIndex(prev => Math.min(prev + 1, currentTabItems.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSlashIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleSlashSelect();
      } else if (e.key === 'Tab') {
        e.preventDefault();
        // Cycle through tabs
        setSlashTab(prev => {
          const tabs: SlashTab[] = ['var', 'kb', 'mcp'];
          const dir = e.shiftKey ? -1 : 1;
          const idx = tabs.indexOf(prev);
          return tabs[(idx + dir + tabs.length) % tabs.length];
        });
        setSlashIndex(0);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        dismissSlash();
      }
      return;
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      document.execCommand('insertLineBreak');
      syncFromDOM();
    }
  }, [currentTabItems.length, handleSlashSelect, dismissSlash, syncFromDOM]);

  // ===========================
  // Paste handler
  // ===========================

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
    syncFromDOM();
  }, [syncFromDOM]);

  // ===========================
  // Resize handler
  // ===========================

  const startResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const startY = e.clientY;
    const startH = editorHeight;
    const onMove = (ev: MouseEvent) => {
      setEditorHeight(Math.max(120, Math.min(500, startH + ev.clientY - startY)));
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    document.body.style.cursor = 'ns-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [editorHeight]);

  // Close slash menu on outside click
  useEffect(() => {
    if (!showSlashMenu) return;
    const handleClick = (e: MouseEvent) => {
      if (slashMenuRef.current && !slashMenuRef.current.contains(e.target as Node) &&
          editorRef.current && !editorRef.current.contains(e.target as Node)) {
        dismissSlash();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showSlashMenu, dismissSlash]);

  // Scroll slash menu active item into view
  useEffect(() => {
    if (showSlashMenu && slashMenuRef.current) {
      const active = slashMenuRef.current.querySelector('[data-active="true"]');
      active?.scrollIntoView({ block: 'nearest' });
    }
  }, [slashIndex, showSlashMenu]);

  const highlightedCount = (systemPrompt.match(RE_MATCH_BRACE) || []).length;
  const kbCount = (systemPrompt.match(RE_MATCH_BRACKET) || []).length;
  const mcpCount = (systemPrompt.match(RE_MATCH_ANGLE) || []).length;
  const charCount = systemPrompt
    .replace(RE_STRIP_BRACE, (m: string) => m.slice(2, -2))
    .replace(RE_STRIP_BRACKET, (m: string) => m.slice(2, -2))
    .replace(RE_STRIP_ANGLE, (m: string) => m.slice(2, -2))
    .length;

  const refTotal = highlightedCount + kbCount + mcpCount;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h3 className="text-sm text-foreground mb-1">提示词配置</h3>
        <p className="text-xs text-muted-foreground/55">{hideFewShot ? '定义 System Prompt 和变量' : '定义 System Prompt、变量和对话样本'}</p>
      </div>

      {/* System Prompt */}
      <div>
        <div className="flex items-center mb-1.5">
          <label className="text-xs text-foreground/80">系统提示词</label>
          <div className="flex-1" />
          <Button
            variant="ghost"
            size="xs"
            onClick={() => setShowVarPanel(true)}
            className="gap-1 px-2 py-0.5 rounded-md text-[9px] text-violet-500/70 bg-violet-500/8 hover:bg-violet-500/15 hover:text-violet-500 border border-violet-500/15 transition-all h-auto"
          >
            <Variable size={9} />
            <span>变量管理</span>
          </Button>
        </div>
        <div className="relative">
          {/* ContentEditable Editor */}
          <div className="rounded-xl border border-border/20 bg-accent/10 transition-all focus-within:border-border/40 focus-within:bg-accent/15 overflow-hidden">
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              onInput={handleEditorInput}
              onKeyDown={handleEditorKeyDown}
              onPaste={handlePaste}
              onCompositionStart={() => { isComposing.current = true; }}
              onCompositionEnd={() => { isComposing.current = false; handleEditorInput(); }}
              spellCheck={false}
              className="w-full px-4 py-3 text-xs text-foreground outline-none font-mono leading-relaxed overflow-y-auto [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:bg-border/30 [&::-webkit-scrollbar-thumb]:rounded-full"
              style={{ minHeight: 120, height: editorHeight }}
            />
            {editorEmpty && (
              <div className="absolute top-3 left-4 text-xs text-muted-foreground/25 font-mono pointer-events-none select-none">
                输入 / 快速插入变量、知识库、MCP 工具...
              </div>
            )}
            {/* Resize handle */}
            <div
              className="flex items-center justify-center h-4 cursor-ns-resize group/resize hover:bg-accent/20 transition-colors"
              onMouseDown={startResize}
            >
              <GripHorizontal size={10} className="text-muted-foreground/20 group-hover/resize:text-muted-foreground/40 transition-colors" />
            </div>
          </div>

          {/* Slash command popup with tabs */}
          <AnimatePresence>
            {showSlashMenu && (
              <motion.div
                ref={slashMenuRef}
                initial={{ opacity: 0, y: -4, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.98 }}
                transition={{ duration: 0.12 }}
                className="absolute z-50 bg-popover border border-border/30 rounded-xl shadow-2xl shadow-black/10 w-[300px] max-h-[280px] overflow-hidden"
                style={{ top: slashPos.top, left: slashPos.left }}
              >
                {/* Tab bar */}
                <div className="px-2 pt-2 pb-0 border-b border-border/15">
                  <div className="flex items-center gap-0.5">
                    {SLASH_TABS.map(tab => {
                      const TabIcon = tab.icon;
                      const isActive = slashTab === tab.id;
                      return (
                        <Button
                          variant="ghost"
                          size="xs"
                          key={tab.id}
                          onClick={() => { setSlashTab(tab.id); setSlashIndex(0); }}
                          className={`gap-1 px-2.5 py-1.5 rounded-t-lg text-[9px] transition-all border-b-2 h-auto ${
                            isActive
                              ? 'text-foreground border-foreground/40 bg-accent/30'
                              : 'text-muted-foreground/45 border-transparent hover:text-foreground/70 hover:bg-accent/15'
                          }`}
                        >
                          <TabIcon size={9} />
                          <span>{tab.label}</span>
                        </Button>
                      );
                    })}
                    {slashSearch && (
                      <span className="text-[8px] text-muted-foreground/30 ml-auto pr-1 truncate max-w-[80px]">
                        {slashSearch}
                      </span>
                    )}
                  </div>
                </div>

                {/* Tab content */}
                <div className="overflow-y-auto max-h-[210px] py-1 [&::-webkit-scrollbar]:w-[2px] [&::-webkit-scrollbar-thumb]:bg-border/30">
                  {/* Variables tab */}
                  {slashTab === 'var' && (
                    <div>
                      {filteredSlashVars.length === 0 && (
                        <div className="px-3 py-4 text-center text-[9px] text-muted-foreground/35">无匹配变量</div>
                      )}
                      {/* System variables */}
                      {filteredSlashVars.some(v => v.isSystem) && (
                        <div className="px-3 pt-1.5 pb-0.5">
                          <span className="text-[8px] text-muted-foreground/35 uppercase tracking-wider">系统变量</span>
                        </div>
                      )}
                      {filteredSlashVars.filter(v => v.isSystem).map((v) => {
                        const idx = filteredSlashVars.indexOf(v);
                        const SysIcon = SYSTEM_VAR_ICONS[v.name] || Variable;
                        return (
                          <Button
                            variant="ghost"
                            size="xs"
                            key={v.id}
                            data-active={idx === slashIndex}
                            onClick={() => insertVariable(v.name)}
                            className={`gap-2 w-full px-3 py-[6px] justify-start h-auto ${
                              idx === slashIndex ? 'bg-accent/60 text-foreground' : 'text-muted-foreground/70 hover:bg-accent/30 hover:text-foreground'
                            }`}
                          >
                            <SysIcon size={11} className="text-teal-400/60 flex-shrink-0" />
                            <span className="text-xs font-mono flex-shrink-0">{v.name}</span>
                            <span className="text-[9px] text-muted-foreground/40 truncate ml-auto">{v.description}</span>
                          </Button>
                        );
                      })}
                      {/* User variables */}
                      {filteredSlashVars.some(v => !v.isSystem) && (
                        <div className="px-3 pt-2 pb-0.5">
                          <span className="text-[8px] text-muted-foreground/35 uppercase tracking-wider">自定义变量</span>
                        </div>
                      )}
                      {filteredSlashVars.filter(v => !v.isSystem).map((v) => {
                        const idx = filteredSlashVars.indexOf(v);
                        const tc = VAR_TYPE_CONFIG[v.type];
                        const TypeIcon = tc.icon;
                        return (
                          <Button
                            variant="ghost"
                            size="xs"
                            key={v.id}
                            data-active={idx === slashIndex}
                            onClick={() => insertVariable(v.name)}
                            className={`gap-2 w-full px-3 py-[6px] justify-start h-auto ${
                              idx === slashIndex ? 'bg-accent/60 text-foreground' : 'text-muted-foreground/70 hover:bg-accent/30 hover:text-foreground'
                            }`}
                          >
                            <TypeIcon size={11} className={`flex-shrink-0 ${tc.color.split(' ')[0]}`} />
                            <span className="text-xs font-mono flex-shrink-0">{v.name}</span>
                            <span className="text-[9px] text-muted-foreground/40 truncate ml-auto">{v.description || v.defaultValue}</span>
                          </Button>
                        );
                      })}
                    </div>
                  )}

                  {/* Knowledge base tab */}
                  {slashTab === 'kb' && (
                    <div>
                      {filteredSlashKB.length === 0 && (
                        <div className="px-3 py-4 text-center text-[9px] text-muted-foreground/35">无匹配知识库</div>
                      )}
                      {filteredSlashKB.map((kb, i) => (
                        <Button
                          variant="ghost"
                          size="xs"
                          key={kb.id}
                          data-active={i === slashIndex}
                          onClick={() => insertBadge(kb.name, 'kb')}
                          className={`gap-2 w-full px-3 py-[6px] justify-start h-auto ${
                            i === slashIndex ? 'bg-accent/60 text-foreground' : 'text-muted-foreground/70 hover:bg-accent/30 hover:text-foreground'
                          }`}
                        >
                          <BookOpen size={11} className="text-info/60 flex-shrink-0" />
                          <span className="text-xs flex-shrink-0">{kb.name}</span>
                          <span className="text-[9px] text-muted-foreground/40 truncate ml-auto">{kb.docCount} 篇</span>
                        </Button>
                      ))}
                    </div>
                  )}

                  {/* MCP tools tab */}
                  {slashTab === 'mcp' && (
                    <div>
                      {filteredSlashMCP.length === 0 && (
                        <div className="px-3 py-4 text-center text-[9px] text-muted-foreground/35">无匹配工具</div>
                      )}
                      {filteredSlashMCP.map((tool, i) => {
                        const ToolIcon = tool.icon;
                        return (
                          <Button
                            variant="ghost"
                            size="xs"
                            key={tool.id}
                            data-active={i === slashIndex}
                            onClick={() => insertBadge(tool.name, 'mcp')}
                            className={`gap-2 w-full px-3 py-[6px] justify-start h-auto ${
                              i === slashIndex ? 'bg-accent/60 text-foreground' : 'text-muted-foreground/70 hover:bg-accent/30 hover:text-foreground'
                            }`}
                          >
                            <ToolIcon size={11} className="text-warning/60 flex-shrink-0" />
                            <span className="text-xs font-mono flex-shrink-0">{tool.name}</span>
                            <span className="text-[9px] text-muted-foreground/40 truncate ml-auto">{tool.description}</span>
                          </Button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="px-3 py-1.5 border-t border-border/15 flex items-center gap-3 text-[8px] text-muted-foreground/30">
                  <span>↑↓ 导航</span>
                  <span>↵ 选择</span>
                  <span>Tab 切换</span>
                  <span>Esc 关闭</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="flex items-center justify-end mt-1.5 px-1 gap-2">
          <span className="text-[9px] text-muted-foreground/30">{charCount} 字符</span>
          <span className="text-[9px] text-muted-foreground/30">·</span>
          <span className="text-[9px] text-muted-foreground/30">{refTotal} 个引</span>
        </div>
      </div>

      {/* Few-shot Examples */}
      {!hideFewShot && (
        <div className="border border-border/15 rounded-xl overflow-hidden">
          <Button variant="ghost" size="sm" onClick={() => setFsOpen(!fsOpen)}
            className="flex items-center gap-2 w-full px-4 py-3 justify-start h-auto hover:bg-accent/10 transition-colors">
            {fsOpen ? <ChevronDown size={11} className="text-muted-foreground/45" /> : <ChevronRight size={11} className="text-muted-foreground/45" />}
            <MessageCircle size={12} className="text-foreground/45" />
            <span className="text-xs text-foreground">对话样本 (Few-Shot)</span>
            <span className="text-[9px] text-muted-foreground/40 ml-1">{fewShots.length}</span>
          </Button>
          <AnimatePresence>
            {fsOpen && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="px-4 pb-4 space-y-3">
                  {fewShots.map((fs, i) => (
                    <div key={fs.id} className="group border border-border/10 rounded-xl p-3 space-y-2 relative hover:border-border/25 transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[9px] text-muted-foreground/40">样本 {i + 1}</span>
                        <Button variant="ghost" size="icon-xs" onClick={() => removeFewShot(fs.id)}
                          className="w-5 h-5 rounded-md text-muted-foreground/25 hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all">
                          <Trash2 size={9} />
                        </Button>
                      </div>
                      <div>
                        <label className="text-[9px] text-info/50 mb-1 block">用户</label>
                        <textarea value={fs.user} onChange={e => updateFewShot(fs.id, 'user', e.target.value)} rows={2}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-border/15 bg-accent/10 text-xs text-foreground outline-none focus:border-border/40 transition-all resize-none" />
                      </div>
                      <div>
                        <label className="text-[9px] text-foreground/40 mb-1 block">助手</label>
                        <textarea value={fs.assistant} onChange={e => updateFewShot(fs.id, 'assistant', e.target.value)} rows={2}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-border/15 bg-accent/10 text-xs text-foreground outline-none focus:border-border/40 transition-all resize-none" />
                      </div>
                    </div>
                  ))}
                  <Button variant="ghost" size="xs" onClick={addFewShot}
                    className="gap-1 px-2 py-1.5 rounded-lg text-xs text-muted-foreground/45 hover:text-foreground hover:bg-accent/30 transition-colors h-auto">
                    <Plus size={10} /> 添加对话样本
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Variable Management Sidebar Panel */}
      <AnimatePresence>
        {showVarPanel && (
          <VarManagerPanel
            systemVars={SYSTEM_VARIABLES}
            userVars={variables}
            onClose={() => setShowVarPanel(false)}
            onInsert={(name) => { insertVariable(name); setShowVarPanel(false); }}
            onAdd={addVariable}
            onUpdate={updateVariable}
            onUpdateType={updateVariableType}
            onRemove={removeVariable}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
