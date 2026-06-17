import React, { useState, useMemo } from 'react';
import { X, ChevronLeft, ChevronRight, Check, HelpCircle, Search, Sparkles } from 'lucide-react';
import {
  Dialog, DialogContent, DialogTitle,
  Button, Input, Textarea,
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
  Popover, PopoverTrigger, PopoverContent,
  SimpleTooltip,
} from '@cherry-studio/ui';
import { motion, AnimatePresence } from 'motion/react';
import { ASSISTANT_MODELS } from '@/app/config/models';
import { AVATAR_OPTIONS } from '@/app/config/constants';
import { MOCK_KNOWLEDGE_BASE_LIST } from '@/app/mock/knowledgeData';

// ===========================
// CreateAssistantWizard
// ===========================
// A 3-step guided flow for creating a new Assistant. Mirrors the Agent
// wizard's design language (left step-rail, neutral accent/foreground
// selected states, dense rows, border/15 + bg-accent/15 surfaces) but
// collects assistant-specific fields: an Assistant is a persona + system
// prompt, not an autonomous multi-step workflow — so the steps are
// 基础信息 / 设定人格 / 标签整理.
// ===========================

export interface CreateAssistantResult {
  name: string;
  emoji: string;
  model: string;
  modelProvider: string;
  systemPrompt: string;
  knowledgeBases: { id: string; name: string }[];
}

export interface CreateAssistantWizardProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreate?: (data: CreateAssistantResult) => void;
}

type StepId = 'basic' | 'persona' | 'knowledge';

interface StepDef {
  id: StepId;
  index: number;
  label: string;
  title: string;
  description: string;
}

const STEPS: StepDef[] = [
  { id: 'basic',   index: 1, label: '基础信息', title: '基础信息',
    description: '给助手取个名字、挑个头像，再选一个驱动它的模型。之后随时可改。' },
  { id: 'persona',   index: 2, label: '设定人格', title: '设定它的人格',
    description: '这段系统提示词决定助手的语气、专长和回答方式。保持具体、明确。' },
  { id: 'knowledge', index: 3, label: '添加知识库', title: '添加知识库',
    description: '挂载知识库后，助手回答时会优先检索其中的内容。可多选，也可稍后再加。' },
];

const DEFAULT_PROMPT = `你是一个专业、友好的 AI 助手。
回答时保持简洁清晰，必要时给出可执行的步骤或示例。
当问题不明确时，先简短澄清再作答。`;

