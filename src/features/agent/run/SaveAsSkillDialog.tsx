import React, { useEffect, useMemo, useState } from 'react';
import { Sparkles, X, CheckCircle2, Loader2, Wrench, ArrowRight } from 'lucide-react';
import {
  Button, Input, Textarea, Typography,
  Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter,
} from '@cherry-studio/ui';
import { Combobox } from '@cherrystudio/ui/components/primitives/combobox';
import { Field, FieldContent, FieldLabel } from '@cherrystudio/ui/components/primitives/field';
import type { ResourceItem } from '@/app/types';
import { TAG_COLORS, DEFAULT_TAG_COLOR } from '@/app/config/constants';
import { addUserSkill } from '@/app/stores/userSkillsStore';

// ============================================================
// SaveAsSkillDialog
// ============================================================
// Conceptual model: "Skill" is just a tool. The Agent itself owns the
// `create_skill` capability — once the user OKs basic metadata, the
// Agent runs the tool to author the file behind the scenes. The UI's
// job is small: confirm name / description / tags, then play back a
// short tool-call animation so the user understands the Agent did
// the heavy lifting.

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

type Phase = 'confirm' | 'creating' | 'done';

const CREATE_STEPS = [
  { id: 'analyze',  label: '分析对话上下文' },
  { id: 'extract',  label: '提取关键步骤与边界条件' },
  { id: 'compose',  label: '生成 Skill 文件' },
  { id: 'persist',  label: '写入资源库' },
];

function deriveName(agentName: string | undefined, firstUserMsg: string | undefined): string {
  const base = (firstUserMsg ?? '').trim().slice(0, 16);
  if (base) return `${base} · SOP`;
  return `${agentName || '智能体'} 工作流`;
}

function deriveDescription(agentName: string | undefined): string {
  return `由本次与「${agentName || '智能体'}」的对话沉淀的工作流，可在资源库直接复用。`;
}

function deriveSkillContent(agentName: string | undefined, messages: AnyMsg[]): string {
  // Mock authored content — what the Agent would normally produce.
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

  const [phase, setPhase] = useState<Phase>('confirm');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (!open) return;
    setPhase('confirm');
    setStepIndex(0);
    setName(deriveName(agent?.name, firstUserMsg));
    setDescription(deriveDescription(agent?.name));
    setTags(Array.from(new Set(['SOP', '工作流', ...(agent?.tags ?? [])])).slice(0, 4));
  }, [open, agent, firstUserMsg]);

  // Drive the fake tool-call timeline once the user confirms.
  useEffect(() => {
    if (phase !== 'creating') return;
    if (stepIndex >= CREATE_STEPS.length) {
      // All steps done — actually persist and flip to done.
      const now = new Date().toISOString();
      const skill: ResourceItem = {
        id: `skill-${Date.now()}`,
        name: name.trim() || deriveName(agent?.name, firstUserMsg),
        type: 'skill',
        description: description.trim() || deriveDescription(agent?.name),
        avatar: agent?.avatar || '✨',
        tags,
        createdAt: now,
        updatedAt: now,
        enabled: true,
        author: agent?.name ? `create_skill · 从「${agent.name}」对话生成` : 'create_skill · 自动生成',
        content: deriveSkillContent(agent?.name, messages),
        fileName: `${name.trim() || 'skill'}.md`,
        fileType: 'md',
        fileSize: '<1 KB',
      };
      addUserSkill(skill);
      setPhase('done');
      const t = setTimeout(() => onOpenChange(false), 1200);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setStepIndex(i => i + 1), 450);
    return () => clearTimeout(t);
  }, [phase, stepIndex, agent, firstUserMsg, messages, name, description, tags, onOpenChange]);

  const handleGenerate = () => {
    if (!name.trim()) return;
    setStepIndex(0);
    setPhase('creating');
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (phase === 'creating') return; onOpenChange(v); }}>
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
            确认基本信息后，Agent 会自动调用 <span className="font-mono px-1 rounded bg-muted/50">create_skill</span> 把本次对话沉淀成可复用的工具。
          </DialogDescription>
        </div>

        {/* Body — switches between confirm form and tool-call animation */}
        <div className="px-6 py-4 border-t border-border/15 min-h-[220px]">
          {phase === 'confirm' && (
            <div className="space-y-4">
              <Field>
                <FieldLabel>名称</FieldLabel>
                <FieldContent>
                  <Input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="给这个 Skill 起个名字"
                    className="h-8 text-sm"
                  />
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
                              <span key={t} className={`inline-flex items-center gap-1 px-1.5 py-[2px] rounded-md text-[11px] border ${c.badge}`}>
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
          )}

          {(phase === 'creating' || phase === 'done') && (
            <div className="space-y-3">
              {/* Tool-call header — mimics how the Agent renders its own tool calls */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/30 border border-border/15">
                <Wrench size={11} className="text-accent-violet flex-shrink-0" />
                <span className="text-xs font-mono text-foreground">create_skill</span>
                {phase === 'creating' && (
                  <Loader2 size={11} className="text-muted-foreground/60 animate-spin ml-auto" />
                )}
                {phase === 'done' && (
                  <CheckCircle2 size={11} className="text-success ml-auto" />
                )}
              </div>

              {/* Step timeline */}
              <div className="space-y-1.5 pl-1">
                {CREATE_STEPS.map((step, i) => {
                  const isDone = phase === 'done' || i < stepIndex;
                  const isRunning = phase === 'creating' && i === stepIndex;
                  return (
                    <div key={step.id} className="flex items-center gap-2 text-xs">
                      <span className="w-3.5 h-3.5 flex items-center justify-center flex-shrink-0">
                        {isDone && <CheckCircle2 size={11} className="text-success" />}
                        {isRunning && <Loader2 size={11} className="text-muted-foreground/70 animate-spin" />}
                        {!isDone && !isRunning && <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />}
                      </span>
                      <span className={isDone ? 'text-foreground' : isRunning ? 'text-foreground/80' : 'text-muted-foreground/45'}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {phase === 'done' && (
                <div className="mt-3 pt-3 border-t border-border/15 flex items-center gap-2 text-xs text-success">
                  <CheckCircle2 size={13} />
                  <span>Skill 已加入资源库</span>
                  <ArrowRight size={11} className="ml-auto text-muted-foreground/40" />
                  <span className="text-muted-foreground/60">资源库 · Skill</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="bg-transparent border-t border-border/15">
          {phase === 'confirm' && (
            <>
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
            </>
          )}
          {phase === 'creating' && (
            <div className="text-xs text-muted-foreground/55">Agent 正在创建，请稍候…</div>
          )}
          {phase === 'done' && (
            <Button size="sm" onClick={() => onOpenChange(false)}>完成</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
