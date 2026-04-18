import React, { useState } from "react"
import { PromptInput, InspirationPopover, Button } from "@cherry-studio/ui"
import { Section, type PropDef } from "../components/Section"

const promptInputProps: PropDef[] = [
  { name: "value", type: "string", default: '""', description: "Input text value" },
  { name: "onChange", type: "(value: string) => void", default: "-", description: "Text change handler" },
  { name: "onSubmit", type: "() => void", default: "-", description: "Submit handler (Enter key or button)" },
  { name: "placeholder", type: "string", default: '"Ask me anything..."', description: "Placeholder text" },
  { name: "modelName", type: "string", default: "undefined", description: "Current model name for selector" },
  { name: "onUpload", type: "() => void", default: "undefined", description: "Upload button handler" },
  { name: "onInspiration", type: "() => void", default: "undefined", description: "Inspiration dropdown handler" },
  { name: "onVoice", type: "() => void", default: "undefined", description: "Voice input handler" },
  { name: "status", type: '"idle" | "connected" | "typing" | "error"', default: '"idle"', description: "Connection status indicator" },
  { name: "isLoading", type: "boolean", default: "false", description: "Loading/generating state" },
  { name: "attachments", type: "{ id: string; name: string }[]", default: "undefined", description: "File attachments list" },
]

