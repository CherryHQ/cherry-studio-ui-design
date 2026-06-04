import React, { useState, useEffect, useRef } from 'react';
import { X, Wand2, Send, Loader2, Check, Sparkles, RefreshCw } from 'lucide-react';
import {
  Dialog, DialogContent, DialogTitle,
  Button, Textarea,
} from '@cherry-studio/ui';
import { motion, AnimatePresence } from 'motion/react';
import type { ResourceItem } from '@/app/types';

// ===========================
// CreateSkillWithAgentDialog
// ===========================
// AI-assisted skill creation. The user describes the skill they want,
// an agent "thinks" for a beat and proposes a generated Skill (name +
// description + system prompt). User clicks "采用" to add it.
// This is a UX shell — the agent response is mocked but shaped the
// way the real Skill-creator agent will return.
// ===========================

interface Props {
  open: boolean;
  onClose: () => void;
  onComplete: (resource: ResourceItem) => void;
}

interface SkillDraft {
  name: string;
  description: string;
  systemPrompt: string;
  tags: string[];
}

const EXAMPLES = [
  '帮我把会议记录整理成结构化摘要 + 待办事项',
  '把任意 JSON 转换成 TypeScript 类型定义',
  '审查 React 组件的可访问性问题',
  '生成 Tailwind v4 兼容的组件样式',
];

