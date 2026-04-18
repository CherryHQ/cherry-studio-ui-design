import React, { useState } from "react"
import {
  Button, AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
  Dialog, DialogContent, Input, Badge,
} from "@cherry-studio/ui"
import { Section, type PropDef } from "../components/Section"
import {
  File, FolderOpen, Pencil, Copy, Trash2, Download, Share2,
  FolderInput, Star, MoreHorizontal,
} from "lucide-react"

const MOCK_FILES = [
  { id: "f1", name: "设计系统规范.pdf", type: "pdf", size: "4.2 MB", starred: true },
  { id: "f2", name: "API 文档.md", type: "md", size: "256 KB", starred: false },
  { id: "f3", name: "用户研究报告.docx", type: "docx", size: "1.8 MB", starred: false },
  { id: "f4", name: "产品截图.png", type: "png", size: "890 KB", starred: true },
]

const FOLDERS = [
  { id: "d1", name: "工作文档", count: 12 },
  { id: "d2", name: "项目资料", count: 8 },
  { id: "d3", name: "个人笔记", count: 24 },
  { id: "d4", name: "归档", count: 56 },
]

const ACTIONS = [
  { id: "rename", label: "重命名", icon: Pencil },
  { id: "copy", label: "复制", icon: Copy },
  { id: "download", label: "下载", icon: Download },
  { id: "share", label: "分享", icon: Share2 },
  { id: "move", label: "移动到...", icon: FolderInput },
  { id: "star", label: "收藏", icon: Star },
  { id: "sep", label: "", icon: null },
  { id: "delete", label: "删除", icon: Trash2, destructive: true },
] as const

const fileMenuProps: PropDef[] = [
  { name: "file", type: "FileItem", default: "-", description: "文件对象" },
  { name: "onAction", type: "(action: string, fileId: string) => void", default: "-", description: "操作回调" },
]

export function FileMenuDemo() {
  const [files, setFiles] = useState(MOCK_FILES)
  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number; fileId: string } | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [moveTarget, setMoveTarget] = useState<string | null>(null)

  const handleAction = (action: string, fileId: string) => {
    if (action === "delete") setDeleteTarget(fileId)
    else if (action === "move") setMoveTarget(fileId)
    else if (action === "star") {
      setFiles(prev => prev.map(f => f.id === fileId ? { ...f, starred: !f.starred } : f))
    }
    setCtxMenu(null)
  }

  const confirmDelete = () => {
    if (deleteTarget) setFiles(prev => prev.filter(f => f.id !== deleteTarget))
    setDeleteTarget(null)
  }

  return (
    <Section title="File Menu & Confirm Dialogs" props={fileMenuProps} code={`// Right-click context menu on files
// Move to Folder dialog (Dialog)
// Delete confirm (AlertDialog)`}>
      <div className="rounded-[24px] border bg-background overflow-hidden" onClick={() => setCtxMenu(null)}>
        <div className="px-5 py-4">
          <div className="flex items-center gap-2 mb-3">
            <FolderOpen size={14} className="text-muted-foreground" />
            <h3 className="text-sm font-medium text-foreground tracking-tight">文件管理</h3>
            <span className="text-xs text-muted-foreground/40">{files.length} 个文件</span>
          </div>
          <p className="text-xs text-muted-foreground/40 mb-4">右键点击文件查看操作菜单</p>

          {/* File list */}
          <div className="space-y-0.5">
            {files.map(file => (
              <div
                key={file.id}
                onContextMenu={e => { e.preventDefault(); setCtxMenu({ x: e.clientX, y: e.clientY, fileId: file.id }) }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-button)] hover:bg-accent/30 transition-colors cursor-default group"
              >
                <File size={14} className="text-muted-foreground/50 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-foreground truncate tracking-tight">{file.name}</span>
                    {file.starred && <Star size={10} className="text-accent-amber fill-accent-amber flex-shrink-0" />}
                  </div>
                  <span className="text-[10px] text-muted-foreground/35">{file.type.toUpperCase()} · {file.size}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={e => { e.stopPropagation(); setCtxMenu({ x: e.clientX, y: e.clientY, fileId: file.id }) }}
                  className="opacity-0 group-hover:opacity-60 hover:!opacity-100"
                >
                  <MoreHorizontal size={14} />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Context menu */}
        {ctxMenu && (
          <div
            className="fixed z-[60] bg-popover rounded-[var(--radius-button)] border shadow-popover py-1 min-w-[160px]"
            style={{ left: ctxMenu.x, top: ctxMenu.y }}
            onClick={e => e.stopPropagation()}
          >
            {ACTIONS.map(action => {
              if (action.id === "sep") return <div key="sep" className="h-px bg-border/15 my-1 mx-2" />
              const Icon = action.icon!
              return (
                <Button
                  key={action.id}
                  variant="ghost"
                  onClick={() => handleAction(action.id, ctxMenu.fileId)}
                  className={`w-full justify-start gap-2.5 h-auto px-3 py-1.5 text-xs font-normal rounded-none ${
                    action.destructive ? "text-destructive hover:bg-destructive/10" : "text-foreground hover:bg-accent/50"
                  }`}
                >
                  <Icon size={12} className={action.destructive ? "" : "text-muted-foreground"} />
                  {action.label}
                </Button>
              )
            })}
          </div>
        )}
      </div>

      {/* Delete confirm AlertDialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={open => { if (!open) setDeleteTarget(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除 &quot;{files.find(f => f.id === deleteTarget)?.name}&quot; 吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Move to Folder Dialog */}
      <Dialog open={!!moveTarget} onOpenChange={open => { if (!open) setMoveTarget(null) }}>
        <DialogContent className="max-w-sm">
          <div className="space-y-4">
            <h3 className="text-base font-medium text-foreground tracking-tight">移动到文件夹</h3>
            <p className="text-xs text-muted-foreground/50">将 &quot;{files.find(f => f.id === moveTarget)?.name}&quot; 移动到:</p>
            <div className="space-y-1">
              {FOLDERS.map(folder => (
                <Button
                  key={folder.id}
                  variant="ghost"
                  onClick={() => setMoveTarget(null)}
                  className="w-full justify-start gap-2.5 h-auto px-3 py-2 text-sm font-normal"
                >
                  <FolderOpen size={14} className="text-muted-foreground" />
                  <span className="flex-1 text-left">{folder.name}</span>
                  <Badge variant="secondary" className="text-xs">{folder.count}</Badge>
                </Button>
              ))}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setMoveTarget(null)}>取消</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Section>
  )
}
