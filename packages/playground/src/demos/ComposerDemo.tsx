import React, { useState } from "react"
import { Composer, Badge } from "@cherry-studio/ui"
import { Section, type PropDef } from "../components/Section"
import { Plus, Code2, FolderOpen, Image, Mic, Paperclip } from "lucide-react"

export function ComposerDemo() {
  const [lastMessage, setLastMessage] = useState("")

  return (
    <>
      <Section title="Default Variant" install="npm install @cherry-studio/ui" props={[
        { name: "onSendMessage", type: "(text: string) => void", description: "Send handler" },
        { name: "placeholder", type: "string", default: '"Type a message..."', description: "Placeholder text" },
        { name: "variant", type: '"default" | "rounded"', default: '"default"', description: "Style variant" },
        { name: "disabled", type: "boolean", default: "false", description: "Disable input" },
        { name: "maxHeight", type: "number", default: "140", description: "Max textarea height" },
        { name: "autoFocus", type: "boolean", default: "false", description: "Auto-focus on mount" },
      ]} code={`import { Composer } from "@cherry-studio/ui"

<Composer
  onSendMessage={(msg) => console.log(msg)}
  placeholder="Type a message..."
/>`}>
        <div className="max-w-lg border rounded-xl overflow-hidden bg-background">
          <div className="h-32 flex items-center justify-center text-muted-foreground/30 text-sm">
            Messages area
          </div>
          <Composer
            onSendMessage={(msg) => setLastMessage(msg)}
            placeholder="Type a message..."
            autoFocus
          />
        </div>
        {lastMessage && (
          <p className="mt-2 text-sm text-muted-foreground">
            Sent: <span className="text-foreground font-medium">{lastMessage}</span>
          </p>
        )}
      </Section>

      <Section title="Rounded Variant">
        <div className="max-w-lg border rounded-xl overflow-hidden bg-background">
          <div className="h-32 flex items-center justify-center text-muted-foreground/30 text-sm">
            Messages area
          </div>
          <Composer
            onSendMessage={(msg) => setLastMessage(msg)}
            placeholder="Ask anything..."
            variant="rounded"
          />
        </div>
      </Section>

      <Section title="With Custom Actions">
        <div className="max-w-lg border rounded-xl overflow-hidden bg-background">
          <div className="h-24 flex items-center justify-center text-muted-foreground/30 text-sm">
            Messages area
          </div>
          <Composer
            onSendMessage={(msg) => setLastMessage(msg)}
            placeholder="Type a message..."
            leftActions={
              <div className="flex items-center gap-0.5">
                <button className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/20 transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
                  <Plus size={14} />
                </button>
                <button className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/20 transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
                  <Image size={14} />
                </button>
                <button className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/20 transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
                  <Paperclip size={14} />
                </button>
                <button className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/20 transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
                  <Mic size={14} />
                </button>
              </div>
            }
            rightInfo={
              <Badge variant="outline" className="text-[9px] h-5">GPT-4o</Badge>
            }
          />
        </div>
      </Section>

      <Section title="Disabled">
        <div className="max-w-lg border rounded-xl overflow-hidden bg-background">
          <div className="h-16 flex items-center justify-center text-muted-foreground/30 text-sm">
            Waiting for response...
          </div>
          <Composer
            onSendMessage={() => {}}
            placeholder="Waiting for response..."
            disabled
          />
        </div>
      </Section>
    </>
  )
}
