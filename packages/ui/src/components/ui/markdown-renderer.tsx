"use client"

import * as React from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import rehypeHighlight from "rehype-highlight"
import rehypeKatex from "rehype-katex"
import { cn } from "../../lib/utils"
import { ScrollArea } from "./scroll-area"
import { CodeBlock } from "./code-block"
import { Skeleton } from "./skeleton"

/* ---------- Mermaid (lazy-loaded) ---------- */

function MermaidBlock({ code }: { code: string }) {
  const [svg, setSvg] = React.useState("")
  const [error, setError] = React.useState("")

  React.useEffect(() => {
    let cancelled = false
    import("mermaid").then(async (mermaid) => {
      mermaid.default.initialize({ startOnLoad: false, theme: "neutral" })
      try {
        const { svg: rendered } = await mermaid.default.render(`mermaid-${Date.now()}`, code)
        if (!cancelled) setSvg(rendered)
      } catch (e) {
        if (!cancelled) setError(String(e))
      }
    })
    return () => { cancelled = true }
  }, [code])

  if (error) return <CodeBlock code={code} language="text" />
  if (!svg) return <Skeleton className="h-32 w-full rounded-[var(--radius-button)]" />

  return (
    <div
      className="my-4 flex justify-center overflow-x-auto"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}

/* ---------- MarkdownRenderer ---------- */

export interface MarkdownRendererProps {
  /** Markdown content string */
  content: string
  /** Additional CSS classes */
  className?: string
}

function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div data-slot="markdown-renderer" className={cn("prose-cherry tracking-[-0.14px]", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeHighlight, rehypeKatex]}
        components={{
          code({ className: codeClassName, children, ...rest }) {
            const match = /language-(\w+)/.exec(codeClassName || "")
            const language = match ? match[1] : ""
            const isInline = !match && !String(children).includes("\n")

            if (isInline) {
              return (
                <code
                  className="bg-muted/50 px-1.5 py-0.5 rounded-[var(--radius-kbd)] text-xs font-mono"
                  {...rest}
                >
                  {children}
                </code>
              )
            }

            if (language === "mermaid") {
              return <MermaidBlock code={String(children).trim()} />
            }

            return (
              <CodeBlock
                code={String(children).replace(/\n$/, "")}
                language={language}
                showLineNumbers
              />
            )
          },
          pre({ children }) {
            // When code blocks are handled by CodeBlock, pre is just a pass-through
            return <>{children}</>
          },
          a({ children, ...rest }) {
            return (
              <a
                className="text-accent-blue underline underline-offset-4 hover:text-accent-blue/80"
                target="_blank"
                rel="noopener noreferrer"
                {...rest}
              >
                {children}
              </a>
            )
          },
          p({ children, ...rest }) {
            return (
              <p className="mb-3 last:mb-0 leading-relaxed" {...rest}>
                {children}
              </p>
            )
          },
          ul({ children, ...rest }) {
            return (
              <ul className="mb-3 last:mb-0 list-disc pl-6 space-y-1" {...rest}>
                {children}
              </ul>
            )
          },
          ol({ children, ...rest }) {
            return (
              <ol className="mb-3 last:mb-0 list-decimal pl-6 space-y-1" {...rest}>
                {children}
              </ol>
            )
          },
          li({ children, ...rest }) {
            return (
              <li className="leading-relaxed" {...rest}>
                {children}
              </li>
            )
          },
          blockquote({ children, ...rest }) {
            return (
              <blockquote
                className="border-l-2 border-primary/30 pl-4 italic text-muted-foreground mb-3 last:mb-0"
                {...rest}
              >
                {children}
              </blockquote>
            )
          },
          table({ children, ...rest }) {
            return (
              <ScrollArea className="my-3">
                <table className="w-full border-collapse text-sm" {...rest}>
                  {children}
                </table>
              </ScrollArea>
            )
          },
          thead({ children, ...rest }) {
            return (
              <thead className="bg-muted/50" {...rest}>
                {children}
              </thead>
            )
          },
          th({ children, ...rest }) {
            return (
              <th
                className="border border-border px-3 py-1.5 text-left font-medium text-foreground"
                {...rest}
              >
                {children}
              </th>
            )
          },
          td({ children, ...rest }) {
            return (
              <td className="border border-border px-3 py-1.5" {...rest}>
                {children}
              </td>
            )
          },
          img({ alt, ...rest }) {
            return (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="max-w-full rounded-[var(--radius-button)]" alt={alt ?? ""} {...rest} />
            )
          },
          h1({ children, ...rest }) {
            return (
              <h1 className="text-2xl font-medium mb-3 mt-4 first:mt-0" {...rest}>
                {children}
              </h1>
            )
          },
          h2({ children, ...rest }) {
            return (
              <h2 className="text-xl font-medium mb-2.5 mt-3.5 first:mt-0" {...rest}>
                {children}
              </h2>
            )
          },
          h3({ children, ...rest }) {
            return (
              <h3 className="text-lg font-medium mb-2 mt-3 first:mt-0" {...rest}>
                {children}
              </h3>
            )
          },
          h4({ children, ...rest }) {
            return (
              <h4 className="text-base font-medium mb-2 mt-2.5 first:mt-0" {...rest}>
                {children}
              </h4>
            )
          },
          hr({ ...rest }) {
            return <hr className="my-4 border-border" {...rest} />
          },
        }}
      />
    </div>
  )
}

export { MarkdownRenderer }
