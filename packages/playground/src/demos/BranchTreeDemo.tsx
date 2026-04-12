import React, { useState } from "react"
import { Card, CardContent, Badge, Button } from "@cherry-studio/ui"
import { Section } from "../components/Section"
import { User, Bot, GitBranch, ChevronRight, ChevronDown } from "lucide-react"

interface BranchNode {
  id: string; role: "user" | "assistant"; preview: string; depth: number
  children?: BranchNode[]; branchLabel?: string
}

const tree: BranchNode[] = [
  {
    id: "1", role: "user", preview: "How do I optimize React rendering?", depth: 0,
    children: [
      {
        id: "2", role: "assistant", preview: "There are several strategies: React.memo, useMemo, useCallback...", depth: 1,
        children: [
          {
            id: "3a", role: "user", preview: "Can you show me an example with useMemo?", depth: 2, branchLabel: "Branch A",
            children: [
              { id: "4a", role: "assistant", preview: "Sure! Here's a useMemo example with expensive computation...", depth: 3 },
            ],
          },
          {
            id: "3b", role: "user", preview: "What about virtualization for long lists?", depth: 2, branchLabel: "Branch B",
            children: [
              { id: "4b", role: "assistant", preview: "For long lists, react-window or react-virtuoso are great...", depth: 3 },
            ],
          },
        ],
      },
    ],
  },
]

function TreeNode({ node, activeBranch, onSwitch }: {
  node: BranchNode; activeBranch: string; onSwitch: (id: string) => void
}) {
  const [expanded, setExpanded] = useState(true)
  const hasChildren = node.children && node.children.length > 0
  const isActive = node.id === activeBranch || !node.branchLabel

  return (
    <div className="relative">
      {node.depth > 0 && (
        <div
          className="absolute left-3 -top-3 w-px h-3 bg-border"
          style={{ marginLeft: `${(node.depth - 1) * 24}px` }}
        />
      )}

      <div style={{ paddingLeft: `${node.depth * 24}px` }} className="relative">
        {node.depth > 0 && (
          <div className="absolute left-0 top-4 h-px bg-border" style={{ left: `${(node.depth - 1) * 24 + 12}px`, width: "12px" }} />
        )}

        <div className="flex items-start gap-1.5 mb-1.5">
          {node.branchLabel && (
            <Button
              variant={isActive ? "default" : "outline"}
              size="sm"
              className="h-5 text-[9px] px-1.5 shrink-0 mb-0.5"
              onClick={() => onSwitch(node.id)}
            >
              <GitBranch size={9} className="mr-0.5" /> {node.branchLabel}
            </Button>
          )}

          <Card className={`p-0 flex-1 ${!isActive ? "opacity-40" : ""} transition-opacity`}>
            <CardContent className="p-2 flex items-start gap-2">
              <div className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                node.role === "user" ? "bg-blue-500/15 text-blue-600 dark:text-blue-400" : "bg-green-500/15 text-green-600 dark:text-green-400"
              }`}>
                {node.role === "user" ? <User size={10} /> : <Bot size={10} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-medium text-muted-foreground capitalize">{node.role}</span>
                  <Badge variant="outline" className="text-[8px] h-3.5">#{node.id}</Badge>
                </div>
                <p className="text-[11px] text-foreground/80 mt-0.5 line-clamp-2">{node.preview}</p>
              </div>
              {hasChildren && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="text-muted-foreground hover:text-foreground transition-colors p-0.5 shrink-0"
                >
                  {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                </button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {expanded && node.children?.map(child => (
        <TreeNode key={child.id} node={child} activeBranch={activeBranch} onSwitch={onSwitch} />
      ))}
    </div>
  )
}

export function BranchTreeDemo() {
  const [activeBranch, setActiveBranch] = useState("3a")

  return (
    <Section title="Conversation Branch Tree" install="npm install @cherry-studio/ui">
      <div className="max-w-lg space-y-3">
        <p className="text-xs text-muted-foreground">
          Click branch buttons to switch between conversation branches.
          Active branch: <Badge variant="secondary" className="text-[10px]">{activeBranch}</Badge>
        </p>
        <div className="rounded-xl border bg-background p-3">
          {tree.map(node => (
            <TreeNode key={node.id} node={node} activeBranch={activeBranch} onSwitch={setActiveBranch} />
          ))}
        </div>
      </div>
    </Section>
  )
}
