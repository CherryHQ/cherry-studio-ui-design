"use client"

import * as React from "react"
import { Code2, CheckCircle2, XCircle, Clock } from "lucide-react"
import { cn } from "../../lib/utils"
import { Button } from "./button"
import { ScrollArea } from "./scroll-area"

export interface FunctionCallUIProps {
  /** Name of the function being called */
  functionName: string
  /** Arguments passed to the function */
  args: Record<string, unknown>
  /** Optional human-readable description */
  description?: string
  /** Called when user approves the function call */
  onApprove?: () => void
  /** Called when user rejects the function call */
  onReject?: () => void
  /** Current approval status */
  status?: "pending" | "approved" | "rejected"
  /** Additional CSS classes */
  className?: string
}

function FunctionCallUI({
  functionName,
  args,
  description,
  onApprove,
  onReject,
  status = "pending",
  className,
}: FunctionCallUIProps) {
  const statusConfig = {
    pending: {
      icon: Clock,
      label: "Pending approval",
      className: "bg-muted text-muted-foreground",
    },
    approved: {
      icon: CheckCircle2,
      label: "Approved",
      className: "bg-success-muted text-success",
    },
    rejected: {
      icon: XCircle,
      label: "Rejected",
      className: "bg-error-muted text-error",
    },
  }

  const config = statusConfig[status]
  const StatusIcon = config.icon
  const hasArgs = Object.keys(args).length > 0

  return (
    <div
      data-slot="function-call-ui"
      className={cn(
        "rounded-[var(--radius-button)] border border-border bg-card p-4 tracking-[-0.14px]",
        className
      )}
    >
      {/* Header: function name + status */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <Code2 className="size-4 text-muted-foreground shrink-0" />
          <span className="inline-flex items-center rounded-[var(--radius-button)] bg-muted px-2 py-0.5 text-xs font-mono font-medium text-foreground truncate">
            {functionName}
          </span>
        </div>
        <div
          data-slot="function-call-status"
          className={cn(
            "flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium shrink-0",
            config.className
          )}
        >
          <StatusIcon className="size-3" />
          <span>{config.label}</span>
        </div>
      </div>

      {/* Description */}
      {description && (
        <p className="text-sm text-muted-foreground mb-2 leading-relaxed">
          {description}
        </p>
      )}

      {/* Arguments */}
      {hasArgs && (
        <ScrollArea className="rounded-[var(--radius-button)] bg-muted/50 mb-3">
          <pre
            data-slot="function-call-args"
            className="text-xs font-mono p-3 text-muted-foreground leading-relaxed"
          >
            {JSON.stringify(args, null, 2)}
          </pre>
        </ScrollArea>
      )}

      {/* Approve / Reject buttons */}
      {status === "pending" && (onApprove || onReject) && (
        <div className="flex items-center gap-2 pt-1">
          {onApprove && (
            <Button
              data-slot="function-call-approve"
              size="sm"
              onClick={onApprove}
              className="gap-1.5 px-4 text-xs"
            >
              <CheckCircle2 className="size-3.5" />
              Approve
            </Button>
          )}
          {onReject && (
            <Button
              variant="destructive"
              data-slot="function-call-reject"
              size="sm"
              onClick={onReject}
              className="gap-1.5 px-4 text-xs"
            >
              <XCircle className="size-3.5" />
              Reject
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

export { FunctionCallUI }
