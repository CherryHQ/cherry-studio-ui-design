import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus, Pencil, Trash2, X, Check, MessageSquareText,
  Variable, CircleHelp, FileText, Search,
} from 'lucide-react';
import { Button, Input } from '@cherry-studio/ui';
import { Toggle } from './shared';
import {
  VarManagerPanel, SYSTEM_VARIABLES, VAR_TYPE_CONFIG,
  type VariableDef, type VarType,
} from '@/app/components/ui/VarManagerPanel';

// ===========================
// Types
// ===========================
interface QuickPhrase {
  id: string;
  title: string;
  content: string;
  enabled: boolean;
}

// ===========================
// Mock Data
// ===========================
const INITIAL_PHRASES: QuickPhrase[] = [
  { id: 'p1', title: '日报模板', content: '今日完成：\n1. ${task1}\n2. ${task2}\n\n明日计划：\n1. ${plan1}\n\n遇到问题：${issue}', enabled: true },
  { id: 'p2', title: '邮件回复', content: '${name} 你好，\n\n感谢你的来信。关于 ${topic}，我的回复如下：\n${reply}\n\n祝好，\n${sender}', enabled: true },
  { id: 'p3', title: '代码 Review 模板', content: '## Code Review\n\n**文件**: ${file}\n**问题类型**: ${type}\n**严重程度**: ${severity}\n\n### 描述\n${description}\n\n### 建议修改\n${suggestion}', enabled: true },
  { id: 'p4', title: '路线规划', content: '帮我规划从 ${from} 到 ${to} 的路线，然后发送到 ${email}', enabled: true },
  { id: 'p5', title: '翻译请求', content: '请将以下内容从 ${sourceLang} 翻译为 ${targetLang}：\n\n${text}', enabled: false },
];

const DEFAULT_USER_VARS: VariableDef[] = [
  { id: 'u1', name: 'user_name', defaultValue: '用户', description: '用户的称呼', type: 'string' },
  { id: 'u2', name: 'language', defaultValue: '中文', description: '输出语言', type: 'string' },
  { id: 'u3', name: 'max_tokens', defaultValue: '2048', description: '最大输出长度', type: 'number' },
];

function extractVars(content: string): string[] {
  const varPattern = new RegExp(String.fromCharCode(36) + String.fromCharCode(123) + '(\\w+)' + String.fromCharCode(125), 'g');
  const matches = content.match(varPattern);
  if (!matches) return [];
  return [...new Set(matches.map(m => m.slice(2, -1)))];
}