export function CreateAssistantWizard({ open, onOpenChange, onCreate }: CreateAssistantWizardProps) {
  const [stepId, setStepId] = useState<StepId>('basic');
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🤖');
  const [modelId, setModelId] = useState(ASSISTANT_MODELS[0]?.id ?? '');
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_PROMPT);
  const [kbIds, setKbIds] = useState<Set<string>>(new Set());
  const [emojiSearch, setEmojiSearch] = useState('');
  const [kbSearch, setKbSearch] = useState('');

  const stepIndex = STEPS.findIndex(s => s.id === stepId);
  const step = STEPS[stepIndex];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === STEPS.length - 1;

  const canProceed = useMemo(() => {
    if (stepId === 'basic') return name.trim().length > 0 && !!modelId;
    if (stepId === 'persona') return systemPrompt.trim().length > 0;
    return true;
  }, [stepId, name, modelId, systemPrompt]);

  const reset = () => {
    setStepId('basic');
    setName('');
    setEmoji('🤖');
    setModelId(ASSISTANT_MODELS[0]?.id ?? '');
    setSystemPrompt(DEFAULT_PROMPT);
    setKbIds(new Set());
    setEmojiSearch('');
    setKbSearch('');
  };

  const close = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const next = () => {
    if (isLast) {
      const model = ASSISTANT_MODELS.find(m => m.id === modelId);
      onCreate?.({
        name: name.trim(),
        emoji,
        model: model?.name ?? modelId,
        modelProvider: model?.provider ?? '',
        systemPrompt: systemPrompt.trim(),
        knowledgeBases: MOCK_KNOWLEDGE_BASE_LIST
          .filter(kb => kbIds.has(kb.id))
          .map(kb => ({ id: kb.id, name: kb.name })),
      });
      close(false);
      return;
    }
    setStepId(STEPS[stepIndex + 1].id);
  };

  const back = () => {
    if (isFirst) return;
    setStepId(STEPS[stepIndex - 1].id);
  };

  const toggleKb = (id: string) => {
    setKbIds(prev => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };

  const filteredKbs = useMemo(() => {
    const q = kbSearch.trim().toLowerCase();
    if (!q) return MOCK_KNOWLEDGE_BASE_LIST;
    return MOCK_KNOWLEDGE_BASE_LIST.filter(kb => kb.name.toLowerCase().includes(q));
  }, [kbSearch]);

  const filteredEmojis = useMemo(() => {
    if (!emojiSearch.trim()) return AVATAR_OPTIONS;
    // Emojis aren't searchable by text; treat search as a simple include over
    // the raw glyphs so a pasted emoji can be located. Otherwise show all.
    return AVATAR_OPTIONS.filter(e => e.includes(emojiSearch.trim()));
  }, [emojiSearch]);

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent
        showCloseButton={false}
        className="!max-w-[720px] sm:!max-w-[720px] !w-[min(720px,86vw)] !h-[min(540px,80vh)] !rounded-2xl !p-0 !gap-0 !grid-cols-1 overflow-hidden border border-border/20 shadow-xl flex flex-col"
      >
        <DialogTitle className="sr-only">添加助手</DialogTitle>

        {/* Header */}
        <div className="flex items-center gap-3 px-5 h-14 border-b border-border/15 flex-shrink-0">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-cherry-primary/10 text-cherry-primary text-lg">
            {emoji}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-foreground">添加助手</div>
            <div className="text-xs text-muted-foreground/60 mt-0.5">引导式创建 · 第 {step.index} / {STEPS.length} 步</div>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={() => close(false)}
            className="text-muted-foreground/50 hover:text-foreground hover:bg-accent/40 flex-shrink-0">
            <X size={14} />
          </Button>
        </div>

        {/* Body — left step rail + right pane */}
        <div className="flex flex-1 min-h-0">
          {/* Left: step rail */}
          <div className="w-[180px] flex-shrink-0 border-r border-border/15 py-4 px-2.5 flex flex-col gap-0.5">
            {STEPS.map((s, i) => {
              const active = s.id === stepId;
              const done = i < stepIndex;
              const clickable = done;
              return (
                <button
                  key={s.id}
                  onClick={() => clickable && setStepId(s.id)}
                  disabled={!clickable && !active}
                  className={`flex items-center gap-2.5 px-2.5 h-8 rounded-md text-left transition-colors ${
                    active
                      ? 'bg-accent/60'
                      : clickable
                        ? 'hover:bg-accent/40 cursor-pointer'
                        : 'cursor-default'
                  }`}
                >
                  <span className={`flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-medium flex-shrink-0 transition-colors ${
                    active
                      ? 'bg-foreground text-background'
                      : done
                        ? 'bg-foreground/10 text-foreground'
                        : 'bg-muted/60 text-muted-foreground/50'
                  }`}>
                    {done ? <Check size={10} strokeWidth={3} /> : s.index}
                  </span>
                  <span className={`text-xs truncate transition-colors ${
                    active
                      ? 'text-foreground font-medium'
                      : done
                        ? 'text-foreground'
                        : 'text-muted-foreground/60'
                  }`}>
                    {s.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right: step body */}
          <div className="flex-1 min-w-0 flex flex-col">
            <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5 scrollbar-thin">
              <div className="mb-4">
                <div className="text-[15px] font-semibold text-foreground">{step.title}</div>
                <div className="text-xs text-muted-foreground/70 mt-1 leading-relaxed">{step.description}</div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={stepId}
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -3 }}
                  transition={{ duration: 0.12 }}
                >
                  {stepId === 'basic' && (
                    <div className="space-y-4">
                      <div>
                        <label className="flex items-center gap-1 text-sm text-muted-foreground mb-1.5">
                          头像与名称 <span className="text-destructive">*</span>
                        </label>
                        {/* Avatar sits inline with the input so both share one row height. */}
                        <div className="flex items-center gap-2.5">
                          <Popover>
                            <PopoverTrigger asChild>
                              <button className="w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center text-xl bg-accent/30 border border-border/40 hover:bg-accent/50 transition-colors">
                                {emoji}
                              </button>
                            </PopoverTrigger>
                            <PopoverContent align="start" className="w-[300px] p-2">
                              <div className="relative mb-2">
                                <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
                                <Input
                                  value={emojiSearch}
                                  onChange={(e) => setEmojiSearch(e.target.value)}
                                  placeholder="挑一个头像"
                                  className="h-7 pl-6 pr-2 text-xs border border-border/40 bg-accent/15 focus-visible:ring-0 shadow-none"
                                />
                              </div>
                              <div className="grid grid-cols-8 gap-0.5 max-h-[180px] overflow-y-auto scrollbar-thin">
                                {filteredEmojis.map((e, i) => (
                                  <button
                                    key={`${e}-${i}`}
                                    onClick={() => setEmoji(e)}
                                    className={`w-8 h-8 rounded-md flex items-center justify-center text-lg transition-colors ${
                                      emoji === e ? 'bg-accent/60 ring-1 ring-foreground/25' : 'hover:bg-accent/50'
                                    }`}
                                  >
                                    {e}
                                  </button>
                                ))}
                              </div>
                            </PopoverContent>
                          </Popover>
                          <Input
                            autoFocus
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="例如：写作助手"
                            className="flex-1 h-9 px-3 py-1.5 rounded-lg border border-border/60 bg-accent/15 text-xs text-foreground focus-visible:border-border focus-visible:ring-0 shadow-none"
                          />
                        </div>
                      </div>

                      {/* Model */}
                      <div>
                        <label className="flex items-center gap-1 text-sm text-muted-foreground mb-1.5">
                          模型 <span className="text-destructive">*</span>
                          <SimpleTooltip content="可以选择 Cherry 自带的内置模型，也可以选择已配置的第三方供应商模型。" side="top" sideOffset={6}>
                            <HelpCircle size={11} className="text-muted-foreground/40 hover:text-muted-foreground transition-colors cursor-help" />
                          </SimpleTooltip>
                        </label>
                        <Select value={modelId} onValueChange={setModelId}>
                          <SelectTrigger className="!h-9 w-full px-3 text-xs border border-border/60 bg-accent/15 hover:bg-accent/40 rounded-lg">
                            <SelectValue placeholder="选择模型" />
                          </SelectTrigger>
                          <SelectContent>
                            {ASSISTANT_MODELS.map(m => (
                              <SelectItem key={m.id} value={m.id}>
                                <span className="flex items-center gap-2">
                                  <span>{m.name}</span>
                                  {m.provider && <span className="text-muted-foreground/50 text-[11px]">· {m.provider}</span>}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {stepId === 'persona' && (
                    <div>
                      <label className="flex items-center gap-1.5 text-sm text-muted-foreground mb-1.5">
                        系统提示词 <span className="text-muted-foreground/40 text-xs">system prompt</span>
                      </label>
                      <Textarea
                        value={systemPrompt}
                        onChange={(e) => setSystemPrompt(e.target.value)}
                        rows={14}
                        className="w-full px-3 py-2 rounded-lg border border-border/60 bg-accent/15 text-xs leading-[1.7] text-foreground shadow-none focus-visible:border-border focus-visible:ring-0 resize-y min-h-[200px]"
                      />
                      <div className="text-xs text-muted-foreground/50 mt-1.5">描述助手的角色、语气和擅长的场景，越具体表现越稳定。</div>
                    </div>
                  )}

                  {stepId === 'knowledge' && (
                    <div>
                      {/* Search + selected count */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="relative flex-1">
                          <Search size={11} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
                          <Input
                            value={kbSearch}
                            onChange={(e) => setKbSearch(e.target.value)}
                            placeholder="搜索知识库"
                            className="h-7 pl-6 pr-2 text-xs border border-border/40 bg-accent/15 focus-visible:ring-0 shadow-none"
                          />
                        </div>
                        <div className="text-[11px] text-muted-foreground/60 tabular-nums flex-shrink-0 px-1">
                          已选 <span className="text-foreground font-medium">{kbIds.size}</span>
                        </div>
                      </div>

                      {/* Knowledge base list — same selected-state language as the agent skill grid */}
                      <div className="grid grid-cols-2 gap-2">
                        {filteredKbs.map(kb => {
                          const checked = kbIds.has(kb.id);
                          return (
                            <button
                              key={kb.id}
                              onClick={() => toggleKb(kb.id)}
                              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border text-left transition-all ${
                                checked
                                  ? 'border-foreground/10 bg-accent/60'
                                  : 'border-border/15 bg-accent/15 hover:bg-accent/40'
                              }`}
                            >
                              <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                                checked ? 'border-foreground bg-foreground' : 'border-border/60 bg-background'
                              }`}>
                                {checked && <Check size={9} className="text-background" strokeWidth={3.5} />}
                              </span>
                              <span className="text-base leading-none flex-shrink-0">{kb.icon}</span>
                              <div className="flex-1 min-w-0">
                                <span className="text-sm text-foreground truncate block">{kb.name}</span>
                                <span className="text-[11px] text-muted-foreground/60 truncate block">{kb.docCount} 个文档</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                      {filteredKbs.length === 0 && (
                        <div className="text-center py-10 text-xs text-muted-foreground/50">没有匹配的知识库</div>
                      )}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 h-12 border-t border-border/15 flex-shrink-0">
              <Button variant="ghost" size="sm" onClick={() => close(false)} className="h-7 px-3 text-xs text-muted-foreground hover:text-foreground">
                取消
              </Button>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={back}
                  disabled={isFirst}
                  className="h-7 px-2.5 text-xs"
                >
                  <ChevronLeft size={11} className="mr-0.5" />
                  上一步
                </Button>
                <Button
                  size="sm"
                  onClick={next}
                  disabled={!canProceed}
                  className="h-7 px-3 text-xs"
                >
                  {isLast ? (
                    <>
                      <Sparkles size={11} className="mr-0.5" />
                      完成创建
                    </>
                  ) : (
                    <>
                      下一步
                      <ChevronRight size={11} className="ml-0.5" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