export function CreateSkillWithAgentDialog({ open, onClose, onComplete }: Props) {
  const [input, setInput] = useState('');
  const [phase, setPhase] = useState<'input' | 'thinking' | 'draft'>('input');
  const [draft, setDraft] = useState<SkillDraft | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!open) {
      // Reset on close
      setInput('');
      setPhase('input');
      setDraft(null);
    } else {
      // Focus textarea on open
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [open]);

  const submit = () => {
    if (!input.trim()) return;
    setPhase('thinking');
    // Simulate agent generation
    setTimeout(() => {
      setDraft(buildDraftFrom(input.trim()));
      setPhase('draft');
    }, 1400);
  };

  const accept = () => {
    if (!draft) return;
    const now = new Date().toISOString();
    const resource: ResourceItem = {
      id: `res-skill-${Date.now()}`,
      type: 'skill',
      name: draft.name,
      description: draft.description,
      avatar: '⚡',
      model: 'GPT-4o',
      tags: draft.tags,
      createdAt: now,
      updatedAt: now,
      enabled: true,
    };
    onComplete(resource);
  };

  const regenerate = () => {
    setPhase('thinking');
    setTimeout(() => {
      setDraft(buildDraftFrom(input.trim(), true));
      setPhase('draft');
    }, 1200);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="!max-w-[560px] sm:!max-w-[560px] !w-[min(560px,90vw)] !rounded-2xl !p-0 !gap-0 overflow-hidden border border-border/20 shadow-xl flex flex-col"
      >
        <DialogTitle className="sr-only">使用 Agent 帮我创建 Skill</DialogTitle>

        {/* Header */}
        <div className="flex items-center gap-3 px-5 h-14 border-b border-border/15 flex-shrink-0">
          <div className="w-9 h-9 rounded-xl bg-cherry-primary/10 text-cherry-primary flex items-center justify-center flex-shrink-0">
            <Wand2 size={15} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-foreground">使用 Agent 帮我创建 Skill</div>
            <div className="text-xs text-muted-foreground/60 mt-0.5">描述你想要的能力，Agent 帮你生成完整 Skill</div>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={onClose}
            className="text-muted-foreground/50 hover:text-foreground hover:bg-accent/40 flex-shrink-0">
            <X size={14} />
          </Button>
        </div>

        {/* Body */}
        <div className="px-5 py-4">
          <AnimatePresence mode="wait">
            {phase === 'input' && (
              <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}>
                <label className="block text-xs text-muted-foreground mb-1.5">告诉 Agent 你需要什么</label>
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit();
                  }}
                  rows={5}
                  placeholder="例如：把任意 JSON 转换成 TypeScript 类型定义"
                  className="w-full px-3 py-2 rounded-lg border border-border/60 bg-accent/15 text-xs text-foreground placeholder:text-muted-foreground/50 shadow-none focus-visible:border-border focus-visible:ring-0 resize-none leading-[1.7]"
                />
                <div className="mt-2 text-[11px] text-muted-foreground/50 flex items-center justify-between">
                  <span>⌘ + Enter 提交</span>
                </div>

                {/* Examples */}
                <div className="mt-4">
                  <div className="text-[11px] text-muted-foreground/50 mb-1.5">不知道写什么？试试这些：</div>
                  <div className="flex flex-wrap gap-1.5">
                    {EXAMPLES.map((ex, i) => (
                      <button
                        key={i}
                        onClick={() => setInput(ex)}
                        className="text-[11px] px-2 h-6 rounded-full border border-border/30 bg-accent/15 text-muted-foreground hover:text-foreground hover:bg-accent/40 hover:border-border/50 transition-colors"
                      >
                        {ex}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {phase === 'thinking' && (
              <motion.div key="thinking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                className="py-8 flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full bg-cherry-primary/10 text-cherry-primary flex items-center justify-center mb-3">
                  <Loader2 size={16} className="animate-spin" />
                </div>
                <div className="text-sm text-foreground">Agent 正在为你生成 Skill...</div>
                <div className="text-[11px] text-muted-foreground/60 mt-1">分析需求 · 拟定 prompt · 设计输入输出</div>
              </motion.div>
            )}

            {phase === 'draft' && draft && (
              <motion.div key="draft" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                {/* Generated card */}
                <div className="rounded-xl border border-cherry-primary/30 bg-cherry-primary/5 p-3.5">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Sparkles size={11} className="text-cherry-primary" />
                    <span className="text-[11px] text-cherry-primary font-medium tracking-wide uppercase">Agent 生成</span>
                  </div>

                  <div className="mb-3">
                    <div className="text-[10px] text-muted-foreground/60 mb-0.5">名称</div>
                    <div className="text-sm text-foreground font-medium">{draft.name}</div>
                  </div>

                  <div className="mb-3">
                    <div className="text-[10px] text-muted-foreground/60 mb-0.5">描述</div>
                    <div className="text-xs text-foreground/85 leading-[1.65]">{draft.description}</div>
                  </div>

                  <div className="mb-3">
                    <div className="text-[10px] text-muted-foreground/60 mb-0.5">系统提示词</div>
                    <div className="text-[11px] font-mono text-foreground/75 bg-background/50 rounded-md border border-border/20 p-2 leading-[1.6] whitespace-pre-wrap max-h-[120px] overflow-y-auto scrollbar-thin-xs">
                      {draft.systemPrompt}
                    </div>
                  </div>

                  {draft.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {draft.tags.map(t => (
                        <span key={t} className="text-[10px] px-1.5 py-px rounded bg-background/70 border border-border/30 text-muted-foreground/80">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 h-12 border-t border-border/15 flex-shrink-0">
          {phase === 'draft' ? (
            <>
              <Button variant="ghost" size="sm" onClick={regenerate}
                className="h-7 px-2.5 text-xs text-muted-foreground hover:text-foreground">
                <RefreshCw size={11} className="mr-1" />
                重新生成
              </Button>
              <div className="flex items-center gap-1.5">
                <Button variant="outline" size="sm" onClick={onClose}
                  className="h-7 px-2.5 text-xs">
                  取消
                </Button>
                <Button size="sm" onClick={accept}
                  className="h-7 px-3 text-xs bg-cherry-primary hover:bg-cherry-primary-dark text-primary-foreground">
                  <Check size={11} className="mr-1" />
                  采用
                </Button>
              </div>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={onClose}
                className="h-7 px-2.5 text-xs text-muted-foreground hover:text-foreground">
                取消
              </Button>
              <Button size="sm" onClick={submit} disabled={!input.trim() || phase === 'thinking'}
                className="h-7 px-3 text-xs bg-cherry-primary hover:bg-cherry-primary-dark text-primary-foreground">
                <Send size={11} className="mr-1" />
                生成 Skill
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ===========================
// Mocked agent draft generator
// ===========================
// Produces a plausible-looking SkillDraft from the user's free-text
// description. In production this would be the agent's API response.
function buildDraftFrom(prompt: string, alt = false): SkillDraft {
  const lc = prompt.toLowerCase();
  const isJson = /json|类型|typescript/i.test(prompt);
  const isMeeting = /会议|纪要|摘要|todo|待办/i.test(prompt);
  const isReview = /审查|review|代码|可访问|a11y|css|tailwind/i.test(prompt);

  if (isJson) {
    return {
      name: alt ? 'JSON Schema → TypeScript' : 'JSON 转 TypeScript 类型',
      description: '把任意 JSON 数据结构推断为对应的 TypeScript 类型定义，支持嵌套对象、数组、可选字段和联合类型。',
      systemPrompt: `You are a TypeScript type-inference specialist.\nGiven any JSON input, produce idiomatic TypeScript type definitions.\n\nRules:\n1. Infer optional fields as \`field?\`.\n2. Mixed arrays become union types.\n3. Prefer interfaces over type aliases for objects.\n4. Output ONLY valid TypeScript, no commentary.`,
      tags: ['代码', 'TypeScript', '工具'],
    };
  }
  if (isMeeting) {
    return {
      name: alt ? '结构化会议摘要' : '会议纪要整理',
      description: '把原始会议记录整理成结构化摘要：核心议题、关键决策、行动项（带负责人和截止日期）。',
      systemPrompt: `You are a meeting-notes editor.\nTransform raw meeting transcripts into a structured digest.\n\nOutput format (Markdown):\n- ## 核心议题\n- ## 关键决策\n- ## 行动项 (Owner · Due)\n- ## 待跟进\n\nIgnore filler words. Surface only actionable content.`,
      tags: ['办公', '总结', '协作'],
    };
  }
  if (isReview) {
    return {
      name: alt ? '前端代码审查' : 'React 组件审查',
      description: '审查 React/TypeScript 组件，关注可访问性、性能、状态管理和代码可维护性，输出可执行的修改建议。',
      systemPrompt: `You are a senior frontend code reviewer.\nReview the given component and provide concrete, actionable feedback.\n\nFocus areas:\n1. Accessibility (ARIA, keyboard nav, focus management)\n2. Performance (re-renders, memoization opportunities)\n3. State + prop hygiene\n4. Tailwind class organization\n\nFormat each finding as: severity · location · suggested fix.`,
      tags: ['代码', 'React', '审查'],
    };
  }

  // Generic fallback
  const head = prompt.length > 24 ? `${prompt.slice(0, 24)}…` : prompt;
  return {
    name: alt ? `${head} 助手 v2` : `${head} 助手`,
    description: `根据你的描述自动生成的能力：${prompt}`,
    systemPrompt: `You are a focused assistant whose only job is:\n\n${prompt}\n\nWhen the user provides input, address it directly with that single goal. Stay concise. Ask for clarification only when truly blocked.`,
    tags: ['自定义'],
  };
}
