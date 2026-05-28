import React, { useState, useRef } from 'react';
import { X, Check, Upload, Link2, Plus, Trash2, RotateCcw, Info } from 'lucide-react';
import type { ResourceItem } from '@/app/types';
import { AVATAR_OPTIONS } from '@/app/config/constants';
import { Button } from '@cherrystudio/ui/components/primitives/button';
// Name input now on V2 — bg-accent/15 override defeats V2's invisible
// transparent default. Textarea + Switch stay on legacy for now.
import { Input } from '@cherrystudio/ui/components/primitives/input';
import { Textarea, Switch } from '@cherry-studio/ui';
import { Separator } from "@cherry-studio/ui";
import { Slider } from '@cherrystudio/ui/components/primitives/slider';
import { Badge } from '@cherrystudio/ui/components/primitives/badge';
import { Popover, PopoverTrigger, PopoverContent } from '@cherrystudio/ui/components/primitives/popover';
import { Combobox } from '@cherrystudio/ui/components/primitives/combobox';
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@cherrystudio/ui/components/primitives/select';
import { Typography, SimpleTooltip } from '@cherry-studio/ui';

// ===========================
// Tag presets
// ===========================

// Selected-tag chip palette — kept pale on purpose: muted-foreground
// text + faint accent-tinted bg + thin colored border. Lets multi-tag
// combinations stay readable without visual noise.
const TAG_PRESETS: { tag: string; color: string }[] = [
  { tag: '写作', color: 'bg-accent-amber-muted text-muted-foreground border-accent-amber/15' },
  { tag: '编程', color: 'bg-accent-cyan-muted text-muted-foreground border-accent-cyan/15' },
  { tag: '翻译', color: 'bg-accent-violet-muted text-muted-foreground border-accent-violet/15' },
  { tag: '创作', color: 'bg-accent-pink-muted text-muted-foreground border-accent-pink/15' },
  { tag: '代码审查', color: 'bg-accent-blue-muted text-muted-foreground border-accent-blue/15' },
  { tag: '数据分析', color: 'bg-accent-indigo-muted text-muted-foreground border-accent-indigo/15' },
  { tag: '对话', color: 'bg-muted text-muted-foreground border-border/30' },
  { tag: '工具', color: 'bg-accent-orange-muted text-muted-foreground border-accent-orange/15' },
  { tag: '知识问答', color: 'bg-accent-blue-muted text-muted-foreground border-accent-blue/15' },
  { tag: '效率', color: 'bg-accent-amber-muted text-muted-foreground border-accent-amber/15' },
  { tag: '学习', color: 'bg-accent-emerald-muted text-muted-foreground border-accent-emerald/15' },
  { tag: '产品', color: 'bg-accent-pink-muted text-muted-foreground border-accent-pink/15' },
];

