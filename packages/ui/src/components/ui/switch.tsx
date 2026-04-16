"use client"

import * as React from "react"
import { Switch as SwitchPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Switch({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
  size?: "sm" | "default"
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer group/switch inline-flex shrink-0 items-center rounded-full border border-transparent shadow-[inset_0_0_1px_0.5px_rgba(18,18,18,0.1)] transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-30 data-[size=default]:h-[22px] data-[size=default]:w-10 data-[size=sm]:h-3.5 data-[size=sm]:w-6 data-[state=checked]:bg-foreground/70 data-[state=checked]:shadow-[inset_0_1px_0.6px_0_rgba(18,18,18,0.3)] data-[state=unchecked]:bg-switch-background dark:data-[state=unchecked]:bg-switch-background",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none relative block rounded-full bg-surface-02 shadow-[0_0_2.6px_0_rgba(0,0,0,0.25),0_1px_4px_0_rgba(0,0,0,0.14)] ring-0 transition-transform group-data-[size=default]/switch:size-[18px] group-data-[size=sm]/switch:size-3 data-[state=checked]:group-data-[size=default]/switch:translate-x-[18px] data-[state=checked]:group-data-[size=sm]/switch:translate-x-[10px] data-[state=unchecked]:translate-x-0 dark:data-[state=checked]:bg-primary-foreground dark:data-[state=unchecked]:bg-foreground before:absolute before:inset-0 before:rounded-[inherit] before:shadow-[inset_0_1px_0.5px_0_rgba(255,255,255,0.82)] before:pointer-events-none"
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
