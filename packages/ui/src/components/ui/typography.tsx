"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"
import { cn } from "../../lib/utils"

const typographyVariants = cva("", {
  variants: {
    variant: {
      /** Page title — text-xl font-semibold */
      "page-title": "text-xl font-semibold text-foreground tracking-tight",
      /** Section title — text-lg */
      "section-title": "text-lg font-medium text-foreground",
      /** Subsection header — text-sm font-medium (most common h3 pattern) */
      "subtitle": "text-sm font-medium text-foreground",
      /** Body text — text-sm */
      "body": "text-sm text-foreground",
      /** Small body — text-xs */
      "body-sm": "text-xs text-foreground",
      /** Label — text-xs text-muted */
      "label": "text-xs text-muted-foreground",
      /** Caption — text-xs muted/60 */
      "caption": "text-xs text-muted-foreground/60",
      /** Large display — text-2xl */
      "display": "text-2xl font-semibold text-foreground tracking-tight",
    },
  },
  defaultVariants: {
    variant: "body",
  },
})

const defaultElementMap: Record<string, React.ElementType> = {
  "display": "h1",
  "page-title": "h1",
  "section-title": "h2",
  "subtitle": "h3",
  "body": "p",
  "body-sm": "p",
  "label": "span",
  "caption": "span",
}

export interface TypographyProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof typographyVariants> {
  /** Render as a different element. Defaults based on variant. */
  as?: React.ElementType
  /** Use Radix Slot for composition */
  asChild?: boolean
}

const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  ({ className, variant = "body", as, asChild = false, ...props }, ref) => {
    const Comp = (asChild ? Slot : as || defaultElementMap[variant!] || "p") as React.ElementType
    return (
      <Comp
        ref={ref}
        className={cn(typographyVariants({ variant, className }))}
        {...props}
      />
    )
  }
)
Typography.displayName = "Typography"

export { Typography, typographyVariants }
