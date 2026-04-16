"use client"

import * as React from "react"
import { Loader2, CheckCircle2, XCircle, Clock } from "lucide-react"
import { cn } from "../../lib/utils"
import { Card } from "./card"
import { Badge } from "./badge"

export interface ToolCallCardProps extends React.HTMLAttributes<HTMLDivElement> {
  toolName: string
  args: Record<string, unknown>
  status: "pending" | "running" | "done" | "error"
  result?: unknown
  error?: string
}

function ToolCallCard({ toolName, args, status, result, error, className, ...props }: ToolCallCardProps) {
  const statusConfig = {
    pending: { icon: Clock, label: "Pending", className: "bg-muted text-muted-foreground" },
    running: { icon: Loader2, label: "Running", className: "bg-info-muted text-info" },
    done: { icon: CheckCircle2, label: "Done", className: "bg-success-muted text-success" },
    error: { icon: XCircle, label: "Error", className: "bg-error-muted text-error" },
  }
  const config = statusConfig[status]
  const StatusIcon = config.icon

  return (
    <Card
      data-slot="tool-call-card"
      className={cn(
        "rounded-[var(--radius-button)] p-3 text-[13px] tracking-tight gap-2",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-2">
        <Badge variant="outline" className={cn("gap-1.5", config.className)}>
          <StatusIcon className={cn("size-3", status === "running" && "animate-spin")} />
          {config.label}
        </Badge>
        <span className="font-mono text-xs text-foreground font-medium">{toolName}</span>
      </div>
      {Object.keys(args).length > 0 && (
        <pre className="text-xs bg-muted/50 rounded-[var(--radius-button)] p-2 overflow-x-auto text-muted-foreground font-mono">
          {JSON.stringify(args, null, 2)}
        </pre>
      )}
      {status === "done" && result !== undefined && (
        <div className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Result: </span>
          <span className="font-mono">{typeof result === "string" ? result : JSON.stringify(result)}</span>
        </div>
      )}
      {status === "error" && error && (
        <p className="text-xs text-error">{error}</p>
      )}
    </Card>
  )
}

export { ToolCallCard }
