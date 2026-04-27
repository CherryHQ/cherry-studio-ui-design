import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowRight, ChevronLeft, Plus, Check, Download, Variable, Save } from 'lucide-react';
import {
  Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, SearchInput, Input, Typography,
  VarManagerPanel, SYSTEM_VARIABLES, type VariableDef, type VarType,
} from '@cherry-studio/ui';
import { skills as discoverSkills, assistants as discoverAssistants } from '@/features/explore/ExploreData';
import { useGlobalActions } from '@/app/context/GlobalActionContext';
import type { ResourceItem, FolderNode, TagItem, LibrarySidebarFilter, LibraryConfigView, ResourceType } from '@/app/types';
import type { ViewMode, SortKey } from '@/app/types';
import { MOCK_RESOURCES, MOCK_FOLDERS, TAG_COLORS, DEFAULT_TAG_COLOR } from '@/app/config/constants';
import { LibrarySidebar } from './LibrarySidebar';
import { ResourceGrid } from './ResourceGrid';
import { ImportModal } from './ImportModal';
import { SkillPluginImportModal } from './SkillPluginImportModal';
import { SkillPluginDetail } from './SkillPluginDetail';
import { AssistantConfig } from '@/features/assistant/AssistantConfig';
import { AgentConfig } from '@/features/agent/AgentConfig';

// ===========================
// Template Banner (shown at top for assistant / skill views)
// ===========================

const SKILL_TEMPLATES = [
  { id: 'st1', icon: '🐍', name: '代码解释器', desc: '在沙箱环境中执行 Python 代码，支持数据可视化' },
  { id: 'st2', icon: '📄', name: 'PDF 解析器', desc: '解析并提取 PDF 文档中的结构化数据' },
  { id: 'st3', icon: '🌍', name: '翻译助手', desc: '支持 100+ 语言的高质量上下文感知翻译' },
];

const ASSISTANT_TEMPLATES = [
  { id: 'at1', icon: '✍️', name: '写作助手', desc: '擅长各类文档写作、润色和多语言翻译' },
  { id: 'at2', icon: '💻', name: '代码解读助手', desc: '阅读和解释复杂代码逻辑，生成文档注释' },
  { id: 'at3', icon: '🎓', name: '英语教学助手', desc: '专业英语教学，支持口语练习和语法纠正' },
];

function TemplateBanner({ resourceType, onDismiss, onBrowseAll, installedNames }: {
  resourceType: 'assistant' | 'skill';
  onDismiss: () => void;
  onBrowseAll: () => void;
  installedNames: Set<string>;
}) {
  const templates = resourceType === 'skill' ? SKILL_TEMPLATES : ASSISTANT_TEMPLATES;
  const label = resourceType === 'skill' ? 'Skill' : '助手';

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border/30 bg-muted/15 px-4 py-2.5 mb-3 relative">
      <p className="text-xs text-muted-foreground/50 flex-shrink-0">模板</p>
      <div className="flex items-center gap-2 flex-1 min-w-0 overflow-x-auto scrollbar-hide">
        {templates.map(t => {
          const installed = installedNames.has(t.name);
          return (
            <button key={t.id}
              className={`flex items-center gap-1.5 px-2.5 py-[4px] rounded-lg text-xs whitespace-nowrap border transition-all flex-shrink-0 ${
                installed
                  ? 'border-border/20 text-muted-foreground/40 bg-transparent'
                  : 'border-border/30 bg-background text-foreground hover:border-border/50 hover:shadow-sm cursor-pointer'
              }`}
            >
              <span className="text-sm leading-none">{t.icon}</span>
              <span>{t.name}</span>
              {installed && <Check size={9} className="text-primary/60" />}
            </button>
          );
        })}
      </div>
      <button onClick={onBrowseAll} className="flex items-center gap-1 text-xs text-muted-foreground/40 hover:text-foreground transition-colors flex-shrink-0 whitespace-nowrap">
        全部
        <ArrowRight size={10} />
      </button>
      <button onClick={onDismiss} className="text-muted-foreground/25 hover:text-muted-foreground transition-colors flex-shrink-0">
        <X size={12} />
      </button>
    </div>
  );
}

// ===========================
// Template Browse Page (full page for all templates)
// ===========================

const TEMPLATE_CATEGORIES: Record<'skill' | 'assistant', string[]> = {
  skill: ['全部', '代码', '数据', '文档', '翻译', '图像', '音频'],
  assistant: ['全部', '写作', '编程', '教育', '创意', '商业', '翻译', '法律', '健康'],
};

