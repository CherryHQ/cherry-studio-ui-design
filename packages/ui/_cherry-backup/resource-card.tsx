"use client"

import * as React from "react"
import { cn } from "../../lib/utils"

/* ----------------------------- ResourceCard ----------------------------- */

export interface ResourceCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Avatar/icon element */
  avatar?: React.ReactNode
  /** Title */
  title: string
  /** Category or subtitle */
  subtitle?: string
  /** Description text */
  description?: string
  /** Tags to display */
  tags?: string[]
  /** Stats area (stars, runs, etc.) */
  stats?: React.ReactNode
  /** Action buttons */
  actions?: React.ReactNode
  /** Badge overlay (e.g., "Featured", "New") */
  badge?: React.ReactNode
  /** Whether to show hover effect */
  hoverable?: boolean
}

const ResourceCard = React.forwardRef<HTMLDivElement, ResourceCardProps>(
  (
    {
      avatar,
      title,
      subtitle,
      description,
      tags,
      stats,
      actions,
      badge,
      hoverable = true,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative rounded-xl border bg-card p-4 flex flex-col gap-3 transition-all duration-150",
          hoverable && "hover:shadow-md hover:border-border/80 hover:-translate-y-0.5",
          className
        )}
        {...props}
      >
        {badge && (
          <div className="absolute top-2.5 right-2.5">{badge}</div>
        )}
        <div className="flex items-start gap-3">
          {avatar && <div className="flex-shrink-0">{avatar}</div>}
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-medium truncate">{title}</h4>
            {subtitle && (
              <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
            )}
          </div>
        </div>
        {description && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {description}
          </p>
        )}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full bg-secondary/60 px-2 py-0.5 text-xs text-secondary-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        {(stats || actions) && (
          <div className="flex items-center justify-between mt-auto pt-1">
            {stats && <div className="flex items-center gap-3 text-xs text-muted-foreground">{stats}</div>}
            {actions && <div className="flex items-center gap-1.5 ml-auto">{actions}</div>}
          </div>
        )}
      </div>
    )
  }
)
ResourceCard.displayName = "ResourceCard"

/* ------------------------------ FileCard ------------------------------ */

export interface FileCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** File icon or thumbnail */
  icon?: React.ReactNode
  /** File name */
  name: string
  /** File size */
  size?: string
  /** File type label */
  type?: string
  /** Status badge */
  status?: React.ReactNode
  /** Hover to show actions */
  actions?: React.ReactNode
}

const FileCard = React.forwardRef<HTMLDivElement, FileCardProps>(
  ({ icon, name, size, type, status, actions, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "group relative rounded-lg border bg-card p-3 flex flex-col gap-2 hover:shadow-sm hover:border-border/80 transition-all cursor-pointer",
          className
        )}
        {...props}
      >
        {/* Thumbnail/icon area */}
        <div className="h-20 rounded-md bg-muted/50 flex items-center justify-center">
          {icon || <span className="text-2xl text-muted-foreground/30">📄</span>}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium truncate">{name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            {size && <span className="text-xs text-muted-foreground">{size}</span>}
            {type && (
              <span className="text-xs text-muted-foreground bg-muted rounded px-1">{type}</span>
            )}
          </div>
        </div>
        {status && <div className="absolute top-2 right-2">{status}</div>}
        {actions && (
          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {actions}
          </div>
        )}
      </div>
    )
  }
)
FileCard.displayName = "FileCard"

/* ----------------------------- StatusBadge ----------------------------- */

export type StatusBadgeVariant = "success" | "warning" | "error" | "info" | "processing" | "default"

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: StatusBadgeVariant
  /** Dot indicator */
  dot?: boolean
  /** Animated pulse for processing states */
  pulse?: boolean
}

const statusStyles: Record<StatusBadgeVariant, string> = {
  success: "bg-green-500/15 text-green-700 border-green-500/20 dark:text-green-400",
  warning: "bg-yellow-500/15 text-yellow-700 border-yellow-500/20 dark:text-yellow-400",
  error: "bg-red-500/15 text-red-700 border-red-500/20 dark:text-red-400",
  info: "bg-blue-500/15 text-blue-700 border-blue-500/20 dark:text-blue-400",
  processing: "bg-blue-500/15 text-blue-700 border-blue-500/20 dark:text-blue-400",
  default: "bg-secondary text-secondary-foreground border-border",
}

const dotColors: Record<StatusBadgeVariant, string> = {
  success: "bg-green-500",
  warning: "bg-yellow-500",
  error: "bg-red-500",
  info: "bg-blue-500",
  processing: "bg-blue-500",
  default: "bg-muted-foreground",
}

const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ variant = "default", dot = true, pulse, className, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium",
          statusStyles[variant],
          className
        )}
        {...props}
      >
        {dot && (
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              dotColors[variant],
              (pulse || variant === "processing") && "animate-pulse"
            )}
          />
        )}
        {children}
      </span>
    )
  }
)
StatusBadge.displayName = "StatusBadge"

export { ResourceCard, FileCard, StatusBadge }
