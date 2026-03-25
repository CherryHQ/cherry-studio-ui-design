import React, { useState, useRef } from 'react';
import { ChevronDown, X, Tag, Check } from 'lucide-react';
import type { ResourceItem } from '@/app/types';
import { MODEL_PROVIDERS, PROVIDER_MODELS, AVATAR_OPTIONS } from '@/app/config/constants';

// ===========================
// Tag presets
// ===========================

const TAG_PRESETS: { tag: string; color: string }[] = [
  { tag: '写作', color: 'bg-amber-500/12 text-amber-700 border-amber-500/20' },
  { tag: '编程', color: 'bg-cyan-500/12 text-cyan-700 border-cyan-500/20' },
  { tag: '翻译', color: 'bg-violet-500/12 text-violet-700 border-violet-500/20' },
  { tag: '创作', color: 'bg-pink-500/12 text-pink-700 border-pink-500/20' },
  { tag: '代码审查', color: 'bg-sky-500/12 text-sky-700 border-sky-500/20' },
  { tag: '数据分析', color: 'bg-indigo-500/12 text-indigo-700 border-indigo-500/20' },
  { tag: '对话', color: 'bg-foreground/[0.07] text-foreground/80 border-foreground/[0.1]' },
  { tag: '工具', color: 'bg-orange-500/12 text-orange-700 border-orange-500/20' },
  { tag: '知识问答', color: 'bg-blue-500/12 text-blue-700 border-blue-500/20' },
  { tag: '效率', color: 'bg-yellow-500/12 text-yellow-700 border-yellow-500/20' },
  { tag: '学习', color: 'bg-teal-500/12 text-teal-700 border-teal-500/20' },
  { tag: '产品', color: 'bg-rose-500/12 text-rose-700 border-rose-500/20' },
];

