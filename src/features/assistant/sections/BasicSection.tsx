import React, { useState, useRef } from 'react';
import { X, Tag, Check, ChevronDown } from 'lucide-react';
import type { ResourceItem } from '@/app/types';
import { AVATAR_OPTIONS } from '@/app/config/constants';
import { Button, Input, Slider, Textarea, Typography, Badge, Popover, PopoverTrigger, PopoverContent } from '@cherry-studio/ui';
import { ModelPickerPanel } from '@/app/components/shared/ModelPickerPanel';
import { ASSISTANT_MODELS } from '@/app/config/models';

// ===========================
// Tag presets
// ===========================

const TAG_PRESETS: { tag: string; color: string }[] = [
  { tag: '写作', color: 'bg-accent-amber-muted text-accent-amber border-accent-amber/20' },
  { tag: '编程', color: 'bg-accent-cyan-muted text-accent-cyan border-accent-cyan/20' },
  { tag: '翻译', color: 'bg-accent-violet-muted text-accent-violet border-accent-violet/20' },
  { tag: '创作', color: 'bg-accent-pink-muted text-accent-pink border-accent-pink/20' },
  { tag: '代码审查', color: 'bg-accent-blue-muted text-accent-blue border-accent-blue/20' },
  { tag: '数据分析', color: 'bg-accent-indigo-muted text-accent-indigo border-accent-indigo/20' },
  { tag: '对话', color: 'bg-muted text-foreground border-border/50' },
  { tag: '工具', color: 'bg-accent-orange-muted text-accent-orange border-accent-orange/20' },
  { tag: '知识问答', color: 'bg-accent-blue-muted text-accent-blue border-accent-blue/20' },
  { tag: '效率', color: 'bg-accent-amber-muted text-accent-amber border-accent-amber/20' },
  { tag: '学习', color: 'bg-accent-emerald-muted text-accent-emerald border-accent-emerald/20' },
  { tag: '产品', color: 'bg-accent-pink-muted text-accent-pink border-accent-pink/20' },
];

