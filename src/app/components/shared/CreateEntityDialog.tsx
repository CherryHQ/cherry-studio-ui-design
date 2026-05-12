import React, { useState, useMemo } from 'react';
import {
  X, Check, ChevronLeft, ChevronRight, Bot, Sparkles,
  Wrench, Hammer, BookOpen, Layers,
} from 'lucide-react';
import {
  Dialog, DialogContent, DialogTitle,
  Button, Input, Textarea, SearchInput,
} from '@cherry-studio/ui';
import {
  BUILTIN_TOOLS_CATALOG, MCP_CATALOG, SKILLS_CATALOG,
} from '@/app/config/agentTools';
import { MOCK_KNOWLEDGE_BASE_LIST } from '@/app/mock/knowledgeData';

const AVATAR_EMOJIS = ['🤖', '🧠', '📊', '✨', '⚙️', '🚀', '📈', '🎨', '🔬', '📚', '💡', '🛠️'];
const DEFAULT_MODELS = [
  { id: 'claude-4.7-opus', name: 'Claude 4.7 Opus' },
  { id: 'claude-4.6-sonnet', name: 'Claude 4.6 Sonnet' },
  { id: 'gpt-5', name: 'GPT-5' },
  { id: 'gpt-4o', name: 'GPT-4o' },
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro' },
];

export type CreateEntityVariant = 'agent' | 'assistant';

export interface CreateEntityDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  variant: CreateEntityVariant;
  onCreate?: (data: CreateEntityResult) => void;
}

export interface CreateEntityResult {
  variant: CreateEntityVariant;
  name: string;
  avatar: string;
  model: string;
  prompt: string;
  toolIds: string[];
  mcpIds: string[];
  skillIds: string[];
  knowledgeIds: string[];
}

const STEP_LABELS = ['基础信息', '提示词', '工具与扩展'];

