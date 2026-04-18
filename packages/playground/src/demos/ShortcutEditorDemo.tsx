import React, { useState, useEffect } from "react"
import { Switch, Button, Input, Kbd } from "@cherry-studio/ui"
import { Section, type PropDef } from "../components/Section"
import {
  Monitor, MessageCircle, MessagesSquare, Zap,
  Search, RotateCcw, ChevronRight, AlertTriangle,
} from "lucide-react"

// ===========================
// Types (matching src/features/settings/ShortcutsPage)
// ===========================

type ShortcutCategoryId = "window" | "session" | "message" | "assistant"

interface ShortcutKey {
  id: string; label: string; keys: string[]; enabled: boolean; conflict?: string
}

interface ShortcutCategory {
  id: ShortcutCategoryId; label: string; icon: React.ReactNode; items: ShortcutKey[]
}

// ===========================
// Mock Data (matching original)
// ===========================

const INITIAL_CATEGORIES: ShortcutCategory[] = [
  {
    id: "window", label: "全局与窗口", icon: <Monitor size={13} />,
    items: [
      { id: "w1", label: "显示/隐藏应用", keys: ["⌥", "Space"], enabled: true },
      { id: "w2", label: "打开设置", keys: ["⌘", ","], enabled: true },
      { id: "w3", label: "切换侧边栏", keys: ["⌘", "\\"], enabled: true },
      { id: "w4", label: "放大界面", keys: ["⌘", "+"], enabled: true },
      { id: "w5", label: "缩小界面", keys: ["⌘", "-"], enabled: true },
      { id: "w6", label: "重置缩放", keys: ["⌘", "0"], enabled: true, conflict: "与系统快捷键冲突" },
      { id: "w7", label: "退出全屏", keys: ["Esc"], enabled: false },
      { id: "w8", label: "切换深色/浅色", keys: ["⇧", "⌘", "L"], enabled: true },
    ],
  },
  {
    id: "session", label: "会话与话题", icon: <MessageCircle size={13} />,
    items: [
      { id: "s1", label: "新建对话", keys: ["⌘", "N"], enabled: true },
      { id: "s2", label: "搜索对话", keys: ["⌘", "K"], enabled: true },
      { id: "s3", label: "重命名话题", keys: ["⌘", "E"], enabled: true },
      { id: "s4", label: "上一个话题", keys: ["⌘", "["], enabled: true },
      { id: "s5", label: "下一个话题", keys: ["⌘", "]"], enabled: true },
      { id: "s6", label: "关闭话题", keys: ["⌘", "W"], enabled: true },
    ],
  },
  {
    id: "message", label: "消息交互", icon: <MessagesSquare size={13} />,
    items: [
      { id: "m1", label: "复制最后回复", keys: ["⌘", "⇧", "C"], enabled: true },
      { id: "m2", label: "编辑最后消息", keys: ["↑"], enabled: true },
      { id: "m3", label: "搜索消息", keys: ["⌘", "F"], enabled: true },
      { id: "m4", label: "清空当前对话", keys: [], enabled: true },
    ],
  },
  {
    id: "assistant", label: "AI 助手工具", icon: <Zap size={13} />,
    items: [
      { id: "a1", label: "唤起快捷助手", keys: ["⌘", "E"], enabled: true },
      { id: "a2", label: "划词翻译", keys: [], enabled: false },
      { id: "a3", label: "划词解释", keys: ["⌘", "⇧", "X"], enabled: true },
    ],
  },
]

// ===========================
// Keycap Display (matching original)
// ===========================

