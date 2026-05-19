import React, { useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, Copy, Check } from 'lucide-react';
import {
  Button, Input, Textarea, SearchInput, Typography, Badge,
  Popover, PopoverTrigger, PopoverContent,
} from '@cherry-studio/ui';

// ===========================
// Quick Phrases (快捷短语)
// ===========================
// A library of reusable Prompt templates. Each phrase has a short
// title (used as the trigger in chat) and a body that gets inserted
// into the composer. Mirrors Cherry Studio source's 常用短语 pattern.

interface PhraseItem {
  id: string;
  title: string;
  body: string;
  tags: string[];
}

const PRESET_PHRASES: PhraseItem[] = [
  {
    id: 'p1',
    title: '专业翻译',
    body: '请将以下内容翻译为中文，保持原文的语气和专业性，遇到专有名词请保留原文并附注释。\n\n---\n\n{{text}}',
    tags: ['翻译', '写作'],
  },
  {
    id: 'p2',
    title: '代码审查',
    body: '请审查以下代码，关注：\n1. 潜在的 bug 和边界情况\n2. 性能问题\n3. 可读性 / 可维护性\n4. 安全隐患\n\n```\n{{code}}\n```',
    tags: ['编程', '代码审查'],
  },
  {
    id: 'p3',
    title: '会议纪要',
    body: '请基于以下对话整理会议纪要，包含：\n• 议题概述\n• 关键决策\n• 行动项（负责人 + 截止时间）\n• 待办问题\n\n---\n\n{{transcript}}',
    tags: ['办公', '纪要'],
  },
  {
    id: 'p4',
    title: '总结要点',
    body: '请帮我用 5 条要点概括以下文章，每条 30 字以内，按重要性排序。\n\n---\n\n{{article}}',
    tags: ['总结', '阅读'],
  },
  {
    id: 'p5',
    title: '邮件回复',
    body: '请基于以下邮件写一份得体的回复，语气{{tone}}（如：正式 / 友好 / 简洁），落款用 {{name}}。\n\n---\n\n{{email}}',
    tags: ['办公', '写作'],
  },
  {
    id: 'p6',
    title: 'SQL 解释',
    body: '请逐行解释以下 SQL 语句的执行计划与业务含义，并指出潜在的性能问题。\n\n```sql\n{{sql}}\n```',
    tags: ['编程', '数据库'],
  },
];

const TAG_COLOR_MAP: Record<string, string> = {
  翻译:     'bg-accent-violet-muted text-accent-violet border-accent-violet/20',
  写作:     'bg-accent-amber-muted  text-accent-amber  border-accent-amber/20',
  编程:     'bg-accent-cyan-muted   text-accent-cyan   border-accent-cyan/20',
  代码审查: 'bg-accent-blue-muted   text-accent-blue   border-accent-blue/20',
  办公:     'bg-accent-emerald-muted text-accent-emerald border-accent-emerald/20',
  纪要:     'bg-accent-indigo-muted text-accent-indigo border-accent-indigo/20',
  总结:     'bg-accent-pink-muted   text-accent-pink   border-accent-pink/20',
  阅读:     'bg-accent-orange-muted text-accent-orange border-accent-orange/20',
  数据库:   'bg-success/10          text-success       border-success/20',
};

function tagClass(tag: string) {
  return TAG_COLOR_MAP[tag] || 'bg-muted text-muted-foreground border-border/40';
}

