import React, { useRef, useState } from 'react';
import {
  X, Check, ChevronDown, Bot, Sparkles, Smile, Image as ImageIcon, Upload,
} from 'lucide-react';
import {
  Dialog, DialogContent, DialogTitle,
  Button, Input, Textarea, Popover, PopoverTrigger, PopoverContent,
} from '@cherry-studio/ui';
import { ModelPickerPanel } from '@/app/components/shared/ModelPickerPanel';
import { ASSISTANT_MODELS } from '@/app/config/models';

const AVATAR_EMOJIS = [
  '🤖', '🧠', '📊', '✨', '⚙️', '🚀', '📈', '🎨', '🔬', '📚', '💡', '🛠️',
  '🦊', '🐼', '🐨', '🦁', '🐵', '🐯', '🐧', '🦉', '🌟', '🔥', '🌈', '🎯',
  '📝', '🧪', '🧭', '🧬', '🌍', '🌙', '🎵', '🎮', '🏆', '🎁', '🍀', '☕️',
];

const DEFAULT_MODEL_ID = ASSISTANT_MODELS[0]?.id ?? 'claude-4-sonnet';

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
  /** Either an emoji or a data: URL for an uploaded image */
  avatar: string;
  /** True when avatar is an uploaded image URL rather than an emoji */
  avatarIsImage: boolean;
  model: string;
  description: string;
}

type AvatarTab = 'emoji' | 'upload';

