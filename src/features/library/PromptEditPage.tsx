import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, Save, Variable, X } from 'lucide-react';
import { Button } from '@cherrystudio/ui/components/primitives/button';
import { Combobox } from '@cherrystudio/ui/components/primitives/combobox';
import { Field, FieldContent, FieldLabel } from '@cherrystudio/ui/components/primitives/field';
import { Popover, PopoverContent, PopoverTrigger } from '@cherrystudio/ui/components/primitives/popover';
import { Input, SearchInput, Typography, SYSTEM_VARIABLES, type VariableDef } from '@cherry-studio/ui';
import type { ResourceItem } from '@/app/types';
import { DEFAULT_TAG_COLOR, TAG_COLORS } from '@/app/config/constants';

function extractVars(content: string): string[] {
  const p = /\$\{(\w+)\}/g;
  const matches = content.match(p);
  if (!matches) return [];
  return [...new Set(matches.map(m => m.slice(2, -1)))];
}

// Rich editor for prompt content with variable tag rendering.
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
        className="w-full bg-muted/30 border border-border/40 rounded-xl px-3.5 py-3 text-sm text-foreground outline-none focus:border-border/50 transition-colors leading-relaxed whitespace-pre-wrap break-words"
        style={{ minHeight: '420px' }}
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

function VarPickerPopover({ systemVars, onInsert }: {
  systemVars: VariableDef[];
  onInsert: (name: string) => void;
}) {
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const filtSys = q ? systemVars.filter(v => v.name.toLowerCase().includes(q)) : systemVars;

  return (
    <div className="flex flex-col max-h-[320px]">
      <div className="p-2 border-b border-border/30">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="搜索变量"
          iconSize={11}
          wrapperClassName="px-2 h-7 rounded-md bg-muted/20 border border-border/20"
        />
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin py-1">
        {filtSys.length > 0 && (
          <div className="mb-1">
            <div className="px-2 py-1 text-xs text-muted-foreground/50 uppercase tracking-wider">系统变量</div>
            {filtSys.map(v => (
              <button
                key={v.id}
                type="button"
                onClick={() => onInsert(v.name)}
                className="w-full flex items-center gap-2 px-2 py-1.5 text-left hover:bg-accent/40 transition-colors"
              >
                <span className="text-xs font-mono text-accent-violet/80">{'${' + v.name + '}'}</span>
                {v.description && <span className="text-xs text-muted-foreground/60 truncate flex-1 text-right">{v.description}</span>}
              </button>
            ))}
          </div>
        )}
        {filtSys.length === 0 && (
          <div className="py-6 text-xs text-muted-foreground/50 text-center">无匹配变量</div>
        )}
      </div>
    </div>
  );
}

export function PromptEditPage({ resource, onBack, onSave, inModal = false }: {
  resource: ResourceItem;
  onBack: () => void;
  onSave: (updates: Partial<ResourceItem>) => void;
  inModal?: boolean;
}) {
  const [name, setName] = useState(resource.name);
  const [content, setContent] = useState(resource.content || '');
  const [tags, setTags] = useState<string[]>(resource.tags || []);
  const [showVarPanel, setShowVarPanel] = useState(false);

  const vars = extractVars(content);
  const tagsChanged = tags.join('|') !== (resource.tags || []).join('|');
  const hasChanges = name !== resource.name || content !== (resource.content || '') || tagsChanged;

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ name: name.trim(), content, tags, description: content.slice(0, 60).replace(/\n/g, ' '), updatedAt: new Date().toISOString() });
  };

  const handleInsertVar = (varName: string) => {
    setContent(prev => prev + '${' + varName + '}');
    setShowVarPanel(false);
  };

  const BasicSection = (
    <div className="space-y-5">
      <Typography variant="subtitle">基础信息</Typography>
      <div className="grid grid-cols-[1fr_220px] gap-3">
        <Field>
          <FieldLabel>名称</FieldLabel>
          <FieldContent>
            <Input value={name} onChange={e => setName(e.target.value)} className="h-8 text-sm" placeholder="Prompt 名称" />
          </FieldContent>
        </Field>
        <Field>
          <FieldLabel>标签</FieldLabel>
          <FieldContent>
            <Combobox
              multiple
              searchable
              value={tags}
              onChange={(v) => setTags(Array.isArray(v) ? v : [v])}
              options={Object.keys(TAG_COLORS).map(t => ({ value: t, label: t }))}
              placeholder="选择标签…"
              searchPlaceholder="搜索标签…"
              emptyText="没有匹配标签"
              renderOption={(opt) => {
                const c = TAG_COLORS[opt.value] || DEFAULT_TAG_COLOR;
                return <span className={`px-1.5 py-[1px] rounded-md text-xs border ${c.badge}`}>{opt.label}</span>;
              }}
              renderValue={(val) => {
                const selected = Array.isArray(val) ? val : (val ? [val] : []);
                if (selected.length === 0) return null;
                return (
                  <div className="flex flex-wrap gap-1 flex-1 min-w-0">
                    {selected.map(t => {
                      const c = TAG_COLORS[t] || DEFAULT_TAG_COLOR;
                      return (
                        <span key={t} className={`inline-flex items-center gap-1 px-1.5 py-[2px] rounded-md text-xs border ${c.badge}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
                          {t}
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setTags(prev => prev.filter(x => x !== t)); }}
                            aria-label={`移除 ${t}`}
                            className="ml-0.5 opacity-50 hover:opacity-100 transition-opacity"
                          >
                            <X size={9} />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                );
              }}
            />
          </FieldContent>
        </Field>
      </div>
    </div>
  );

  const ContentSection = (
    <div className="space-y-5">
      <div>
        <div className="flex items-center justify-between mb-2">
          <Typography variant="subtitle">内容</Typography>
          <Popover open={showVarPanel} onOpenChange={setShowVarPanel}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="xs"
                className="flex items-center gap-1 px-2 text-accent-violet/70 hover:text-accent-violet hover:bg-accent-violet/[0.06]"
              >
                <Variable size={10} /><span>使用变量</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" sideOffset={4} className="w-[280px] p-0 overflow-hidden">
              <VarPickerPopover systemVars={SYSTEM_VARIABLES} onInsert={handleInsertVar} />
            </PopoverContent>
          </Popover>
        </div>
        <PromptRichEditor
          value={content}
          onChange={setContent}
          onSlashCommand={() => setShowVarPanel(true)}
          placeholder="输入 Prompt 内容，使用 / 快速插入变量..."
        />
        <p className="text-xs text-muted-foreground/40 mt-1.5">输入 / 或点击「使用变量」插入变量</p>
      </div>
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
  );

  if (inModal) {
    return (
      <div className="flex-1 min-w-0 overflow-y-auto scrollbar-thin px-5 py-4 space-y-6">
        {BasicSection}
        {ContentSection}
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-background">
      <div className="flex items-center justify-between px-6 pt-5 pb-4 flex-shrink-0 border-b border-border/20">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-muted-foreground/50 hover:text-foreground transition-colors">
            <ChevronLeft size={18} />
          </button>
          <Typography variant="subtitle">编辑 Prompt</Typography>
        </div>
        <Button
          variant="default"
          size="xs"
          onClick={handleSave}
          disabled={!name.trim() || !hasChanges}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
        >
          <Save size={11} />
          <span>保存</span>
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="max-w-[640px] mx-auto px-6 py-6 space-y-5">
          {BasicSection}
          {ContentSection}
        </div>
      </div>
    </div>
  );
}