export function CreateEntityDialog({ open, onOpenChange, variant, onCreate }: CreateEntityDialogProps) {
  const isAgent = variant === 'agent';
  const title = isAgent ? '新建 Agent' : '新建助手';

  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(AVATAR_EMOJIS[0]);
  const [modelId, setModelId] = useState(DEFAULT_MODELS[0].id);
  const [prompt, setPrompt] = useState('');
  const [toolIds, setToolIds] = useState<Set<string>>(new Set());
  const [mcpIds, setMcpIds] = useState<Set<string>>(new Set());
  const [skillIds, setSkillIds] = useState<Set<string>>(new Set());
  const [knowledgeIds, setKnowledgeIds] = useState<Set<string>>(new Set());
  const [tab3, setTab3] = useState<'tools' | 'mcp' | 'skills' | 'knowledge'>('tools');
  const [search, setSearch] = useState('');

  const reset = () => {
    setStep(0); setName(''); setAvatar(AVATAR_EMOJIS[0]); setModelId(DEFAULT_MODELS[0].id);
    setPrompt(''); setToolIds(new Set()); setMcpIds(new Set()); setSkillIds(new Set()); setKnowledgeIds(new Set());
    setTab3('tools'); setSearch('');
  };

  const close = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const canNext =
    step === 0 ? name.trim().length > 0 :
    step === 1 ? prompt.trim().length > 0 :
    true;

  const submit = () => {
    onCreate?.({
      variant,
      name: name.trim(),
      avatar,
      model: modelId,
      prompt: prompt.trim(),
      toolIds: Array.from(toolIds),
      mcpIds: Array.from(mcpIds),
      skillIds: Array.from(skillIds),
      knowledgeIds: Array.from(knowledgeIds),
    });
    close(false);
  };

  const toggle = (set: Set<string>, id: string, setter: (s: Set<string>) => void) => {
    const next = new Set(set);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setter(next);
  };

  const tabs3 = useMemo(() => {
    const base: { key: typeof tab3; label: string; icon: React.ElementType; count: number }[] = [
      { key: 'tools', label: '工具', icon: Wrench, count: toolIds.size },
      { key: 'mcp', label: 'MCP', icon: Hammer, count: mcpIds.size },
    ];
    if (isAgent) {
      base.push({ key: 'skills', label: 'Skill', icon: Layers, count: skillIds.size });
    } else {
      base.push({ key: 'knowledge', label: '知识库', icon: BookOpen, count: knowledgeIds.size });
    }
    return base;
  }, [isAgent, toolIds.size, mcpIds.size, skillIds.size, knowledgeIds.size]);

  const filteredList = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = tab3 === 'tools'
      ? BUILTIN_TOOLS_CATALOG.map(t => ({ id: t.id, name: t.name, desc: t.desc }))
      : tab3 === 'mcp'
      ? MCP_CATALOG.map(m => ({ id: m.id, name: m.name, desc: m.desc }))
      : tab3 === 'skills'
      ? SKILLS_CATALOG.map(s => ({ id: s.id, name: s.name, desc: s.desc }))
      : MOCK_KNOWLEDGE_BASE_LIST.map(k => ({ id: k.id, name: k.name, desc: `${k.group} · ${k.docCount} 个文档` }));
    if (!q) return list;
    return list.filter(x => x.name.toLowerCase().includes(q) || (x.desc || '').toLowerCase().includes(q));
  }, [tab3, search]);

  const activeSet = tab3 === 'tools' ? toolIds : tab3 === 'mcp' ? mcpIds : tab3 === 'skills' ? skillIds : knowledgeIds;
  const setActiveSet = tab3 === 'tools' ? setToolIds : tab3 === 'mcp' ? setMcpIds : tab3 === 'skills' ? setSkillIds : setKnowledgeIds;

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-w-[560px] p-0 gap-0 overflow-hidden">
        <DialogTitle className="sr-only">{title}</DialogTitle>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border/30">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-accent/40 flex items-center justify-center">
              {isAgent ? <Bot size={14} className="text-primary/70" /> : <Sparkles size={14} className="text-primary/70" />}
            </div>
            <div>
              <div className="text-sm text-foreground font-medium">{title}</div>
              <div className="text-xs text-muted-foreground/60">第 {step + 1} / 3 步 · {STEP_LABELS[step]}</div>
            </div>
          </div>
          <Button variant="ghost" size="icon-xs" onClick={() => close(false)}
            className="text-muted-foreground/60 hover:text-foreground hover:bg-accent/30">
            <X size={14} />
          </Button>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-2 px-5 py-2.5 bg-muted/15 border-b border-border/20">
          {STEP_LABELS.map((label, idx) => {
            const active = idx === step;
            const done = idx < step;
            return (
              <React.Fragment key={label}>
                <button
                  type="button"
                  onClick={() => idx < step && setStep(idx)}
                  className={`flex items-center gap-1.5 text-xs ${idx < step ? 'cursor-pointer' : 'cursor-default'}`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                    active ? 'bg-primary text-primary-foreground' :
                    done ? 'bg-primary/20 text-primary' :
                    'bg-muted text-muted-foreground/50'
                  }`}>
                    {done ? <Check size={10} /> : idx + 1}
                  </span>
                  <span className={active ? 'text-foreground font-medium' : done ? 'text-foreground/70' : 'text-muted-foreground/50'}>
                    {label}
                  </span>
                </button>
                {idx < STEP_LABELS.length - 1 && <span className="flex-1 h-px bg-border/40" />}
              </React.Fragment>
            );
          })}
        </div>

        {/* Body */}
        <div className="px-5 py-4 min-h-[280px] max-h-[400px] overflow-y-auto scrollbar-thin">
          {step === 0 && (
            <div className="space-y-4">
              {/* Avatar + name row */}
              <div className="flex items-center gap-3">
                <button type="button"
                  className="w-14 h-14 rounded-xl bg-accent/40 hover:bg-accent/60 flex items-center justify-center text-2xl flex-shrink-0 transition-colors"
                  title="点击下方更换"
                >
                  {avatar}
                </button>
                <div className="flex-1 min-w-0">
                  <label className="block text-xs text-muted-foreground/70 mb-1">名称</label>
                  <Input value={name} onChange={e => setName(e.target.value)} autoFocus
                    placeholder={isAgent ? '例如：代码助手' : '例如：写作助手'}
                    className="h-8 text-sm" />
                </div>
              </div>
              {/* Avatar grid */}
              <div>
                <div className="text-xs text-muted-foreground/70 mb-1.5">选择头像</div>
                <div className="flex flex-wrap gap-1.5">
                  {AVATAR_EMOJIS.map(e => (
                    <button key={e} type="button" onClick={() => setAvatar(e)}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-base transition-colors ${
                        avatar === e ? 'bg-accent ring-1 ring-primary/40' : 'bg-accent/25 hover:bg-accent/50'
                      }`}>
                      {e}
                    </button>
                  ))}
                </div>
              </div>
              {/* Model select */}
              <div>
                <label className="block text-xs text-muted-foreground/70 mb-1.5">模型</label>
                <div className="grid grid-cols-1 gap-1">
                  {DEFAULT_MODELS.map(m => (
                    <button key={m.id} type="button" onClick={() => setModelId(m.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm text-left transition-colors ${
                        modelId === m.id ? 'bg-accent text-foreground' : 'text-foreground/80 hover:bg-accent/40'
                      }`}>
                      <Sparkles size={12} className="text-primary/60 flex-shrink-0" />
                      <span className="flex-1 truncate">{m.name}</span>
                      {modelId === m.id && <Check size={12} className="text-primary flex-shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-muted-foreground/70 mb-1.5">系统提示词</label>
                <Textarea value={prompt} onChange={e => setPrompt(e.target.value)} autoFocus
                  placeholder="描述这个角色擅长什么、说话风格、约束……"
                  rows={9}
                  className="text-sm leading-[1.55] resize-none" />
              </div>
              <div className="text-xs text-muted-foreground/50">
                Tip: 提示词越具体，输出越稳定。可以包含「角色」「目标」「风格」「禁忌」等。
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-2.5">
              {/* Tabs */}
              <div className="flex items-center gap-1">
                {tabs3.map(t => {
                  const TabIcon = t.icon;
                  const active = tab3 === t.key;
                  return (
                    <button key={t.key} type="button" onClick={() => { setTab3(t.key); setSearch(''); }}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-colors ${
                        active ? 'bg-accent text-foreground' : 'text-muted-foreground hover:bg-accent/40 hover:text-foreground'
                      }`}>
                      <TabIcon size={11} className={active ? 'text-primary/70' : 'text-muted-foreground/50'} />
                      <span>{t.label}</span>
                      {t.count > 0 && (
                        <span className="text-[10px] tabular-nums text-muted-foreground/60">{t.count}</span>
                      )}
                    </button>
                  );
                })}
                <div className="flex-1" />
                <SearchInput value={search} onChange={setSearch} placeholder="搜索"
                  iconSize={11}
                  wrapperClassName="px-2 h-6 w-[120px] rounded-md bg-muted/20 border border-border/20" />
              </div>
              {/* List */}
              <div className="space-y-0.5">
                {filteredList.length === 0 && (
                  <div className="text-xs text-muted-foreground/50 text-center py-6">无匹配项</div>
                )}
                {filteredList.map(item => {
                  const selected = activeSet.has(item.id);
                  return (
                    <button key={item.id} type="button"
                      onClick={() => toggle(activeSet, item.id, setActiveSet)}
                      className={`w-full flex items-start gap-2 px-2.5 py-2 rounded-md text-left transition-colors ${
                        selected ? 'bg-accent/60' : 'hover:bg-accent/30'
                      }`}>
                      <span className={`mt-[2px] w-3.5 h-3.5 rounded-[4px] border flex items-center justify-center flex-shrink-0 ${
                        selected ? 'bg-primary border-primary text-primary-foreground' : 'border-border/60'
                      }`}>
                        {selected && <Check size={9} />}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-xs text-foreground truncate">{item.name}</span>
                        {item.desc && (
                          <span className="block text-xs text-muted-foreground/55 truncate">{item.desc}</span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-border/30 bg-muted/10">
          <Button variant="ghost" size="sm"
            onClick={() => step > 0 ? setStep(s => s - 1) : close(false)}
            className="text-xs text-muted-foreground hover:text-foreground">
            {step === 0 ? '取消' : (<><ChevronLeft size={12} className="mr-1" />上一步</>)}
          </Button>
          {step < 2 ? (
            <Button variant="default" size="sm" disabled={!canNext}
              onClick={() => setStep(s => s + 1)}
              className="text-xs">
              下一步<ChevronRight size={12} className="ml-1" />
            </Button>
          ) : (
            <Button variant="default" size="sm" onClick={submit} className="text-xs">
              <Check size={12} className="mr-1" />创建{isAgent ? ' Agent' : '助手'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
