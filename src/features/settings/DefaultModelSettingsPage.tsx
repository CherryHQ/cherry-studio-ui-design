import React, { useState } from 'react';
import { Star, Info, ChevronDown } from 'lucide-react';
import { Button, Typography, Switch, Popover, PopoverTrigger, PopoverContent } from '@cherry-studio/ui';
import { ModelPickerPanel } from '@/app/components/shared/ModelPickerPanel';
import { ASSISTANT_MODELS, PROVIDER_COLORS } from '@/app/config/models';

// ===========================
// Types
// ===========================

interface ConfigEntry {
  key: string;
  label: string;
  description: string;
  icon: string;
}

const CONFIG_ENTRIES: ConfigEntry[] = [
  { key: 'assistant', label: '助手对话', description: '聊天助手使用的默认模型', icon: '💬' },
  { key: 'agent', label: '智能体', description: '智能体任务使用的默认模型', icon: '🤖' },
  { key: 'translate', label: '翻译', description: '翻译功能使用的默认模型', icon: '🌐' },
  { key: 'summary', label: '摘要生成', description: '对话标题和摘要的生成模型', icon: '📝' },
  { key: 'code', label: '代码生成', description: '代码相关任务使用的默认模型', icon: '💻' },
  { key: 'naming', label: '命名建议', description: '自动命名使用的模型', icon: '🏷️' },
];

// ===========================
// Model Picker Button
// ===========================

function ModelPickerButton({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const selected = ASSISTANT_MODELS.find(m => m.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="xs"
          className="min-w-[200px] justify-between gap-2 px-2.5 py-[5px] h-auto text-xs border-border/30 hover:border-border/60"
        >
          <span className="truncate text-foreground">{selected?.name || value || '选择模型'}</span>
          <ChevronDown size={9} className={`text-muted-foreground/40 transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`} />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="p-0 w-[480px]">
        <ModelPickerPanel
          models={ASSISTANT_MODELS}
          selectedModels={[value]}
          onSelectModel={onChange}
          multiModel={false}
          onToggleMultiModel={() => {}}
          providerColors={PROVIDER_COLORS}
          onClose={() => setOpen(false)}
        />
      </PopoverContent>
    </Popover>
  );
}

// ===========================
// Main Page
// ===========================
export function DefaultModelSettingsPage() {
  const [models, setModels] = useState<Record<string, string>>({
    assistant: 'claude-4-opus',
    agent: 'gpt-41',
    translate: 'deepseek-v3',
    summary: 'deepseek-v3',
    code: 'gpt-41',
    naming: 'deepseek-v3',
  });
  const [autoSelect, setAutoSelect] = useState(true);
  const [fallbackEnabled, setFallbackEnabled] = useState(true);

  const updateModel = (key: string, value: string) => {
    setModels(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3.5 flex-shrink-0 border-b border-border/30">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent-amber/20 to-accent-orange/20 flex items-center justify-center flex-shrink-0">
          <Star size={14} className="text-warning" />
        </div>
        <div className="flex-1 min-w-0">
          <Typography variant="subtitle">默认模型</Typography>
          <p className="text-xs text-muted-foreground/60 mt-0.5">为不同功能场景配置默认使用的 AI 模型</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 scrollbar-thin">
        {/* Global Settings */}
        <div>
          <p className="text-sm text-foreground mb-2.5 font-medium">全局设置</p>
          <div className="bg-muted/30 border border-border/50 rounded-xl px-3.5">
            <div className="flex items-center justify-between py-[8px] border-b border-border/30">
              <div className="flex items-center gap-2">
                <span className="text-sm text-foreground">智能选择</span>
                <Info size={9} className="text-muted-foreground/40" />
              </div>
              <Switch size="sm" checked={autoSelect} onCheckedChange={setAutoSelect} />
            </div>
            <div className="flex items-center justify-between py-[8px]">
              <div className="flex items-center gap-2">
                <span className="text-sm text-foreground">故障自动切换</span>
                <Info size={9} className="text-muted-foreground/40" />
              </div>
              <Switch size="sm" checked={fallbackEnabled} onCheckedChange={setFallbackEnabled} />
            </div>
          </div>
          <p className="text-xs text-muted-foreground/40 mt-1.5 px-1">
            智能选择：系统根据任务类型自动推荐最优模型。故障切换：当首选模型不可用时自动使用备选模型。
          </p>
        </div>

        {/* Per-function Model Config */}
        <div>
          <p className="text-sm text-foreground mb-2.5 font-medium">功能模型配置</p>
          <div className="space-y-1">
            {CONFIG_ENTRIES.map(entry => (
              <div
                key={entry.key}
                className="flex items-center justify-between gap-4 px-3.5 py-[8px] bg-muted/30 border border-border/50 rounded-xl hover:border-border/50 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-sm flex-shrink-0">{entry.icon}</span>
                  <div className="min-w-0">
                    <p className="text-sm text-foreground font-medium">{entry.label}</p>
                    <p className="text-xs text-muted-foreground/60 mt-0.5">{entry.description}</p>
                  </div>
                </div>
                <ModelPickerButton
                  value={models[entry.key] || ''}
                  onChange={(v) => updateModel(entry.key, v)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Tip */}
        <div className="bg-warning-muted border border-warning/10 rounded-xl px-3.5 py-2.5">
          <div className="flex items-start gap-2">
            <Info size={10} className="text-warning/60 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground/60 leading-[14px]">
              默认模型设置在新建对话时自动应用。你也可以在每次对话中单独切换模型。Cherry IN 提供的模型通过官方 API 代理访问，价格更优惠。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
