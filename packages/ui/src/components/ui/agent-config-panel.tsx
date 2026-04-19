"use client"

import * as React from "react"
import { cn } from "../../lib/utils"
import { Button } from "./button"
import { Badge } from "./badge"
import { Input } from "./input"
import { Textarea } from "./textarea"
import { Switch } from "./switch"
import { Slider } from "./slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./accordion"
import { ConfigSection } from "./config-section"
import { FormRow } from "./form-row"
import { PanelHeader } from "./panel-header"
import { ScrollArea } from "./scroll-area"
import { Bot, Plus, Trash2, Save, X } from "lucide-react"

/* ---------- Types ---------- */

export interface AgentConfig {
  id: string
  name: string
  avatar: string
  systemPrompt: string
  model: string
  temperature: number
  maxTokens: number
  topP: number
  tools: { id: string; name: string; enabled: boolean }[]
  knowledgeBases: { id: string; name: string }[]
}

export interface AgentConfigPanelProps extends Omit<React.ComponentProps<"div">, "onChange"> {
  config: AgentConfig
  onChange: (config: Partial<AgentConfig>) => void
  onSave?: () => void
  onCancel?: () => void
  onDelete?: () => void

  availableModels: { value: string; label: string }[]
  availableTools: { id: string; name: string; description: string }[]
  availableKBs: { id: string; name: string }[]

  avatarOptions?: string[]
  readOnly?: boolean
}

/* ---------- Component ---------- */

