import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-[var(--radius-button)] text-sm font-semibold tracking-tight whitespace-nowrap transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-30 aria-invalid:border-destructive-border aria-invalid:ring-destructive-ring dark:aria-invalid:ring-destructive-ring [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "relative bg-gradient-to-b from-[var(--btn-primary-from)] to-[var(--btn-primary-to)] text-primary-foreground shadow-[var(--btn-primary-shadow)] overflow-hidden " +
          "before:absolute before:inset-0 before:rounded-[inherit] before:shadow-[var(--btn-primary-inset)] before:pointer-events-none " +
          "hover:from-[var(--btn-primary-hover-from)] hover:to-[var(--btn-primary-hover-to)]",
        secondary:
          "relative bg-gradient-to-b from-[var(--btn-default-from)] to-[var(--btn-default-to)] text-foreground shadow-[var(--btn-default-shadow)] overflow-hidden " +
          "before:absolute before:inset-0 before:rounded-[inherit] before:shadow-[var(--btn-default-inset)] before:pointer-events-none " +
          "hover:from-[var(--btn-default-hover-from)] hover:to-[var(--btn-default-hover-to)]",
        destructive:
          "relative bg-gradient-to-b from-[var(--btn-destructive-from)] to-[var(--btn-destructive-to)] text-destructive-foreground overflow-hidden " +
          "shadow-[var(--btn-destructive-shadow)] " +
          "before:absolute before:inset-0 before:rounded-[inherit] before:shadow-[var(--btn-destructive-inset)] before:pointer-events-none " +
          "hover:from-[var(--btn-destructive-hover-from)] hover:to-[var(--btn-destructive-hover-to)] focus-visible:ring-destructive-ring",
        outline:
          "border bg-background shadow-button hover:bg-accent hover:text-accent-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-accent-blue underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-6 py-2.5 has-[>svg]:px-4",
        xs: "h-6 gap-1 rounded-[var(--radius-control)] px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-9 gap-1.5 rounded-[var(--radius-control)] px-5 has-[>svg]:px-3",
        lg: "h-11 rounded-[var(--radius-button)] px-8 has-[>svg]:px-5",
        icon: "size-10",
        "icon-xs": "size-6 rounded-[var(--radius-control)] [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-9",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
