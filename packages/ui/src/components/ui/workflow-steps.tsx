"use client"

import * as React from "react"
import { Check, Circle, Loader2, X } from "lucide-react"
import { cn } from "../../lib/utils"
import { Badge } from "./badge"

/* ----------------------------- Types ----------------------------- */

export type WorkflowStepStatus = "done" | "running" | "pending" | "error"

export interface WorkflowStep {
  id: string
  label: string
  description?: string
  icon?: React.ReactNode
  status: WorkflowStepStatus
}

/* ----------------------------- StatusDot ----------------------------- */

export interface StatusDotProps extends React.HTMLAttributes<HTMLDivElement> {
  status: WorkflowStepStatus
  size?: number
}

function StatusDot({ status, size = 10, className, ...props }: StatusDotProps) {
  if (status === "done") {
    return (
      <Badge variant="outline" className={cn("w-4 h-4 rounded-[var(--radius-dot)] bg-success-muted border-0 p-0 flex items-center justify-center flex-shrink-0", className)} {...props}>
        <Check size={size} className="text-success" />
      </Badge>
    )
  }
  if (status === "running") {
    return (
      <div className={cn("w-4 h-4 flex items-center justify-center flex-shrink-0", className)} {...props}>
        <Loader2 size={size + 1} className="text-info animate-spin" />
      </div>
    )
  }
  if (status === "error") {
    return (
      <Badge variant="outline" className={cn("w-4 h-4 rounded-[var(--radius-dot)] bg-error-muted border-0 p-0 flex items-center justify-center flex-shrink-0", className)} {...props}>
        <X size={size} className="text-error" />
      </Badge>
    )
  }
  return (
    <div className={cn("w-4 h-4 flex items-center justify-center flex-shrink-0", className)} {...props}>
      <Circle size={size} className="text-muted-foreground" />
    </div>
  )
}

/* ----------------------------- WorkflowSteps ----------------------------- */

export interface WorkflowStepsProps extends React.HTMLAttributes<HTMLDivElement> {
  steps: WorkflowStep[]
  /** Show connector lines between steps */
  showConnectors?: boolean
}

function WorkflowSteps({ steps, showConnectors = true, className, ref, ...props }: WorkflowStepsProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <div ref={ref} data-slot="workflow-steps" className={cn("space-y-0 tracking-tight", className)} {...props}>
      {steps.map((step, i) => {
        const isLast = i === steps.length - 1
        return (
          <div key={step.id} className="flex gap-3">
            {/* Left column: status + connector */}
            <div className="flex flex-col items-center">
              <StatusDot status={step.status} />
              {showConnectors && !isLast && (
                <div className={cn(
                  "w-px flex-1 min-h-4 my-0.5",
                  step.status === "done" ? "bg-success/30" : "bg-border"
                )} />
              )}
            </div>
            {/* Right column: content */}
            <div className={cn("flex-1 min-w-0 pb-3", isLast && "pb-0")}>
              <div className="flex items-center gap-2">
                {step.icon && (
                  <span className={cn(
                    "flex-shrink-0 [&>svg]:h-3.5 [&>svg]:w-3.5",
                    step.status === "done" ? "text-success" :
                    step.status === "running" ? "text-info" :
                    step.status === "error" ? "text-error" :
                    "text-muted-foreground"
                  )}>
                    {step.icon}
                  </span>
                )}
                <span className={cn(
                  "text-xs font-medium",
                  step.status === "done" ? "text-foreground" :
                  step.status === "running" ? "text-foreground" :
                  step.status === "error" ? "text-error" :
                  "text-muted-foreground"
                )}>
                  {step.label}
                </span>
              </div>
              {step.description && (
                <p className="text-xs text-muted-foreground mt-0.5 ml-6">
                  {step.description}
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export { WorkflowSteps, StatusDot }
