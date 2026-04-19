import React, { useState } from "react"
import { AgentConfigPanel } from "@cherry-studio/ui"
import type { AgentConfig } from "@cherry-studio/ui"
import { Section } from "../components/Section"

const MODELS = [
  { value: "claude-sonnet-4", label: "Claude Sonnet 4" },
  { value: "gpt-4o", label: "GPT-4o" },
  { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro" },
  { value: "deepseek-v3", label: "DeepSeek V3" },
]

const TOOLS = [
  { id: "web-search", name: "Web 搜索", description: "搜索互联网获取最新信息" },
  { id: "code-exec", name: "代码执行", description: "在沙盒中运行 Python/JS 代码" },
  { id: "file-rw", name: "文件读写", description: "读写本地文件系统" },
  { id: "data-viz", name: "数据可视化", description: "生成图表和数据可视化" },
  { id: "image-gen", name: "图片生成", description: "调用 DALL·E 生成图片" },
]

const KBS = [
  { id: "kb-react", name: "React 文档" },
  { id: "kb-python", name: "Python 手册" },
  { id: "kb-internal", name: "内部 Wiki" },
  { id: "kb-api", name: "API 参考" },
]

const INITIAL_CONFIG: AgentConfig = {
  id: "agent-1",
  name: "代码审查 Agent",
  avatar: "🤖",
  systemPrompt: "你是一个专业的代码审查助手。你的任务是审查代码变更，找出潜在问题，并提供改进建议。",
  model: "claude-sonnet-4",
  temperature: 0.7,
  maxTokens: 4096,
  topP: 0.9,
  tools: [
    { id: "web-search", name: "Web 搜索", enabled: true },
    { id: "code-exec", name: "代码执行", enabled: true },
    { id: "file-rw", name: "文件读写", enabled: false },
    { id: "data-viz", name: "数据可视化", enabled: false },
    { id: "image-gen", name: "图片生成", enabled: false },
  ],
  knowledgeBases: [
    { id: "kb-react", name: "React 文档" },
  ],
}

export function AgentConfigPanelDemo() {
  const [config, setConfig] = useState<AgentConfig>(INITIAL_CONFIG)
  const [saved, setSaved] = useState(false)

  const handleChange = (partial: Partial<AgentConfig>) => {
    setConfig((prev) => ({ ...prev, ...partial }))
    setSaved(false)
  }

  return (
    <Section
      title="AgentConfigPanel"
      description="可复用的 Agent 配置面板组件"
      props={[
        { name: "config", type: "AgentConfig", description: "Agent 配置对象" },
        { name: "onChange", type: "(partial) => void", description: "配置变更回调" },
        { name: "onSave", type: "() => void", default: "undefined", description: "保存回调" },
        { name: "availableModels", type: "{ value, label }[]", description: "可选模型列表" },
        { name: "availableTools", type: "{ id, name, description }[]", description: "可选工具列表" },
        { name: "readOnly", type: "boolean", default: "false", description: "只读模式" },
      ]}
      code={`import { AgentConfigPanel } from "@cherry-studio/ui"

<AgentConfigPanel
  config={config}
  onChange={handleChange}
  onSave={() => alert("Saved")}
  availableModels={models}
  availableTools={tools}
  availableKBs={kbs}
/>`}
    >
      <AgentConfigPanel
        config={config}
        onChange={handleChange}
        onSave={() => { setSaved(true); setTimeout(() => setSaved(false), 2000) }}
        onCancel={() => setConfig(INITIAL_CONFIG)}
        onDelete={() => alert("Agent deleted")}
        availableModels={MODELS}
        availableTools={TOOLS}
        availableKBs={KBS}
        className="h-[560px]"
      />
      {saved && <p className="text-xs text-success mt-2">已保存</p>}
    </Section>
  )
}
