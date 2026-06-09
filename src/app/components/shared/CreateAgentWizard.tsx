import React, { useState, useMemo } from 'react';
import { X, ChevronLeft, ChevronRight, Check, HelpCircle, Plus, Trash2, FolderOpen, Search, Bot } from 'lucide-react';
import {
  Dialog, DialogContent, DialogTitle,
  Button, Input, Textarea,
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
  Switch, SimpleTooltip,
} from '@cherry-studio/ui';
import { motion, AnimatePresence } from 'motion/react';
import { AGENT_MODELS } from '@/app/config/models';
import { SKILLS_CATALOG } from '@/app/config/agentTools';
import type { AgentSkillItem } from '@/app/config/agentTools';

// ===========================
// CreateAgentWizard
// ===========================
// A 4-step guided flow for creating a new Agent. Mirrors the existing
// AgentConfig design language (cherry-primary accents, dense rows,
// border/15 + bg-accent/15 surfaces) so it doesn't feel like a foreign
// dialog grafted in.
// ===========================

export interface CreateAgentResult {
  name: string;
  model: string;
  systemPrompt: string;
  skillIds: string[];
  soulMode: boolean;
  workDir: string;
  permissionMode: 'full-auto' | 'ask' | 'manual';
  envVars: Array<{ key: string; value: string }>;
}

export interface CreateAgentWizardProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreate?: (data: CreateAgentResult) => void;
}

type StepId = 'basic' | 'role' | 'abilities' | 'workspace';

interface StepDef {
  id: StepId;
  index: number;
  label: string;
  title: string;
  description: string;
}

const STEPS: StepDef[] = [
  { id: 'basic',     index: 1, label: '基础信息',     title: '基础信息',
    description: '给智能体一个名字，再挑一个愿意托付核心工作的模型。之后随时可改。' },
  { id: 'role',      index: 2, label: '塑造角色',     title: '塑造它的角色',
    description: '这段内容会作为系统提示词写入 soul.md 基底。保持简短、明确、可执行。' },
  { id: 'abilities', index: 3, label: '可用能力',     title: '选择可用能力',
    description: '挑选这个智能体可以调用的 Skill。先开几个最常用的，后续可以随时增减。' },
  { id: 'workspace', index: 4, label: '工作区设置',   title: '工作区与执行规则',
    description: '默认启用自主模式。你可以现在添加工作目录，需要时再调整高级执行规则。' },
];

const DEFAULT_SOUL_MD = `You are "Cherry Studio Pi Agent", an AI agent running inside Cherry Studio Pi.
Your configured display name is "Cherry Studio Pi Agent". When the user asks your name or identity, answer with this name.
Pi is only your internal agent runtime. Do not introduce yourself as Pi unless the user explicitly asks about the underlying engine or runtime.
Help the user complete coding, workspace, and agent tasks.`;

const DEFAULT_AGENT_MODEL_ID = AGENT_MODELS[0]?.id ?? 'claude-4-sonnet';

