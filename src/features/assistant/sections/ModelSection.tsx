import React, { useState } from 'react';
import { Plus, Trash2, RotateCcw, Info } from 'lucide-react';
import { Button } from '@cherrystudio/ui/components/primitives/button';
import { Input } from '@cherry-studio/ui';
import { Slider } from '@cherrystudio/ui/components/primitives/slider';
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@cherrystudio/ui/components/primitives/select';
import { Typography, SimpleTooltip, Switch } from '@cherry-studio/ui';

// ===========================
// 模型设置 (Model Settings) section
// ===========================
// Extracted from BasicSection so the model parameter set lives on its
// own sidebar page. Field set + order mirrors Cherry Studio source's
// AssistantModelSettings.tsx: 温度 / Top-P / 自动上下文 / 最大 Token /
// 流式输出 / 最大工具调用次数 / 自定义参数 / 重置.

type CustomParam = { name: string; type: 'string' | 'number' | 'boolean' | 'json'; value: string };

export function ModelSection() {
  const [temperature, setTemperature]               = useState(0.7);
  const [enableTemperature, setEnableTemperature]   = useState(true);
  const [topP, setTopP]                             = useState(0.9);
  const [enableTopP, setEnableTopP]                 = useState(false);
  const [enableContextCount, setEnableContextCount] = useState(true);
  const [contextCount, setContextCount]             = useState(10);
  const [maxTokens, setMaxTokens]                   = useState(0);
  const [enableMaxTokens, setEnableMaxTokens]       = useState(false);
  const [streamOutput, setStreamOutput]             = useState(true);
  const [maxToolCalls, setMaxToolCalls]             = useState(20);
  const [enableMaxToolCalls, setEnableMaxToolCalls] = useState(true);
  const [customParameters, setCustomParameters]     = useState<CustomParam[]>([]);

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
        <Typography variant="subtitle">模型设置</Typography>
        <InfoTip text="调整模型的采样、上下文与输出参数" />
      </div>

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

        {/* 自动上下文 — Switch ON means auto; OFF reveals slider */}
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
                <span>0</span><span>不限</span>
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
            className="h-8 text-xs tabular-nums" />
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
            className="h-8 text-xs tabular-nums" />
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

// ── Local helpers (duplicated from BasicSection so this section is
// self-contained) ─────────────────────────────────────────────────

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