// ===========================
// RichPromptDisplay
// ===========================
function RichPromptPreview({ content, className, singleLine }: {
  content: string;
  className?: string;
  singleLine?: boolean;
}) {
  const varPattern = new RegExp('(' + String.fromCharCode(36) + String.fromCharCode(123) + '\\w+' + String.fromCharCode(125) + ')', 'g');
  const varExact = new RegExp('^' + String.fromCharCode(36) + String.fromCharCode(123) + '(\\w+)' + String.fromCharCode(125) + '$');
  const parts = content.split(varPattern);
  const rendered = parts.map((part, i) => {
    const match = part.match(varExact);
    if (match) {
      return (
        <span
          key={i}
          className="inline-flex items-center px-[5px] py-[0.5px] mx-[1px] rounded bg-violet-500/10 text-violet-500/80 text-[9px] font-mono align-baseline font-medium"
        >
          {'${' + match[1] + '}'}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });

  if (singleLine) {
    return <div className={`truncate ${className || ''}`}>{rendered}</div>;
  }
  return <div className={className || ''}>{rendered}</div>;
}

// ===========================
// RichPromptEditor
// ===========================
function RichPromptEditor({ value, onChange, onSlashCommand, placeholder }: {
  value: string;
  onChange: (v: string) => void;
  onSlashCommand: () => void;
  placeholder?: string;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isComposing = useRef(false);
  const lastCaretOffset = useRef(0);

  const varReplace = new RegExp(String.fromCharCode(36) + String.fromCharCode(123) + '(\\w+)' + String.fromCharCode(125), 'g');

  const toHTML = useCallback((text: string) => {
    if (!text) return '';
    const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const withVars = escaped.replace(
      varReplace,
      '<span class="var-tag" contenteditable="false" data-var="$1">${$1}</span>'
    );
    return withVars.replace(/\n/g, '<br>');
  }, []);

  const toPlainText = useCallback((el: HTMLElement): string => {
    let result = '';
    el.childNodes.forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        result += node.textContent || '';
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        if (element.classList.contains('var-tag')) {
          const varName = element.getAttribute('data-var');
          result += '${' + varName + '}';
        } else if (element.tagName === 'BR') {
          result += '\n';
        } else if (element.tagName === 'DIV') {
          if (result.length > 0 && !result.endsWith('\n')) result += '\n';
          result += toPlainText(element);
        } else {
          result += toPlainText(element);
        }
      }
    });
    return result;
  }, []);

  const getCaretOffset = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount || !editorRef.current) return 0;
    const range = sel.getRangeAt(0);
    const preRange = document.createRange();
    preRange.selectNodeContents(editorRef.current);
    preRange.setEnd(range.endContainer, range.endOffset);
    const fragment = preRange.cloneContents();
    const div = document.createElement('div');
    div.appendChild(fragment);
    return toPlainText(div).length;
  }, [toPlainText]);

  const setCaretOffset = useCallback((offset: number) => {
    const el = editorRef.current;
    if (!el) return;
    const sel = window.getSelection();
    if (!sel) return;
    let remaining = offset;

    function walk(node: Node): boolean {
      if (node.nodeType === Node.TEXT_NODE) {
        const len = (node.textContent || '').length;
        if (remaining <= len) {
          const range = document.createRange();
          range.setStart(node, remaining);
          range.collapse(true);
          sel!.removeAllRanges();
          sel!.addRange(range);
          return true;
        }
        remaining -= len;
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        if (element.classList.contains('var-tag')) {
          const varName = element.getAttribute('data-var') || '';
          const tagLen = varName.length + 3;
          if (remaining <= tagLen) {
            const range = document.createRange();
            const parent = element.parentNode!;
            const idx = Array.from(parent.childNodes).indexOf(element);
            range.setStart(parent, idx + 1);
            range.collapse(true);
            sel!.removeAllRanges();
            sel!.addRange(range);
            return true;
          }
          remaining -= tagLen;
        } else if (element.tagName === 'BR') {
          if (remaining <= 1) {
            const range = document.createRange();
            const parent = element.parentNode!;
            const idx = Array.from(parent.childNodes).indexOf(element);
            range.setStart(parent, idx + 1);
            range.collapse(true);
            sel!.removeAllRanges();
            sel!.addRange(range);
            return true;
          }
          remaining -= 1;
        } else {
          for (const child of Array.from(node.childNodes)) {
            if (walk(child)) return true;
          }
        }
      }
      return false;
    }
    walk(el);
  }, []);

  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    const currentText = toPlainText(el);
    if (currentText !== value) {
      el.innerHTML = toHTML(value) || '';
    }
  }, [value, toHTML, toPlainText]);

  const handleInput = useCallback(() => {
    if (isComposing.current) return;
    const el = editorRef.current;
    if (!el) return;
    const offset = getCaretOffset();
    lastCaretOffset.current = offset;
    const newText = toPlainText(el);
    onChange(newText);
    requestAnimationFrame(() => {
      const newHtml = toHTML(newText);
      if (el.innerHTML !== newHtml) {
        el.innerHTML = newHtml;
        setCaretOffset(offset);
      }
    });
  }, [onChange, toHTML, toPlainText, getCaretOffset, setCaretOffset]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === '/' && !isComposing.current) {
      const sel = window.getSelection();
      if (sel && sel.rangeCount) {
        const range = sel.getRangeAt(0);
        const node = range.startContainer;
        const offset = range.startOffset;
        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent || '';
          const charBefore = offset > 0 ? text[offset - 1] : '';
          if (offset === 0 || charBefore === ' ' || charBefore === '\n') {
            e.preventDefault();
            onSlashCommand();
          }
        } else {
          e.preventDefault();
          onSlashCommand();
        }
      }
    }
  }, [onSlashCommand]);

  const isEmpty = !value;

  return (
    <div className="relative">
      {isEmpty && (
        <div className="absolute inset-0 px-3 py-[9px] text-xs text-foreground/15 pointer-events-none leading-relaxed">
          {placeholder || '输入内容，使用 / 插入变量...'}
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
        className="w-full bg-foreground/[0.04] border border-foreground/[0.08] rounded-xl px-3 py-[9px] text-xs text-foreground/70 outline-none focus:border-foreground/20 transition-colors leading-relaxed whitespace-pre-wrap break-words"
        style={{ minHeight: '140px' }}
      />
      <style>{`
        .var-tag {
          display: inline-flex; align-items: center; padding: 1px 6px; margin: 0 1px;
          border-radius: 4px; background: rgba(139, 92, 246, 0.1); color: rgba(139, 92, 246, 0.8);
          font-size: 10px; font-family: ui-monospace, monospace; font-weight: 500;
          user-select: all; vertical-align: baseline; cursor: default;
        }
      `}</style>
    </div>
  );
}

function insertVarIntoContent(content: string, varName: string): string {
  return content + '${' + varName + '}';
}

// ===========================
// Edit Form Panel
// ===========================
function EditFormPanel({ open, onClose, item, onSave }: {
  open: boolean; onClose: () => void; item: QuickPhrase | null;
  onSave: (data: { title: string; content: string }) => void;
}) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [showVarPanel, setShowVarPanel] = useState(false);
  const [userVars, setUserVars] = useState<VariableDef[]>(DEFAULT_USER_VARS);

  useEffect(() => {
    if (open) {
      if (item) { setTitle(item.title); setContent(item.content); }
      else { setTitle(''); setContent(''); }
      setShowVarPanel(false);
    }
  }, [open, item]);

  const isAdd = !item;
  const canSave = title.trim().length > 0;

  const handleSave = () => { if (!canSave) return; onSave({ title: title.trim(), content: content.trim() }); onClose(); };
  const handleInsertVar = (name: string) => { setContent(prev => insertVarIntoContent(prev, name)); setShowVarPanel(false); };
  const handleAddVar = () => {
    const newId = `uvar-${Date.now()}`;
    setUserVars(prev => [...prev, { id: newId, name: 'new_var', defaultValue: '', description: '', type: 'string' as VarType }]);
    return newId;
  };
  const handleUpdateVar = (id: string, field: keyof VariableDef, value: string) => { setUserVars(prev => prev.map(v => v.id === id ? { ...v, [field]: value } : v)); };
  const handleUpdateVarType = (id: string, type: VarType) => { setUserVars(prev => prev.map(v => v.id === id ? { ...v, type } : v)); };
  const handleRemoveVar = (id: string) => { setUserVars(prev => prev.filter(v => v.id !== id)); };

  if (!open) return null;

  return (
    <div className="absolute inset-0 z-50 pointer-events-none">
      <motion.div
        initial={{ x: '100%', opacity: 0.8 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0.8 }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        className="pointer-events-auto absolute inset-y-2 right-2 w-[300px] bg-background rounded-2xl shadow-2xl border border-border/50 flex flex-col overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-foreground/[0.06] flex-shrink-0">
          <div className="flex items-center gap-2">
            {isAdd ? <Plus size={14} className="text-foreground/60" /> : <Pencil size={14} className="text-foreground/50" />}
            <h3 className="text-sm text-foreground/90 font-medium">{isAdd ? '添加短语' : '编辑短语'}</h3>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="w-6 h-6 rounded-lg text-foreground/35 hover:text-foreground/70 hover:bg-foreground/[0.06]">
            <X size={14} />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:bg-border/20">
          <div>
            <p className="text-xs text-foreground/40 mb-2 font-medium">标题</p>
            <Input value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-foreground/[0.04] border border-foreground/[0.08] rounded-xl px-3 py-[8px] text-xs text-foreground/70 focus:border-foreground/20" placeholder="请输入短语标题" autoFocus onKeyDown={e => { if (e.key === 'Escape') onClose(); }} />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-foreground/40 font-medium">内容</p>
              <Button variant="ghost" size="sm" onClick={() => setShowVarPanel(true)} className="flex items-center gap-1 px-2 py-[2px] h-auto rounded-lg text-[9px] text-violet-500/70 hover:text-violet-500 hover:bg-violet-500/[0.06]">
                <Variable size={10} /><span>插入变量</span>
              </Button>
            </div>
            <RichPromptEditor value={content} onChange={setContent} onSlashCommand={() => setShowVarPanel(true)} placeholder="输入内容，使用 / 快速插入变量..." />
            <p className="text-[9px] text-foreground/20 mt-1.5">{'输入 / 或点击「插入变量」打开变量管理面板'}</p>
          </div>
          {extractVars(content).length > 0 && (
            <div>
              <p className="text-xs text-foreground/40 mb-2 font-medium">已引用变量</p>
              <div className="flex flex-wrap gap-1.5">
                {extractVars(content).map(v => (
                  <span key={v} className="text-[9px] text-violet-500/70 bg-violet-500/[0.08] px-2 py-[2px] rounded font-mono font-medium">{v}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-3.5 border-t border-foreground/[0.06] flex-shrink-0">
          <Button variant="ghost" size="sm" onClick={onClose} className="px-4 py-[5px] h-auto rounded-lg text-xs text-foreground/40 hover:text-foreground/60 hover:bg-foreground/[0.05]">取消</Button>
          <Button onClick={handleSave} disabled={!canSave} size="sm" className={`px-4 py-[5px] h-auto rounded-lg text-xs ${canSave ? '' : 'bg-foreground/15 text-white cursor-not-allowed'}`}>
            {isAdd ? '添加' : '保存'}
          </Button>
        </div>
      </motion.div>

      <AnimatePresence>
        {showVarPanel && (
          <div className="pointer-events-auto absolute inset-0" style={{ right: 310 }}>
            <VarManagerPanel systemVars={SYSTEM_VARIABLES} userVars={userVars} onClose={() => setShowVarPanel(false)} onInsert={handleInsertVar} onAdd={handleAddVar} onUpdate={handleUpdateVar} onUpdateType={handleUpdateVarType} onRemove={handleRemoveVar} position="right" noBackdrop positionStyle={{ right: 8 }} />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ===========================
// Main: QuickPhrasesPage
// ===========================
export function QuickPhrasesPage() {
  const [phrases, setPhrases] = useState<QuickPhrase[]>(INITIAL_PHRASES);
  const [showFormPanel, setShowFormPanel] = useState(false);
  const [editingItem, setEditingItem] = useState<QuickPhrase | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  const openAdd = () => { setEditingItem(null); setShowFormPanel(true); };
  const openEdit = (item: QuickPhrase) => { setEditingItem(item); setShowFormPanel(true); };
  const handleToggle = (id: string, val: boolean) => { setPhrases(prev => prev.map(p => p.id === id ? { ...p, enabled: val } : p)); };
  const handleDelete = (id: string) => { setPhrases(prev => prev.filter(p => p.id !== id)); setConfirmDeleteId(null); };

  const handleSave = (data: { title: string; content: string }) => {
    if (editingItem) {
      setPhrases(prev => prev.map(p => p.id === editingItem.id ? { ...p, ...data } : p));
    } else {
      setPhrases(prev => [...prev, { id: `phrase-${Date.now()}`, title: data.title, content: data.content, enabled: true }]);
    }
  };

  const q = searchQuery.trim().toLowerCase();
  const filteredPhrases = q
    ? phrases.filter(p => p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q) || extractVars(p.content).some(v => v.toLowerCase().includes(q)))
    : phrases;
  const isFiltered = q.length > 0;

  return (
    <div className="relative flex flex-col h-full min-h-0">
      <div className={`flex-1 overflow-y-auto px-6 py-5 [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:bg-border/20 transition-opacity duration-200 ${showFormPanel ? 'opacity-40 pointer-events-none' : ''}`}>
        <div className="mb-3">
          <h3 className="text-sm text-foreground/90 font-medium">快捷短语</h3>
          <p className="text-xs text-foreground/35 mt-1">{'预设常用的 Prompt 模板，在对话中快速插入使用。支持变量占位符。'}</p>
        </div>

        <div className="bg-foreground/[0.03] border border-foreground/[0.06] rounded-2xl px-3 py-2">
          <div className="flex items-center justify-between gap-2 px-2 py-2">
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <h4 className="text-sm text-foreground/70 font-medium">短语列表</h4>
              <span className="text-[9px] text-foreground/25 bg-foreground/[0.04] px-1.5 py-[1px] rounded-md">
                {isFiltered ? `${filteredPhrases.length} / ${phrases.length}` : phrases.length}
              </span>
            </div>
            <div className="flex items-center gap-1.5 flex-1 justify-end">
              <div className="relative flex items-center max-w-[200px] flex-1">
                <Search size={11} className="absolute left-2.5 text-foreground/20 pointer-events-none" />
                <Input ref={searchRef} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="搜索标题、内容或变量..." className="w-full bg-foreground/[0.04] border border-transparent focus:border-foreground/[0.1] rounded-lg pl-7 pr-2 py-[5px] h-auto text-xs text-foreground/70 placeholder:text-foreground/20" />
                {searchQuery && (
                  <Button variant="ghost" size="icon" onClick={() => { setSearchQuery(''); searchRef.current?.focus(); }} className="absolute right-1.5 w-4 h-4 rounded text-foreground/25 hover:text-foreground/50">
                    <X size={9} />
                  </Button>
                )}
              </div>
              <Button variant="ghost" size="icon" onClick={openAdd} className="w-6 h-6 rounded-lg text-primary hover:bg-primary/10 flex-shrink-0" title="添加短语">
                <Plus size={13} />
              </Button>
            </div>
          </div>

          <div className="pb-1">
            {filteredPhrases.map(phrase => {
              const vars = extractVars(phrase.content);
              const isDeleting = confirmDeleteId === phrase.id;
              const preview = phrase.content.replace(new RegExp(String.fromCharCode(10) + '+', 'g'), '  ').trim();
              return (
                <div key={phrase.id} className={`group flex items-center gap-3 px-3 py-[9px] rounded-xl transition-colors hover:bg-foreground/[0.04] cursor-pointer ${!phrase.enabled ? 'opacity-35' : ''}`} onClick={() => openEdit(phrase)}>
                  <MessageSquareText size={13} className="text-foreground/30 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <p className="text-xs text-foreground/80 truncate flex-shrink-0 font-medium">{phrase.title}</p>
                      {vars.length > 0 && (
                        <div className="flex items-center gap-1 flex-shrink min-w-0 overflow-hidden">
                          {vars.slice(0, 3).map(v => (
                            <span key={v} className="text-[9px] text-foreground/50 bg-foreground/[0.05] px-1.5 py-[1px] rounded font-mono flex-shrink-0 font-medium">{v}</span>
                          ))}
                          {vars.length > 3 && <span className="text-[9px] text-foreground/25 flex-shrink-0">+{vars.length - 3}</span>}
                        </div>
                      )}
                    </div>
                    <RichPromptPreview content={preview} singleLine className="text-xs text-foreground/30 mt-[3px] leading-normal" />
                  </div>
                  <div className="flex items-center gap-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                    {isDeleting ? (
                      <div className="flex items-center gap-0.5">
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(phrase.id)} className="w-5 h-5 rounded-md text-destructive hover:bg-destructive/10" title="确认删除"><Check size={10} /></Button>
                        <Button variant="ghost" size="icon" onClick={() => setConfirmDeleteId(null)} className="w-5 h-5 rounded-md text-foreground/25 hover:text-foreground/50 hover:bg-foreground/[0.06]" title="取消"><X size={9} /></Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-0.5">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(phrase)} className="w-5 h-5 rounded-md text-foreground/25 hover:text-foreground/55 hover:bg-foreground/[0.06]" title="编辑"><Pencil size={10} /></Button>
                        <Button variant="ghost" size="icon" onClick={() => setConfirmDeleteId(phrase.id)} className="w-5 h-5 rounded-md text-foreground/25 hover:text-destructive hover:bg-destructive/[0.06]" title="删除"><Trash2 size={10} /></Button>
                      </div>
                    )}
                  </div>
                  <div className="flex-shrink-0" onClick={e => e.stopPropagation()}>
                    <Toggle checked={phrase.enabled} onChange={v => handleToggle(phrase.id, v)} size="md" />
                  </div>
                </div>
              );
            })}

            {phrases.length === 0 && (
              <div className="py-6 text-center">
                <FileText size={18} className="text-foreground/10 mx-auto mb-1.5" />
                <p className="text-xs text-foreground/30">暂无短语</p>
                <Button variant="ghost" size="sm" onClick={openAdd} className="mt-2 flex items-center gap-1 px-3 py-[4px] h-auto rounded-lg text-xs text-foreground/60 hover:bg-foreground/[0.04] mx-auto">
                  <Plus size={11} /><span>添加第一个短语</span>
                </Button>
              </div>
            )}

            {phrases.length > 0 && filteredPhrases.length === 0 && (
              <div className="py-6 text-center">
                <Search size={16} className="text-foreground/10 mx-auto mb-1.5" />
                <p className="text-xs text-foreground/30">没有找到匹配的短语</p>
                <p className="text-[9px] text-foreground/20 mt-0.5">尝试其他关键词，或清除搜索条件</p>
              </div>
            )}
          </div>

          <div className="flex items-start gap-1.5 px-3 py-2.5 border-t border-foreground/[0.04]">
            <CircleHelp size={9} className="text-foreground/15 mt-[1px] flex-shrink-0" />
            <p className="text-[9px] text-foreground/20 leading-relaxed">
              {'在对话输入框中使用 / 命令快速插入短语。使用 ${变量名} 定义可编辑的占位符。'}
            </p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showFormPanel && (
          <EditFormPanel open={showFormPanel} onClose={() => setShowFormPanel(false)} item={editingItem} onSave={handleSave} />
        )}
      </AnimatePresence>
    </div>
  );
}