export function CreateAgentWizard({ open, onOpenChange, onCreate }: CreateAgentWizardProps) {
  const [stepId, setStepId] = useState<StepId>('basic');
  const [name, setName] = useState('Cherry Studio Pi Agent');
  const [modelId, setModelId] = useState(DEFAULT_AGENT_MODEL_ID);
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_SOUL_MD);
  const [skillIds, setSkillIds] = useState<Set<string>>(
    () => new Set(SKILLS_CATALOG.filter(s => s.enabled).map(s => s.id)),
  );
  const [skillFilter, setSkillFilter] = useState<'all' | AgentSkillItem['source']>('all');
  const [skillSearch, setSkillSearch] = useState('');
  const [soulMode, setSoulMode] = useState(true);
  const [workDir, setWorkDir] = useState('');
  const [permissionMode, setPermissionMode] = useState<CreateAgentResult['permissionMode']>('full-auto');
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [envVars, setEnvVars] = useState<CreateAgentResult['envVars']>([]);

  const stepIndex = STEPS.findIndex(s => s.id === stepId);
  const step = STEPS[stepIndex];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === STEPS.length - 1;

  const canProceed = useMemo(() => {
    if (stepId === 'basic') return name.trim().length > 0 && !!modelId;
    if (stepId === 'role') return systemPrompt.trim().length > 0;
    return true;
  }, [stepId, name, modelId, systemPrompt]);

  const reset = () => {
    setStepId('basic');
    setName('Cherry Studio Pi Agent');
    setModelId(DEFAULT_AGENT_MODEL_ID);
    setSystemPrompt(DEFAULT_SOUL_MD);
    setSkillIds(new Set(SKILLS_CATALOG.filter(s => s.enabled).map(s => s.id)));
    setSkillFilter('all');
    setSkillSearch('');
    setSoulMode(true);
    setWorkDir('');
    setPermissionMode('full-auto');
    setEnvVars([]);
    setAdvancedOpen(false);
  };

  const close = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const next = () => {
    if (isLast) {
      onCreate?.({
        name: name.trim(),
        model: modelId,
        systemPrompt: systemPrompt.trim(),
        skillIds: [...skillIds],
        soulMode,
        workDir: workDir.trim(),
        permissionMode,
        envVars: envVars.filter(e => e.key.trim() !== ''),
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

  const toggleSkill = (id: string) => {
    setSkillIds(prev => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };

  const filteredSkills = useMemo(() => {
    const lc = skillSearch.trim().toLowerCase();
    return SKILLS_CATALOG.filter(s => {
      if (skillFilter !== 'all' && s.source !== skillFilter) return false;
      if (lc && !s.name.toLowerCase().includes(lc) && !s.desc.toLowerCase().includes(lc)) return false;
      return true;
    });
  }, [skillFilter, skillSearch]);

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent
        showCloseButton={false}
        className="!max-w-[720px] sm:!max-w-[720px] !w-[min(720px,86vw)] !h-[min(540px,80vh)] !rounded-2xl !p-0 !gap-0 !grid-cols-1 overflow-hidden border border-border/20 shadow-xl flex flex-col"
      >
        <DialogTitle className="sr-only">添加 Agent</DialogTitle>

        {/* Header — matches LibraryPage modal header style */}
        <div className="flex items-center gap-3 px-5 h-14 border-b border-border/15 flex-shrink-0">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-cherry-primary/10 text-cherry-primary">
            <Bot size={16} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-foreground">添加 Agent</div>
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
                      ? 'bg-cherry-primary/8'
                      : clickable
                        ? 'hover:bg-accent/40 cursor-pointer'
                        : 'cursor-default'
                  }`}
                >
                  <span className={`flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-medium flex-shrink-0 transition-colors ${
                    active
                      ? 'bg-cherry-primary text-primary-foreground'
                      : done
                        ? 'bg-cherry-primary/15 text-cherry-primary'
                        : 'bg-muted/60 text-muted-foreground/50'
                  }`}>
                    {done ? <Check size={10} strokeWidth={3} /> : s.index}
                  </span>
                  <span className={`text-xs truncate transition-colors ${
                    active
                      ? 'text-cherry-primary font-medium'
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
                          名称 <span className="text-destructive">*</span>
                        </label>
                        <Input
                          autoFocus
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="例如：Cherry Studio Pi Agent"
                          className="h-9 px-3 py-1.5 rounded-lg border border-border/60 bg-accent/15 text-xs text-foreground focus-visible:border-border focus-visible:ring-0 shadow-none"
                        />
                        <div className="text-xs text-muted-foreground/50 mt-1.5">具体的名字会让智能体更容易被识别和复用。</div>
                      </div>

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
                            {AGENT_MODELS.map(m => (
                              <SelectItem key={m.id} value={m.id}>
                                <span className="flex items-center gap-2">
                                  <span>{m.name}</span>
                                  {m.provider && <span className="text-muted-foreground/50 text-[11px]">· {m.provider}</span>}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="text-xs text-muted-foreground/50 mt-1.5">更强的模型通常更适合长任务和多步推理。</div>
                      </div>
                    </div>
                  )}

                  {stepId === 'role' && (
                    <div>
                      <label className="flex items-center gap-1.5 text-sm text-muted-foreground mb-1.5">
                        系统提示词 <span className="text-muted-foreground/40 text-xs">soul.md</span>
                      </label>
                      <Textarea
                        value={systemPrompt}
                        onChange={(e) => setSystemPrompt(e.target.value)}
                        rows={11}
                        className="w-full px-3 py-2 rounded-lg border border-border/60 bg-accent/15 font-mono text-xs leading-[1.7] text-foreground shadow-none focus-visible:border-border focus-visible:ring-0 resize-none"
                      />
                      <div className="text-xs text-muted-foreground/50 mt-1.5">描述智能体的角色、工作方式，以及最重要的执行边界。</div>
                    </div>
                  )}

                  {stepId === 'abilities' && (
                    <div>
                      {/* Filter chips + search + count */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-0.5 p-0.5 rounded-md bg-accent/30 border border-border/30">
                          {([
                            { id: 'all',     label: '全部' },
                            { id: 'builtin', label: '内置' },
                            { id: 'custom',  label: '自定义' },
                            { id: 'market',  label: '市场' },
                          ] as const).map(opt => (
                            <button
                              key={opt.id}
                              onClick={() => setSkillFilter(opt.id)}
                              className={`px-2 h-6 rounded text-[11px] transition-colors ${
                                skillFilter === opt.id
                                  ? 'bg-background text-foreground shadow-sm'
                                  : 'text-muted-foreground hover:text-foreground'
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                        <div className="relative flex-1">
                          <Search size={11} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
                          <Input
                            value={skillSearch}
                            onChange={(e) => setSkillSearch(e.target.value)}
                            placeholder="搜索 Skill"
                            className="h-7 pl-6 pr-2 text-xs border border-border/40 bg-accent/15 focus-visible:ring-0 shadow-none"
                          />
                        </div>
                        <div className="text-[11px] text-muted-foreground/60 tabular-nums flex-shrink-0 px-1">
                          已选 <span className="text-cherry-primary">{skillIds.size}</span>
                        </div>
                      </div>

                      {/* Skill grid — same row style as AgentConfig toolchain */}
                      <div className="grid grid-cols-2 gap-2">
                        {filteredSkills.map(s => {
                          const checked = skillIds.has(s.id);
                          return (
                            <button
                              key={s.id}
                              onClick={() => toggleSkill(s.id)}
                              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border text-left transition-all ${
                                checked
                                  ? 'border-cherry-primary/35 bg-cherry-primary/5'
                                  : 'border-border/15 bg-accent/15 hover:bg-accent/40'
                              }`}
                            >
                              <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                                checked ? 'border-cherry-primary bg-cherry-primary' : 'border-border/60 bg-background'
                              }`}>
                                {checked && <Check size={9} className="text-primary-foreground" strokeWidth={3.5} />}
                              </span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-sm text-foreground truncate">{s.name}</span>
                                  <span className="text-[10px] px-1 py-px rounded leading-none flex-shrink-0 bg-muted/50 text-muted-foreground/70">
                                    {s.source === 'builtin' ? '内置' : s.source === 'custom' ? '自定义' : '市场'}
                                  </span>
                                </div>
                                <div className="text-[11px] text-muted-foreground/60 truncate mt-0.5">{s.desc}</div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                      {filteredSkills.length === 0 && (
                        <div className="text-center py-10 text-xs text-muted-foreground/50">没有匹配的 Skill</div>
                      )}
                    </div>
                  )}

                  {stepId === 'workspace' && (
                    <div className="space-y-4">
                      {/* Soul Mode row */}
                      <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl border border-border/15 bg-accent/15">
                        <div className="min-w-0">
                          <div className="text-sm text-foreground">自主模式</div>
                          <div className="text-[11px] text-muted-foreground/60 mt-0.5">默认开启。智能体会获得持久工作区和 soul.md 身份基底。</div>
                        </div>
                        <Switch checked={soulMode} onCheckedChange={setSoulMode} className="flex-shrink-0" />
                      </div>

                      {/* Work directory */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-sm text-muted-foreground">工作目录</label>
                          <Button variant="ghost" size="sm" className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground">
                            <FolderOpen size={10} className="mr-1" />添加目录
                          </Button>
                        </div>
                        <Input
                          value={workDir}
                          onChange={(e) => setWorkDir(e.target.value)}
                          placeholder="未指定时将自动创建默认工作目录"
                          className="h-9 px-3 py-1.5 rounded-lg border border-border/60 bg-accent/15 font-mono text-xs focus-visible:border-border focus-visible:ring-0 shadow-none"
                        />
                      </div>

                      {/* Advanced */}
                      <div>
                        <button
                          onClick={() => setAdvancedOpen(v => !v)}
                          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-2"
                        >
                          <ChevronRight size={10} className={`transition-transform ${advancedOpen ? 'rotate-90' : ''}`} />
                          高级设置
                        </button>

                        <AnimatePresence initial={false}>
                          {advancedOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.15 }}
                              className="overflow-hidden"
                            >
                              <div className="space-y-3 pl-3.5 border-l border-border/30 mt-1">
                                {/* Permission mode */}
                                <div>
                                  <label className="block text-xs text-muted-foreground mb-1">权限模式</label>
                                  <Select value={permissionMode} onValueChange={(v) => setPermissionMode(v as CreateAgentResult['permissionMode'])}>
                                    <SelectTrigger className="!h-8 w-full px-3 text-xs border border-border/60 bg-accent/15 hover:bg-accent/40 rounded-lg">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="full-auto">全自动模式</SelectItem>
                                      <SelectItem value="ask">询问模式（每次工具调用前确认）</SelectItem>
                                      <SelectItem value="manual">手动模式（仅运行你点中的步骤）</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <div className="text-[11px] text-muted-foreground/50 mt-1">指定智能体如何处理工具使用授权。</div>
                                </div>

                                {/* Env vars */}
                                <div>
                                  <div className="flex items-center justify-between mb-1">
                                    <label className="text-xs text-muted-foreground">环境变量</label>
                                    <Button variant="ghost" size="sm" onClick={() => setEnvVars(prev => [...prev, { key: '', value: '' }])}
                                      className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground">
                                      <Plus size={10} className="mr-0.5" />新增
                                    </Button>
                                  </div>
                                  {envVars.length === 0 ? (
                                    <div className="text-[11px] text-muted-foreground/50 py-1">运行时注入到智能体工作区，例如 OPENAI_API_KEY。</div>
                                  ) : (
                                    <div className="space-y-1.5">
                                      {envVars.map((kv, i) => (
                                        <div key={i} className="flex items-center gap-1.5">
                                          <Input
                                            value={kv.key}
                                            onChange={(e) => setEnvVars(prev => prev.map((p, j) => j === i ? { ...p, key: e.target.value } : p))}
                                            placeholder="KEY"
                                            className="h-7 px-2 text-xs font-mono flex-1 border border-border/40 bg-accent/15 focus-visible:ring-0 shadow-none"
                                          />
                                          <Input
                                            value={kv.value}
                                            onChange={(e) => setEnvVars(prev => prev.map((p, j) => j === i ? { ...p, value: e.target.value } : p))}
                                            placeholder="value"
                                            className="h-7 px-2 text-xs font-mono flex-1 border border-border/40 bg-accent/15 focus-visible:ring-0 shadow-none"
                                          />
                                          <Button variant="ghost" size="icon-xs" onClick={() => setEnvVars(prev => prev.filter((_, j) => j !== i))}
                                            className="text-muted-foreground/40 hover:text-destructive">
                                            <Trash2 size={11} />
                                          </Button>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
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
                  className="h-7 px-3 text-xs bg-cherry-primary hover:bg-cherry-primary-dark text-primary-foreground"
                >
                  {isLast ? '完成创建' : (
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