export function PhrasesSection() {
  const [phrases, setPhrases] = useState<PhraseItem[]>(PRESET_PHRASES);
  const [search, setSearch] = useState('');
  const [activeId, setActiveId] = useState<string | null>(PRESET_PHRASES[0]?.id ?? null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editing, setEditing] = useState<PhraseItem | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return phrases;
    return phrases.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.body.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q)),
    );
  }, [phrases, search]);

  const active = phrases.find(p => p.id === activeId) ?? filtered[0];

  const handleCopy = (id: string, body: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(body).catch(() => {});
    }
    setCopiedId(id);
    window.setTimeout(() => setCopiedId(null), 1400);
  };

  const startAdd = () => {
    setEditing({ id: `p-${Date.now()}`, title: '', body: '', tags: [] });
  };

  const saveEditing = () => {
    if (!editing || !editing.title.trim()) return;
    setPhrases(prev => {
      const exists = prev.find(p => p.id === editing.id);
      if (exists) return prev.map(p => p.id === editing.id ? editing : p);
      return [...prev, editing];
    });
    setActiveId(editing.id);
    setEditing(null);
  };

  const remove = (id: string) => {
    setPhrases(prev => prev.filter(p => p.id !== id));
    if (activeId === id) setActiveId(null);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <Typography variant="subtitle" className="mb-1">快捷短语</Typography>
        <p className="text-xs text-muted-foreground/60">配置可在对话中快速插入的 Prompt 模板。输入框中按 <span className="font-mono text-muted-foreground/80">/</span> 触发选择。</p>
      </div>

      <div className="flex gap-4 min-h-[420px]">
        {/* Left: list */}
        <div className="w-[240px] flex-shrink-0 flex flex-col gap-2">
          <div className="flex items-center gap-1.5">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="搜索短语…"
              clearable
              wrapperClassName="flex-1 flex items-center gap-1.5 px-2 h-8 rounded-md bg-muted/30 border border-border/25"
            />
            <Button variant="outline" size="icon-xs" onClick={startAdd} title="新增短语" className="h-8 w-8 flex-shrink-0">
              <Plus size={12} />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-thin space-y-1 pr-1">
            {filtered.length === 0 && (
              <div className="text-xs text-muted-foreground/50 px-2 py-6 text-center">未找到匹配的短语</div>
            )}
            {filtered.map(p => {
              const active = p.id === activeId;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setActiveId(p.id)}
                  className={`w-full text-left rounded-lg border px-2.5 py-2 transition-colors ${
                    active
                      ? 'border-border/50 bg-accent/40'
                      : 'border-transparent hover:bg-accent/25'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span className="text-xs font-medium text-foreground truncate">{p.title}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground/60 line-clamp-2 leading-relaxed">{p.body}</p>
                  {p.tags.length > 0 && (
                    <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                      {p.tags.slice(0, 3).map(t => (
                        <span key={t} className={`text-[9px] px-1 py-px rounded border ${tagClass(t)}`}>{t}</span>
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: detail / editor */}
        <div className="flex-1 min-w-0 rounded-xl border border-border/20 bg-card/40 overflow-hidden">
          {editing ? (
            <PhraseEditor
              draft={editing}
              onChange={setEditing}
              onCancel={() => setEditing(null)}
              onSave={saveEditing}
            />
          ) : active ? (
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border/20">
                <div className="min-w-0 flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground truncate">{active.title}</span>
                  {active.tags.map(t => (
                    <span key={t} className={`text-[10px] px-1.5 py-px rounded border ${tagClass(t)}`}>{t}</span>
                  ))}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button variant="ghost" size="icon-xs" onClick={() => handleCopy(active.id, active.body)} title="复制 Prompt" className="text-muted-foreground/60 hover:text-foreground">
                    {copiedId === active.id ? <Check size={12} className="text-primary" /> : <Copy size={12} />}
                  </Button>
                  <Button variant="ghost" size="icon-xs" onClick={() => setEditing(active)} title="编辑" className="text-muted-foreground/60 hover:text-foreground">
                    <Pencil size={12} />
                  </Button>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon-xs" title="删除" className="text-muted-foreground/60 hover:text-destructive">
                        <Trash2 size={12} />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="end" sideOffset={4} className="w-[200px] p-3 space-y-2">
                      <p className="text-xs text-foreground">确认删除「{active.title}」？</p>
                      <div className="flex items-center justify-end gap-1.5">
                        <Button variant="ghost" size="xs">取消</Button>
                        <Button variant="destructive" size="xs" onClick={() => remove(active.id)}>删除</Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-3">
                <pre className="text-xs font-mono leading-relaxed text-foreground/85 whitespace-pre-wrap break-words">
                  {active.body}
                </pre>
              </div>
              <div className="px-4 py-2.5 border-t border-border/20 flex items-center justify-between bg-muted/20">
                <p className="text-[11px] text-muted-foreground/60">
                  使用变量：<span className="font-mono text-muted-foreground/80">{`{{text}}`}</span> 在调用时会被替换
                </p>
                <Button variant="default" size="xs" className="gap-1.5">
                  插入到输入框
                </Button>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-muted-foreground/50">
              请在左侧选择一条短语，或点击 + 新建
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PhraseEditor({
  draft, onChange, onCancel, onSave,
}: {
  draft: PhraseItem;
  onChange: (d: PhraseItem) => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  const [tagInput, setTagInput] = useState('');
  const addTag = () => {
    const t = tagInput.trim();
    if (!t || draft.tags.includes(t)) return;
    onChange({ ...draft, tags: [...draft.tags, t] });
    setTagInput('');
  };
  const removeTag = (t: string) => {
    onChange({ ...draft, tags: draft.tags.filter(x => x !== t) });
  };
  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-border/20">
        <div className="text-sm font-medium text-foreground">{draft.id.startsWith('p-') ? '新建短语' : '编辑短语'}</div>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-3 space-y-3">
        <div>
          <label className="text-xs text-muted-foreground/60 mb-1.5 block">标题</label>
          <Input
            value={draft.title}
            onChange={e => onChange({ ...draft, title: e.target.value })}
            placeholder="例如：会议纪要"
            className="h-9 text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground/60 mb-1.5 block">内容</label>
          <Textarea
            value={draft.body}
            onChange={e => onChange({ ...draft, body: e.target.value })}
            placeholder="支持 {{变量}} 占位，调用时会提示输入。"
            rows={10}
            className="text-xs font-mono leading-relaxed resize-none"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground/60 mb-1.5 block">标签</label>
          <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
            {draft.tags.map(t => (
              <Badge key={t} variant="outline" className={`gap-1 px-1.5 py-[2px] rounded-md ${tagClass(t)}`}>
                {t}
                <button onClick={() => removeTag(t)} className="opacity-50 hover:opacity-100">×</button>
              </Badge>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <Input
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
              placeholder="输入标签后回车"
              className="h-8 text-xs flex-1"
            />
            <Button variant="outline" size="xs" onClick={addTag}>添加</Button>
          </div>
        </div>
      </div>
      <div className="px-4 py-2.5 border-t border-border/20 flex items-center justify-end gap-2 bg-muted/20">
        <Button variant="ghost" size="xs" onClick={onCancel}>取消</Button>
        <Button variant="default" size="xs" onClick={onSave} disabled={!draft.title.trim()}>保存</Button>
      </div>
    </div>
  );
}
