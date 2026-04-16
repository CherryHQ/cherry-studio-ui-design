import React, { useState } from "react"
import {
  PanelHeader, ConfigSection, FormRow, Switch, Slider, InlineSelect
} from "@cherry-studio/ui"
import { Section } from "../components/Section"

const modelOptions = [
  { value: "claude-sonnet", label: "Claude Sonnet 4" },
  { value: "claude-opus", label: "Claude Opus 4" },
  { value: "gpt-4o", label: "GPT-4o" },
  { value: "gemini-pro", label: "Gemini 2.5 Pro" },
]

const languageOptions = [
  { value: "en", label: "English" },
  { value: "zh", label: "Chinese" },
  { value: "ja", label: "Japanese" },
  { value: "auto", label: "Auto Detect" },
]

export function ChatSettingsDemo() {
  const [model, setModel] = useState("claude-sonnet")
  const [language, setLanguage] = useState("auto")
  const [stream, setStream] = useState(true)
  const [markdown, setMarkdown] = useState(true)
  const [codeHighlight, setCodeHighlight] = useState(true)
  const [timestamps, setTimestamps] = useState(false)
  const [thinking, setThinking] = useState(true)
  const [temp, setTemp] = useState([70])
  const [maxTokens, setMaxTokens] = useState([40])
  const [topP, setTopP] = useState([90])
  const [contextLength, setContextLength] = useState([50])

  return (
    <Section title="Chat Settings Panel" install="npm install @cherry-studio/ui" props={[
        { name: "model", type: "string", default: '"claude-sonnet"', description: "Selected AI model" },
        { name: "temperature", type: "number", default: "0.7", description: "Controls randomness of responses (0-1)" },
        { name: "maxTokens", type: "number", default: "4096", description: "Maximum number of tokens in the response" },
        { name: "streaming", type: "boolean", default: "true", description: "Enable streaming token output" },
      ]}>
      <div className="max-w-md rounded-xl border bg-background p-4 space-y-3">
        <PanelHeader icon="💬" title="Chat Settings" desc="Configure conversation preferences" />

        <ConfigSection title="Model" hint="AI model and parameters">
          <FormRow label="Model">
            <InlineSelect value={model} options={modelOptions} onChange={setModel} />
          </FormRow>
          <FormRow label="Temperature" desc="Controls randomness">
            <div className="flex items-center gap-2">
              <div className="w-28"><Slider value={temp} onValueChange={setTemp} max={100} step={1} /></div>
              <span className="text-[10px] font-mono text-muted-foreground w-6 text-right">{(temp[0] / 100).toFixed(1)}</span>
            </div>
          </FormRow>
          <FormRow label="Max Tokens">
            <div className="flex items-center gap-2">
              <div className="w-28"><Slider value={maxTokens} onValueChange={setMaxTokens} max={100} step={1} /></div>
              <span className="text-[10px] font-mono text-muted-foreground w-8 text-right">{maxTokens[0] * 40}k</span>
            </div>
          </FormRow>
          <FormRow label="Top P">
            <div className="flex items-center gap-2">
              <div className="w-28"><Slider value={topP} onValueChange={setTopP} max={100} step={1} /></div>
              <span className="text-[10px] font-mono text-muted-foreground w-6 text-right">{(topP[0] / 100).toFixed(1)}</span>
            </div>
          </FormRow>
        </ConfigSection>

        <ConfigSection title="Display" hint="Message rendering options">
          <FormRow label="Streaming" desc="Show tokens as they arrive">
            <Switch checked={stream} onCheckedChange={setStream} />
          </FormRow>
          <FormRow label="Markdown Rendering">
            <Switch checked={markdown} onCheckedChange={setMarkdown} />
          </FormRow>
          <FormRow label="Code Highlighting">
            <Switch checked={codeHighlight} onCheckedChange={setCodeHighlight} />
          </FormRow>
          <FormRow label="Show Timestamps">
            <Switch checked={timestamps} onCheckedChange={setTimestamps} />
          </FormRow>
          <FormRow label="Show Thinking Process" desc="Display AI reasoning steps">
            <Switch checked={thinking} onCheckedChange={setThinking} />
          </FormRow>
        </ConfigSection>

        <ConfigSection title="Context" hint="Conversation context settings">
          <FormRow label="Language">
            <InlineSelect value={language} options={languageOptions} onChange={setLanguage} />
          </FormRow>
          <FormRow label="Context Window" desc="Number of messages to include">
            <div className="flex items-center gap-2">
              <div className="w-28"><Slider value={contextLength} onValueChange={setContextLength} max={100} step={5} /></div>
              <span className="text-[10px] font-mono text-muted-foreground w-6 text-right">{contextLength[0]}</span>
            </div>
          </FormRow>
        </ConfigSection>
      </div>
    </Section>
  )
}
