import React, { useEffect, useMemo, useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import {
  Button, Input, Textarea,
  Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter,
} from '@cherry-studio/ui';
import { Combobox } from '@cherrystudio/ui/components/primitives/combobox';
import { Field, FieldContent, FieldLabel } from '@cherrystudio/ui/components/primitives/field';
import { TAG_COLORS, DEFAULT_TAG_COLOR } from '@/app/config/constants';
import { startSkillJob } from '@/app/stores/skillJobStore';

// ============================================================
// SaveAsSkillDialog (confirm-only)
// ============================================================
// Captures the user's basic confirmation (name / description / tags)
// then hands off to skillJobStore. The actual create_skill timeline
// runs in the background; the chat-header chip surfaces progress.

interface AnyMsg {
  role?: string;
  content?: string;
  text?: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agent: { name: string; avatar?: string; tags?: string[] } | null;
  messages: AnyMsg[];
}

// Map of well-known agent names → snake_case identifier stem. Skills
// are tools — they need identifier-style names, not human titles.
const AGENT_SLUG: Record<string, string> = {
  '全栈工程师': 'fullstack',
  '调研分析师': 'research',
  '后端工程师': 'backend',
  '运维工程师': 'devops',
  '数据分析师': 'data',
};

// Keyword → identifier matcher applied to the first user message so the
// auto-generated name reads as a real tool (e.g. `code_review_workflow`).
const KEYWORD_TO_SLUG: { match: RegExp; slug: string }[] = [
  { match: /审查|review/i,          slug: 'code_review' },
  { match: /调试|debug|栈追踪|trace/i, slug: 'debug_workflow' },
  { match: /部署|deploy|发布|release/i, slug: 'deploy_workflow' },
  { match: /组件|component|scaffold/i, slug: 'component_scaffolder' },
  { match: /api|接口|endpoint/i,    slug: 'api_builder' },
  { match: /测试|test/i,            slug: 'test_runner' },
  { match: /数据|分析|data|analy/i,   slug: 'data_pipeline' },
  { match: /翻译|translate/i,       slug: 'translator' },
  { match: /写作|文档|doc|write/i,    slug: 'doc_writer' },
  { match: /sql|查询|query/i,       slug: 'sql_query' },
  { match: /日程|会议|schedule|meeting/i, slug: 'schedule_helper' },
];

function sanitizeIdentifier(raw: string): string {
  // snake_case: lowercase alphanumerics + underscore, collapse runs.
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_+/g, '_')
    .slice(0, 40);
}

function deriveName(agentName: string | undefined, firstUserMsg: string | undefined): string {
  const msg = (firstUserMsg ?? '').trim();
  const hit = KEYWORD_TO_SLUG.find(k => k.match.test(msg));
  if (hit) return hit.slug;
  const agentSlug = (agentName && AGENT_SLUG[agentName]) || 'agent';
  return `${agentSlug}_sop`;
}

function deriveDescription(agentName: string | undefined): string {
  return `由本次与「${agentName || '智能体'}」的对话沉淀的工作流，可在资源库直接复用。`;
}

function deriveSkillContent(agentName: string | undefined, messages: AnyMsg[]): string {
  const userTurns = messages
    .filter(m => m.role === 'user')
    .map(m => (m.content ?? m.text ?? '').trim())
    .filter(Boolean)
    .slice(0, 5);
  const steps = userTurns.length > 0
    ? userTurns.map((t, i) => `${i + 1}. ${t.length > 80 ? t.slice(0, 80) + '…' : t}`)
    : [
        '1. 描述目标与约束（输入数据 / 期望输出 / 边界条件）',
        '2. 让模型先列出执行计划，确认后再开干',
        '3. 逐步执行并在关键节点回报进展',
        '4. 产出物归档到工作目录，附简短说明',
      ];
  return [
    `# 由「${agentName || '智能体'}」对话沉淀`,
    '',
    '## 步骤',
    ...steps,
    '',
    '## 备注',
    '由 Cherry create_skill 工具自动生成，可在资源库中编辑。',
  ].join('\n');
}