function Keycaps({ keys, isRecording, hasConflict }: {
  keys: string[]; isRecording?: boolean; hasConflict?: boolean
}) {
  if (isRecording) {
    return (
      <span className="inline-flex items-center h-[20px] px-2.5 rounded-[12px] border border-border/40 bg-accent/30">
        <span className="text-xs text-foreground/60 animate-pulse" style={{ fontWeight: 500 }}>录制中...</span>
      </span>
    )
  }

  if (keys.length === 0) {
    return (
      <span className="inline-flex items-center h-[20px] px-2 rounded-[12px] border border-dashed border-border/40 cursor-pointer hover:border-border/60 transition-colors">
        <span className="text-xs text-muted-foreground/60">未设置</span>
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-[2px]">
      {keys.map((key, i) => (
        <span key={i} className="inline-flex items-center gap-[2px]">
          <Kbd
            className={hasConflict
              ? "bg-error/5 border-error/20 text-error/70 shadow-[0_1px_0_0] shadow-error/10"
              : ""
            }
          >
            {key}
          </Kbd>
        </span>
      ))}
    </span>
  )
}

// ===========================
// Shortcut Row (matching original)
// ===========================

function ShortcutRow({ item, isRecording, onStartRecording, onReset, onToggle }: {
  item: ShortcutKey; isRecording: boolean
  onStartRecording: () => void; onReset: () => void; onToggle: (v: boolean) => void
}) {
  return (
    <div className={`flex items-center gap-3 py-[6px] px-1 group ${!item.enabled ? "opacity-35" : ""} transition-opacity`}>
      {/* Label */}
      <div className="flex-1 min-w-0 flex items-center gap-1.5">
        <span className="text-xs text-foreground/65 truncate">{item.label}</span>
        {item.conflict && !isRecording && (
          <AlertTriangle size={8} className="text-error/50 flex-shrink-0" />
        )}
      </div>

      {/* Keycaps */}
      <Button variant="ghost" onClick={onStartRecording} className="h-auto px-0 py-0 font-normal tracking-normal focus:outline-none flex-shrink-0">
        <Keycaps keys={item.keys} isRecording={isRecording} hasConflict={!!item.conflict} />
      </Button>

      {/* Reset — show on hover */}
      <Button
        variant="ghost"
        onClick={onReset}
        className="h-auto px-0 py-0 font-normal tracking-normal w-4 h-4 rounded-[6px] flex items-center justify-center text-transparent group-hover:text-muted-foreground/60 hover:!text-muted-foreground transition-colors flex-shrink-0"
        title="重置"
      >
        <RotateCcw size={8} />
      </Button>

      {/* Toggle */}
      <Switch checked={item.enabled} onCheckedChange={onToggle} />
    </div>
  )
}

// ===========================
// Props
// ===========================

const shortcutProps: PropDef[] = [
  { name: "categories", type: "ShortcutCategory[]", description: "快捷键分组列表" },
  { name: "onUpdate", type: "(catId, itemId, keys) => void", description: "快捷键更新回调" },
  { name: "onReset", type: "(catId?, itemId?) => void", description: "重置快捷键回调" },
]

// ===========================
// Main Component
// ===========================

export function ShortcutEditorDemo() {
  const [categories, setCategories] = useState<ShortcutCategory[]>(INITIAL_CATEGORIES)
  const [selectedId, setSelectedId] = useState<ShortcutCategoryId>("window")
  const [recordingId, setRecordingId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const selectedCategory = categories.find(c => c.id === selectedId)!

  const updateItem = (catId: ShortcutCategoryId, itemId: string, update: Partial<ShortcutKey>) => {
    setCategories(prev => prev.map(cat =>
      cat.id === catId
        ? { ...cat, items: cat.items.map(item => item.id === itemId ? { ...item, ...update } : item) }
        : cat
    ))
  }

  const handleToggle = (itemId: string, val: boolean) => updateItem(selectedId, itemId, { enabled: val })

  const handleReset = (itemId: string) => {
    const origItem = INITIAL_CATEGORIES.find(c => c.id === selectedId)?.items.find(i => i.id === itemId)
    if (origItem) updateItem(selectedId, itemId, { keys: origItem.keys, enabled: origItem.enabled, conflict: origItem.conflict })
  }

  const handleResetGroup = () => {
    const orig = INITIAL_CATEGORIES.find(c => c.id === selectedId)
    if (orig) setCategories(prev => prev.map(cat => cat.id === selectedId ? { ...orig } : cat))
  }

  const batchToggle = (val: boolean) => {
    setCategories(prev => prev.map(cat =>
      cat.id === selectedId ? { ...cat, items: cat.items.map(item => ({ ...item, enabled: val })) } : cat
    ))
  }

  // Keyboard recording
  useEffect(() => {
    if (!recordingId) return
    const handler = (e: KeyboardEvent) => {
      e.preventDefault()
      if (e.key === "Escape") { setRecordingId(null); return }
      const keys: string[] = []
      if (e.ctrlKey) keys.push("⌃")
      if (e.metaKey) keys.push("⌘")
      if (e.altKey) keys.push("⌥")
      if (e.shiftKey) keys.push("⇧")
      if (!["Control", "Meta", "Alt", "Shift"].includes(e.key)) {
        keys.push(e.key.length === 1 ? e.key.toUpperCase() : e.key)
      }
      if (keys.length > 0 && keys.some(k => !["⌃", "⌘", "⌥", "⇧"].includes(k))) {
        updateItem(selectedId, recordingId, { keys, conflict: undefined })
        setRecordingId(null)
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [recordingId, selectedId])

  const filteredItems = searchQuery.trim()
    ? selectedCategory.items.filter(item =>
        item.label.includes(searchQuery) || item.keys.join("").includes(searchQuery)
      )
    : selectedCategory.items

  return (
    <Section title="Shortcut Editor" props={shortcutProps} code={`// Two-panel layout: category sidebar + shortcut list
// Matching src/features/settings/ShortcutsPage.tsx structure
<div className="flex h-full">
  {/* Left: category nav */}
  <div className="w-[140px] border-r">
    {categories.map(cat => <NavButton />)}
  </div>
  {/* Right: header + search + shortcut rows */}
  <div className="flex-1">
    <ShortcutRow item={...} isRecording={...} />
  </div>
</div>`}>
      <div className="flex border rounded-[24px] overflow-hidden bg-background" style={{ minHeight: 420 }}>
        {/* Left nav */}
        <div className="w-[140px] flex-shrink-0 flex flex-col border-r border-border/30 min-h-0">
          <div className="px-3 pt-4 pb-2 flex-shrink-0">
            <p className="text-[10px] text-foreground/35" style={{ fontWeight: 500 }}>快捷键分组</p>
          </div>
          <div className="flex-1 overflow-y-auto px-2 pb-3 [&::-webkit-scrollbar]:w-[2px] [&::-webkit-scrollbar-thumb]:bg-border/20">
            <div className="space-y-[1px]">
              {categories.map(cat => {
                const sel = selectedId === cat.id
                return (
                  <Button
                    variant="ghost"
                    key={cat.id}
                    onClick={() => { setSelectedId(cat.id); setRecordingId(null) }}
                    className={`h-auto px-0 py-0 font-normal tracking-normal w-full flex items-center justify-between px-2.5 py-[7px] rounded-[12px] transition-all text-left relative ${
                      sel ? "bg-accent/60" : "border border-transparent hover:bg-accent/30"
                    }`}
                  >
                    {sel && (
                      <div className="absolute inset-0 rounded-[12px] border border-border/30 pointer-events-none" />
                    )}
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      <span className={`flex-shrink-0 ${sel ? "text-foreground/50" : "text-foreground/30"}`}>{cat.icon}</span>
                      <span className={`text-[10px] truncate ${sel ? "text-foreground/80" : "text-foreground/50"}`} style={{ fontWeight: sel ? 500 : 400 }}>
                        {cat.label}
                      </span>
                    </div>
                    <ChevronRight size={8} className={`flex-shrink-0 ${sel ? "text-foreground/20" : "text-muted-foreground/30"}`} />
                  </Button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right content */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          {/* Header row */}
          <div className="flex items-center justify-between px-5 pt-4 pb-2 flex-shrink-0">
            <h3 className="text-xs text-foreground/80" style={{ fontWeight: 500 }}>{selectedCategory.label}</h3>
            <div className="flex items-center gap-1">
              <Button variant="ghost" onClick={() => batchToggle(true)} className="h-auto px-0 py-0 font-normal tracking-normal px-2 py-[2px] rounded-[12px] text-xs text-foreground/30 hover:text-foreground/50 hover:bg-accent/40 transition-colors">全部启用</Button>
              <Button variant="ghost" onClick={() => batchToggle(false)} className="h-auto px-0 py-0 font-normal tracking-normal px-2 py-[2px] rounded-[12px] text-xs text-foreground/30 hover:text-foreground/50 hover:bg-accent/40 transition-colors">全部禁用</Button>
              <Button variant="ghost" onClick={handleResetGroup} className="h-auto px-0 py-0 font-normal tracking-normal flex items-center gap-0.5 px-2 py-[2px] rounded-[12px] text-xs text-foreground/40 hover:text-foreground/60 hover:bg-accent/30 transition-colors">
                <RotateCcw size={7} />
                <span>重置</span>
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="px-5 pb-1 flex-shrink-0">
            <div className="flex items-center gap-2 px-3 py-[5px] bg-muted/30 border border-border/30 rounded-[12px]">
              <Search size={10} className="text-foreground/15 flex-shrink-0" />
              <Input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="搜索..."
                className="flex-1 bg-transparent text-[10px] text-foreground/55 placeholder:text-foreground/15 min-w-0 border-0 shadow-none focus-visible:ring-0 h-auto p-0"
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto px-5 pt-1 pb-4 [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:bg-border/20">
            {filteredItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Search size={14} className="text-muted-foreground/30 mb-1.5" />
                <p className="text-xs text-muted-foreground/50">没有匹配的快捷键</p>
              </div>
            ) : (
              <div className="divide-y divide-border/30">
                {filteredItems.map(item => (
                  <ShortcutRow
                    key={item.id}
                    item={item}
                    isRecording={recordingId === item.id}
                    onStartRecording={() => setRecordingId(prev => prev === item.id ? null : item.id)}
                    onReset={() => handleReset(item.id)}
                    onToggle={v => handleToggle(item.id, v)}
                  />
                ))}
              </div>
            )}

            {recordingId && (
              <div className="mt-2 flex items-center gap-2 px-3 py-[6px] bg-muted/30 border border-border/40 rounded-[12px]">
                <div className="w-1 h-1 rounded-full bg-foreground/50 animate-pulse flex-shrink-0" />
                <p className="text-xs text-foreground/40 flex-1">请按下组合键。Esc 取消。</p>
                <Button
                  variant="ghost"
                  onClick={() => setRecordingId(null)}
                  className="h-auto px-0 py-0 font-normal tracking-normal px-2 py-[2px] rounded-[12px] text-xs text-foreground/30 hover:text-foreground/50 hover:bg-accent/40 transition-colors flex-shrink-0"
                >
                  取消
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Section>
  )
}
