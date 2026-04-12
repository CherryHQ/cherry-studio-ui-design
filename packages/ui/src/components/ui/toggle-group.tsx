"use client"

import * as React from "react"
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group"
import { type VariantProps } from "class-variance-authority"

import { cn } from "../../lib/utils"
import { toggleVariants } from "./toggle"

const ToggleGroupContext = React.createContext<
  VariantProps<typeof toggleVariants>
>({
  size: "default",
  variant: "default",
})

function ToggleGroup({
  className,
  variant,
  size,
  children,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Root> &
  VariantProps<typeof toggleVariants>) {
  const isSingle = props.type === "single"
  return (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      data-variant={variant}
      data-size={size}
      data-mode={isSingle ? "single" : "multi"}
      className={cn(
        "group/toggle-group flex w-fit items-center",
        isSingle
          ? "rounded-lg bg-muted p-1 gap-1"
          : "rounded-md data-[variant=outline]:shadow-xs",
        className,
      )}
      {...props}
    >
      <ToggleGroupContext.Provider value={{ variant, size }}>
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  )
}

function ToggleGroupItem({
  className,
  children,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Item> &
  VariantProps<typeof toggleVariants>) {
  const context = React.useContext(ToggleGroupContext)

  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      data-variant={context.variant || variant}
      data-size={context.size || size}
      className={cn(
        // Multi mode: use toggle base variants
        "group-data-[mode=multi]/toggle-group:data-[state=on]:bg-accent group-data-[mode=multi]/toggle-group:data-[state=on]:text-accent-foreground",
        // Single mode: override all toggle base styles for tab-switch look
        "group-data-[mode=single]/toggle-group:bg-transparent group-data-[mode=single]/toggle-group:hover:bg-muted/60 group-data-[mode=single]/toggle-group:hover:text-foreground group-data-[mode=single]/toggle-group:data-[state=on]:!bg-background group-data-[mode=single]/toggle-group:data-[state=on]:!text-foreground group-data-[mode=single]/toggle-group:data-[state=on]:shadow-sm group-data-[mode=single]/toggle-group:rounded-md group-data-[mode=single]/toggle-group:h-7 group-data-[mode=single]/toggle-group:px-3 group-data-[mode=single]/toggle-group:text-sm group-data-[mode=single]/toggle-group:font-medium group-data-[mode=single]/toggle-group:flex-initial",
        // Multi mode: joined buttons layout
        "group-data-[mode=multi]/toggle-group:rounded-none group-data-[mode=multi]/toggle-group:shadow-none group-data-[mode=multi]/toggle-group:first:rounded-l-md group-data-[mode=multi]/toggle-group:last:rounded-r-md group-data-[mode=multi]/toggle-group:data-[variant=outline]:border-l-0 group-data-[mode=multi]/toggle-group:data-[variant=outline]:first:border-l",
        // Shared base from toggleVariants (only for multi mode sizing/focus)
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size,
        }),
        "min-w-0 flex-1 shrink-0 focus:z-10 focus-visible:z-10",
        className,
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  )
}

export { ToggleGroup, ToggleGroupItem }