export function CreateEntityDialog({ open, onOpenChange, variant, onCreate }: CreateEntityDialogProps) {
  const isAgent = variant === 'agent';
  const title = isAgent ? '新建 Agent' : '新建助手';
  const noun = isAgent ? 'Agent' : '助手';

  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(AVATAR_EMOJIS[0]);
  const [avatarIsImage, setAvatarIsImage] = useState(false);
  const [avatarTab, setAvatarTab] = useState<AvatarTab>('emoji');
  const [modelId, setModelId] = useState<string>(DEFAULT_MODEL_ID);
  const [description, setDescription] = useState('');
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [modelOpen, setModelOpen] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [urlError, setUrlError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentModel = ASSISTANT_MODELS.find(m => m.id === modelId) ?? ASSISTANT_MODELS[0];
  const canSubmit = name.trim().length > 0;

  const reset = () => {
    setName('');
    setAvatar(AVATAR_EMOJIS[0]);
    setAvatarIsImage(false);
    setAvatarTab('emoji');
    setModelId(DEFAULT_MODEL_ID);
    setDescription('');
    setAvatarOpen(false);
    setModelOpen(false);
    setUrlInput('');
    setUrlError(null);
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
      avatarIsImage,
      model: modelId,
      description: description.trim(),
    });
    close(false);
  };

  const onUploadFile = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = typeof reader.result === 'string' ? reader.result : '';
      if (url) {
        setAvatar(url);
        setAvatarIsImage(true);
        setAvatarOpen(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const applyImageUrl = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return;
    let parsed: URL | null = null;
    try { parsed = new URL(trimmed); } catch { /* fall through */ }
    const ok = parsed
      ? (parsed.protocol === 'http:' || parsed.protocol === 'https:' || parsed.protocol === 'data:')
      : false;
    if (!ok) {
      setUrlError('请输入有效的 http(s) 或 data: 图片链接');
      return;
    }
    setAvatar(trimmed);
    setAvatarIsImage(true);
    setUrlInput('');
    setUrlError(null);
    setAvatarOpen(false);
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
                    <span className="w-6 h-6 rounded flex items-center justify-center overflow-hidden">
                      {avatarIsImage
                        ? <img src={avatar} alt="" className="w-full h-full object-cover" />
                        : <span className="text-lg leading-none">{avatar}</span>}
                    </span>
                    <ChevronDown size={11} className="text-muted-foreground/50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" sideOffset={4} className="w-[260px] p-0 overflow-hidden">
                  {/* Tabs */}
                  <div className="flex items-center gap-0.5 px-1.5 pt-1.5">
                    {([
                      { key: 'emoji', label: '表情', icon: Smile },
                      { key: 'upload', label: '上传图片', icon: ImageIcon },
                    ] as { key: AvatarTab; label: string; icon: React.ElementType }[]).map(t => {
                      const active = avatarTab === t.key;
                      const Icon = t.icon;
                      return (
                        <button key={t.key} type="button"
                          onClick={() => setAvatarTab(t.key)}
                          className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs transition-colors ${
                            active ? 'bg-accent text-foreground' : 'text-muted-foreground hover:bg-accent/40 hover:text-foreground'
                          }`}>
                          <Icon size={11} className={active ? 'text-primary/70' : 'text-muted-foreground/60'} />
                          <span>{t.label}</span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="h-px bg-border/30 mt-1.5" />
                  {/* Tab body */}
                  {avatarTab === 'emoji' ? (
                    <div className="grid grid-cols-6 gap-1 p-2 max-h-[200px] overflow-y-auto scrollbar-thin">
                      {AVATAR_EMOJIS.map(e => (
                        <button key={e} type="button"
                          onClick={() => { setAvatar(e); setAvatarIsImage(false); setAvatarOpen(false); }}
                          className={`w-8 h-8 rounded-md flex items-center justify-center text-base transition-colors ${
                            !avatarIsImage && avatar === e ? 'bg-accent ring-1 ring-primary/40' : 'hover:bg-accent/50'
                          }`}>
                          {e}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 space-y-2.5">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => onUploadFile(e.target.files?.[0] ?? null)}
                      />
                      <button type="button"
                        onClick={() => fileInputRef.current?.click()}
                        onPaste={(e) => {
                          const item = Array.from(e.clipboardData?.items ?? []).find(it => it.type.startsWith('image/'));
                          if (item) {
                            e.preventDefault();
                            onUploadFile(item.getAsFile());
                          }
                        }}
                        className="w-full flex flex-col items-center justify-center gap-1.5 py-5 rounded-md border border-dashed border-border/50 text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors">
                        <Upload size={16} className="text-muted-foreground/60" />
                        <span>点击上传图片</span>
                        <span className="text-muted-foreground/40">PNG / JPG，建议 256×256</span>
                      </button>
                      {/* URL paste */}
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground/60">或粘贴图片链接</div>
                        <div className="flex items-center gap-1.5">
                          <Input
                            value={urlInput}
                            onChange={(e) => { setUrlInput(e.target.value); if (urlError) setUrlError(null); }}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); applyImageUrl(urlInput); } }}
                            onPaste={(e) => {
                              const text = e.clipboardData?.getData('text') ?? '';
                              if (text) {
                                e.preventDefault();
                                setUrlInput(text);
                                applyImageUrl(text);
                              }
                            }}
                            placeholder="https://… 或 data:image/…"
                            className="h-7 flex-1 text-xs"
                          />
                          <Button variant="default" size="xs"
                            onClick={() => applyImageUrl(urlInput)}
                            disabled={!urlInput.trim()}
                            className="h-7 px-2 text-xs">
                            使用
                          </Button>
                        </div>
                        {urlError && (
                          <div className="text-xs text-destructive/80">{urlError}</div>
                        )}
                      </div>
                      {avatarIsImage && (
                        <button type="button"
                          onClick={() => { setAvatar(AVATAR_EMOJIS[0]); setAvatarIsImage(false); }}
                          className="w-full text-xs text-muted-foreground/60 hover:text-foreground py-1">
                          移除当前图片
                        </button>
                      )}
                    </div>
                  )}
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

          {/* Model — generic ModelPickerPanel inside a popover */}
          <div>
            <label className="block text-xs text-muted-foreground/70 mb-1">模型</label>
            <Popover open={modelOpen} onOpenChange={setModelOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="inline"
                  className="w-full h-9 flex items-center justify-between gap-2 px-3 rounded-md border border-border/40 bg-background hover:bg-accent/30">
                  <span className="flex items-center gap-2 min-w-0">
                    <Sparkles size={12} className="text-primary/60 flex-shrink-0" />
                    <span className="text-sm truncate">{currentModel?.name ?? '选择模型'}</span>
                    {currentModel?.provider && (
                      <span className="text-xs text-muted-foreground/50 flex-shrink-0">· {currentModel.provider}</span>
                    )}
                  </span>
                  <ChevronDown size={11} className="text-muted-foreground/50 flex-shrink-0" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" sideOffset={4}
                className="w-[var(--radix-popover-trigger-width)] p-0 max-h-[360px] overflow-hidden">
                <ModelPickerPanel
                  selectedModels={[modelId]}
                  onSelectModel={(id) => setModelId(id)}
                  multiModel={false}
                  onToggleMultiModel={() => { /* single-select only */ }}
                  showMultiModelToggle={false}
                  onClose={() => setModelOpen(false)}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs text-muted-foreground/70 mb-1">描述</label>
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
