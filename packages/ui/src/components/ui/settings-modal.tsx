"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "./button"

export interface SettingsSection {
  id: string
  label: string
  icon?: React.ReactNode
}

export interface SettingsModalProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  title?: string
  sections: SettingsSection[]
  activeSection?: string
  onSectionChange?: (id: string) => void
  children?: React.ReactNode
  className?: string
}

function SettingsModal({
  open,
  onOpenChange,
  title = "Settings",
  sections,
  activeSection,
  onSectionChange,
  children,
  className,
}: SettingsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-slot="settings-modal"
        className={cn(
          "rounded-[var(--radius-window)] shadow-popover sm:max-w-2xl p-0 gap-0 overflow-hidden tracking-tight",
          className
        )}
      >
        <div className="flex min-h-[400px]">
          {/* Sidebar */}
          <div
            data-slot="settings-modal-sidebar"
            className="w-48 border-r bg-muted/30 flex flex-col"
          >
            <DialogHeader className="px-4 pt-5 pb-3">
              <DialogTitle className="text-base">{title}</DialogTitle>
            </DialogHeader>
            <nav className="flex-1 px-2 pb-4 space-y-0.5">
              {sections.map((section) => (
                <Button
                  key={section.id}
                  variant="ghost"
                  data-slot="settings-modal-nav-item"
                  data-active={activeSection === section.id || undefined}
                  className={cn(
                    "w-full justify-start gap-2 text-[13px] px-3 py-2",
                    activeSection === section.id &&
                      "bg-accent font-medium"
                  )}
                  onClick={() => onSectionChange?.(section.id)}
                >
                  {section.icon && (
                    <span className="size-4 flex-shrink-0 flex items-center justify-center">
                      {section.icon}
                    </span>
                  )}
                  {section.label}
                </Button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div
            data-slot="settings-modal-content"
            className="flex-1 p-6 overflow-y-auto"
          >
            {children}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { SettingsModal }