function AgentConfigPanel({
  config,
  onChange,
  onSave,
  onCancel,
  onDelete,
  availableModels,
  availableTools,
  availableKBs,
  avatarOptions = ["🤖", "🧠", "⚡", "🎯", "🔧", "📊", "🎨", "💡", "🚀", "🔍"],
  readOnly = false,
  className,
  ...props
}: AgentConfigPanelProps) {
  const updateTools = (toolId: string, enabled: boolean) => {
    onChange({
      tools: config.tools.map((t) => (t.id === toolId ? { ...t, enabled } : t)),
    })
  }

  const addKB = (kb: { id: string; name: string }) => {
    if (!config.knowledgeBases.find((k) => k.id === kb.id)) {
      onChange({ knowledgeBases: [...config.knowledgeBases, kb] })
    }
  }

  const removeKB = (kbId: string) => {
    onChange({ knowledgeBases: config.knowledgeBases.filter((k) => k.id !== kbId) })
  }

  return (
    <div
      data-slot="agent-config-panel"
      className={cn("flex flex-col h-full bg-background rounded-[var(--radius-card)] border overflow-hidden", className)}
      {...props}
    >
      {/* Header */}
      <PanelHeader
        icon={<span className="text-lg">{config.avatar}</span>}
        title={config.name || "新建 Agent"}
        desc="智能体配置"
        actions={
          <div className="flex items-center gap-1.5">
            {onDelete && (
              <Button variant="ghost" size="icon-sm" onClick={onDelete} disabled={readOnly} className="text-destructive hover:text-destructive">
                <Trash2 size={14} />
              </Button>
            )}
            {onCancel && (
              <Button variant="ghost" size="sm" onClick={onCancel} className="text-xs gap-1">
                <X size={12} /> 取消
              </Button>
            )}
            {onSave && (
              <Button size="sm" onClick={onSave} disabled={readOnly} className="text-xs gap-1">
                <Save size={12} /> 保存
              </Button>
            )}
          </div>
        }
      />

      {/* Body */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          <Accordion type="multiple" defaultValue={["basic", "prompt", "model"]} className="space-y-2">
            {/* Basic info */}
            <AccordionItem value="basic" className="border rounded-[var(--radius-button)] px-3">
              <AccordionTrigger className="text-sm py-2.5">基础信息</AccordionTrigger>
              <AccordionContent className="pb-3 space-y-3">
                <FormRow label="名称">
                  <Input
                    value={config.name}
                    onChange={(e) => onChange({ name: e.target.value })}
                    placeholder="Agent 名称"
                    disabled={readOnly}
                    className="h-8 text-xs"
                  />
                </FormRow>
                <FormRow label="头像">
                  <div className="flex flex-wrap gap-1.5">
                    {avatarOptions.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => !readOnly && onChange({ avatar: emoji })}
                        className={cn(
                          "w-8 h-8 rounded-[var(--radius-control)] border flex items-center justify-center text-base transition-all",
                          config.avatar === emoji
                            ? "border-primary/60 bg-primary/10 ring-2 ring-primary/15"
                            : "border-border/30 hover:border-border/60",
                        )}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </FormRow>
              </AccordionContent>
            </AccordionItem>

            {/* System prompt */}
            <AccordionItem value="prompt" className="border rounded-[var(--radius-button)] px-3">
              <AccordionTrigger className="text-sm py-2.5">系统提示词</AccordionTrigger>
              <AccordionContent className="pb-3">
                <Textarea
                  value={config.systemPrompt}
                  onChange={(e) => onChange({ systemPrompt: e.target.value })}
                  placeholder="定义 Agent 的行为、角色和规则..."
                  rows={6}
                  disabled={readOnly}
                  className="text-xs font-mono"
                />
              </AccordionContent>
            </AccordionItem>

            {/* Model params */}
            <AccordionItem value="model" className="border rounded-[var(--radius-button)] px-3">
              <AccordionTrigger className="text-sm py-2.5">模型参数</AccordionTrigger>
              <AccordionContent className="pb-3 space-y-3">
                <FormRow label="模型">
                  <Select value={config.model} onValueChange={(v) => onChange({ model: v })} disabled={readOnly}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableModels.map((m) => (
                        <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormRow>
                <FormRow label="温度" desc={config.temperature.toFixed(1)}>
                  <Slider
                    value={[config.temperature]}
                    onValueChange={(v) => onChange({ temperature: v[0] })}
                    min={0} max={2} step={0.1}
                    disabled={readOnly}
                    className="w-40"
                  />
                </FormRow>
                <FormRow label="最大 Token" desc={String(config.maxTokens)}>
                  <Slider
                    value={[config.maxTokens]}
                    onValueChange={(v) => onChange({ maxTokens: v[0] })}
                    min={256} max={32768} step={256}
                    disabled={readOnly}
                    className="w-40"
                  />
                </FormRow>
                <FormRow label="Top P" desc={config.topP.toFixed(1)}>
                  <Slider
                    value={[config.topP]}
                    onValueChange={(v) => onChange({ topP: v[0] })}
                    min={0} max={1} step={0.05}
                    disabled={readOnly}
                    className="w-40"
                  />
                </FormRow>
              </AccordionContent>
            </AccordionItem>

            {/* Tools */}
            <AccordionItem value="tools" className="border rounded-[var(--radius-button)] px-3">
              <AccordionTrigger className="text-sm py-2.5">
                工具
                <Badge variant="secondary" className="ml-2 text-xs">{config.tools.filter((t) => t.enabled).length}/{config.tools.length}</Badge>
              </AccordionTrigger>
              <AccordionContent className="pb-3 space-y-2">
                {config.tools.map((tool) => {
                  const info = availableTools.find((t) => t.id === tool.id)
                  return (
                    <div key={tool.id} className="flex items-center justify-between py-1.5 px-2 -mx-2 hover:bg-accent/30 transition-colors rounded-[var(--radius-button)]">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-foreground truncate">{tool.name}</p>
                        {info?.description && (
                          <p className="text-xs text-muted-foreground/60 truncate">{info.description}</p>
                        )}
                      </div>
                      <Switch checked={tool.enabled} onCheckedChange={(v) => updateTools(tool.id, v)} disabled={readOnly} />
                    </div>
                  )
                })}
              </AccordionContent>
            </AccordionItem>

            {/* Knowledge bases */}
            <AccordionItem value="kb" className="border rounded-[var(--radius-button)] px-3">
              <AccordionTrigger className="text-sm py-2.5">
                知识库
                <Badge variant="secondary" className="ml-2 text-xs">{config.knowledgeBases.length}</Badge>
              </AccordionTrigger>
              <AccordionContent className="pb-3 space-y-2">
                {config.knowledgeBases.map((kb) => (
                  <div key={kb.id} className="flex items-center justify-between py-1.5 px-2 -mx-2 hover:bg-accent/30 transition-colors rounded-[var(--radius-button)]">
                    <span className="text-xs text-foreground">{kb.name}</span>
                    {!readOnly && (
                      <Button variant="ghost" size="icon-xs" onClick={() => removeKB(kb.id)} className="text-muted-foreground/60 hover:text-destructive">
                        <X size={12} />
                      </Button>
                    )}
                  </div>
                ))}
                {!readOnly && (
                  <Select onValueChange={(v) => {
                    const kb = availableKBs.find((k) => k.id === v)
                    if (kb) addKB(kb)
                  }}>
                    <SelectTrigger className="h-7 text-xs">
                      <span className="flex items-center gap-1 text-muted-foreground/60"><Plus size={10} /> 添加知识库</span>
                    </SelectTrigger>
                    <SelectContent>
                      {availableKBs
                        .filter((kb) => !config.knowledgeBases.find((k) => k.id === kb.id))
                        .map((kb) => (
                          <SelectItem key={kb.id} value={kb.id}>{kb.name}</SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </ScrollArea>
    </div>
  )
}

export { AgentConfigPanel }
