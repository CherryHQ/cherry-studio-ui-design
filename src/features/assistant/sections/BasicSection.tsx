import React, { useState, useRef } from 'react';
import { X, Check, ChevronDown, Upload, Link2, Plus, Trash2, RotateCcw, Info } from 'lucide-react';
import type { ResourceItem } from '@/app/types';
import { AVATAR_OPTIONS } from '@/app/config/constants';
import {
  Button, Input, Slider, Switch, Textarea, Typography, Badge, Popover, PopoverTrigger, PopoverContent,
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
  SimpleTooltip,
} from '@cherry-studio/ui';
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
  const [avatarType, setAvatarType] = useState<'emoji' | 'image'>('emoji');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarTab, setAvatarTab] = useState<'emoji' | 'image'>('emoji');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [model, setModel] = useState(resource.model || 'claude-4-opus');
  const [modelPickerOpen, setModelPickerOpen] = useState(false);
  // Model parameters — exact set + order from Cherry Studio source's
  // AssistantModelSettings.tsx. Each adjustable param has its own enable
  // Switch; the slider/input row only renders when that switch is on.
  const [temperature, setTemperature] = useState(0.7);
  const [enableTemperature, setEnableTemperature] = useState(true);
  const [topP, setTopP] = useState(0.9);
  const [enableTopP, setEnableTopP] = useState(false);
  const [enableContextCount, setEnableContextCount] = useState(true);
  // Manual context count — only used when "自动上下文" is OFF
  const [contextCount, setContextCount] = useState(10);
  const [maxTokens, setMaxTokens] = useState(0);
  const [enableMaxTokens, setEnableMaxTokens] = useState(false);
  const [streamOutput, setStreamOutput] = useState(true);
  const [maxToolCalls, setMaxToolCalls] = useState(20);
  const [enableMaxToolCalls, setEnableMaxToolCalls] = useState(true);
  // Custom parameters — dynamic list matching source's AssistantSettingCustomParameters
  type CustomParam = { name: string; type: 'string' | 'number' | 'boolean' | 'json'; value: string };
  const [customParameters, setCustomParameters] = useState<CustomParam[]>([]);

  // Tags state — dropdown multi-select
  const [tags, setTags] = useState<string[]>(resource.tags || ['标签']);

  const removeTag = (tag: string) => {
    setTags(prev => prev.filter(t => t !== tag));
  };

  const togglePresetTag = (tag: string) => {
    if (tags.includes(tag)) removeTag(tag);
    else setTags(prev => [...prev, tag]);
  };

  const addCustomParam = () => {
    setCustomParameters(prev => [...prev, { name: '', type: 'string', value: '' }]);
  };
  const updateCustomParam = (i: number, field: keyof CustomParam, value: string) => {
    setCustomParameters(prev => prev.map((p, idx) => idx === i ? { ...p, [field]: value } as CustomParam : p));
  };
  const removeCustomParam = (i: number) => {
    setCustomParameters(prev => prev.filter((_, idx) => idx !== i));
  };
  const resetParameters = () => {
    setTemperature(0.7); setEnableTemperature(true);
    setTopP(0.9); setEnableTopP(false);
    setEnableContextCount(true); setContextCount(10);
    setMaxTokens(0); setEnableMaxTokens(false);
    setStreamOutput(true);
    setMaxToolCalls(20); setEnableMaxToolCalls(true);
    setCustomParameters([]);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-1.5">
        <Typography variant="subtitle">基础设置</Typography>
        <InfoTip text="配置助手的身份信息和模型参数" />
      </div>

      {/* Row 1: 头像与名称 + 模型 — two-row form with aligned label band */}
      <div>
        <div className="flex items-center justify-between gap-3 mb-1.5">
          <label className="text-sm text-muted-foreground/60">头像与名称</label>
          <label className="text-sm text-muted-foreground/60 w-[220px] flex-shrink-0">模型</label>
        </div>
        <div className="flex items-center gap-3">
          <Popover>
            <PopoverTrigger asChild>
              <button type="button"
                className="w-11 h-11 rounded-xl bg-accent/50 flex items-center justify-center text-xl flex-shrink-0 border border-border/20 overflow-hidden hover:border-border/40 transition-colors">
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
              <div className="h-px bg-border/30 mt-1.5" />
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
            className="flex-1 min-w-0 h-11 px-3 rounded-xl border-border/20 bg-accent/15 text-xs text-foreground focus:border-border/40 focus:bg-accent/15 transition-all" />
          <Popover open={modelPickerOpen} onOpenChange={setModelPickerOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="flex-shrink-0 justify-between gap-2 h-11 px-3 text-xs border-border/20 bg-accent/15 hover:bg-accent/25 w-[220px] rounded-xl"
              >
                <span className="truncate text-foreground">
                  {ASSISTANT_MODELS.find(m => m.id === model)?.name || model}
                </span>
                <ChevronDown
                  size={12}
                  className={`text-muted-foreground/50 flex-shrink-0 transition-transform ${modelPickerOpen ? 'rotate-180' : ''}`}
                />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="p-0 w-[480px]">
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
        </div>
      </div>

      {/* Row 2: 简介 (full width) */}
      <FieldGroup label="简介">
        <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
          className="input-accent resize-none" />
      </FieldGroup>

      {/* Tags — full width */}
      <FieldGroup label="标签">
        <Popover>
          <PopoverTrigger asChild>
            <button type="button"
              className="w-full min-h-[36px] px-2.5 py-1.5 rounded-xl border border-border/20 bg-accent/15 flex flex-wrap items-center gap-1.5 text-left hover:border-border/40 transition-colors">
              {tags.length === 0 ? (
                <span className="text-xs text-muted-foreground/60">选择标签…</span>
              ) : tags.map(tag => (
                <Badge key={tag} variant="outline"
                  className={`gap-1 px-1.5 py-[2px] rounded-md ${getTagColor(tag)}`}>
                  {tag}
                  <Button variant="ghost" size="icon-xs"
                    onClick={(e) => { e.stopPropagation(); removeTag(tag); }}
                    className="ml-0.5 text-current opacity-40 hover:opacity-100 transition-opacity w-auto h-auto p-0">
                    <X size={7} />
                  </Button>
                </Badge>
              ))}
              <span className="flex-1" />
              <ChevronDown size={11} className="text-muted-foreground/40 flex-shrink-0" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" sideOffset={4} className="w-[var(--radix-popover-trigger-width)] p-1.5 max-h-[260px] overflow-y-auto">
            {TAG_PRESETS.map(preset => {
              const selected = tags.includes(preset.tag);
              return (
                <button key={preset.tag} type="button"
                  onClick={() => togglePresetTag(preset.tag)}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs text-left transition-colors ${
                    selected ? 'bg-accent/40 text-foreground' : 'text-muted-foreground/80 hover:bg-accent/30 hover:text-foreground'
                  }`}>
                  <span className={`w-3.5 h-3.5 rounded-[4px] border flex items-center justify-center flex-shrink-0 ${
                    selected ? 'bg-primary border-primary text-primary-foreground' : 'border-border/60'
                  }`}>
                    {selected && <Check size={9} />}
                  </span>
                  <span className={`px-1.5 py-[1px] rounded-md text-xs border ${preset.color}`}>{preset.tag}</span>
                </button>
              );
            })}
          </PopoverContent>
        </Popover>
      </FieldGroup>

      {/* Model parameters — single-column list matching Cherry Studio's
          模型设置 tab (CherryHQ/cherry-studio
          src/renderer/src/pages/settings/AssistantSettings/AssistantModelSettings.tsx) */}
      <div className="space-y-1">
        <ParamRow
          label="模型温度"
          hint="控制采样随机性，越大越发散"
          valueLabel={enableTemperature ? temperature.toFixed(2) : undefined}
          enabled={enableTemperature}
          onEnabledChange={setEnableTemperature}
        >
          <Slider min={0} max={2} step={0.01} value={[temperature]} onValueChange={([v]) => setTemperature(v)} />
          <div className="flex justify-between mt-1 tabular-nums text-[10px] text-muted-foreground/50">
            <span>0</span><span>0.7</span><span>2</span>
          </div>
        </ParamRow>

        <ParamRow
          label="Top-P"
          hint="核采样阈值，越大候选词越多"
          valueLabel={enableTopP ? topP.toFixed(2) : undefined}
          enabled={enableTopP}
          onEnabledChange={setEnableTopP}
        >
          <Slider min={0} max={1} step={0.01} value={[topP]} onValueChange={([v]) => setTopP(v)} />
          <div className="flex justify-between mt-1 tabular-nums text-[10px] text-muted-foreground/50">
            <span>0</span><span>1</span>
          </div>
        </ParamRow>

        {/* 自动上下文 — Switch ON means auto-manage (no slider). When the
            user turns it OFF, surface a manual slider for the exact
            number of history messages to include. */}
        <div className="py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 min-w-0">
              <label className="text-sm text-muted-foreground/80">
                自动上下文
                {!enableContextCount && (
                  <span className="text-muted-foreground/40 ml-1.5 tabular-nums">
                    {contextCount >= 100 ? '不限' : contextCount}
                  </span>
                )}
              </label>
              <InfoTip text="开启自动；关闭后用滑块设定保留的历史消息数" />
            </div>
            <Switch checked={enableContextCount} onCheckedChange={setEnableContextCount} className="flex-shrink-0" />
          </div>
          {!enableContextCount && (
            <div className="pt-2.5">
              <Slider min={0} max={100} step={1} value={[contextCount]} onValueChange={([v]) => setContextCount(v)} />
              <div className="flex justify-between mt-1 tabular-nums text-[10px] text-muted-foreground/50">
                <span>0</span><span>25</span><span>50</span><span>75</span><span>不限</span>
              </div>
            </div>
          )}
        </div>

        <ParamRow
          label="最大 Token 数"
          hint="单次回复最多生成的 Token 数量"
          valueLabel={enableMaxTokens ? String(maxTokens) : undefined}
          enabled={enableMaxTokens}
          onEnabledChange={setEnableMaxTokens}
        >
          <Input type="number" min={0} step={100} value={maxTokens}
            onChange={e => setMaxTokens(parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 rounded-xl border-border/20 bg-accent/15 text-xs text-foreground focus:border-border/40 focus:bg-accent/15 transition-all tabular-nums" />
        </ParamRow>

        <ToggleRow
          label="流式输出"
          checked={streamOutput}
          onCheckedChange={setStreamOutput}
        />

        <ParamRow
          label="最大工具调用次数"
          hint="单轮中允许调用工具的最大次数"
          valueLabel={enableMaxToolCalls ? String(maxToolCalls) : undefined}
          enabled={enableMaxToolCalls}
          onEnabledChange={setEnableMaxToolCalls}
        >
          <Input type="number" min={1} max={100} step={1} value={maxToolCalls}
            onChange={e => setMaxToolCalls(parseInt(e.target.value) || 1)}
            className="w-full px-3 py-2 rounded-xl border-border/20 bg-accent/15 text-xs text-foreground focus:border-border/40 focus:bg-accent/15 transition-all tabular-nums" />
        </ParamRow>

        {/* 自定义参数 — dynamic list with name + type + value + delete */}
        <div className="py-3 space-y-2">
          <div className="flex items-center justify-between gap-3">
            <label className="text-sm text-muted-foreground/80">自定义参数</label>
            <Button variant="outline" size="xs" onClick={addCustomParam} className="gap-1.5 h-7">
              <Plus size={11} />
              添加参数
            </Button>
          </div>
          {customParameters.map((param, i) => (
            <div key={i} className="grid grid-cols-[1fr_120px_1fr_auto] gap-2 items-center">
              <Input
                placeholder="参数名称"
                value={param.name}
                onChange={e => updateCustomParam(i, 'name', e.target.value)}
                className="h-8 text-xs"
              />
              <Select value={param.type} onValueChange={(v) => updateCustomParam(i, 'type', v)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="string">文本</SelectItem>
                  <SelectItem value="number">数字</SelectItem>
                  <SelectItem value="boolean">布尔值</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
              {param.type === 'boolean' ? (
                <Select value={param.value || 'false'} onValueChange={(v) => updateCustomParam(i, 'value', v)}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">true</SelectItem>
                    <SelectItem value="false">false</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  type={param.type === 'number' ? 'number' : 'text'}
                  placeholder={param.type === 'json' ? '{ ... }' : '参数值'}
                  value={param.value}
                  onChange={e => updateCustomParam(i, 'value', e.target.value)}
                  className="h-8 text-xs"
                />
              )}
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => removeCustomParam(i)}
                className="text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                title="删除"
              >
                <Trash2 size={12} />
              </Button>
            </div>
          ))}
        </div>

        {/* Reset all parameters to defaults — mirrors source's 重置 button */}
        <div className="flex justify-end pt-4">
          <Button
            variant="destructive"
            size="xs"
            onClick={resetParameters}
            className="gap-1.5"
          >
            <RotateCcw size={11} />
            重置
          </Button>
        </div>
      </div>
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

function ToggleRow({ label, hint, checked, onCheckedChange }: {
  label: string;
  hint?: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <div className="flex items-center gap-1.5 min-w-0">
        <label className="text-sm text-muted-foreground/80">{label}</label>
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
          <label className="text-sm text-muted-foreground/80">
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
