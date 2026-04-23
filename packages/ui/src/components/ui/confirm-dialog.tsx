"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./dialog"
import { Button } from "./button"

export interface ConfirmDialogProps {
  /** Whether the dialog is open */
  open: boolean
  /** Dialog title */
  title: string
  /** Description message */
  message: string
  /** Confirm button text */
  confirmLabel?: string
  /** Cancel button text */
  cancelLabel?: string
  /** Use destructive style for confirm button */
  danger?: boolean
  /** Called when user confirms */
  onConfirm: () => void
  /** Called when user cancels or closes */
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "确认",
  cancelLabel = "取消",
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onCancel() }}>
      <DialogContent className="w-[300px] p-4">
        <DialogHeader>
          <DialogTitle className="text-xs text-foreground">{title}</DialogTitle>
        </DialogHeader>
        <p className="text-xs text-muted-foreground/50 mb-3">{message}</p>
        <DialogFooter className="flex justify-end gap-1.5">
          <Button
            variant="ghost"
            size="xs"
            onClick={onCancel}
            className="h-6 px-2.5 text-xs text-muted-foreground hover:text-foreground"
          >
            {cancelLabel}
          </Button>
          <Button
            variant={danger ? "destructive" : "default"}
            size="xs"
            onClick={onConfirm}
            className="h-6 px-2.5 text-xs"
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
