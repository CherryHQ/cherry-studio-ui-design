"use client"

import * as React from "react"
import { Check, Circle, Loader2, X } from "lucide-react"
import { cn } from "../../lib/utils"

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
      <div className={cn("w-4 h-4 rounded-sm bg-green-500/15 flex items-center justify-center flex-shrink-0", className)} {...props}>
        <Check size={size} className="text-green-600 dark:text-green-400" />
      </div>
    )
  }
  if (status === "running") {
    return (
      <div className={cn("w-4 h-4 flex items-center justify-center flex-shrink-0", className)} {...props}>
        <Loader2 size={size + 1} className="text-primary animate-spin" />
      </div>
    )
  }
  if (status === "error") {
    return (
      <div className={cn("w-4 h-4 rounded-sm bg-red-500/15 flex items-center justify-center flex-shrink-0", className)} {...props}>
        <X size={size} className="text-red-500" />
      </div>
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

const WorkflowSteps = React.forwardRef<HTMLDivElement, WorkflowStepsProps>(
  ({ steps, showConnectors = true, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("space-y-0", className)} {...props}>
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
                    step.status === "done" ? "bg-green-500/30" : "bg-border"
                  )} />
                )}
              </div>
              {/* Right column: content */}
              <div className={cn("flex-1 min-w-0 pb-3", isLast && "pb-0")}>
                <div className="flex items-center gap-2">
                  {step.icon && (
                    <span className={cn(
                      "flex-shrink-0 [&>svg]:h-3.5 [&>svg]:w-3.5",
                      step.status === "done" ? "text-green-600 dark:text-green-400" :
                      step.status === "running" ? "text-primary" :
                      step.status === "error" ? "text-red-500" :
                      "text-muted-foreground"
                    )}>
                      {step.icon}
                    </span>
                  )}
                  <span className={cn(
                    "text-xs font-medium",
                    step.status === "done" ? "text-foreground" :
                    step.status === "running" ? "text-foreground" :
                    step.status === "error" ? "text-red-500" :
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
)
WorkflowSteps.displayName = "WorkflowSteps"

export { WorkflowSteps, StatusDot }
