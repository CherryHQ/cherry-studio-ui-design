"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Badge } from "./badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./collapsible"
import { Spinner } from "./spinner"
import { ChevronRight, Check, AlertCircle, Clock } from "lucide-react"

interface DeepSearchStep {
  label: string
  status: "pending" | "searching" | "done" | "error"
  result?: string
}

interface DeepSearchLabels {
  title?: string
  pending?: string
  searching?: string
  done?: string
  error?: string
}

interface DeepSearchProps extends React.ComponentProps<"div"> {
  query: string
  steps: DeepSearchStep[]
  isSearching?: boolean
  labels?: DeepSearchLabels
}

const statusIcons = {
  pending: { icon: Clock, color: "text-muted-foreground/50", badge: "outline" as const },
  searching: { icon: Spinner, color: "text-primary", badge: "default" as const },
  done: { icon: Check, color: "text-success", badge: "default" as const },
  error: { icon: AlertCircle, color: "text-destructive", badge: "destructive" as const },
}

function DeepSearch({ query, steps, isSearching, labels, className, ...props }: DeepSearchProps) {
  const l = {
    title: labels?.title ?? "深度搜索",
    pending: labels?.pending ?? "等待中",
    searching: labels?.searching ?? "搜索中",
    done: labels?.done ?? "完成",
    error: labels?.error ?? "错误",
  }
  return (
    <div
      data-slot="deep-search"
      className={cn(
        "rounded-[var(--radius-card)] border bg-card p-4 space-y-3",
        className
      )}
      {...props}
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        {isSearching && <Spinner className="size-3.5 text-primary" />}
        <span className="text-sm font-medium text-foreground tracking-[-0.14px]">{l.title}</span>
        <Badge variant="outline" className="text-xs px-1.5 py-0">
          {steps.filter(s => s.status === "done").length}/{steps.length}
        </Badge>
      </div>

      {/* Query */}
      <p className="text-xs text-muted-foreground/70 tracking-[-0.12px]">{query}</p>

      {/* Steps */}
      <div className="space-y-1">
        {steps.map((step, i) => {
          const cfg = statusIcons[step.status]
          const StepIcon = cfg.icon
          return (
            <Collapsible key={step.label || i}>
              <CollapsibleTrigger className="flex items-center gap-2 w-full px-2 py-1.5 rounded-[var(--radius-track)] hover:bg-accent/50 transition-colors text-left group focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
                <ChevronRight className="size-3 text-muted-foreground/40 transition-transform group-data-[state=open]:rotate-90" />
                <StepIcon className={cn("size-3.5", cfg.color)} />
                <span className="text-xs text-foreground/80 flex-1 tracking-[-0.12px]">{step.label}</span>
                <Badge variant={cfg.badge} className="text-xs px-1.5 py-0">{l[step.status]}</Badge>
              </CollapsibleTrigger>
              {step.result && (
                <CollapsibleContent>
                  <div className="ml-8 mt-1 mb-1 px-2.5 py-2 rounded-[var(--radius-track)] bg-muted/30 border border-border/20">
                    <p className="text-xs text-muted-foreground/70 leading-relaxed">{step.result}</p>
                  </div>
                </CollapsibleContent>
              )}
            </Collapsible>
          )
        })}
      </div>
    </div>
  )
}

export { DeepSearch }
export type { DeepSearchProps, DeepSearchStep, DeepSearchLabels }