function getTagColor(tag: string): string {
  const preset = TAG_PRESETS.find(p => p.tag === tag);
  if (preset) return preset.color;
  const colors = [
    'bg-muted text-muted-foreground border-border/30',
    'bg-accent-purple-muted text-muted-foreground border-accent-purple/15',
    'bg-accent-emerald-muted text-muted-foreground border-accent-emerald/15',
    'bg-destructive/10 text-muted-foreground border-destructive/15',
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
  const [avatarType, setAvatarType] = useState<'emoji' | 'image'>('emoji');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarTab, setAvatarTab] = useState<'emoji' | 'image'>('emoji');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tags state — dropdown multi-select
  const [tags, setTags] = useState<string[]>(resource.tags || ['标签']);

  const removeTag = (tag: string) => {
    setTags(prev => prev.filter(t => t !== tag));
  };

  const togglePresetTag = (tag: string) => {
    if (tags.includes(tag)) removeTag(tag);
    else setTags(prev => [...prev, tag]);
  };

  return (
    <div className="max-w-3xl space-y-5">
      {/* 头像与名称 — full-width row. 模型 lives on its own row below
          (via the page's `space-y-5`) so it can take the full container
          width without competing with the avatar + name combo. */}
      <div>
          <label className="text-sm text-muted-foreground mb-1.5 block">头像与名称</label>
          <div className="flex items-center gap-3 min-w-0">
            <Popover>
            <PopoverTrigger asChild>
              <button type="button"
                className="w-9 h-9 rounded-lg bg-accent/50 flex items-center justify-center text-lg flex-shrink-0 border border-border/60 overflow-hidden hover:border-border transition-colors">
                {avatarType === 'image' && avatarUrl ? (
                  <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  avatar
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" sideOffset={6} className="w-[340px] p-0 overflow-hidden">
              {/* Tabs */}
              <div className="flex items-center gap-0.5 px-1.5 pt-1.5">
                {([
                  { key: 'emoji' as const, label: 'Emoji' },
                  { key: 'image' as const, label: '图片' },
                ]).map(tab => {
                  const active = avatarTab === tab.key;
                  return (
                    <button key={tab.key} onClick={() => setAvatarTab(tab.key)}
                      className={`flex-1 px-2 py-1.5 rounded-md text-xs transition-colors ${
                        active ? 'bg-accent text-foreground' : 'text-muted-foreground hover:bg-accent/40 hover:text-foreground'
                      }`}>
                      {tab.label}
                    </button>
                  );
                })}
              </div>
              <Separator opacity={30} className="mt-1.5" />
              {avatarTab === 'emoji' && (
                <div className="grid grid-cols-8 gap-1 p-2 max-h-[260px] overflow-y-auto scrollbar-thin">
                  {AVATAR_OPTIONS.map(a => (
                    <button key={a} type="button"
                      onClick={() => { setAvatar(a); setAvatarType('emoji'); }}
                      className={`w-8 h-8 rounded-md flex items-center justify-center text-base transition-colors ${
                        avatarType === 'emoji' && avatar === a ? 'bg-accent ring-1 ring-primary/40' : 'hover:bg-accent/50'
                      }`}>
                      {a}
                    </button>
                  ))}
                </div>
              )}
              {avatarTab === 'image' && (
                <div className="p-3 space-y-2.5">
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const url = URL.createObjectURL(file);
                        setAvatarUrl(url);
                        setAvatarType('image');
                      }
                    }}
                  />
                  <button onClick={() => fileInputRef.current?.click()}
                    className="w-full flex flex-col items-center justify-center gap-1.5 py-5 rounded-md border border-dashed border-border/50 text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors">
                    <Upload size={16} className="text-muted-foreground/60" />
                    <span>点击上传图片</span>
                    <span className="text-muted-foreground/40">PNG / JPG，建议 256×256</span>
                  </button>
                  <div className="text-xs text-muted-foreground/60">或粘贴图片链接</div>
                  <div className="flex items-center gap-1.5">
                    <div className="relative flex-1">
                      <Link2 size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
                      <Input value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)} placeholder="https://… 或 data:image/…"
                        className="w-full pl-7 h-7 text-xs rounded-md border-border/40" />
                    </div>
                    <Button variant="default" size="xs" onClick={() => { if (avatarUrl.trim()) setAvatarType('image'); }}
                      disabled={!avatarUrl.trim()}
                      className="h-7 px-3 text-xs">
                      使用
                    </Button>
                  </div>
                </div>
              )}
            </PopoverContent>
          </Popover>
          <Input value={name} onChange={e => setName(e.target.value)}
            placeholder="助手名称"
            className="flex-1 min-w-0 h-9 px-3 py-1.5 rounded-lg border border-border/60 bg-accent/15 text-xs md:text-xs text-foreground focus:border-border focus:bg-accent/15 transition-all" />
          </div>
      </div>

      {/* 模型选择已迁移到「模型设置」tab；BasicSection 只保留身份信息。 */}

      {/* 简介 (full width) */}
      <FieldGroup label="简介">
        <Textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={3}
          className="w-full min-h-[80px] px-3 py-2 rounded-lg border border-border/60 bg-accent/15 text-xs text-foreground placeholder:text-muted-foreground/60 shadow-none focus-visible:border-border focus-visible:ring-0 resize-none"
        />
      </FieldGroup>

      {/* Tags — full width, same field styling */}
      <FieldGroup label="标签">
        <Combobox
          multiple
          searchable
          value={tags}
          onChange={(v) => setTags(Array.isArray(v) ? v : [v])}
          options={TAG_PRESETS.map(p => ({ value: p.tag, label: p.tag }))}
          placeholder="选择标签…"
          searchPlaceholder="搜索标签…"
          emptyText="没有匹配标签"
          width="100%"
          className="flex h-9 px-3 rounded-lg border border-border/60 bg-accent/15 dark:bg-accent/15 text-xs hover:bg-accent/40"
          renderOption={(opt) => {
            const preset = TAG_PRESETS.find(p => p.tag === opt.value);
            return <span className={`px-1.5 py-[1px] rounded-md text-xs border ${preset?.color ?? ''}`}>{opt.label}</span>;
          }}
          renderValue={(val) => {
            const selected = Array.isArray(val) ? val : (val ? [val] : []);
            if (selected.length === 0) return null;
            return (
              <div className="flex flex-wrap gap-1 flex-1 min-w-0">
                {selected.map(t => {
                  const color = getTagColor(t);
                  return (
                    <span key={t} className={`inline-flex items-center gap-1 px-1.5 py-[2px] rounded-md text-xs border ${color}`}>
                      {t}
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setTags(prev => prev.filter(x => x !== t)); }}
                        aria-label={`移除 ${t}`}
                        className="opacity-50 hover:opacity-100 transition-opacity"
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
      </FieldGroup>

    </div>
  );
}


function FieldGroup({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-sm text-muted-foreground mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}

function ToggleRow({ label, hint, checked, onCheckedChange }: {
  label: string;
  hint?: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <div className="flex items-center gap-1.5 min-w-0">
        <label className="text-sm text-muted-foreground">{label}</label>
        {hint && <InfoTip text={hint} />}
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} className="flex-shrink-0" />
    </div>
  );
}

// Param row with enable Switch — mirrors Cherry Studio source's pattern
// (AssistantModelSettings.tsx: SettingRow with Label + Switch, then
// conditional slider/input row beneath when the toggle is on).
function ParamRow({
  label, hint, valueLabel, enabled, onEnabledChange, children,
}: {
  label: string;
  hint?: string;
  valueLabel?: string;
  enabled: boolean;
  onEnabledChange: (v: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 min-w-0">
          <label className="text-sm text-muted-foreground">
            {label}
            {valueLabel != null && enabled && (
              <span className="text-muted-foreground/40 ml-1.5 tabular-nums">{valueLabel}</span>
            )}
          </label>
          {hint && <InfoTip text={hint} />}
        </div>
        <Switch checked={enabled} onCheckedChange={onEnabledChange} className="flex-shrink-0" />
      </div>
      {enabled && <div className="pt-2.5">{children}</div>}
    </div>
  );
}

// Small info icon that reveals an explanation on hover.
function InfoTip({ text }: { text: string }) {
  return (
    <SimpleTooltip content={text} side="top" sideOffset={6} delayDuration={200}>
      <button
        type="button"
        tabIndex={-1}
        aria-label={text}
        className="inline-flex items-center text-muted-foreground/40 hover:text-muted-foreground transition-colors cursor-help flex-shrink-0"
      >
        <Info size={12} />
      </button>
    </SimpleTooltip>
  );
}