export function SaveAsSkillDialog({ open, onOpenChange, agent, messages }: Props) {
  const firstUserMsg = useMemo(() => {
    const u = messages.find(m => m.role === 'user');
    return (u?.content ?? u?.text ?? '').trim();
  }, [messages]);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    if (!open) return;
    setName(deriveName(agent?.name, firstUserMsg));
    setDescription(deriveDescription(agent?.name));
    setTags(Array.from(new Set(['SOP', '工作流', ...(agent?.tags ?? [])])).slice(0, 4));
  }, [open, agent, firstUserMsg]);

  const handleGenerate = () => {
    if (!name.trim()) return;
    startSkillJob({
      name: name.trim(),
      description: description.trim() || deriveDescription(agent?.name),
      tags,
      agentName: agent?.name || '智能体',
      agentAvatar: agent?.avatar || '✨',
      contentForMock: deriveSkillContent(agent?.name, messages),
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[460px] p-0 overflow-hidden rounded-2xl gap-0">
        {/* Header — paired logos + title */}
        <div className="px-6 pt-6 pb-3 flex flex-col items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-11 h-11 rounded-2xl bg-accent/40 flex items-center justify-center text-xl">
              {agent?.avatar || '🤖'}
            </div>
            <div className="flex items-center gap-1 text-muted-foreground/40">
              <span className="block w-1 h-1 rounded-full bg-current" />
              <span className="block w-1 h-1 rounded-full bg-current" />
              <span className="block w-1 h-1 rounded-full bg-current" />
            </div>
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-accent-violet/40 to-accent-blue/30 flex items-center justify-center">
              <Sparkles size={20} strokeWidth={1.5} className="text-foreground" />
            </div>
          </div>
          <DialogTitle className="text-base font-semibold mt-4">
            保存为 Skill
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground/60 mt-1 text-center max-w-[360px]">
            确认基本信息后，Agent 会在后台调用 <span className="font-mono px-1 rounded bg-muted/50">create_skill</span> 生成工具。你可以从顶部状态条查看进度。
          </DialogDescription>
        </div>

        {/* Body — confirm form */}
        <div className="px-6 py-4 border-t border-border/15 space-y-4">
          <Field>
            <FieldLabel>工具名</FieldLabel>
            <FieldContent>
              <Input
                value={name}
                onChange={e => setName(sanitizeIdentifier(e.target.value))}
                placeholder="code_review_workflow"
                className="h-8 text-sm font-mono"
                spellCheck={false}
              />
              <p className="text-xs text-muted-foreground/50 mt-1">
                小写字母 + 下划线，作为 Skill 在工具列表中的标识
              </p>
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel>描述</FieldLabel>
            <FieldContent>
              <Textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={2}
                placeholder="简单描述这个 Skill 的用途"
                className="text-sm resize-none"
              />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel>标签</FieldLabel>
            <FieldContent>
              <Combobox
                multiple
                searchable
                value={tags}
                onChange={v => setTags(Array.isArray(v) ? v : [v])}
                options={Object.keys(TAG_COLORS).map(t => ({ value: t, label: t }))}
                placeholder="选择标签…"
                searchPlaceholder="搜索标签…"
                emptyText="没有匹配标签"
                renderOption={opt => {
                  const c = TAG_COLORS[opt.value] || DEFAULT_TAG_COLOR;
                  return (
                    <span className="inline-flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.dot}`} />
                      <span className={`px-1.5 py-[1px] rounded-md text-xs border ${c.badge}`}>{opt.label}</span>
                    </span>
                  );
                }}
                renderValue={val => {
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
                              onClick={e => { e.stopPropagation(); setTags(prev => prev.filter(x => x !== t)); }}
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

        {/* Footer */}
        <DialogFooter className="bg-transparent border-t border-border/15">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>取消</Button>
          <Button
            size="sm"
            disabled={!name.trim()}
            onClick={handleGenerate}
            className="gap-1.5"
          >
            <Sparkles size={11} />
            生成 Skill
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