function getTagColor(tag: string): string {
  const preset = TAG_PRESETS.find(p => p.tag === tag);
  if (preset) return preset.color;
  const colors = [
    'bg-muted text-foreground border-border/50',
    'bg-accent-purple-muted text-accent-purple border-accent-purple/20',
    'bg-accent-emerald-muted text-accent-emerald border-accent-emerald/20',
    'bg-destructive/12 text-destructive border-destructive/20',
  ];
  let hash = 0;
  for (let i = 0; i < tag.length; i++) hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

interface Props {
  resource: ResourceItem;
}

export function BasicSection({ resource }: Props) {
  const [name, setName] = useState(resource.name);
  const [description, setDescription] = useState(resource.description);
  const [avatar, setAvatar] = useState(resource.avatar);
  const [model, setModel] = useState(resource.model || 'claude-4-opus');
  const [modelPickerOpen, setModelPickerOpen] = useState(false);
  const [temperature, setTemperature] = useState(0.7);
  const [topP, setTopP] = useState(0.9);
  const [maxTokens, setMaxTokens] = useState(4096);

  // Tags state
  const [tags, setTags] = useState<string[]>(resource.tags || ['标签']);
  const [tagInput, setTagInput] = useState('');
  const [showTagPresets, setShowTagPresets] = useState(false);
  const tagInputRef = useRef<HTMLInputElement>(null);

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags(prev => [...prev, trimmed]);
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    setTags(prev => prev.filter(t => t !== tag));
  };

  const togglePresetTag = (tag: string) => {
    if (tags.includes(tag)) removeTag(tag);
    else setTags(prev => [...prev, tag]);
  };

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <Typography variant="subtitle" className="mb-1">基础设置</Typography>
        <p className="text-xs text-muted-foreground/60">配置助手的身份信息和模型参数</p>
      </div>

      <FieldGroup label="头像">
        <div className="flex items-center gap-2">
          <div className="w-12 h-12 rounded-xl bg-accent/50 flex items-center justify-center text-xl">{avatar}</div>
          <div className="flex flex-wrap gap-1">
            {AVATAR_OPTIONS.map(a => (
              <Button key={a} variant="ghost" size="icon-xs" onClick={() => setAvatar(a)}
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm transition-all ${avatar === a ? 'bg-accent ring-1 ring-primary/20' : 'hover:bg-accent/50'}`}>{a}</Button>
            ))}
          </div>
        </div>
      </FieldGroup>

      <FieldGroup label="名称">
        <Input value={name} onChange={e => setName(e.target.value)}
          className="w-full px-3 py-2 rounded-xl border-border/20 bg-accent/15 text-xs text-foreground focus:border-border/40 focus:bg-accent/15 transition-all" />
      </FieldGroup>

      <FieldGroup label="简介">
        <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
          className="input-accent resize-none" />
      </FieldGroup>

      {/* Tags */}
      <FieldGroup label="标签">
        <div className="min-h-[36px] px-2.5 py-2 rounded-xl border border-border/20 bg-accent/15 flex flex-wrap items-center gap-1.5">
          {tags.map(tag => (
            <Badge
              key={tag}
              variant="outline"
              className={`gap-1 px-1.5 py-[2px] rounded-md ${getTagColor(tag)}`}
            >
              {tag}
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => removeTag(tag)}
                className="ml-0.5 text-current opacity-40 hover:opacity-100 transition-opacity w-auto h-auto p-0"
              >
                <X size={7} />
              </Button>
            </Badge>
          ))}
          <Input
            ref={tagInputRef}
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && tagInput.trim()) { e.preventDefault(); addTag(tagInput); }
              if (e.key === 'Backspace' && !tagInput && tags.length > 0) removeTag(tags[tags.length - 1]);
            }}
            placeholder={tags.length === 0 ? '输入标签，回车添加' : ''}
            className="flex-1 min-w-[80px] bg-transparent text-xs text-foreground placeholder:text-muted-foreground/60 border-0 h-auto p-0 focus-visible:ring-0"
          />
        </div>
        {/* Preset row */}
        <div className="flex flex-wrap gap-1 mt-2">
          {TAG_PRESETS.slice(0, 8).map(preset => {
            const selected = tags.includes(preset.tag);
            return (
              <Button size="inline"
                key={preset.tag}
                variant="ghost"
                onClick={() => togglePresetTag(preset.tag)}
                className={`inline-flex items-center gap-0.5 px-1.5 py-[2px] rounded-md border text-xs transition-all ${preset.color} ${
                  selected ? 'ring-1 ring-ring/10' : 'opacity-50 hover:opacity-80'
                }`}
              >
                {selected && <Check size={7} className="text-current" />}
                {preset.tag}
              </Button>
            );
          })}
        </div>
      </FieldGroup>

      <div className="h-px bg-border/30" />

      <FieldGroup label="模型">
        <Popover open={modelPickerOpen} onOpenChange={setModelPickerOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-between gap-2 px-3 py-2 h-auto text-xs border-border/20 bg-accent/15 hover:bg-accent/25">
              <span className="truncate text-foreground">{ASSISTANT_MODELS.find(m => m.id === model)?.name || model}</span>
              <ChevronDown size={10} className={`text-muted-foreground/40 flex-shrink-0 transition-transform ${modelPickerOpen ? 'rotate-180' : ''}`} />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="p-0 w-[480px]">
            <ModelPickerPanel
              selectedModels={[model]}
              onSelectModel={setModel}
              multiModel={false}
              onToggleMultiModel={() => {}}
              onClose={() => setModelPickerOpen(false)}
              showMultiModelToggle={false}
            />
          </PopoverContent>
        </Popover>
      </FieldGroup>

      <FieldGroup label={<span>Temperature <span className="text-muted-foreground/40 ml-1">{temperature.toFixed(1)}</span></span>}>
        <Slider min={0} max={2} step={0.1} value={[temperature]} onValueChange={([v]) => setTemperature(v)} />
        <div className="flex justify-between mt-1"><span className="text-xs text-muted-foreground/50">精确</span><span className="text-xs text-muted-foreground/50">创意</span></div>
      </FieldGroup>

      <FieldGroup label={<span>Top-P <span className="text-muted-foreground/40 ml-1">{topP.toFixed(1)}</span></span>}>
        <Slider min={0} max={1} step={0.05} value={[topP]} onValueChange={([v]) => setTopP(v)} />
      </FieldGroup>

      <FieldGroup label="最大 Token 数">
        <Input type="number" value={maxTokens} onChange={e => setMaxTokens(parseInt(e.target.value) || 0)}
          className="w-full px-3 py-2 rounded-xl border-border/20 bg-accent/15 text-xs text-foreground focus:border-border/40 focus:bg-accent/15 transition-all tabular-nums" />
      </FieldGroup>
    </div>
  );
}

function FieldGroup({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-sm text-muted-foreground/60 mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}
