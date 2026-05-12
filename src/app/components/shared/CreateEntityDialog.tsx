import React, { useState } from 'react';
import {
  X, Check, ChevronDown, Bot, Sparkles,
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
  description: string;
}

export function CreateEntityDialog({ open, onOpenChange, variant, onCreate }: CreateEntityDialogProps) {
  const isAgent = variant === 'agent';
  const title = isAgent ? '新建 Agent' : '新建助手';
  const noun = isAgent ? 'Agent' : '助手';

  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(AVATAR_EMOJIS[0]);
  const [modelId, setModelId] = useState(DEFAULT_MODELS[0].id);
  const [description, setDescription] = useState('');
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [modelOpen, setModelOpen] = useState(false);

  const currentModel = DEFAULT_MODELS.find(m => m.id === modelId) ?? DEFAULT_MODELS[0];
  const canSubmit = name.trim().length > 0;

  const reset = () => {
    setName(''); setAvatar(AVATAR_EMOJIS[0]); setModelId(DEFAULT_MODELS[0].id);
    setDescription(''); setAvatarOpen(false); setModelOpen(false);
  };

  const close = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const submit = () => {
    onCreate?.({
      variant,
      name: name.trim(),
      avatar,
      model: modelId,
      description: description.trim(),
    });
    close(false);
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-w-[520px] w-[520px] p-0 gap-0 overflow-hidden flex flex-col">
        <DialogTitle className="sr-only">{title}</DialogTitle>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border/30 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-accent/40 flex items-center justify-center">
              {isAgent ? <Bot size={14} className="text-primary/70" /> : <Sparkles size={14} className="text-primary/70" />}
            </div>
            <div>
              <div className="text-sm text-foreground font-medium">{title}</div>
              <div className="text-xs text-muted-foreground/60">填写基础信息，Prompt 和工具会自动初始化</div>
            </div>
          </div>
          <Button variant="ghost" size="icon-xs" onClick={() => close(false)}
            className="text-muted-foreground/60 hover:text-foreground hover:bg-accent/30">
            <X size={14} />
          </Button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4">
          {/* Avatar + name */}
          <div className="flex items-end gap-3">
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

          {/* Model */}
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

          {/* Description */}
          <div>
            <label className="flex items-center justify-between text-xs text-muted-foreground/70 mb-1">
              <span>描述</span>
              <span className="text-muted-foreground/40">非必填</span>
            </label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)}
              placeholder={`一句话介绍这个${noun}的用途与擅长场景`}
              rows={3}
              className="text-sm leading-[1.55] resize-none" />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-border/30 bg-muted/10 flex-shrink-0">
          <Button variant="ghost" size="sm" onClick={() => close(false)}
            className="text-xs text-muted-foreground hover:text-foreground">
            取消
          </Button>
          <Button variant="default" size="sm" onClick={submit} disabled={!canSubmit} className="text-xs">
            <Check size={12} className="mr-1" />创建{noun}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
