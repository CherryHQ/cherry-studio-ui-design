import React, { useState } from 'react';
import { Star, Info } from 'lucide-react';
import { Button, InlineSelect } from '@cherry-studio/ui';
import { Toggle } from './shared';

// ===========================
// Types
// ===========================
interface ModelOption {
  value: string;
  label: string;
  provider: string;
  providerColor: string;
}

const MODEL_OPTIONS: ModelOption[] = [
  { value: 'cherry-in-claude-4-sonnet', label: 'Claude 4 Sonnet (Cherry IN)', provider: 'Cherry IN', providerColor: '#10b981' },
  { value: 'cherry-in-gpt-4o', label: 'GPT-4o (Cherry IN)', provider: 'Cherry IN', providerColor: '#10b981' },
  { value: 'cherry-in-gemini-2.5-pro', label: 'Gemini 2.5 Pro (Cherry IN)', provider: 'Cherry IN', providerColor: '#10b981' },
  { value: 'cherry-in-deepseek-v3', label: 'DeepSeek V3 (Cherry IN)', provider: 'Cherry IN', providerColor: '#10b981' },
  { value: 'gpt-4.1', label: 'GPT-4.1', provider: 'OpenAI', providerColor: '#10a37f' },
  { value: 'gpt-4o', label: 'GPT-4o', provider: 'OpenAI', providerColor: '#10a37f' },
  { value: 'claude-4-sonnet', label: 'Claude 4 Sonnet', provider: 'Anthropic', providerColor: '#d97706' },
  { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro', provider: 'Vertex AI', providerColor: '#4285f4' },
  { value: 'llama3.3-70b', label: 'Llama 3.3 70B', provider: 'Ollama', providerColor: '#1a1a1a' },
  { value: 'cherry-pro', label: 'Cherry Pro', provider: 'Cherry', providerColor: '#10b981' },
];

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

const INLINE_SELECT_OPTIONS = MODEL_OPTIONS.map(o => ({ value: o.value, label: o.label }));

// ===========================
// Main Page
// ===========================
export function DefaultModelSettingsPage() {
  const [models, setModels] = useState<Record<string, string>>({
    assistant: 'cherry-in-claude-4-sonnet',
    agent: 'cherry-in-gpt-4o',
    translate: 'cherry-in-deepseek-v3',
    summary: 'cherry-in-deepseek-v3',
    code: 'gpt-4.1',
    naming: 'cherry-in-deepseek-v3',
  });
  const [autoSelect, setAutoSelect] = useState(true);
  const [fallbackEnabled, setFallbackEnabled] = useState(true);

  const updateModel = (key: string, value: string) => {
    setModels(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3.5 flex-shrink-0 border-b border-foreground/[0.05]">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400/20 to-orange-400/20 flex items-center justify-center flex-shrink-0">
          <Star size={14} className="text-warning" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm text-foreground/90 font-semibold">默认模型</h3>
          <p className="text-[9px] text-foreground/45 mt-0.5">为不同功能场景配置默认使用的 AI 模型</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:bg-border/20">
        {/* Global Settings */}
        <div>
          <p className="text-xs text-foreground/80 mb-2.5 font-medium">全局设置</p>
          <div className="bg-foreground/[0.02] border border-foreground/[0.05] rounded-xl px-3.5">
            <div className="flex items-center justify-between py-[8px] border-b border-foreground/[0.04]">
              <div className="flex items-center gap-2">
                <span className="text-xs text-foreground/70">智能选择</span>
                <Info size={9} className="text-foreground/25" />
              </div>
              <Toggle checked={autoSelect} onChange={setAutoSelect} />
            </div>
            <div className="flex items-center justify-between py-[8px]">
              <div className="flex items-center gap-2">
                <span className="text-xs text-foreground/70">故障自动切换</span>
                <Info size={9} className="text-foreground/25" />
              </div>
              <Toggle checked={fallbackEnabled} onChange={setFallbackEnabled} />
            </div>
          </div>
          <p className="text-[9px] text-foreground/30 mt-1.5 px-1">
            智能选择：系统根据任务类型自动推荐最优模型。故障切换：当首选模型不可用时自动使用备选模型。
          </p>
        </div>

        {/* Per-function Model Config */}
        <div>
          <p className="text-xs text-foreground/80 mb-2.5 font-medium">功能模型配置</p>
          <div className="space-y-1">
            {CONFIG_ENTRIES.map(entry => (
              <div
                key={entry.key}
                className="flex items-center justify-between gap-4 px-3.5 py-[8px] bg-foreground/[0.02] border border-foreground/[0.05] rounded-xl hover:border-foreground/[0.08] transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-sm flex-shrink-0">{entry.icon}</span>
                  <div className="min-w-0">
                    <p className="text-xs text-foreground/75 font-medium">{entry.label}</p>
                    <p className="text-[9px] text-foreground/35 mt-0.5">{entry.description}</p>
                  </div>
                </div>
                <InlineSelect
                  value={models[entry.key] || ''}
                  options={INLINE_SELECT_OPTIONS}
                  onChange={(v) => updateModel(entry.key, v)}
                  className="min-w-[200px]"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Tip */}
        <div className="bg-warning-muted border border-warning/10 rounded-xl px-3.5 py-2.5">
          <div className="flex items-start gap-2">
            <Info size={10} className="text-warning/60 flex-shrink-0 mt-0.5" />
            <p className="text-[9px] text-foreground/45 leading-[14px]">
              默认模型设置在新建对话时自动应用。你也可以在每次对话中单独切换模型。Cherry IN 提供的模型通过官方 API 代理访问，价格更优惠。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
