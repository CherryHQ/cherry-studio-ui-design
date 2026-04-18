"use client"

import * as React from "react"
import { cn } from "../../lib/utils"
import { Button } from "./button"
import { Card } from "./card"

export interface PlanCardProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string
  price: string
  period?: string
  description?: string
  features: string[]
  highlighted?: boolean
  actionLabel?: string
  onAction?: () => void
}

function PlanCard({
  name,
  price,
  period,
  description,
  features,
  highlighted = false,
  actionLabel = "Get Started",
  onAction,
  className,
  ref,
  ...props
}: PlanCardProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <Card
      ref={ref}
      data-slot="plan-card"
      className={cn(
        "p-6 gap-4 tracking-[-0.14px]",
        highlighted && "border-primary shadow-popover",
        className
      )}
      {...props}
    >
      <div className="space-y-1">
        <h3 className="text-base font-medium">{name}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>

      <div className="flex items-baseline gap-0.5">
        <span className="text-3xl font-bold">{price}</span>
        {period && (
          <span className="text-xs text-muted-foreground">{period}</span>
        )}
      </div>

      <ul className="flex flex-col gap-2 flex-1">
        {features.map((feature) => (
          <li key={feature} className="flex items-center gap-2 text-sm">
            <svg
              className="h-4 w-4 shrink-0 text-primary"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="3.5 8.5 6.5 11.5 12.5 4.5" />
            </svg>
            <span className="text-muted-foreground">{feature}</span>
          </li>
        ))}
      </ul>

      <Button
        data-slot="plan-card-action"
        variant={highlighted ? "default" : "outline"}
        onClick={onAction}
        className={cn(
          "mt-2 w-full text-sm",
          highlighted && "bg-primary text-primary-foreground hover:bg-primary/90"
        )}
      >
        {actionLabel}
      </Button>
    </Card>
  )
}

export { PlanCard }