function getTagColor(tag: string): string {
  const preset = TAG_PRESETS.find(p => p.tag === tag);
  if (preset) return preset.color;
  const colors = [
    'bg-gray-500/12 text-gray-700 border-gray-500/20',
    'bg-purple-500/12 text-purple-700 border-purple-500/20',
    'bg-lime-500/12 text-lime-700 border-lime-500/20',
    'bg-red-500/12 text-red-700 border-red-500/20',
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
  const [provider, setProvider] = useState('OpenAI');
  const [model, setModel] = useState(resource.model || 'GPT-4o');
  const [temperature, setTemperature] = useState(0.7);
  const [topP, setTopP] = useState(0.9);
  const [maxTokens, setMaxTokens] = useState(4096);
  const [showProviderDrop, setShowProviderDrop] = useState(false);
  const [showModelDrop, setShowModelDrop] = useState(false);

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
        <h3 className="text-[14px] text-foreground mb-1">基础设置</h3>
        <p className="text-[10px] text-muted-foreground/55">配置助手的身份信息和模型参数</p>
      </div>

      <FieldGroup label="头像">
        <div className="flex items-center gap-2">
          <div className="w-12 h-12 rounded-xl bg-accent/50 flex items-center justify-center text-xl">{avatar}</div>
          <div className="flex flex-wrap gap-1">
            {AVATAR_OPTIONS.map(a => (
              <button key={a} onClick={() => setAvatar(a)}
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm transition-all ${avatar === a ? 'bg-accent ring-1 ring-primary/20' : 'hover:bg-accent/40'}`}>{a}</button>
            ))}
          </div>
        </div>
      </FieldGroup>

      <FieldGroup label="名称">
        <input value={name} onChange={e => setName(e.target.value)}
          className="w-full px-3 py-2 rounded-xl border border-border/20 bg-accent/10 text-[11px] text-foreground outline-none focus:border-border/40 focus:bg-accent/15 transition-all" />
      </FieldGroup>

      <FieldGroup label="简介">
        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
          className="w-full px-3 py-2 rounded-xl border border-border/20 bg-accent/10 text-[11px] text-foreground outline-none focus:border-border/40 focus:bg-accent/15 transition-all resize-none" />
      </FieldGroup>

      {/* Tags */}
      <FieldGroup label="标签">
        <div className="min-h-[36px] px-2.5 py-2 rounded-xl border border-border/20 bg-accent/10 flex flex-wrap items-center gap-1.5">
          {tags.map(tag => (
            <span
              key={tag}
              className={`inline-flex items-center gap-1 px-1.5 py-[2px] rounded-md border text-[10px] ${getTagColor(tag)}`}
            >
              {tag}
              <button
                onClick={() => removeTag(tag)}
                className="ml-0.5 text-current opacity-40 hover:opacity-100 transition-opacity"
              >
                <X size={7} />
              </button>
            </span>
          ))}
          <input
            ref={tagInputRef}
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && tagInput.trim()) { e.preventDefault(); addTag(tagInput); }
              if (e.key === 'Backspace' && !tagInput && tags.length > 0) removeTag(tags[tags.length - 1]);
            }}
            placeholder={tags.length === 0 ? '输入标签，回车添加' : ''}
            className="flex-1 min-w-[80px] bg-transparent text-[10px] text-foreground placeholder:text-muted-foreground/35 outline-none"
          />
        </div>
        {/* Preset row */}
        <div className="flex flex-wrap gap-1 mt-2">
          {TAG_PRESETS.slice(0, 8).map(preset => {
            const selected = tags.includes(preset.tag);
            return (
              <button
                key={preset.tag}
                onClick={() => togglePresetTag(preset.tag)}
                className={`inline-flex items-center gap-0.5 px-1.5 py-[2px] rounded-md border text-[9px] transition-all ${preset.color} ${
                  selected ? 'ring-1 ring-foreground/10' : 'opacity-50 hover:opacity-80'
                }`}
              >
                {selected && <Check size={7} className="text-current" />}
                {preset.tag}
              </button>
            );
          })}
        </div>
      </FieldGroup>

      <div className="h-px bg-border/10" />

      <div className="grid grid-cols-2 gap-3">
        <FieldGroup label="模型提供商">
          <div className="relative">
            <button onClick={() => { setShowProviderDrop(!showProviderDrop); setShowModelDrop(false); }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl border border-border/20 bg-accent/10 text-[11px] text-foreground hover:border-border/40 transition-all">
              <span>{provider}</span><ChevronDown size={10} className="text-muted-foreground/45" />
            </button>
            {showProviderDrop && (
              <div className="contents">
                <div className="fixed inset-0 z-40" onClick={() => setShowProviderDrop(false)} />
                <div className="absolute top-full left-0 mt-1 z-50 w-full bg-popover border border-border/30 rounded-xl shadow-xl p-1">
                  {MODEL_PROVIDERS.map(p => (
                    <button key={p} onClick={() => { setProvider(p); setModel(PROVIDER_MODELS[p][0]); setShowProviderDrop(false); }}
                      className={`w-full text-left px-2.5 py-[5px] rounded-md text-[10px] transition-colors ${provider === p ? 'bg-accent text-foreground' : 'text-muted-foreground/60 hover:bg-accent/50 hover:text-foreground'}`}>{p}</button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </FieldGroup>
        <FieldGroup label="模型">
          <div className="relative">
            <button onClick={() => { setShowModelDrop(!showModelDrop); setShowProviderDrop(false); }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl border border-border/20 bg-accent/10 text-[11px] text-foreground hover:border-border/40 transition-all">
              <span>{model}</span><ChevronDown size={10} className="text-muted-foreground/45" />
            </button>
            {showModelDrop && (
              <div className="contents">
                <div className="fixed inset-0 z-40" onClick={() => setShowModelDrop(false)} />
                <div className="absolute top-full left-0 mt-1 z-50 w-full bg-popover border border-border/30 rounded-xl shadow-xl p-1 max-h-[180px] overflow-y-auto">
                  {(PROVIDER_MODELS[provider] || []).map(m => (
                    <button key={m} onClick={() => { setModel(m); setShowModelDrop(false); }}
                      className={`w-full text-left px-2.5 py-[5px] rounded-md text-[10px] transition-colors ${model === m ? 'bg-accent text-foreground' : 'text-muted-foreground/60 hover:bg-accent/50 hover:text-foreground'}`}>{m}</button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </FieldGroup>
      </div>

      <FieldGroup label={<span>Temperature <span className="text-muted-foreground/40 ml-1">{temperature.toFixed(1)}</span></span>}>
        <input type="range" min={0} max={2} step={0.1} value={temperature} onChange={e => setTemperature(parseFloat(e.target.value))}
          className="w-full h-1 bg-accent/40 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-foreground [&::-webkit-slider-thumb]:cursor-pointer" />
        <div className="flex justify-between mt-1"><span className="text-[8px] text-muted-foreground/35">精确</span><span className="text-[8px] text-muted-foreground/35">创意</span></div>
      </FieldGroup>

      <FieldGroup label={<span>Top-P <span className="text-muted-foreground/40 ml-1">{topP.toFixed(1)}</span></span>}>
        <input type="range" min={0} max={1} step={0.05} value={topP} onChange={e => setTopP(parseFloat(e.target.value))}
          className="w-full h-1 bg-accent/40 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-foreground [&::-webkit-slider-thumb]:cursor-pointer" />
      </FieldGroup>

      <FieldGroup label="最大 Token 数">
        <input type="number" value={maxTokens} onChange={e => setMaxTokens(parseInt(e.target.value) || 0)}
          className="w-full px-3 py-2 rounded-xl border border-border/20 bg-accent/10 text-[11px] text-foreground outline-none focus:border-border/40 focus:bg-accent/15 transition-all tabular-nums" />
      </FieldGroup>
    </div>
  );
}

function FieldGroup({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[10px] text-muted-foreground/60 mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}
