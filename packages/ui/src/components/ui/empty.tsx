"use client"

import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../lib/utils"

function Empty({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty"
      className={cn(
        "flex min-w-0 flex-1 flex-col items-center justify-center gap-6 text-balance rounded-lg border-dashed p-6 text-center md:p-12",
        className
      )}
      {...props}
    />
  )
}

function EmptyHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-header"
      className={cn(
        "flex max-w-sm flex-col items-center gap-2 text-center",
        className
      )}
      {...props}
    />
  )
}

const emptyMediaVariants = cva(
  "mb-2 flex shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        icon: "bg-muted text-foreground flex size-10 shrink-0 items-center justify-center rounded-lg [&_svg:not([class*='size-'])]:size-6",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function EmptyMedia({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof emptyMediaVariants>) {
  return (
    <div
      data-slot="empty-icon"
      data-variant={variant}
      className={cn(emptyMediaVariants({ variant, className }))}
      {...props}
    />
  )
}

function EmptyTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-title"
      className={cn("text-lg font-medium tracking-tight", className)}
      {...props}
    />
  )
}

function EmptyDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <div
      data-slot="empty-description"
      className={cn(
        "text-muted-foreground [&>a:hover]:text-primary text-sm/relaxed [&>a]:underline [&>a]:underline-offset-4",
        className
      )}
      {...props}
    />
  )
}

function EmptyContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-content"
      className={cn(
        "flex w-full min-w-0 max-w-sm flex-col items-center gap-4 text-balance text-sm",
        className
      )}
      {...props}
    />
  )
}

// EmptyState presets
const EMPTY_PRESETS = {
  "no-data": { icon: "Inbox", title: "No data", description: "There's nothing here yet." },
  "no-results": { icon: "Search", title: "No results", description: "Try adjusting your search or filters." },
  "no-files": { icon: "FileX", title: "No files", description: "Upload files to get started." },
  "network-error": { icon: "WifiOff", title: "Network error", description: "Unable to connect. Check your internet." },
  "no-permission": { icon: "ShieldX", title: "No permission", description: "You don't have access to this resource." },
  "first-time": { icon: "Rocket", title: "Get started", description: "Create your first project to begin." },
  "error": { icon: "AlertCircle", title: "Something went wrong", description: "An unexpected error occurred." },
} as const

type EmptyPreset = keyof typeof EMPTY_PRESETS

function EmptyState({ preset, title, description, icon, action, className, ...props }: {
  preset?: EmptyPreset
  title?: string
  description?: string
  icon?: React.ReactNode
  action?: React.ReactNode
  className?: string
} & React.HTMLAttributes<HTMLDivElement>) {
  const presetData = preset ? EMPTY_PRESETS[preset] : null
  const finalTitle = title || presetData?.title || ""
  const finalDesc = description || presetData?.description || ""

  return (
    <Empty className={className} {...props}>
      <EmptyHeader>
        {icon && <EmptyMedia>{icon}</EmptyMedia>}
        {finalTitle && <EmptyTitle>{finalTitle}</EmptyTitle>}
        {finalDesc && <EmptyDescription>{finalDesc}</EmptyDescription>}
      </EmptyHeader>
      {action && <EmptyContent>{action}</EmptyContent>}
    </Empty>
  )
}

export {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
  EmptyState,
  EMPTY_PRESETS,
}

export type { EmptyPreset }
