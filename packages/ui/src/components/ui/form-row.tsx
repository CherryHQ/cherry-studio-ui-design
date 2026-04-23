"use client"

import * as React from "react"
import { Info } from "lucide-react"
import { cn } from "../../lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip"

export interface FormRowProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string
  desc?: string
  disabled?: boolean
  /** Layout direction. Default: "horizontal" */
  direction?: "horizontal" | "vertical"
}

function FormRow({ label, desc, disabled, direction = "horizontal", className, children, ref, ...props }: FormRowProps & { ref?: React.Ref<HTMLDivElement> }) {
  const isVertical = direction === "vertical"
  return (
    <div
      ref={ref}
      data-slot="form-row"
      className={cn(
        isVertical
          ? "flex flex-col gap-1.5 py-1.5 tracking-[-0.14px]"
          : "flex items-center justify-between gap-6 py-1.5 tracking-[-0.14px]",
        disabled && "opacity-50 pointer-events-none",
        className
      )}
      {...props}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="text-xs text-muted-foreground font-normal">{label}</p>
          {desc && (
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-muted-foreground hover:text-muted-foreground transition-colors cursor-help flex-shrink-0">
                    <Info size={14} />
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p className="text-xs max-w-50">{desc}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
      <div className={cn(isVertical ? "" : "flex-shrink-0")}>{children}</div>
    </div>
  )
}

export { FormRow }
