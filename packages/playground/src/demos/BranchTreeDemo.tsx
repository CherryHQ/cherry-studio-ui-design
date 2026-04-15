import React, { useState, useMemo } from "react"
import {
  Badge, Button,
  ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger, ContextMenuSeparator,
} from "@cherry-studio/ui"
import { Section } from "../components/Section"
import {
  User, Bot, GitBranch, Layers, ZoomIn, ZoomOut, Maximize2,
  ChevronDown, ChevronRight, Star, Copy, Pencil,
} from "lucide-react"

// ── Types ──
interface BranchNode {
  id: string; role: "user" | "assistant" | "parallel"
  label: string; preview: string; children: BranchNode[]
  branchId: string; model?: string; assistantName?: string
}

// ── Layout Constants ──
const NODE_W = 140
const NODE_H = 56
const V_GAP = 24
const H_GAP = 20
const CURVE_R = 8

// ── Mock Tree ──
const TREE: BranchNode = {
  id: "r", role: "user", label: "用户", branchId: "main",
  preview: "帮我做一个 AI 聊天应用的技术选型，需要支持多模型接入和流式输出。",
  children: [{
    id: "a1", role: "assistant", label: "助手", branchId: "main", model: "Gemini 3 Pro",
    preview: "好的，我来从前端框架、状态管理、AI 模型接入层和流式通信四个维度进行分析。",
    children: [{
      id: "u2", role: "user", label: "用户", branchId: "main",
      preview: "前端架构具体怎么设计？特别是状态管理和组件拆分这块。",
      children: [
        {
          id: "a2", role: "assistant", label: "助手", branchId: "main", model: "Gemini 3 Pro",
          preview: "推荐使用 zustand 做状态管理，配合 immer 处理嵌套状态更新。",
          children: [{
            id: "u3", role: "user", label: "用户", branchId: "main",
            preview: "流式输出怎么实现？SSE、WebSocket 还是 fetch stream？",
            children: [
              {
                id: "a3a", role: "assistant", label: "助手", branchId: "main", model: "Gemini 3 Pro",
                preview: "推荐 SSE + ReadableStream 方案。前端使用 getReader() 逐块读取。",
                children: [{
                  id: "u4", role: "user", label: "用户", branchId: "main",
                  preview: "给出具体的代码实现，包含前端 fetch 流式读取。",
                  children: [{
                    id: "a4", role: "assistant", label: "助手", branchId: "main", model: "Gemini 3 Pro",
                    preview: "async function streamChat(prompt) {\n  const res = await fetch('/api/chat');\n  const reader = res.body.getReader();\n  ...\n}",
                    children: [],
                  }],
                }],
              },
              {
                id: "a3b", role: "assistant", label: "助手", branchId: "branch-ws", model: "GPT-4.1",
                preview: "建议使用 WebSocket 实现双向通信，客户端可以随时发送 stop 信号。",
                children: [{
                  id: "u4b", role: "user", label: "用户", branchId: "branch-ws",
                  preview: "WebSocket 和 SSE 的性能对比如何？",
                  children: [{
                    id: "a4b", role: "assistant", label: "助手", branchId: "branch-ws", model: "GPT-4.1",
                    preview: "WebSocket 延迟更低(~1ms vs ~50ms)，支持双向通信。但 SSE 更简单。",
                    children: [],
                  }],
                }],
              },
            ],
          }],
        },
        {
          id: "a2-vue", role: "assistant", label: "助手", branchId: "branch-vue", model: "Claude 4 Sonnet",
          preview: "Vue 3 + Composition API 也是很好的选择。状态管理推荐 Pinia。",
          children: [{
            id: "u3-vue", role: "user", label: "用户", branchId: "branch-vue",
            preview: "Vue 3 和 React 在这个场景下的性能差异大吗？",
            children: [{
              id: "a3-vue", role: "assistant", label: "助手", branchId: "branch-vue", model: "Claude 4 Sonnet",
              preview: "在 AI 聊天场景下差异不大。Vue 的响应式在频繁更新单个消息时略有优势。",
              children: [],
            }],
          }],
        },
      ],
    }],
  }],
}

// ── Layout Engine ──
interface LayoutNode {
  node: BranchNode; x: number; y: number; children: LayoutNode[]; isActive: boolean
}

const handleCopyNode = (node: BranchNode) => {
  void node
}

const handleFavoriteNode = (node: BranchNode) => {
  void node
}

const handleCreateBranchFromNode = (node: BranchNode) => {
  void node
}

const handleEditNode = (node: BranchNode) => {
  void node
}

function collectActivePaths(node: BranchNode, branch: string): Set<string> {
  const result = new Set<string>()
  function walk(n: BranchNode): boolean {
    let has = n.branchId === branch
    for (const c of n.children) { if (walk(c)) has = true }
    if (has) result.add(n.id)
    return has
  }
  walk(node)
  return result
}

