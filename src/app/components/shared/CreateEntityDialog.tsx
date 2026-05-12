import React, { useState } from 'react';
import {
  X, Check, ChevronLeft, ChevronRight, ChevronDown, Bot, Sparkles,
} from 'lucide-react';
import {
  Dialog, DialogContent, DialogTitle,
  Button, Input, Textarea, Popover, PopoverTrigger, PopoverContent,
} from '@cherry-studio/ui';

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
}

const STEP_LABELS = ['基础信息', '提示词'];

export function CreateEntityDialog({ open, onOpenChange, variant, onCreate }: CreateEntityDialogProps) {
  const isAgent = variant === 'agent';
  const title = isAgent ? '新建 Agent' : '新建助手';

  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(AVATAR_EMOJIS[0]);
  const [modelId, setModelId] = useState(DEFAULT_MODELS[0].id);
  const [prompt, setPrompt] = useState('');
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [modelOpen, setModelOpen] = useState(false);

  const currentModel = DEFAULT_MODELS.find(m => m.id === modelId) ?? DEFAULT_MODELS[0];

  const reset = () => {
    setStep(0); setName(''); setAvatar(AVATAR_EMOJIS[0]); setModelId(DEFAULT_MODELS[0].id);
    setPrompt(''); setAvatarOpen(false); setModelOpen(false);
  };

  const close = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const canNext =
    step === 0 ? name.trim().length > 0 :
    prompt.trim().length > 0;

  const submit = () => {
    onCreate?.({
      variant,
      name: name.trim(),
      avatar,
      model: modelId,
      prompt: prompt.trim(),
    });
    close(false);
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-w-[560px] w-[560px] h-[80vh] max-h-[720px] p-0 gap-0 overflow-hidden flex flex-col">
        <DialogTitle className="sr-only">{title}</DialogTitle>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border/30 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-accent/40 flex items-center justify-center">
              {isAgent ? <Bot size={14} className="text-primary/70" /> : <Sparkles size={14} className="text-primary/70" />}
            </div>
            <div>
              <div className="text-sm text-foreground font-medium">{title}</div>
              <div className="text-xs text-muted-foreground/60">第 {step + 1} / {STEP_LABELS.length} 步 · {STEP_LABELS[step]}</div>
            </div>
          </div>
          <Button variant="ghost" size="icon-xs" onClick={() => close(false)}
            className="text-muted-foreground/60 hover:text-foreground hover:bg-accent/30">
            <X size={14} />
          </Button>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-2 px-5 py-2.5 bg-muted/15 border-b border-border/20 flex-shrink-0">
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
        <div className="flex-1 min-h-0 px-5 py-4 overflow-y-auto scrollbar-thin flex flex-col">
          {step === 0 && (
            <div className="space-y-4">
              {/* Avatar (dropdown) + name */}
              <div className="flex items-stretch gap-3">
                <div>
                  <label className="block text-xs text-muted-foreground/70 mb-1">头像</label>
                  <Popover open={avatarOpen} onOpenChange={setAvatarOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="inline"
                        className="h-9 flex items-center gap-1 px-2 rounded-md border border-border/40 bg-background hover:bg-accent/30">
                        <span className="text-lg leading-none">{avatar}</span>
                        <ChevronDown size={11} className="text-muted-foreground/50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="start" sideOffset={4} className="w-[180px] p-2">
                      <div className="grid grid-cols-6 gap-1">
                        {AVATAR_EMOJIS.map(e => (
                          <button key={e} type="button"
                            onClick={() => { setAvatar(e); setAvatarOpen(false); }}
                            className={`w-7 h-7 rounded-md flex items-center justify-center text-base transition-colors ${
                              avatar === e ? 'bg-accent ring-1 ring-primary/40' : 'hover:bg-accent/50'
                            }`}>
                            {e}
                          </button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-xs text-muted-foreground/70 mb-1">名称</label>
                  <Input value={name} onChange={e => setName(e.target.value)} autoFocus
                    placeholder={isAgent ? '例如：代码助手' : '例如：写作助手'}
                    className="h-9 text-sm" />
                </div>
              </div>
              {/* Model select */}
              <div>
                <label className="block text-xs text-muted-foreground/70 mb-1">模型</label>
                <Popover open={modelOpen} onOpenChange={setModelOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="inline"
                      className="w-full h-9 flex items-center justify-between gap-2 px-3 rounded-md border border-border/40 bg-background hover:bg-accent/30">
                      <span className="flex items-center gap-2 min-w-0">
                        <Sparkles size={12} className="text-primary/60 flex-shrink-0" />
                        <span className="text-sm truncate">{currentModel.name}</span>
                      </span>
                      <ChevronDown size={11} className="text-muted-foreground/50 flex-shrink-0" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="start" sideOffset={4} className="w-[var(--radix-popover-trigger-width)] p-1">
                    {DEFAULT_MODELS.map(m => (
                      <button key={m.id} type="button"
                        onClick={() => { setModelId(m.id); setModelOpen(false); }}
                        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-left transition-colors ${
                          modelId === m.id ? 'bg-accent text-foreground' : 'text-foreground/80 hover:bg-accent/40'
                        }`}>
                        <Sparkles size={12} className="text-primary/60 flex-shrink-0" />
                        <span className="flex-1 truncate">{m.name}</span>
                        {modelId === m.id && <Check size={12} className="text-primary flex-shrink-0" />}
                      </button>
                    ))}
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="flex-1 min-h-0 flex flex-col gap-2">
              <label className="block text-xs text-muted-foreground/70 flex-shrink-0">系统提示词</label>
              <Textarea value={prompt} onChange={e => setPrompt(e.target.value)} autoFocus
                placeholder="描述这个角色擅长什么、说话风格、约束……"
                className="flex-1 min-h-0 text-sm leading-[1.55] resize-none" />
              <div className="text-xs text-muted-foreground/50 flex-shrink-0">
                Tip: 提示词越具体，输出越稳定。可以包含「角色」「目标」「风格」「禁忌」等。
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-border/30 bg-muted/10 flex-shrink-0">
          <Button variant="ghost" size="sm"
            onClick={() => step > 0 ? setStep(s => s - 1) : close(false)}
            className="text-xs text-muted-foreground hover:text-foreground">
            {step === 0 ? '取消' : (<><ChevronLeft size={12} className="mr-1" />上一步</>)}
          </Button>
          {step < STEP_LABELS.length - 1 ? (
            <Button variant="default" size="sm" disabled={!canNext}
              onClick={() => setStep(s => s + 1)}
              className="text-xs">
              下一步<ChevronRight size={12} className="ml-1" />
            </Button>
          ) : (
            <Button variant="default" size="sm" onClick={submit} disabled={!canNext} className="text-xs">
              <Check size={12} className="mr-1" />创建{isAgent ? ' Agent' : '助手'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
