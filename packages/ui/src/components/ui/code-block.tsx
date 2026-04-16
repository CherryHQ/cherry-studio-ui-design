"use client"

import * as React from "react"
import { Copy, Check } from "lucide-react"
import { cn } from "../../lib/utils"
import { Button } from "./button"
import hljs from "highlight.js/lib/core"
import javascript from "highlight.js/lib/languages/javascript"
import typescript from "highlight.js/lib/languages/typescript"
import python from "highlight.js/lib/languages/python"
import bash from "highlight.js/lib/languages/bash"
import json from "highlight.js/lib/languages/json"
import css from "highlight.js/lib/languages/css"
import xml from "highlight.js/lib/languages/xml"
import markdown from "highlight.js/lib/languages/markdown"
import sql from "highlight.js/lib/languages/sql"
import java from "highlight.js/lib/languages/java"
import go from "highlight.js/lib/languages/go"
import rust from "highlight.js/lib/languages/rust"

hljs.registerLanguage("javascript", javascript)
hljs.registerLanguage("js", javascript)
hljs.registerLanguage("jsx", javascript)
hljs.registerLanguage("typescript", typescript)
hljs.registerLanguage("ts", typescript)
hljs.registerLanguage("tsx", typescript)
hljs.registerLanguage("python", python)
hljs.registerLanguage("py", python)
hljs.registerLanguage("bash", bash)
hljs.registerLanguage("sh", bash)
hljs.registerLanguage("shell", bash)
hljs.registerLanguage("json", json)
hljs.registerLanguage("css", css)
hljs.registerLanguage("html", xml)
hljs.registerLanguage("xml", xml)
hljs.registerLanguage("markdown", markdown)
hljs.registerLanguage("md", markdown)
hljs.registerLanguage("sql", sql)
hljs.registerLanguage("java", java)
hljs.registerLanguage("go", go)
hljs.registerLanguage("rust", rust)

const HLJS_STYLES = `
.hljs { color: var(--foreground); }
.hljs-keyword, .hljs-selector-tag, .hljs-built_in { color: var(--syntax-keyword); }
.hljs-string, .hljs-attr { color: var(--syntax-string); }
.hljs-comment, .hljs-quote { color: var(--syntax-comment); font-style: italic; }
.hljs-number, .hljs-literal { color: var(--syntax-number); }
.hljs-function .hljs-title, .hljs-title.function_ { color: var(--syntax-function); }
.hljs-type, .hljs-class .hljs-title { color: var(--syntax-type); }
.hljs-variable, .hljs-template-variable { color: var(--syntax-variable); }
.hljs-meta { color: var(--syntax-comment); }
.hljs-punctuation { color: var(--muted-foreground); }
`

export interface CodeBlockProps {
  code: string
  language?: string
  showLineNumbers?: boolean
  className?: string
}

function CodeBlock({ code, language, showLineNumbers = true, className, ref }: CodeBlockProps & { ref?: React.Ref<HTMLDivElement> }) {
  const [copied, setCopied] = React.useState(false)
  const timerRef = React.useRef<ReturnType<typeof setTimeout>>(undefined)

  const highlightedCode = React.useMemo(() => {
    if (!code) return ""
    try {
      if (language && hljs.getLanguage(language)) {
        return hljs.highlight(code, { language }).value
      }
      return hljs.highlightAuto(code).value
    } catch {
      return code
    }
  }, [code, language])

  const highlightedLines = React.useMemo(() => {
    return highlightedCode.split("\n")
  }, [highlightedCode])

  const handleCopy = () => {
    navigator.clipboard.writeText(code).catch(() => {})
    setCopied(true)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div
      ref={ref}
      data-slot="code-block"
      className={cn("my-2 rounded-[var(--radius-button)] overflow-hidden border border-border tracking-tight", className)}
    >
      <style>{HLJS_STYLES}</style>
      <div className="flex items-center justify-between px-3 py-1.5 bg-muted/50 border-b border-border">
        <span className="text-xs text-muted-foreground font-mono">
          {language || "text"}
        </span>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={handleCopy}
          aria-label={copied ? "Copied" : "Copy code"}
          className="text-muted-foreground/50 hover:text-foreground"
        >
          {copied ? (
            <Check className="size-3.5 text-primary" />
          ) : (
            <Copy className="size-3.5" />
          )}
        </Button>
      </div>
      <pre className="px-3 py-2.5 overflow-x-auto text-xs leading-relaxed font-mono bg-muted/20 max-h-80 overflow-y-auto scrollbar-thin">
        {highlightedLines.map((line, i) => (
          <div key={i} className="flex">
            {showLineNumbers && (
              <span className="w-7 text-right pr-3 text-xs text-muted-foreground/30 select-none shrink-0 tabular-nums">
                {i + 1}
              </span>
            )}
            <code
              className={cn("hljs flex-1", language && `language-${language}`)}
              dangerouslySetInnerHTML={{ __html: line || "\n" }}
            />
          </div>
        ))}
      </pre>
    </div>
  )
}

export { CodeBlock }