export function PromptInputDemo() {
  const [value, setValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [inspirationOpen, setInspirationOpen] = useState(false)
  const [attachments, setAttachments] = useState<{ id: string; name: string }[]>([])
  const [status, setStatus] = useState<"idle" | "connected" | "typing" | "error">("connected")

  const handleSubmit = () => {
    if (!value.trim()) return
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setValue("")
    }, 2000)
  }

  const handleUpload = () => {
    const id = `file-${Date.now()}`
    setAttachments(prev => [...prev, { id, name: `document-${prev.length + 1}.pdf` }])
  }

  return (
    <>
      <Section title="Prompt Input" install="npm install @cherry-studio/ui" props={promptInputProps} code={`import { PromptInput, InspirationPopover } from "@cherry-studio/ui"

<PromptInput
  value={value}
  onChange={setValue}
  onSubmit={handleSubmit}
  placeholder="Ask me anything..."
  modelName="Brainwave 2.5"
  onUpload={handleUpload}
  onInspiration={() => setInspirationOpen(true)}
  inspirationOpen={inspirationOpen}
  onModelSelect={() => {}}
  onVoice={() => {}}
  status="connected"
  isLoading={isLoading}
  onStop={() => setIsLoading(false)}
  attachments={attachments}
  onRemoveAttachment={(id) => setAttachments(a => a.filter(x => x.id !== id))}
/>`}>
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Full featured */}
          <div>
            <p className="text-xs text-muted-foreground/50 mb-3 tracking-tight">Full Featured</p>
            <div className="relative">
              <PromptInput
                value={value}
                onChange={setValue}
                onSubmit={handleSubmit}
                placeholder="Ask me anything..."
                modelName="Brainwave 2.5"
                onUpload={handleUpload}
                onInspiration={() => setInspirationOpen(!inspirationOpen)}
                inspirationOpen={inspirationOpen}
                onModelSelect={() => {}}
                onVoice={() => {}}
                status={status}
                isLoading={isLoading}
                onStop={() => setIsLoading(false)}
                attachments={attachments}
                onRemoveAttachment={(id) => setAttachments(a => a.filter(x => x.id !== id))}
              />
              <InspirationPopover
                open={inspirationOpen}
                onOpenChange={setInspirationOpen}
                onSelect={(prompt) => setValue(prompt)}
              />
            </div>
          </div>

          {/* Minimal */}
          <div>
            <p className="text-xs text-muted-foreground/50 mb-3 tracking-tight">Minimal (no actions)</p>
            <PromptInput
              value=""
              onChange={() => {}}
              onSubmit={() => {}}
              placeholder="Type a message..."
            />
          </div>

          {/* Loading / Generating state (Figma: disabled toolbar) */}
          <div>
            <p className="text-xs text-muted-foreground/50 mb-3 tracking-tight">Generating (toolbar disabled, voice → X)</p>
            <PromptInput
              value="Design a 3D medieval sword with intricate engravings on the blade."
              onChange={() => {}}
              onSubmit={() => {}}
              isLoading
              onStop={() => {}}
              onUpload={() => {}}
              onInspiration={() => {}}
              modelName="Brainwave 2.5"
              onModelSelect={() => {}}
              onVoice={() => {}}
              isRecording
              status="typing"
            />
          </div>

          {/* With attachments */}
          <div>
            <p className="text-xs text-muted-foreground/50 mb-3 tracking-tight">With Attachments</p>
            <PromptInput
              value="Analyze the attached document and summarize key findings."
              onChange={() => {}}
              onSubmit={() => {}}
              onUpload={() => {}}
              onInspiration={() => {}}
              modelName="Claude Opus"
              onModelSelect={() => {}}
              onVoice={() => {}}
              status="connected"
              attachments={[
                { id: "f1", name: "report-2024.pdf" },
                { id: "f2", name: "data-analysis.xlsx" },
              ]}
              onRemoveAttachment={() => {}}
            />
          </div>

          {/* Error state */}
          <div>
            <p className="text-xs text-muted-foreground/50 mb-3 tracking-tight">Error State</p>
            <PromptInput
              value=""
              onChange={() => {}}
              onSubmit={() => {}}
              placeholder="Connection lost..."
              onUpload={() => {}}
              modelName="Offline"
              onModelSelect={() => {}}
              status="error"
            />
          </div>

          {/* Collapsed (Figma: only toolbar, no text area) */}
          <div>
            <p className="text-xs text-muted-foreground/50 mb-3 tracking-tight">Collapsed (toolbar only)</p>
            <PromptInput
              value=""
              onChange={() => {}}
              onSubmit={() => {}}
              collapsed
              onUpload={() => {}}
              onInspiration={() => {}}
              modelName="Brainwave 2.5"
              onModelSelect={() => {}}
              onVoice={() => {}}
            />
          </div>

          {/* With top toolbar (Figma: pagination ← → ) */}
          <div>
            <p className="text-xs text-muted-foreground/50 mb-3 tracking-tight">With Top Toolbar (pagination)</p>
            <PromptInput
              value=""
              onChange={() => {}}
              onSubmit={() => {}}
              placeholder="Describe your 3D object or scene..."
              onUpload={() => {}}
              onInspiration={() => {}}
              modelName="Brainwave 2.5"
              onModelSelect={() => {}}
              onVoice={() => {}}
              topToolbar={
                <div className="flex items-center gap-1 bg-foreground rounded-full px-3 py-1.5">
                  <Button variant="ghost" size="icon-xs" className="text-background/60 hover:text-background size-5">
                    <span className="text-xs">←</span>
                  </Button>
                  <div className="flex items-center gap-0.5 px-1">
                    {[1,2,3,4,5,6,7].map(i => (
                      <div key={i} className={`w-[3px] h-3 rounded-full ${i === 4 ? "bg-background" : "bg-background/30"}`} />
                    ))}
                  </div>
                  <Button variant="ghost" size="icon-xs" className="text-background/60 hover:text-background size-5">
                    <span className="text-xs">→</span>
                  </Button>
                </div>
              }
            />
          </div>

          {/* Status controls */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground/50">
            <span>Status:</span>
            {(["idle", "connected", "typing", "error"] as const).map(s => (
              <Button key={s} variant={status === s ? "secondary" : "ghost"} size="xs"
                onClick={() => setStatus(s)} className="rounded-full text-xs">
                {s}
              </Button>
            ))}
          </div>
        </div>
      </Section>
    </>
  )
}