function computeLayout(node: BranchNode, activeIds: Set<string>, collapsed: Set<string>): LayoutNode {
  const isCollapsed = collapsed.has(node.id)
  const childLayouts = isCollapsed ? [] : node.children.map(c => computeLayout(c, activeIds, collapsed))
  return { node, x: 0, y: 0, children: childLayouts, isActive: activeIds.has(node.id) }
}

function getSubtreeWidth(l: LayoutNode): number {
  if (l.children.length === 0) return NODE_W
  const tw = l.children.reduce((s, c) => s + getSubtreeWidth(c), 0) + (l.children.length - 1) * H_GAP
  return Math.max(NODE_W, tw)
}

function positionTree(l: LayoutNode, x: number, y: number) {
  l.x = x; l.y = y
  if (l.children.length === 0) return
  const childY = y + NODE_H + V_GAP
  if (l.children.length === 1) {
    positionTree(l.children[0], x, childY)
  } else {
    const widths = l.children.map(c => getSubtreeWidth(c))
    const totalW = widths.reduce((s, w) => s + w, 0) + (l.children.length - 1) * H_GAP
    let startX = x + NODE_W / 2 - totalW / 2
    l.children.forEach((child, i) => {
      const cw = widths[i]
      positionTree(child, startX + cw / 2 - NODE_W / 2, childY)
      startX += cw + H_GAP
    })
  }
}

// ── SVG Connectors ──
function Connectors({ layout }: { layout: LayoutNode }) {
  const lines: React.ReactNode[] = []
  function draw(parent: LayoutNode) {
    parent.children.forEach(child => {
      const px = parent.x + NODE_W / 2, py = parent.y + NODE_H
      const cx = child.x + NODE_W / 2, cy = child.y
      const active = child.isActive
      const color = active ? "var(--primary)" : "rgba(120,120,120,0.15)"
      const dash = active ? "none" : "3,3"
      const sw = active ? 1.5 : 1

      if (Math.abs(px - cx) < 1) {
        lines.push(<line key={`${parent.node.id}-${child.node.id}`} x1={px} y1={py} x2={cx} y2={cy} stroke={color} strokeWidth={sw} strokeDasharray={dash} />)
      } else {
        const midY = py + (cy - py) / 2
        const r = Math.min(CURVE_R, Math.abs(cx - px) / 2, (cy - py) / 4)
        const dir = cx > px ? 1 : -1
        const d = `M ${px} ${py} L ${px} ${midY - r} Q ${px} ${midY} ${px + dir * r} ${midY} L ${cx - dir * r} ${midY} Q ${cx} ${midY} ${cx} ${midY + r} L ${cx} ${cy}`
        lines.push(<path key={`${parent.node.id}-${child.node.id}`} d={d} fill="none" stroke={color} strokeWidth={sw} strokeDasharray={dash} strokeLinecap="round" />)
      }
      lines.push(<circle key={`d-${parent.node.id}-${child.node.id}`} cx={cx} cy={cy} r={1.5} fill={color} />)
      draw(child)
    })
  }
  draw(layout)
  return <g>{lines}</g>
}

// ── Tree Node ──
function TreeNodeView({ layout, collapsed, onToggle, onSwitch }: {
  layout: LayoutNode; collapsed: Set<string>
  onToggle: (id: string) => void; onSwitch: (branch: string) => void
}) {
  const { node } = layout
  const isUser = node.role === "user"
  const active = layout.isActive
  const isCollapsed = collapsed.has(node.id)
  const hasChildren = node.children.length > 0 && !isCollapsed

  const border = isUser
    ? (active ? "border-cherry-user/60" : "border-cherry-user/20")
    : (active ? "border-cherry-assistant/50" : "border-cherry-assistant/20")
  const bg = isUser
    ? (active ? "bg-cherry-user/8" : "bg-cherry-user/3")
    : (active ? "bg-cherry-assistant/8" : "bg-cherry-assistant/3")

  return (
    <>
      <div className="absolute select-none" style={{ left: layout.x, top: layout.y, width: NODE_W, height: NODE_H }}>
        <ContextMenu>
          <ContextMenuTrigger asChild>
            <div className={`relative rounded-[10px] border cursor-pointer transition-all h-full ${border} ${bg} ${active ? "shadow-sm" : ""}`}
              onClick={() => {
                if (node.children.length > 0) onToggle(node.id)
                if (!active) onSwitch(node.branchId)
              }}>
              <div className="flex items-center gap-1.5 px-2 h-[22px]">
                <div className={isUser ? "text-cherry-user" : "text-cherry-assistant"}>
                  {isUser ? <User size={10} strokeWidth={2} /> : <Bot size={10} strokeWidth={1.5} />}
                </div>
                <span className={`text-[9px] truncate ${active ? "text-foreground/80" : "text-foreground/45"}`}>
                  {node.assistantName || node.label}
                </span>
                {node.model && <span className="text-[7px] text-muted-foreground/25 truncate ml-auto">{node.model.split(" ").pop()}</span>}
              </div>
              <div className="px-2 pb-1.5">
                <p className="text-[7px] text-foreground/30 leading-[1.4] line-clamp-2 break-all">{node.preview}</p>
              </div>
              {isCollapsed && node.children.length > 0 && (
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-3 rounded-b-md bg-muted-foreground/5 border border-t-0 border-border/10 flex items-center justify-center">
                  <span className="text-[6px] text-muted-foreground/30">{node.children.length}</span>
                </div>
              )}
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-3 rounded-full bg-primary animate-pulse" />
              )}
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent className="rounded-[12px]">
            <ContextMenuItem onSelect={() => handleCopyNode(node)}>
              <Copy size={12} className="mr-2" />
              复制内容
            </ContextMenuItem>
            <ContextMenuItem onSelect={() => handleFavoriteNode(node)}>
              <Star size={12} className="mr-2" />
              收藏消息
            </ContextMenuItem>
            <ContextMenuItem onSelect={() => handleCreateBranchFromNode(node)}>
              <GitBranch size={12} className="mr-2" />
              从此创建分支
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem onSelect={() => handleEditNode(node)}>
              <Pencil size={12} className="mr-2" />
              编辑消息
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </div>
      {layout.children.map(child => (
        <TreeNodeView key={child.node.id} layout={child} collapsed={collapsed} onToggle={onToggle} onSwitch={onSwitch} />
      ))}
    </>
  )
}

