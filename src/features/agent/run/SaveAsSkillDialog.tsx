import React, { useEffect, useMemo, useState } from 'react';
import { Sparkles, Wand2, Plus, X, GripVertical, CheckCircle2 } from 'lucide-react';
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
// Mock SOP-extraction flow. Reads the most recent user messages from
// the chat, fakes a "Cherry analyzed your conversation" summary, and
// lets the user tweak name / description / tags / steps before saving
// the result as a Skill in the resource library.

interface AnyMsg {
  role?: string;
  content?: string;
  text?: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Source agent (used for default tags + name template). */
  agent: { name: string; avatar?: string; tags?: string[] } | null;
  /** Latest message list — we sample user turns to derive steps. */
  messages: AnyMsg[];
}

// Pluck first 4 user turns and turn them into pseudo-SOP steps. The
// real product would run an LLM extraction; here we just derive from
// what's in the transcript so the dialog feels alive.
function deriveSteps(messages: AnyMsg[]): string[] {
  const userTurns = messages
    .filter(m => m.role === 'user')
    .map(m => (m.content ?? m.text ?? '').trim())
    .filter(Boolean);
  if (userTurns.length === 0) {
    return [
      '描述目标与约束（输入数据 / 期望输出 / 边界条件）',
      '让模型先列出执行计划，确认后再开干',
      '逐步执行并在关键节点回报进展',
      '产出物归档到工作目录，附简短说明',
    ];
  }
  return userTurns.slice(0, 5).map(t => (t.length > 60 ? t.slice(0, 60) + '…' : t));
}

function deriveName(agentName: string | undefined, firstUserMsg: string | undefined): string {
  const base = (firstUserMsg ?? '').trim().slice(0, 16);
  if (base) return `${base} · SOP`;
  return `${agentName || '智能体'} 工作流`;
}

function deriveDescription(agentName: string | undefined, stepCount: number): string {
  return `由本次与「${agentName || '智能体'}」的对话沉淀的工作流，包含 ${stepCount} 个关键步骤。可在资源库直接复用。`;
}

export function SaveAsSkillDialog({ open, onOpenChange, agent, messages }: Props) {
  const initialSteps = useMemo(() => deriveSteps(messages), [messages]);
  const firstUserMsg = useMemo(() => {
    const u = messages.find(m => m.role === 'user');
    return (u?.content ?? u?.text ?? '').trim();
  }, [messages]);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [steps, setSteps] = useState<string[]>([]);
  const [analyzing, setAnalyzing] = useState(true);
  const [justSaved, setJustSaved] = useState(false);

  // Re-derive when the dialog opens so each invocation feels fresh.
  useEffect(() => {
    if (!open) return;
    setAnalyzing(true);
    setJustSaved(false);
    const derivedSteps = deriveSteps(messages);
    const derivedName = deriveName(agent?.name, firstUserMsg);
    const derivedDesc = deriveDescription(agent?.name, derivedSteps.length);
    const derivedTags = Array.from(new Set(['SOP', '工作流', ...(agent?.tags ?? [])])).slice(0, 4);
    // Fake an "analyzing" beat so the user feels Cherry doing work.
    const t = setTimeout(() => {
      setSteps(derivedSteps);
      setName(derivedName);
      setDescription(derivedDesc);
      setTags(derivedTags);
      setAnalyzing(false);
    }, 700);
    return () => clearTimeout(t);
  }, [open, agent, messages, firstUserMsg]);

  const handleSave = () => {
    if (!name.trim()) return;
    const now = new Date().toISOString();
    const skill: ResourceItem = {
      id: `skill-${Date.now()}`,
      name: name.trim(),
      type: 'skill',
      description: description.trim() || deriveDescription(agent?.name, steps.length),
      avatar: agent?.avatar || '✨',
      tags,
      createdAt: now,
      updatedAt: now,
      enabled: true,
      author: agent?.name ? `从「${agent.name}」对话生成` : '从对话生成',
      content: steps.map((s, i) => `${i + 1}. ${s}`).join('\n'),
      fileName: `${name.trim() || 'skill'}.md`,
      fileType: 'md',
      fileSize: '<1 KB',
    };
    addUserSkill(skill);
    setJustSaved(true);
    // Auto-close after a brief success beat so the user sees confirmation.
    setTimeout(() => onOpenChange(false), 900);
  };

  const updateStep = (i: number, v: string) => {
    setSteps(prev => prev.map((s, idx) => (idx === i ? v : s)));
  };
  const removeStep = (i: number) => {
    setSteps(prev => prev.filter((_, idx) => idx !== i));
  };
  const addStep = () => {
    setSteps(prev => [...prev, '']);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[520px] p-0 overflow-hidden rounded-2xl gap-0">
        {/* Header — paired icons + title */}
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
            将本次对话保存为 Skill
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground/60 mt-1 text-center max-w-[360px]">
            Cherry 已根据对话内容总结出可复用的工作流，确认后会加入资源库。
          </DialogDescription>
        </div>

        {/* Body */}
        <div className="px-6 py-4 max-h-[500px] overflow-y-auto scrollbar-thin border-t border-border/15 space-y-5">
          {analyzing ? (
            <div className="py-10 flex flex-col items-center gap-3">
              <div className="relative">
                <Wand2 size={20} strokeWidth={1.4} className="text-muted-foreground/40 animate-pulse" />
              </div>
              <p className="text-xs text-muted-foreground/60">正在分析对话上下文…</p>
            </div>
          ) : (
            <>
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

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Typography variant="subtitle">SOP 步骤</Typography>
                  <Button variant="ghost" size="xs" onClick={addStep}
                    className="gap-1 text-muted-foreground hover:text-foreground">
                    <Plus size={11} /> 添加步骤
                  </Button>
                </div>
                <div className="space-y-1.5">
                  {steps.map((step, i) => (
                    <div key={i} className="group flex items-start gap-2 px-2 py-1.5 rounded-md hover:bg-accent/15 transition-colors">
                      <GripVertical size={11} className="text-muted-foreground/30 mt-1.5 flex-shrink-0" />
                      <span className="text-[11px] text-muted-foreground/55 tabular-nums mt-1.5 flex-shrink-0 w-4 text-right">{i + 1}.</span>
                      <Input
                        value={step}
                        onChange={e => updateStep(i, e.target.value)}
                        placeholder="描述这一步要做什么"
                        className="h-7 text-xs flex-1"
                      />
                      <button
                        type="button"
                        onClick={() => removeStep(i)}
                        aria-label="删除步骤"
                        className="mt-1 p-1 rounded text-muted-foreground/40 opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-all"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                  {steps.length === 0 && (
                    <p className="text-xs text-muted-foreground/40 px-2 py-3">暂无步骤，点击"添加步骤"</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="bg-transparent border-t border-border/15">
          {justSaved ? (
            <div className="flex items-center gap-2 text-xs text-success">
              <CheckCircle2 size={13} />
              <span>已保存到资源库 · Skill</span>
            </div>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>取消</Button>
              <Button
                size="sm"
                disabled={analyzing || !name.trim() || steps.length === 0}
                onClick={handleSave}
                className="gap-1.5"
              >
                <Sparkles size={11} />
                保存到资源库
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
