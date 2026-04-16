import React, { useState } from "react"
import { Eye, Code, Copy, Check, Terminal } from "lucide-react"

export interface PropDef {
  name: string
  type: string
  default?: string
  description: string
}

interface SectionProps {
  title: string
  children: React.ReactNode
  code?: string
  /** Props API table */
  props?: PropDef[]
  /** Shadcn install command e.g. "npx shadcn@latest add button" */
  install?: string
}

export function Section({ title, children, code, props, install }: SectionProps) {
  const [tab, setTab] = useState<"preview" | "code">("preview")
  const [copied, setCopied] = useState("")

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(""), 2000)
  }

  return (
    <section className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground/80">{title}</h3>
        <div className="flex items-center gap-1.5">
          {install && (
            <button
              onClick={() => handleCopy(install, "install")}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors font-mono focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <Terminal size={10} />
              {copied === "install" ? <Check size={10} className="text-success" /> : install.replace("npx shadcn@latest add ", "")}
            </button>
          )}
          {code && (
            <div className="flex items-center rounded-lg bg-muted/50 p-0.5">
              <button
                onClick={() => setTab("preview")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 ${
                  tab === "preview" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Eye size={10} /> Preview
              </button>
              <button
                onClick={() => setTab("code")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 ${
                  tab === "code" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Code size={10} /> Code
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Preview / Code */}
      {tab === "preview" ? (
        <div className="rounded-xl border border-border bg-card p-6 [&:focus-within]:outline-none [&:focus-within]:ring-0 [&:focus-within]:border-border">{children}</div>
      ) : (
        <div className="relative rounded-xl border border-border bg-muted dark:bg-code-block-bg overflow-hidden">
          <button
            onClick={() => handleCopy(code!, "code")}
            className="absolute top-3 right-3 p-1.5 rounded-md bg-white/10 text-white/50 hover:text-white hover:bg-white/20 transition-colors z-10 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            {copied === "code" ? <Check size={12} className="text-success" /> : <Copy size={12} />}
          </button>
          <pre className="p-5 text-[12px] leading-relaxed overflow-x-auto text-foreground dark:text-foreground font-mono">
            <code>{code}</code>
          </pre>
        </div>
      )}

      {/* Props API Table */}
      {props && props.length > 0 && (
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="px-4 py-2 bg-muted/30 border-b border-border">
            <span className="text-[11px] font-medium text-foreground/70">API Reference</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-border bg-muted/10">
                  <th className="text-left px-4 py-2 font-medium text-muted-foreground">Prop</th>
                  <th className="text-left px-4 py-2 font-medium text-muted-foreground">Type</th>
                  <th className="text-left px-4 py-2 font-medium text-muted-foreground">Default</th>
                  <th className="text-left px-4 py-2 font-medium text-muted-foreground">Description</th>
                </tr>
              </thead>
              <tbody>
                {props.map((p) => (
                  <tr key={p.name} className="border-b border-border/50 last:border-0">
                    <td className="px-4 py-2 font-mono text-primary/80">{p.name}</td>
                    <td className="px-4 py-2 font-mono text-muted-foreground">{p.type}</td>
                    <td className="px-4 py-2 font-mono text-muted-foreground/60">{p.default || "—"}</td>
                    <td className="px-4 py-2 text-foreground/70">{p.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  )
}