// ── Main Component ──
export function BranchTreeDemo() {
  const [activeBranch, setActiveBranch] = useState("main")
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
  const [zoom, setZoom] = useState(1)

  const branches = ["main", "branch-ws", "branch-vue"]
  const branchLabels: Record<string, string> = { main: "SSE 方案 (Gemini)", "branch-ws": "WebSocket (GPT-4.1)", "branch-vue": "Vue 方案 (Claude)" }

  const toggleCollapse = (id: string) => {
    setCollapsed(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const { layout, width, height } = useMemo(() => {
    const activeIds = collectActivePaths(TREE, activeBranch)
    const l = computeLayout(TREE, activeIds, collapsed)
    positionTree(l, 20, 20)
    // Calculate bounds
    let maxX = 0, maxY = 0
    function bounds(n: LayoutNode) { maxX = Math.max(maxX, n.x + NODE_W); maxY = Math.max(maxY, n.y + NODE_H); n.children.forEach(bounds) }
    bounds(l)
    return { layout: l, width: maxX + 40, height: maxY + 40 }
  }, [activeBranch, collapsed])

  return (
    <Section title="Branch Tree" props={[
      { name: "tree", type: "BranchNode", description: "对话分支树根节点" },
      { name: "activeBranch", type: "string", description: "当前活跃分支 ID" },
      { name: "onSwitchBranch", type: "(branchId: string) => void", description: "分支切换回调" },
    ]}>
      <div className="border rounded-[24px] overflow-hidden bg-background">
        {/* Toolbar */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/15">
          <GitBranch size={13} className="text-muted-foreground/50" />
          <span className="text-[11px] text-foreground tracking-tight font-medium">对话分支</span>
          <div className="flex-1" />
          {/* Branch switcher */}
          <div className="flex items-center gap-1">
            {branches.map(b => (
              <Badge key={b} variant={activeBranch === b ? "default" : "outline"}
                className="cursor-pointer text-[9px] px-2 py-0"
                onClick={() => setActiveBranch(b)}>
                {activeBranch === b && <Star size={7} className="mr-0.5" />}
                {branchLabels[b]}
              </Badge>
            ))}
          </div>
          <div className="flex items-center gap-0.5 ml-2">
            <Button variant="ghost" size="icon-xs" onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}><ZoomOut size={12} /></Button>
            <span className="text-[9px] text-muted-foreground/40 w-8 text-center">{Math.round(zoom * 100)}%</span>
            <Button variant="ghost" size="icon-xs" onClick={() => setZoom(z => Math.min(1.5, z + 0.1))}><ZoomIn size={12} /></Button>
            <Button variant="ghost" size="icon-xs" onClick={() => setZoom(1)}><Maximize2 size={12} /></Button>
          </div>
        </div>

        {/* Tree Canvas */}
        <div className="overflow-auto" style={{ maxHeight: 520 }}>
          <div style={{ width: width * zoom, height: height * zoom, transform: `scale(${zoom})`, transformOrigin: "0 0" }}>
            <div className="relative" style={{ width, height }}>
              <svg className="absolute inset-0" width={width} height={height} style={{ pointerEvents: "none" }}>
                <Connectors layout={layout} />
              </svg>
              <TreeNodeView layout={layout} collapsed={collapsed} onToggle={toggleCollapse} onSwitch={setActiveBranch} />
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}