function TemplateBrowsePage({ resourceType, onBack, onUse, installedNames }: {
  resourceType: 'skill' | 'assistant';
  onBack: () => void;
  onUse: (item: any) => void;
  installedNames: Set<string>;
}) {
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState('全部');

  const allItems: any[] = resourceType === 'skill' ? discoverSkills : discoverAssistants;
  const categories = TEMPLATE_CATEGORIES[resourceType];
  const label = resourceType === 'skill' ? 'Skill' : '助手';

  const filtered = useMemo(() => {
    let list = allItems;
    if (activeCat !== '全部') {
      list = list.filter(item => item.subcategory === activeCat || item.category === activeCat);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(item => item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q));
    }
    return list;
  }, [allItems, activeCat, search]);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-5 pb-4 flex-shrink-0 border-b border-border/20">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-muted-foreground/50 hover:text-foreground transition-colors">
            <ChevronLeft size={18} />
          </button>
          <div>
            <h1 className="text-base text-foreground font-medium">{label}模板</h1>
            <p className="text-xs text-muted-foreground/50 mt-0.5">浏览和使用预配置的{label}模板</p>
          </div>
        </div>
        <SearchInput value={search} onChange={setSearch} placeholder={`搜索${label}模板...`} iconSize={10}
          wrapperClassName="flex items-center gap-1.5 px-2.5 py-[5px] rounded-lg bg-muted/50 border border-border/30 w-[220px]" />
      </div>

      {/* Category tags */}
      <div className="flex items-center gap-1.5 px-6 py-3 flex-shrink-0 flex-wrap">
        {categories.map(cat => (
          <button key={cat}
            onClick={() => setActiveCat(cat)}
            className={`px-3 py-[4px] rounded-full text-xs transition-all border ${
              activeCat === cat
                ? 'bg-accent border-border text-foreground font-medium'
                : 'bg-transparent border-border/40 text-muted-foreground/60 hover:text-foreground hover:border-border hover:bg-accent/50'
            }`}
          >{cat}</button>
        ))}
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto px-6 pb-6 scrollbar-thin">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground/40">
            <p className="text-sm">没有匹配的模板</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((item: any) => {
              const installed = installedNames.has(item.name);
              return (
                <div key={item.id}
                  className={`group rounded-xl border bg-background transition-all overflow-hidden ${
                    installed ? 'border-border/20' : 'border-border/30 hover:border-border/60 hover:shadow-sm cursor-pointer'
                  }`}
                >
                  <div className="px-5 py-4">
                    <div className="flex items-center gap-3 mb-2.5">
                      <div className="w-10 h-10 rounded-xl bg-accent/60 flex items-center justify-center text-lg flex-shrink-0">
                        {item.avatar || item.icon || '📦'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground font-medium truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground/40 mt-0.5">{item.author}</p>
                      </div>
                      {installed && (
                        <span className="flex items-center gap-1 px-2 py-[2px] rounded-full text-xs text-primary/70 bg-primary/8 border border-primary/15 flex-shrink-0">
                          <Check size={10} />
                          已安装
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground/60 leading-relaxed line-clamp-2 mb-3">{item.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {item.tags?.slice(0, 2).map((tag: string) => (
                          <span key={tag} className="px-1.5 py-[1px] rounded text-xs text-muted-foreground/40 bg-muted/50">{tag}</span>
                        ))}
                      </div>
                      {installed ? (
                        <span className="text-xs text-muted-foreground/30">已添加到资源库</span>
                      ) : (
                        <button
                          onClick={(e) => { e.stopPropagation(); onUse(item); }}
                          className="flex items-center gap-1 px-2.5 py-[3px] rounded-lg text-xs text-muted-foreground/50 hover:text-foreground border border-border/30 hover:border-border/60 hover:bg-accent/50 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Download size={10} />
                          安装
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ===========================
// Prompt Edit Page
// ===========================

const DEFAULT_PROMPT_VARS: VariableDef[] = [
  { id: 'u1', name: 'user_name', defaultValue: '用户', description: '用户的称呼', type: 'string' },
  { id: 'u2', name: 'language', defaultValue: '中文', description: '输出语言', type: 'string' },
];

function extractVars(content: string): string[] {
  const p = /\$\{(\w+)\}/g;
  const matches = content.match(p);
  if (!matches) return [];
  return [...new Set(matches.map(m => m.slice(2, -1)))];
}

// Rich editor for prompt content with variable tag rendering
function PromptRichEditor({ value, onChange, onSlashCommand, placeholder }: {
  value: string; onChange: (v: string) => void; onSlashCommand: () => void; placeholder?: string;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isComposing = useRef(false);

  const varRe = /\$\{(\w+)\}/g;

  const toHTML = useCallback((text: string) => {
    if (!text) return '';
    const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return escaped
      .replace(varRe, '<span class="prompt-var-tag" contenteditable="false" data-var="$1">${$1}</span>')
      .replace(/\n/g, '<br>');
  }, []);

  const toPlain = useCallback((el: HTMLElement): string => {
    let r = '';
    el.childNodes.forEach(n => {
      if (n.nodeType === Node.TEXT_NODE) { r += n.textContent || ''; }
      else if (n.nodeType === Node.ELEMENT_NODE) {
        const e = n as HTMLElement;
        if (e.classList.contains('prompt-var-tag')) { r += '${' + e.getAttribute('data-var') + '}'; }
        else if (e.tagName === 'BR') { r += '\n'; }
        else if (e.tagName === 'DIV') { if (r.length > 0 && !r.endsWith('\n')) r += '\n'; r += toPlain(e); }
        else { r += toPlain(e); }
      }
    });
    return r;
  }, []);

  const getOffset = useCallback(() => {
    const sel = window.getSelection();
    if (!sel?.rangeCount || !editorRef.current) return 0;
    const pre = document.createRange();
    pre.selectNodeContents(editorRef.current);
    pre.setEnd(sel.getRangeAt(0).endContainer, sel.getRangeAt(0).endOffset);
    const d = document.createElement('div'); d.appendChild(pre.cloneContents());
    return toPlain(d).length;
  }, [toPlain]);

  const setOffset = useCallback((offset: number) => {
    const el = editorRef.current; if (!el) return;
    const sel = window.getSelection(); if (!sel) return;
    let rem = offset;
    function walk(node: Node): boolean {
      if (node.nodeType === Node.TEXT_NODE) {
        const len = (node.textContent || '').length;
        if (rem <= len) { const r = document.createRange(); r.setStart(node, rem); r.collapse(true); sel!.removeAllRanges(); sel!.addRange(r); return true; }
        rem -= len;
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const e = node as HTMLElement;
        if (e.classList.contains('prompt-var-tag')) {
          const tl = (e.getAttribute('data-var') || '').length + 3;
          if (rem <= tl) { const r = document.createRange(); r.setStart(e.parentNode!, Array.from(e.parentNode!.childNodes).indexOf(e) + 1); r.collapse(true); sel!.removeAllRanges(); sel!.addRange(r); return true; }
          rem -= tl;
        } else if (e.tagName === 'BR') {
          if (rem <= 1) { const r = document.createRange(); r.setStart(e.parentNode!, Array.from(e.parentNode!.childNodes).indexOf(e) + 1); r.collapse(true); sel!.removeAllRanges(); sel!.addRange(r); return true; }
          rem -= 1;
        } else { for (const c of Array.from(node.childNodes)) { if (walk(c)) return true; } }
      }
      return false;
    }
    walk(el);
  }, []);

  useEffect(() => {
    const el = editorRef.current; if (!el) return;
    if (toPlain(el) !== value) el.innerHTML = toHTML(value) || '';
  }, [value, toHTML, toPlain]);

  const handleInput = useCallback(() => {
    if (isComposing.current) return;
    const el = editorRef.current; if (!el) return;
    const off = getOffset();
    const newText = toPlain(el);
    onChange(newText);
    requestAnimationFrame(() => {
      const html = toHTML(newText);
      if (el.innerHTML !== html) { el.innerHTML = html; setOffset(off); }
    });
  }, [onChange, toHTML, toPlain, getOffset, setOffset]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === '/' && !isComposing.current) {
      const sel = window.getSelection();
      if (sel?.rangeCount) {
        const node = sel.getRangeAt(0).startContainer;
        const off = sel.getRangeAt(0).startOffset;
        const charBefore = node.nodeType === Node.TEXT_NODE ? (node.textContent || '')[off - 1] || '' : '';
        if (node.nodeType !== Node.TEXT_NODE || off === 0 || charBefore === ' ' || charBefore === '\n') {
          e.preventDefault();
          onSlashCommand();
        }
      }
    }
  }, [onSlashCommand]);

  return (
    <div className="relative">
      {!value && (
        <div className="absolute inset-0 px-3.5 py-3 text-sm text-muted-foreground/40 pointer-events-none leading-relaxed">
          {placeholder || '输入 Prompt 内容...'}
        </div>
      )}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onCompositionStart={() => { isComposing.current = true; }}
        onCompositionEnd={() => { isComposing.current = false; handleInput(); }}
        className="w-full bg-muted/30 border border-border/40 rounded-xl px-3.5 py-3 text-sm text-foreground outline-none focus:border-border/60 transition-colors leading-relaxed whitespace-pre-wrap break-words"
        style={{ minHeight: '120px' }}
      />
      <style>{`
        .prompt-var-tag {
          display: inline-flex; align-items: center; padding: 1px 6px; margin: 0 1px;
          border-radius: 4px; background: var(--accent-violet-muted, rgba(139,92,246,0.1)); color: var(--accent-violet, #8b5cf6);
          font-size: 12px; font-family: ui-monospace, monospace; font-weight: 500;
          user-select: all; vertical-align: baseline; cursor: default;
        }
      `}</style>
    </div>
  );
}

function PromptEditPage({ resource, onBack, onSave }: {
  resource: ResourceItem;
  onBack: () => void;
  onSave: (updates: Partial<ResourceItem>) => void;
}) {
  const [name, setName] = useState(resource.name);
  const [content, setContent] = useState(resource.content || '');
  const [showVarPanel, setShowVarPanel] = useState(false);
  const [userVars, setUserVars] = useState<VariableDef[]>(DEFAULT_PROMPT_VARS);

  const vars = extractVars(content);
  const hasChanges = name !== resource.name || content !== (resource.content || '');

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ name: name.trim(), content, description: content.slice(0, 60).replace(/\n/g, ' '), updatedAt: new Date().toISOString() });
  };

  const handleInsertVar = (varName: string) => {
    setContent(prev => prev + '${' + varName + '}');
    setShowVarPanel(false);
  };

  const handleAddVar = () => {
    const newId = `uvar-${Date.now()}`;
    setUserVars(prev => [...prev, { id: newId, name: 'new_var', defaultValue: '', description: '', type: 'string' as VarType }]);
    return newId;
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-5 pb-4 flex-shrink-0 border-b border-border/20">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-muted-foreground/50 hover:text-foreground transition-colors">
            <ChevronLeft size={18} />
          </button>
          <Typography variant="subtitle">编辑 Prompt</Typography>
        </div>
        <Button variant="default" size="xs" onClick={handleSave} disabled={!name.trim() || !hasChanges}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs">
          <Save size={11} />
          <span>保存</span>
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="max-w-[640px] mx-auto px-6 py-6 space-y-5">
          {/* Name */}
          <div>
            <p className="text-xs text-muted-foreground/60 mb-2 font-medium">名称</p>
            <Input value={name} onChange={e => setName(e.target.value)}
              className="w-full bg-muted/30 border border-border/40 px-3.5 py-2.5 text-sm text-foreground rounded-xl"
              placeholder="Prompt 名称" />
          </div>

          {/* Content — rich editor with variable tags */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground/60 font-medium">内容</p>
              <Button variant="ghost" size="xs" onClick={() => setShowVarPanel(true)}
                className="flex items-center gap-1 px-2 text-accent-violet/70 hover:text-accent-violet hover:bg-accent-violet/[0.06]">
                <Variable size={10} /><span>插入变量</span>
              </Button>
            </div>
            <PromptRichEditor
              value={content}
              onChange={setContent}
              onSlashCommand={() => setShowVarPanel(true)}
              placeholder="输入 Prompt 内容，使用 / 快速插入变量..."
            />
            <p className="text-xs text-muted-foreground/40 mt-1.5">输入 / 或点击「插入变量」打开变量面板</p>
          </div>

          {/* Referenced variables */}
          {vars.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground/60 mb-2 font-medium">已引用变量</p>
              <div className="flex flex-wrap gap-1.5">
                {vars.map(v => (
                  <span key={v} className="text-xs text-accent-violet/70 bg-accent-violet/[0.08] px-2.5 py-[3px] rounded-md font-mono font-medium">
                    {'${' + v + '}'}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Variable manager panel */}
      <AnimatePresence>
        {showVarPanel && (
          <VarManagerPanel
            systemVars={SYSTEM_VARIABLES}
            userVars={userVars}
            onClose={() => setShowVarPanel(false)}
            onInsert={handleInsertVar}
            onAdd={handleAddVar}
            onUpdate={(id, field, value) => setUserVars(prev => prev.map(v => v.id === id ? { ...v, [field]: value } : v))}
            onUpdateType={(id, type) => setUserVars(prev => prev.map(v => v.id === id ? { ...v, type } : v))}
            onRemove={(id) => setUserVars(prev => prev.filter(v => v.id !== id))}
            position="right"
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ===========================
// Helpers
// ===========================

function findFolder(nodes: FolderNode[], id: string): FolderNode | null {
  for (const n of nodes) {
    if (n.id === id) return n;
    const found = findFolder(n.children, id);
    if (found) return found;
  }
  return null;
}

function buildTags(resources: ResourceItem[], filterType?: ResourceType): TagItem[] {
  const tagMap = new Map<string, number>();
  const list = filterType ? resources.filter(r => r.type === filterType) : resources;
  list.forEach(r => r.tags.forEach(t => tagMap.set(t, (tagMap.get(t) || 0) + 1)));
  return Array.from(tagMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([name, count], i) => ({
      id: `tag-${i}`,
      name,
      color: (TAG_COLORS[name] || DEFAULT_TAG_COLOR).dot,
      count,
    }));
}

// Folder tree helpers
function addFolderToTree(nodes: FolderNode[], parentId: string | undefined, newFolder: FolderNode): FolderNode[] {
  if (!parentId) return [...nodes, newFolder];
  return nodes.map(n => {
    if (n.id === parentId) return { ...n, children: [...n.children, newFolder] };
    return { ...n, children: addFolderToTree(n.children, parentId, newFolder) };
  });
}

function renameFolderInTree(nodes: FolderNode[], id: string, name: string): FolderNode[] {
  return nodes.map(n => {
    if (n.id === id) return { ...n, name };
    return { ...n, children: renameFolderInTree(n.children, id, name) };
  });
}

function deleteFolderFromTree(nodes: FolderNode[], id: string): FolderNode[] {
  return nodes.filter(n => n.id !== id).map(n => ({ ...n, children: deleteFolderFromTree(n.children, id) }));
}

// ===========================
// Main Library Page
// ===========================

export function LibraryPage() {
  const { libraryEditResourceId: initialEditResourceId, libraryCreateType: initialCreateType, libraryReturn: onReturn } = useGlobalActions();
  const [resources, setResources] = useState<ResourceItem[]>(() => MOCK_RESOURCES.filter(r => r.type !== 'plugin'));
  const [folders, setFolders] = useState<FolderNode[]>(MOCK_FOLDERS);

  const [configView, setConfigView] = useState<LibraryConfigView>({ type: 'list' });
  const [sidebarFilter, setSidebarFilter] = useState<LibrarySidebarFilter>({ type: 'all' });
  const [dismissedBanners, setDismissedBanners] = useState<Set<string>>(new Set());
  const [templateBrowse, setTemplateBrowse] = useState<'skill' | 'assistant' | null>(null);

  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortKey, setSortKey] = useState<SortKey>('updatedAt');
  const [importOpen, setImportOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<ResourceItem | null>(null);

  // Skill/Plugin import modal
  const [spImportOpen, setSpImportOpen] = useState(false);
  const [spImportType, setSpImportType] = useState<'skill' | 'plugin'>('skill');

  // Tag filter (separate from sidebar filter)
  const [activeTag, setActiveTag] = useState<string | null>(null);

  // Type filter (toolbar, separate from sidebar)
  const [activeType, setActiveType] = useState<ResourceType | null>(null);

  // Track whether we came from external create (to enable return navigation)
  const [returnOnClose, setReturnOnClose] = useState(false);

  // Auto-open config when navigated from chat page edit
  const prevEditId = useRef<string | null>(null);
  useEffect(() => {
    if (initialEditResourceId && initialEditResourceId !== prevEditId.current) {
      prevEditId.current = initialEditResourceId;
      const target = resources.find(r => r.id === initialEditResourceId);
      if (target) {
        if (target.type === 'agent') setConfigView({ type: 'agent-config', resource: target });
        else if (target.type === 'assistant') setConfigView({ type: 'assistant-config', resource: target });
        else setConfigView({ type: 'skill-plugin-detail', resource: target });
      }
    }
  }, [initialEditResourceId, resources]);

  // Auto-create agent when navigated from agent run page with createType
  const prevCreateType = useRef<string | null>(null);
  useEffect(() => {
    if (initialCreateType && initialCreateType !== prevCreateType.current) {
      prevCreateType.current = initialCreateType;
      setReturnOnClose(true);
      const now = new Date().toISOString();
      const newRes: ResourceItem = {
        id: `res-new-${Date.now()}`, type: initialCreateType === 'assistant' ? 'assistant' : 'agent',
        name: initialCreateType === 'assistant' ? '新助手' : '新智能体',
        description: '点击编辑配置...',
        avatar: initialCreateType === 'assistant' ? '\uD83D\uDCAC' : '\uD83E\uDD16',
        model: 'GPT-4o',
        tags: [], createdAt: now, updatedAt: now, enabled: true,
      };
      setResources(prev => [newRes, ...prev]);
      setConfigView({ type: initialCreateType === 'assistant' ? 'assistant-config' : 'agent-config', resource: newRes });
    }
  }, [initialCreateType]);

  // Handle config back — if we came from external create, return to origin
  const handleConfigBack = useCallback(() => {
    setConfigView({ type: 'list' });
    if (returnOnClose && onReturn) {
      setReturnOnClose(false);
      onReturn();
    }
  }, [returnOnClose, onReturn]);

  // Derived data
  const activeResourceType = sidebarFilter.type === 'resource' ? sidebarFilter.resourceType : undefined;
  const scopedTags = useMemo(() => buildTags(resources, activeResourceType), [resources, activeResourceType]);
  const typeCounts = useMemo(() => {
    const c: Record<string, number> = {};
    resources.forEach(r => { c[r.type] = (c[r.type] || 0) + 1; });
    return c;
  }, [resources]);

  // Filter & sort
  const filtered = useMemo(() => {
    let list = resources;
    if (sidebarFilter.type === 'resource') {
      list = list.filter(r => r.type === sidebarFilter.resourceType);
    } else if (sidebarFilter.type === 'folder') {
      const collectIds = (node: FolderNode): string[] => [node.id, ...node.children.flatMap(collectIds)];
      const folder = findFolder(folders, sidebarFilter.folderId);
      if (folder) {
        const ids = new Set(collectIds(folder));
        list = list.filter(r => r.folderId && ids.has(r.folderId));
      }
    } else if (sidebarFilter.type === 'tag') {
      list = list.filter(r => r.tags.includes(sidebarFilter.tagName));
    }
    // Apply tag filter from top bar
    if (activeTag) {
      list = list.filter(r => r.tags.includes(activeTag));
    }
    // Apply type filter from top bar
    if (activeType) {
      list = list.filter(r => r.type === activeType);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(r => r.name.toLowerCase().includes(q) || r.description.toLowerCase().includes(q));
    }
    return [...list].sort((a, b) => {
      if (sortKey === 'name') return a.name.localeCompare(b.name, 'zh');
      if (sortKey === 'createdAt') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [resources, sidebarFilter, activeTag, activeType, search, sortKey, folders]);

  // ===========================
  // Folder Management
  // ===========================

  const handleCreateFolder = useCallback((parentId?: string) => {
    const newFolder: FolderNode = { id: `f-${Date.now()}`, name: '新文件夹', children: [] };
    setFolders(prev => addFolderToTree(prev, parentId, newFolder));
  }, []);

  const handleRenameFolder = useCallback((id: string, name: string) => {
    setFolders(prev => renameFolderInTree(prev, id, name));
  }, []);

  const handleDeleteFolder = useCallback((id: string) => {
    setFolders(prev => deleteFolderFromTree(prev, id));
    // Unassign resources from deleted folder
    setResources(prev => prev.map(r => r.folderId === id ? { ...r, folderId: undefined } : r));
  }, []);

  // ===========================
  // Tag Management
  // ===========================

  const handleAddTag = useCallback((tagName: string) => {
    setActiveTag(tagName);
  }, []);

  const handleDeleteTag = useCallback((tagName: string) => {
    setResources(prev => prev.map(r => ({
      ...r,
      tags: r.tags.filter(t => t !== tagName),
    })));
    if (activeTag === tagName) setActiveTag(null);
  }, [activeTag]);

  // Collect all unique tag names across all resources
  const allTagNames = useMemo(() => {
    const s = new Set<string>();
    resources.forEach(r => r.tags.forEach(t => s.add(t)));
    return Array.from(s).sort((a, b) => a.localeCompare(b, 'zh'));
  }, [resources]);

  const handleUpdateResourceTags = useCallback((resourceId: string, tags: string[]) => {
    setResources(prev => prev.map(r => r.id === resourceId ? { ...r, tags, updatedAt: new Date().toISOString() } : r));
  }, []);

  // ===========================
  // Resource Handlers
  // ===========================

  const handleEdit = useCallback((r: ResourceItem) => {
    if (r.type === 'prompt') setConfigView({ type: 'prompt-edit', resource: r });
    else if (r.type === 'agent') setConfigView({ type: 'agent-config', resource: r });
    else if (r.type === 'assistant') setConfigView({ type: 'assistant-config', resource: r });
    else setConfigView({ type: 'skill-plugin-detail', resource: r });
  }, []);

  const handleDuplicate = useCallback((r: ResourceItem) => {
    const now = new Date().toISOString();
    setResources(prev => [{ ...r, id: `res-dup-${Date.now()}`, name: `${r.name} (副本)`, createdAt: now, updatedAt: now }, ...prev]);
  }, []);

  const handleDelete = useCallback((r: ResourceItem) => setDeleteConfirm(r), []);

  const confirmDelete = useCallback(() => {
    if (deleteConfirm) {
      setResources(prev => prev.filter(x => x.id !== deleteConfirm.id));
      setDeleteConfirm(null);
      if (configView.type !== 'list') setConfigView({ type: 'list' });
    }
  }, [deleteConfirm, configView]);

  const handleToggle = useCallback((id: string) => {
    setResources(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  }, []);

  const handleCreateResource = useCallback((type: ResourceType) => {
    if (type === 'skill') {
      setSpImportType('skill');
      setSpImportOpen(true);
      return;
    }
    const now = new Date().toISOString();
    const nameMap: Record<string, string> = { agent: '新智能体', assistant: '新助手', prompt: '新 Prompt' };
    const avatarMap: Record<string, string> = { agent: '\uD83E\uDD16', assistant: '\uD83D\uDCAC', prompt: '\uD83D\uDCDD' };
    const newRes: ResourceItem = {
      id: `res-new-${Date.now()}`, type,
      name: nameMap[type] || '新资源',
      description: type === 'prompt' ? '' : '点击编辑配置...',
      avatar: avatarMap[type] || '\uD83D\uDCDD',
      model: type !== 'prompt' ? 'GPT-4o' : undefined,
      content: type === 'prompt' ? '' : undefined,
      tags: [], createdAt: now, updatedAt: now, enabled: true,
    };
    setResources(prev => [newRes, ...prev]);
    if (type === 'prompt') setConfigView({ type: 'prompt-edit', resource: newRes });
    else if (type === 'agent') setConfigView({ type: 'agent-config', resource: newRes });
    else if (type === 'assistant') setConfigView({ type: 'assistant-config', resource: newRes });
  }, []);

  const handleImportComplete = useCallback((resource: ResourceItem) => {
    setResources(prev => [resource, ...prev]);
    setSpImportOpen(false);
    setConfigView({ type: 'skill-plugin-detail', resource });
  }, []);

  const handleMoveToFolder = useCallback((resourceId: string, folderId: string | undefined) => {
    setResources(prev => prev.map(r => r.id === resourceId ? { ...r, folderId } : r));
  }, []);

  // Installed resource names (for template installed indicator)
  const installedNames = useMemo(() => new Set(resources.map(r => r.name)), [resources]);

  // ===========================
  // Render
  // ===========================

  if (templateBrowse) {
    return (
      <AnimatePresence mode="wait">
        <motion.div key="template-browse" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col min-h-0 bg-background">
          <TemplateBrowsePage
            resourceType={templateBrowse}
            installedNames={installedNames}
            onBack={() => setTemplateBrowse(null)}
            onUse={(item) => {
              const now = new Date().toISOString();
              const newRes: ResourceItem = {
                id: `res-tpl-${Date.now()}`, type: templateBrowse,
                name: item.name,
                description: item.description,
                avatar: item.avatar || item.icon || '📦',
                tags: item.tags?.slice(0, 2) || [],
                createdAt: now, updatedAt: now, enabled: true,
              };
              setResources(prev => [newRes, ...prev]);
            }}
          />
        </motion.div>
      </AnimatePresence>
    );
  }

  if (configView.type === 'prompt-edit') {
    return (
      <AnimatePresence mode="wait">
        <motion.div key="prompt-edit" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col min-h-0 bg-background">
          <PromptEditPage
            resource={configView.resource}
            onBack={handleConfigBack}
            onSave={(updates) => {
              setResources(prev => prev.map(r => r.id === configView.resource.id ? { ...r, ...updates } : r));
              setConfigView({ type: 'list' });
            }}
          />
        </motion.div>
      </AnimatePresence>
    );
  }

  if (configView.type === 'assistant-config') {
    return (
      <AnimatePresence mode="wait">
        <motion.div key="assistant" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col min-h-0 bg-background">
          <AssistantConfig resource={configView.resource} onBack={handleConfigBack} />
        </motion.div>
      </AnimatePresence>
    );
  }

  if (configView.type === 'agent-config') {
    return (
      <AnimatePresence mode="wait">
        <motion.div key="agent" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col min-h-0 bg-background">
          <AgentConfig resource={configView.resource} onBack={handleConfigBack} />
        </motion.div>
      </AnimatePresence>
    );
  }

  if (configView.type === 'skill-plugin-detail') {
    return (
      <AnimatePresence mode="wait">
        <motion.div key="sp-detail" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col min-h-0 bg-background">
          <SkillPluginDetail
            resource={configView.resource}
            onBack={handleConfigBack}
            onToggle={handleToggle}
            onDelete={handleDelete}
          />
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <div className="flex-1 flex min-h-0 bg-background">
      <LibrarySidebar
        filter={sidebarFilter}
        onFilterChange={f => { setSidebarFilter(f); setActiveTag(null); }}
        folders={folders}
        onImport={() => setImportOpen(true)}
        typeCounts={typeCounts}
        onCreateFolder={handleCreateFolder}
        onRenameFolder={handleRenameFolder}
        onDeleteFolder={handleDeleteFolder}
      />

      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        <ResourceGrid
          resources={filtered}
          viewMode={viewMode} sortKey={sortKey} search={search}
          onSearchChange={setSearch} onViewModeChange={setViewMode} onSortKeyChange={setSortKey}
          onEdit={handleEdit} onDuplicate={handleDuplicate} onDelete={handleDelete}
          onToggle={handleToggle} onCreate={handleCreateResource}
          folders={folders} onMoveToFolder={handleMoveToFolder}
          tags={scopedTags} activeTag={activeTag} onTagFilter={setActiveTag}
          onAddTag={handleAddTag} onDeleteTag={handleDeleteTag}
          allTagNames={allTagNames} onUpdateResourceTags={handleUpdateResourceTags}
          activeType={activeType} onTypeFilter={setActiveType} typeCounts={typeCounts}
          templateBanner={
            activeResourceType && ['assistant', 'skill'].includes(activeResourceType) && !dismissedBanners.has(activeResourceType)
              ? <TemplateBanner
                  resourceType={activeResourceType as 'assistant' | 'skill'}
                  installedNames={installedNames}
                  onDismiss={() => setDismissedBanners(prev => new Set(prev).add(activeResourceType!))}
                  onBrowseAll={() => setTemplateBrowse(activeResourceType as 'assistant' | 'skill')}
                />
              : undefined
          }
          onBrowseTemplates={
            activeResourceType && ['assistant', 'skill'].includes(activeResourceType)
              ? () => setTemplateBrowse(activeResourceType as 'assistant' | 'skill')
              : undefined
          }
        />
      </div>

      <ImportModal open={importOpen} onClose={() => setImportOpen(false)} />
      <SkillPluginImportModal
        open={spImportOpen} importType={spImportType}
        onClose={() => setSpImportOpen(false)} onImportComplete={handleImportComplete}
      />

      <Dialog open={!!deleteConfirm} onOpenChange={v => { if (!v) setDeleteConfirm(null); }}>
        <DialogContent className="w-[320px]">
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground/60 mb-4">确定要删除「{deleteConfirm?.name}」吗？此操作无法撤销。</p>
          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(null)}>取消</Button>
            <Button variant="destructive" size="sm" onClick={confirmDelete}>删除</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
