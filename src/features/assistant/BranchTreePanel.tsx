import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import {
  X, ZoomIn, ZoomOut, Maximize2, Minimize2, UnfoldVertical, FoldVertical,
  Bot, User, GitBranch, Layers, Crown, Check,
  Plus, Copy, Star, Pencil,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Button, Input,
  ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem, ContextMenuSeparator,
} from '@cherry-studio/ui';
import type { Message } from '@/app/types/chat';
import type { BranchNode, LayoutNode } from '@/app/types/assistant';

// Backward-compatible alias
type AssistantMessage = Message;

// ===========================
// Constants
// ===========================

const NODE_W = 130;
const NODE_H = 52;
const NODE_H_EXPANDED = 80;
const V_GAP = 22;
const H_GAP = 16;
const CURVE_R = 8;

// ===========================
// Mock tree data
// ===========================

function buildDefaultTree(): BranchNode {
  return {
    id: 'r', role: 'user', label: '\u7528\u6237', branchId: 'main',
    preview: '\u5e2e\u6211\u505a\u4e00\u4e2a AI \u804a\u5929\u5e94\u7528\u7684\u6280\u672f\u9009\u578b\uff0c\u9700\u8981\u652f\u6301\u591a\u6a21\u578b\u63a5\u5165\u3001\u6d41\u5f0f\u8f93\u51fa\u548c\u5bf9\u8bdd\u5206\u652f\u7ba1\u7406\u3002',
    children: [
      {
        id: 'a1', role: 'assistant', label: '\u52a9\u624b', branchId: 'main', model: 'Gemini 3 Pro',
        preview: '\u597d\u7684\uff0c\u6211\u6765\u4ece\u524d\u7aef\u6846\u67b6\u3001\u72b6\u6001\u7ba1\u7406\u3001AI \u6a21\u578b\u63a5\u5165\u5c42\u548c\u6d41\u5f0f\u901a\u4fe1\u56db\u4e2a\u7ef4\u5ea6\u8fdb\u884c\u5206\u6790\u3002\u524d\u7aef\u63a8\u8350 React 18+ \u914d\u5408 TypeScript...',
        children: [
          {
            id: 'u2', role: 'user', label: '\u7528\u6237', branchId: 'main',
            preview: '\u524d\u7aef\u67b6\u6784\u5177\u4f53\u600e\u4e48\u8bbe\u8ba1\uff1f\u7279\u522b\u662f\u72b6\u6001\u7ba1\u7406\u548c\u7ec4\u4ef6\u62c6\u5206\u8fd9\u5757\u3002',
            children: [
              {
                id: 'a2', role: 'assistant', label: '\u52a9\u624b', branchId: 'main', model: 'Gemini 3 Pro',
                preview: '\u63a8\u8350\u4f7f\u7528 zustand \u505a\u72b6\u6001\u7ba1\u7406\uff0c\u914d\u5408 immer \u5904\u7406\u5d4c\u5957\u72b6\u6001\u66f4\u65b0\u3002\u7ec4\u4ef6\u62c6\u5206\u4e3a ChatPanel\u3001MessageBubble\u3001InputArea...',
                children: [
                  {
                    id: 'u3', role: 'user', label: '\u7528\u6237', branchId: 'main',
                    preview: '\u6d41\u5f0f\u8f93\u51fa\u600e\u4e48\u5b9e\u73b0\uff1fSSE\u3001WebSocket \u8fd8\u662f fetch stream\uff1f',
                    children: [
                      // Branch point: user asks again and gets two different assistant answers
                      {
                        id: 'a3a', role: 'assistant', label: '\u52a9\u624b', branchId: 'main', model: 'Gemini 3 Pro',
                        preview: '\u63a8\u8350 SSE + ReadableStream \u65b9\u6848\u3002\u524d\u7aef\u4f7f\u7528 getReader() \u9010\u5757\u8bfb\u53d6\uff0c\u901a\u8fc7 TextDecoder \u89e3\u7801\u3002\u65ad\u7ebf\u91cd\u8fde\u4f7f\u7528\u5185\u7f6e\u673a\u5236\u3002',
                        children: [
                          {
                            id: 'u4', role: 'user', label: '\u7528\u6237', branchId: 'main',
                            preview: '\u7ed9\u51fa\u5177\u4f53\u7684\u4ee3\u7801\u5b9e\u73b0\uff0c\u5305\u542b\u524d\u7aef fetch \u6d41\u5f0f\u8bfb\u53d6\u548c\u540e\u7aef Express SSE \u63a8\u9001\u3002',
                            children: [
                              {
                                id: 'a4', role: 'assistant', label: '\u52a9\u624b', branchId: 'main', model: 'Gemini 3 Pro',
                                preview: 'async function streamChat(prompt) {\n  const res = await fetch("/api/chat", { method: "POST" });\n  const reader = res.body.getReader();\n  ...\n}',
                                children: [
                                  {
                                    id: 'u5', role: 'user', label: '\u7528\u6237', branchId: 'main',
                                    preview: '\u5bf9\u8bdd\u5206\u652f\u7ba1\u7406\u600e\u4e48\u5b9e\u73b0\uff1f\u8bf7\u591a\u4e2a\u52a9\u624b\u4ece\u4e0d\u540c\u89d2\u5ea6\u5206\u6790\u3002',
                                    children: [
                                      // Multi-assistant parallel
                                      {
                                        id: 'pa1', role: 'assistant', label: '\u52a9\u624b', branchId: 'main', model: 'Gemini 3 Pro', assistantName: '\u9ed8\u8ba4\u52a9\u624b',
                                        preview: '\u6838\u5fc3\u662f\u4e00\u68f5\u6811\uff0c\u6bcf\u4e2a\u8282\u70b9\u4ee3\u8868\u4e00\u6761\u6d88\u606f\u3002\u4f7f\u7528 Map \u5b58\u50a8\u8282\u70b9\uff0cactivePath \u8bb0\u5f55\u4ece\u6839\u5230\u53f6\u7684\u8def\u5f84\u3002',
                                        children: [],
                                      },
                                      {
                                        id: 'pa2', role: 'assistant', label: '\u52a9\u624b', branchId: 'branch-expert', model: 'DeepSeek R1', assistantName: '\u4ee3\u7801\u4e13\u5bb6',
                                        preview: '\u4f7f\u7528 zustand + immer \u5b9e\u73b0\u5206\u652f\u72b6\u6001\u7ba1\u7406\u3002Map \u5b58\u50a8\u8282\u70b9 O(1) \u67e5\u627e\uff0c\u5207\u6362\u5206\u652f\u53ea\u9700\u66f4\u65b0 activePath\u3002',
                                        children: [
                                          {
                                            id: 'pa2-u', role: 'user', label: '\u7528\u6237', branchId: 'branch-expert',
                                            preview: '\u80fd\u7ed9\u51fa zustand store \u7684\u5b8c\u6574\u4ee3\u7801\u5417\uff1f',
                                            children: [
                                              {
                                                id: 'pa2-a', role: 'assistant', label: '\u52a9\u624b', branchId: 'branch-expert', model: 'DeepSeek R1',
                                                preview: 'const useChatStore = create(immer((set, get) => ({\n  tree: new Map(),\n  activePath: [],\n  createBranch: ...\n})))',
                                                children: [],
                                              },
                                            ],
                                          },
                                        ],
                                      },
                                    ],
                                  },
                                ],
                              },
                            ],
                          },
                        ],
                      },
                      {
                        id: 'a3b', role: 'assistant', label: '\u52a9\u624b', branchId: 'branch-ws', model: 'GPT-4.1',
                        preview: '\u5efa\u8bae\u4f7f\u7528 WebSocket \u5b9e\u73b0\u53cc\u5411\u901a\u4fe1\uff0c\u5ba2\u6237\u7aef\u53ef\u4ee5\u968f\u65f6\u53d1\u9001 stop \u4fe1\u53f7\u6765\u4e2d\u65ad\u751f\u6210\u3002\u63a8\u8350\u4f7f\u7528 socket.io \u7b80\u5316\u8fde\u63a5\u7ba1\u7406\u3002',
                        children: [
                          {
                            id: 'u4b', role: 'user', label: '\u7528\u6237', branchId: 'branch-ws',
                            preview: 'WebSocket \u548c SSE \u7684\u6027\u80fd\u5bf9\u6bd4\u5982\u4f55\uff1f',
                            children: [
                              {
                                id: 'a4b', role: 'assistant', label: '\u52a9\u624b', branchId: 'branch-ws', model: 'GPT-4.1',
                                preview: 'WebSocket \u5ef6\u8fdf\u66f4\u4f4e(~1ms vs ~50ms)\uff0c\u652f\u6301\u53cc\u5411\u901a\u4fe1\u3002\u4f46 SSE \u66f4\u7b80\u5355\uff0c\u81ea\u52a8\u91cd\u8fde\uff0c\u9002\u5408\u5927\u90e8\u5206 AI \u804a\u5929\u573a\u666f\u3002',
                                children: [],
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
              // Branch: Vue alternative
              {
                id: 'a2-vue', role: 'assistant', label: '\u52a9\u624b', branchId: 'branch-vue', model: 'Claude 4 Sonnet',
                preview: 'Vue 3 + Composition API \u4e5f\u662f\u5f88\u597d\u7684\u9009\u62e9\u3002\u72b6\u6001\u7ba1\u7406\u63a8\u8350 Pinia\uff0c\u54cd\u5e94\u5f0f\u7cfb\u7edf\u5929\u7136\u652f\u6301\u7ec6\u7c92\u5ea6\u66f4\u65b0\u3002',
                children: [
                  {
                    id: 'u3-vue', role: 'user', label: '\u7528\u6237', branchId: 'branch-vue',
                    preview: 'Vue 3 \u548c React \u5728\u8fd9\u4e2a\u573a\u666f\u4e0b\u7684\u6027\u80fd\u5dee\u5f02\u5927\u5417\uff1f',
                    children: [
                      {
                        id: 'a3-vue', role: 'assistant', label: '\u52a9\u624b', branchId: 'branch-vue', model: 'Claude 4 Sonnet',
                        preview: '\u5728 AI \u804a\u5929\u573a\u666f\u4e0b\u5dee\u5f02\u4e0d\u5927\u3002Vue \u7684\u54cd\u5e94\u5f0f\u5728\u9891\u7e41\u66f4\u65b0\u5355\u4e2a\u6d88\u606f\u65f6\u7565\u6709\u4f18\u52bf\uff0cReact \u5728\u5927\u5217\u8868\u6e32\u67d3\u65f6\u914d\u5408\u865a\u62df\u6eda\u52a8\u66f4\u7075\u6d3b\u3002',
                        children: [],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  };
}

function buildFromMessages(messages: AssistantMessage[], modelName: string): BranchNode {
  if (messages.length === 0) return buildDefaultTree();

  const root: BranchNode = {
    id: 'root', role: 'user', label: '\u7528\u6237', branchId: 'main',
    preview: messages[0]?.content.slice(0, 120) || '\u5bf9\u8bdd\u5f00\u59cb',
    children: [],
  };

  let current = root;
  const msgList = messages.slice(1);

  msgList.forEach((msg, i) => {
    const child: BranchNode = {
      id: msg.id,
      role: msg.parallelResponses ? 'parallel' : (msg.role === 'user' ? 'user' : 'assistant'),
      label: msg.role === 'user' ? '\u7528\u6237' : '\u52a9\u624b',
      branchId: 'main',
      preview: msg.content?.slice(0, 120) || (msg.parallelResponses ? `${msg.parallelResponses.length} \u4e2a\u6a21\u578b\u5e76\u884c\u56de\u590d` : ''),
      model: msg.role === 'assistant' ? modelName : undefined,
      assistantName: msg.assistantLabel,
      children: [],
    };

    if (msg.parallelResponses) {
      child.children = msg.parallelResponses.map((pr, j) => ({
        id: pr.id,
        role: 'assistant' as const,
        label: '\u52a9\u624b',
        branchId: j === 0 ? 'main' : `branch-p${j}`,
        preview: pr.content.slice(0, 120),
        model: pr.modelName,
        assistantName: pr.assistantName,
        children: [],
      }));
      current.children.push(child.children.length > 0 ? { ...child, children: child.children } : child);
      // Continue from first parallel response
      if (child.children.length > 0) {
        current = child.children[0];
      }
    } else {
      current.children.push(child);

      // Add retry versions as sibling nodes
      if (msg.retryVersions && msg.retryVersions.length > 0) {
        msg.retryVersions.forEach((rv, rvIdx) => {
          const retryNode: BranchNode = {
            id: rv.id,
            role: 'assistant',
            label: '\u52a9\u624b',
            branchId: `retry-${msg.id}-${rvIdx + 1}`,
            preview: rv.content?.slice(0, 120) || `\u91cd\u8bd5\u7248\u672c ${rvIdx + 2}`,
            model: modelName,
            assistantName: rv.assistantLabel,
            children: [],
          };
          current.children.push(retryNode);
        });
      }

      current = child;
    }

    // Inject mock branch at msg index 3
    if (i === 3 && msgList.length > 5) {
      const parent = current;
      const branch: BranchNode = {
        id: `branch-alt-${i}`, role: 'assistant', label: '\u52a9\u624b', branchId: 'branch-alt',
        preview: '(GPT-4.1 \u91cd\u65b0\u751f\u6210) \u8ba9\u6211\u6362\u4e2a\u89d2\u5ea6\u5206\u6790\uff0c\u5efa\u8bae\u4f7f\u7528 Server Components \u6765\u51cf\u5c11\u5ba2\u6237\u7aef JavaScript \u4f53\u79ef\u3002',
        model: 'GPT-4.1',
        children: [],
      };
      // Add as sibling
      const gp = findParent(root, parent.id);
      if (gp) gp.children.push(branch);
    }
  });

  return root;
}

function findParent(root: BranchNode, childId: string): BranchNode | null {
  for (const c of root.children) {
    if (c.id === childId) return root;
    const r = findParent(c, childId);
    if (r) return r;
  }
  return null;
}

/** Collect all ancestor node IDs from root to targetId (inclusive), walking the tree. */
function collectAncestorIds(node: BranchNode, targetId: string): string[] | null {
  if (node.id === targetId) return [node.id];
  for (const child of node.children) {
    const path = collectAncestorIds(child, targetId);
    if (path) return [node.id, ...path];
  }
  return null;
}

/** Get messages up to and including the node with given ID. */
function getMessagesUpToNode(messages: AssistantMessage[], nodeId: string, tree: BranchNode): AssistantMessage[] {
  // The root node uses messages[0], subsequent nodes use messages[1..N] in order.
  // Node IDs match message IDs (except root which is 'root').
  const ancestorIds = collectAncestorIds(tree, nodeId);
  if (!ancestorIds) return messages;

  // Collect message IDs from ancestor path (skip 'root' which maps to messages[0])
  const nodeIdSet = new Set(ancestorIds);
  const result: AssistantMessage[] = [];

  // First message is always included (root)
  if (messages.length > 0) result.push(messages[0]);

  for (let i = 1; i < messages.length; i++) {
    const msg = messages[i];
    if (nodeIdSet.has(msg.id)) {
      result.push(msg);
      if (msg.id === nodeId) break; // Stop after the target node
    }
  }

  // If we didn't find by exact ID match (e.g. locally created nodes), return all messages
  if (result.length <= 1 && messages.length > 1) return messages;

  return result;
}

// ===========================
// Layout Engine
// ===========================

// Collect all node IDs on paths from root to any node with matching branchId
function collectActivePathIds(node: BranchNode, activeBranch: string): Set<string> {
  const result = new Set<string>();

  function walk(n: BranchNode): boolean {
    // Check if this node or any descendant belongs to the active branch
    let hasActiveBranch = n.branchId === activeBranch;
    for (const child of n.children) {
      if (walk(child)) hasActiveBranch = true;
    }
    if (hasActiveBranch) result.add(n.id);
    return hasActiveBranch;
  }

  walk(node);
  return result;
}

function computeLayout(
  node: BranchNode,
  collapsed: Set<string>,
  expandedNodes: Set<string>,
  activeNodeIds: Set<string>,
  depth: number = 0,
): LayoutNode {
  const isCollapsed = collapsed.has(node.id);
  const isExpanded = expandedNodes.has(node.id);
  const isActive = activeNodeIds.has(node.id);
  const h = isExpanded ? NODE_H_EXPANDED : NODE_H;

  const childLayouts: LayoutNode[] = [];
  if (!isCollapsed) {
    for (const child of node.children) {
      childLayouts.push(computeLayout(child, collapsed, expandedNodes, activeNodeIds, depth + 1));
    }
  }

  const layout: LayoutNode = {
    node,
    x: 0, y: 0,
    width: NODE_W,
    height: h,
    children: childLayouts,
    collapsed: isCollapsed,
    isActive,
  };

  return layout;
}

// Position the tree using a simple recursive algorithm
function positionTree(layout: LayoutNode, x: number, y: number): { maxX: number; maxY: number } {
  layout.x = x;
  layout.y = y;

  if (layout.children.length === 0 || layout.collapsed) {
    return { maxX: x + layout.width, maxY: y + layout.height };
  }

  const childY = y + layout.height + V_GAP;
  let maxX = x + layout.width;
  let maxY = childY;

  if (layout.children.length === 1) {
    const childX = x; // Centered under parent
    const r = positionTree(layout.children[0], childX, childY);
    maxX = Math.max(maxX, r.maxX);
    maxY = Math.max(maxY, r.maxY);
  } else {
    // Calculate total width of all children
    const childWidths = layout.children.map(c => getSubtreeWidth(c));
    const totalW = childWidths.reduce((s, w) => s + w, 0) + (layout.children.length - 1) * H_GAP;
    let startX = x + layout.width / 2 - totalW / 2;

    layout.children.forEach((child, i) => {
      const cw = childWidths[i];
      const childX = startX + cw / 2 - child.width / 2;
      const r = positionTree(child, childX, childY);
      maxX = Math.max(maxX, r.maxX);
      maxY = Math.max(maxY, r.maxY);
      startX += cw + H_GAP;
    });
  }

  return { maxX, maxY };
}

function getSubtreeWidth(layout: LayoutNode): number {
  if (layout.children.length === 0 || layout.collapsed) return layout.width;
  const childWidths = layout.children.map(c => getSubtreeWidth(c));
  const totalChildW = childWidths.reduce((s, w) => s + w, 0) + (layout.children.length - 1) * H_GAP;
  return Math.max(layout.width, totalChildW);
}

// ===========================
// SVG Connector Lines
// ===========================

function ConnectorLines({ layout }: { layout: LayoutNode }) {
  const lines: React.ReactNode[] = [];

  function drawConnectors(parent: LayoutNode) {
    if (parent.collapsed || parent.children.length === 0) return;

    const px = parent.x + parent.width / 2;
    const py = parent.y + parent.height;

    parent.children.forEach((child, i) => {
      const cx = child.x + child.width / 2;
      const cy = child.y;
      const isActive = child.isActive;

      const strokeColor = isActive ? 'var(--cherry-primary)' : 'var(--border)';
      const dashArray = isActive ? 'none' : '3,3';
      const strokeWidth = isActive ? 1.5 : 1;

      if (Math.abs(px - cx) < 1) {
        // Straight vertical line
        lines.push(
          <line
            key={`${parent.node.id}-${child.node.id}`}
            x1={px} y1={py} x2={cx} y2={cy}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={dashArray}
          />
        );
      } else {
        // Curved connector: vertical down, curve, horizontal, curve, vertical down
        const midY = py + (cy - py) / 2;
        const r = Math.min(CURVE_R, Math.abs(cx - px) / 2, (cy - py) / 4);
        const dir = cx > px ? 1 : -1;

        const path = [
          `M ${px} ${py}`,
          `L ${px} ${midY - r}`,
          `Q ${px} ${midY} ${px + dir * r} ${midY}`,
          `L ${cx - dir * r} ${midY}`,
          `Q ${cx} ${midY} ${cx} ${midY + r}`,
          `L ${cx} ${cy}`,
        ].join(' ');

        lines.push(
          <path
            key={`${parent.node.id}-${child.node.id}`}
            d={path}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={dashArray}
            strokeLinecap="round"
          />
        );
      }

      // Junction dot at child top
      lines.push(
        <circle
          key={`dot-${parent.node.id}-${child.node.id}`}
          cx={cx} cy={cy}
          r={1.5}
          fill={isActive ? 'var(--cherry-primary)' : 'var(--border)'}
        />
      );

      drawConnectors(child);
    });
  }

  drawConnectors(layout);
  return <g>{lines}</g>;
}

// ===========================
// Tree Node Component
// ===========================

function TreeNode({
  layout,
  collapsed,
  expandedNodes,
  activeBranch,
  pinnedBranches,
  onToggleCollapse,
  onToggleExpand,
  onSwitchBranch,
  onHover,
  onCreateNode,
  onSetActiveBranch,
  onPinBranch,
  onCopyBranch,
  onNodeContextMenu,
}: {
  layout: LayoutNode;
  collapsed: Set<string>;
  expandedNodes: Set<string>;
  activeBranch: string;
  pinnedBranches: Map<string, string>;
  onToggleCollapse: (id: string) => void;
  onToggleExpand: (id: string) => void;
  onSwitchBranch: (id: string) => void;
  onHover: (info: { x: number; y: number; preview: string } | null) => void;
  onCreateNode: (node: BranchNode) => void;
  onSetActiveBranch: (node: BranchNode) => void;
  onPinBranch: (node: BranchNode) => void;
  onCopyBranch: (node: BranchNode) => void;
  onNodeContextMenu: (e: React.MouseEvent, node: BranchNode) => void;
}) {
  const { node } = layout;
  const isActive = layout.isActive;
  const isNodeCollapsed = collapsed.has(node.id);
  const isNodeExpanded = expandedNodes.has(node.id);
  const hasChildren = node.children.length > 0;
  const isUser = node.role === 'user';
  const isParallel = node.role === 'parallel';

  // Colors from design tokens: --cherry-user, --cherry-assistant, --cherry-parallel
  const borderColor = isUser
    ? (isActive ? 'border-cherry-user/60' : 'border-cherry-user/20')
    : isParallel
      ? (isActive ? 'border-cherry-parallel/50' : 'border-cherry-parallel/15')
      : (isActive ? 'border-cherry-assistant/50' : 'border-cherry-assistant/20');

  const bgColor = isUser
    ? (isActive ? 'bg-cherry-user/8' : 'bg-cherry-user/3')
    : isParallel
      ? (isActive ? 'bg-cherry-parallel/6' : 'bg-cherry-parallel/3')
      : (isActive ? 'bg-cherry-assistant/8' : 'bg-cherry-assistant/3');

  const iconColor = isUser ? 'text-cherry-user' : isParallel ? 'text-cherry-parallel' : 'text-cherry-assistant';

  const childCount = countAll(node) - 1;
  const isBranchActive = activeBranch === node.branchId;
  const isBranchPinned = pinnedBranches.has(node.branchId);

  return (
    <div>
      {/* This node */}
      <div
        data-node
        className={`absolute select-none transition-all duration-150`}
        style={{ left: layout.x, top: layout.y, width: layout.width, height: isNodeExpanded ? NODE_H_EXPANDED : NODE_H }}
      >
        {/* Node pill */}
            <div
              className={`relative rounded-lg border cursor-pointer transition-all ${borderColor} ${bgColor} ${isActive ? 'shadow-sm' : ''}`}
              style={{ height: isNodeExpanded ? NODE_H_EXPANDED : NODE_H }}
              onClick={(e) => {
                e.stopPropagation();
                if (hasChildren) onToggleCollapse(node.id);
                else onToggleExpand(node.id);
                if (!isActive) onSwitchBranch(node.branchId);
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onNodeContextMenu(e, node);
              }}
              onMouseEnter={(e) => {
                if (!isNodeExpanded && node.preview) {
                  onHover({ x: e.clientX, y: e.clientY, preview: node.preview });
                }
              }}
              onMouseMove={(e) => {
                if (!isNodeExpanded && node.preview) {
                  onHover({ x: e.clientX, y: e.clientY, preview: node.preview });
                }
              }}
              onMouseLeave={() => onHover(null)}
            >
              {/* Top row: icon + label */}
              <div className="flex items-center gap-1.5 px-2 h-[22px]">
                <div className={`flex-shrink-0 ${iconColor}`}>
                  {isUser ? <User size={10} strokeWidth={2} /> : isParallel ? <Layers size={10} strokeWidth={1.5} /> : <Bot size={10} strokeWidth={1.5} />}
                </div>
                <span className={`text-xs truncate ${isActive ? 'text-foreground' : 'text-muted-foreground/60'}`}>
                  {node.assistantName || node.label}
                </span>
                {node.model && !isParallel && (
                  <span className="text-xs text-muted-foreground/50 truncate ml-auto">{node.model.split(' ').pop()}</span>
                )}
                {isParallel && node.parallelCount && (
                  <span className="text-xs text-accent-amber/40 ml-auto">{node.parallelCount}x</span>
                )}
              </div>

              {/* Always-visible 2-line preview */}
              {node.preview && !isNodeExpanded && (
                <div className="px-2 pb-1.5">
                  <p className="text-xs text-muted-foreground/40 leading-[1.4] line-clamp-2 break-all">{node.preview}</p>
                </div>
              )}

              {/* Expanded preview (full) */}
              {isNodeExpanded && (
                <div className="px-2 pb-1.5">
                  <p className="text-xs text-muted-foreground/40 leading-[1.5] line-clamp-3">{node.preview}</p>
                </div>
              )}

              {/* Collapse indicator */}
              {isNodeCollapsed && hasChildren && (
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-3 rounded-b-md bg-muted-foreground/5 border border-t-0 border-border/10 flex items-center justify-center">
                  <span className="text-xs text-muted-foreground/50">{childCount}</span>
                </div>
              )}

              {/* Active pulse line */}
              {isActive && (
                <motion.div
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-3 rounded-full bg-cherry-primary"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                />
              )}
            </div>
      </div>

      {/* Recurse children */}
      {!isNodeCollapsed && layout.children.map(child => (
        <TreeNode
          key={child.node.id}
          layout={child}
          collapsed={collapsed}
          expandedNodes={expandedNodes}
          activeBranch={activeBranch}
          pinnedBranches={pinnedBranches}
          onToggleCollapse={onToggleCollapse}
          onToggleExpand={onToggleExpand}
          onSwitchBranch={onSwitchBranch}
          onHover={onHover}
          onCreateNode={onCreateNode}
          onSetActiveBranch={onSetActiveBranch}
          onPinBranch={onPinBranch}
          onCopyBranch={onCopyBranch}
          onNodeContextMenu={onNodeContextMenu}
        />
      ))}
    </div>
  );
}

function countAll(node: BranchNode): number {
  let c = 1;
  for (const child of node.children) c += countAll(child);
  return c;
}

// Collect the first N nodes along a branch path
function collectBranchPreview(root: BranchNode, branchId: string, maxCount: number = 2): BranchNode[] {
  const result: BranchNode[] = [];

  function walk(node: BranchNode): boolean {
    if (result.length >= maxCount) return true;
    // Include nodes on the active branch path
    if (node.branchId === branchId) {
      result.push(node);
      if (result.length >= maxCount) return true;
    }
    for (const child of node.children) {
      if (walk(child)) return true;
    }
    return false;
  }

  walk(root);
  return result;
}

// ===========================
// Hover Tooltip
// ===========================

function HoverTooltip({ info }: { info: { x: number; y: number; preview: string } | null }) {
  if (!info) return null;
  return (
    <div
      className="fixed z-[var(--z-tooltip)] max-w-[260px] px-3 py-2 rounded-lg bg-popover border border-border/50 shadow-lg pointer-events-none"
      style={{ left: info.x + 14, top: info.y - 10, transform: 'translateY(-100%)' }}
    >
      <p className="text-xs text-foreground leading-[1.6] whitespace-pre-wrap line-clamp-5">{info.preview}</p>
    </div>
  );
}

// ===========================
// Main Panel
// ===========================

interface BranchTreePanelProps {
  messages: AssistantMessage[];
  onClose: () => void;
  assistantName: string;
  modelName: string;
  topicName?: string;
  /** Called when active branch changes (e.g. new node created, branch switched) */
  onBranchChange?: (branchId: string, newNode?: BranchNode) => void;
  /** Called when user copies a branch node as a new topic. Receives messages up to (and including) the node. */
  onCopyAsTopic?: (messagesUpToNode: AssistantMessage[], sourceNodeId: string) => void;
}

export function BranchTreePanel({ messages, onClose, assistantName, modelName, topicName, onBranchChange, onCopyAsTopic }: BranchTreePanelProps) {
  const [scale, setScale] = useState(0.9);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [activeBranch, setActiveBranch] = useState('main');
  const [mainBranch, setMainBranch] = useState('main');
  const [hoverInfo, setHoverInfo] = useState<{ x: number; y: number; preview: string } | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  // Pinned branch tabs: Map<branchId, displayName> — only pinned branches show as tabs
  const [pinnedBranches, setPinnedBranches] = useState<Map<string, string>>(new Map());
  // Rename dialog state
  const [renamingBranch, setRenamingBranch] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  // Mock counter for new nodes
  const [newNodeCounter, setNewNodeCounter] = useState(0);
  // Locally created branch nodes: map of parentId -> new child nodes
  const [localNodes, setLocalNodes] = useState<Map<string, BranchNode[]>>(new Map());
  // Toast message
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  // Custom node context menu (replaces Radix ContextMenu which doesn't work inside scaled canvas)
  const [nodeMenu, setNodeMenu] = useState<{ x: number; y: number; node: BranchNode } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);

  const baseTree = useMemo(
    () => buildFromMessages(messages, modelName),
    [messages, modelName]
  );

  // Merge locally created nodes into the tree
  const tree = useMemo(() => {
    if (localNodes.size === 0) return baseTree;
    const merge = (node: BranchNode): BranchNode => {
      const extras = localNodes.get(node.id) || [];
      const mergedChildren = [...node.children.map(merge), ...extras];
      return { ...node, children: mergedChildren };
    };
    return merge(baseTree);
  }, [baseTree, localNodes]);

  // Reset view state when messages change (topic switch)
  const prevMessagesRef = useRef(messages);
  useEffect(() => {
    if (prevMessagesRef.current !== messages) {
      prevMessagesRef.current = messages;
      setCollapsed(new Set());
      setExpandedNodes(new Set());
      setActiveBranch('main');
      setPosition({ x: 0, y: 0 });
      setScale(0.9);
      setLocalNodes(new Map());
    }
  }, [messages]);

  // Compute layout
  const { layout, treeW, treeH, branches, totalNodes } = useMemo(() => {
    const l = computeLayout(tree, collapsed, expandedNodes, collectActivePathIds(tree, activeBranch));
    const { maxX, maxY } = positionTree(l, 0, 0);
    // Collect branches
    const bset = new Set<string>();
    let count = 0;
    const walk = (n: BranchNode) => { bset.add(n.branchId); count++; n.children.forEach(walk); };
    walk(tree);
    return { layout: l, treeW: maxX, treeH: maxY, branches: Array.from(bset), totalNodes: count };
  }, [tree, collapsed, expandedNodes, activeBranch]);

  // Toggle collapse (fold/unfold children)
  const handleToggleCollapse = useCallback((id: string) => {
    setCollapsed(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // Toggle inline preview expand
  const handleToggleExpand = useCallback((id: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    setCollapsed(new Set());
  }, []);

  const collapseAll = useCallback(() => {
    const ids = new Set<string>();
    const walk = (n: BranchNode) => {
      if (n.children.length > 0) ids.add(n.id);
      n.children.forEach(walk);
    };
    walk(tree);
    setCollapsed(ids);
  }, [tree]);

  const zoomIn = () => setScale(s => Math.min(s + 0.15, 2.5));
  const zoomOut = () => setScale(s => Math.max(s - 0.15, 0.3));
  const fitView = () => { setScale(0.85); setPosition({ x: 0, y: 0 }); };

  // Canvas drag (only left button, skip right-click and node clicks)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // only left click
    if ((e.target as HTMLElement).closest('[data-node]')) return;
    setDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragging) return;
    setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  }, [dragging, dragStart]);

  const handleMouseUp = useCallback(() => setDragging(false), []);

  useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragging, handleMouseMove, handleMouseUp]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    // Only zoom on actual wheel scroll (deltaMode 0 = pixel), not synthetic events
    if (e.ctrlKey || Math.abs(e.deltaY) > 0) {
      e.stopPropagation();
      const delta = e.deltaY > 0 ? -0.06 : 0.06;
      setScale(s => Math.min(Math.max(s + delta, 0.3), 2.5));
    }
  }, []);

  // Panel sizing
  const panelClasses = isFullscreen
    ? 'absolute inset-2 z-[var(--z-popover)] rounded-2xl'
    : 'absolute right-2 top-2 bottom-2 w-[380px] z-[var(--z-overlay)] rounded-2xl';

  // Close node context menu on any click
  useEffect(() => {
    if (!nodeMenu) return;
    const handler = () => setNodeMenu(null);
    document.addEventListener('click', handler);
    document.addEventListener('contextmenu', handler);
    return () => { document.removeEventListener('click', handler); document.removeEventListener('contextmenu', handler); };
  }, [nodeMenu]);

  const handleNodeContextMenu = useCallback((e: React.MouseEvent, node: BranchNode) => {
    setNodeMenu({ x: e.clientX, y: e.clientY, node });
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20, scale: 0.97 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.97 }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
      className={`${panelClasses} bg-background border border-border/30 shadow-2xl flex flex-col overflow-hidden`}
      ref={panelRef}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 h-[36px] border-b border-border/30 flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <GitBranch size={11} className="text-muted-foreground/60 flex-shrink-0" />
          <span className="text-xs text-foreground flex-shrink-0">{'\u5206\u652f\u7ba1\u7406'}</span>
          {topicName && (
            <span className="text-xs text-muted-foreground/50 truncate max-w-[120px]" title={topicName}>{'\u00b7'} {topicName}</span>
          )}
          <span className="text-xs text-muted-foreground/50 ml-0.5 flex-shrink-0">{branches.length} {'\u5206\u652f'} {'\u00b7'} {totalNodes} {'\u8282\u70b9'}</span>
        </div>
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? '\u8fd8\u539f' : '\u6700\u5927\u5316'}
          >
            {isFullscreen ? <Minimize2 size={11} /> : <Maximize2 size={11} />}
          </Button>
          <Button variant="ghost" size="icon-xs" onClick={onClose}>
            <X size={12} />
          </Button>
        </div>
      </div>

      {/* Branch tabs: only "活跃分支" by default; pinned branches show as named tabs */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-border/15 overflow-x-auto scrollbar-hide flex-shrink-0">
        {/* Active branch tab — always visible */}
        <Button
          variant="ghost"
          size="xs"
          onClick={() => setActiveBranch(activeBranch)}
          className="gap-1 px-2 py-[3px] text-xs whitespace-nowrap flex-shrink-0 bg-cherry-active-bg text-cherry-primary-dark border border-cherry-ring"
        >
          <Star size={8} className="text-cherry-primary flex-shrink-0" />
          {'\u6d3b\u8dc3\u5206\u652f'}
        </Button>
        {/* Pinned branch tabs — appear when user pins from context menu */}
        {Array.from(pinnedBranches.entries()).map(([bid, displayName]) => {
          const isCurrent = activeBranch === bid;
          const isMain = mainBranch === bid;
          return (
            <ContextMenu key={bid}>
              <ContextMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => setActiveBranch(bid)}
                  className={`gap-1 px-2 py-[3px] text-xs whitespace-nowrap flex-shrink-0 ${
                    isCurrent
                      ? 'bg-accent/25 text-foreground border border-border/30'
                      : 'text-muted-foreground/40 hover:text-foreground hover:bg-accent/15 border border-transparent'
                  }`}
                >
                  <GitBranch size={8} className={`flex-shrink-0 ${isCurrent ? 'text-muted-foreground' : 'text-muted-foreground/50'}`} />
                  {displayName}
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPinnedBranches(prev => {
                        const next = new Map(prev);
                        next.delete(bid);
                        return next;
                      });
                    }}
                    className="ml-0.5 p-0 text-muted-foreground/50 hover:text-foreground"
                  >
                    <X size={7} />
                  </Button>
                </Button>
              </ContextMenuTrigger>
              <ContextMenuContent className="min-w-[140px]">
                <ContextMenuItem
                  onSelect={() => setActiveBranch(bid)}
                  disabled={isCurrent}
                  className="gap-2.5 text-xs"
                >
                  <GitBranch size={11} className="text-muted-foreground" />
                  {'\u5207\u6362\u5230\u6b64\u5206\u652f'}
                  {isCurrent && <Check size={9} className="text-cherry-primary ml-auto" />}
                </ContextMenuItem>
                <ContextMenuItem
                  onSelect={() => setMainBranch(bid)}
                  disabled={isMain}
                  className="gap-2.5 text-xs"
                >
                  <Crown size={11} className="text-accent-amber/70" />
                  {'\u8bbe\u4e3a\u4e3b\u7ebf'}
                  {isMain && <Check size={9} className="text-cherry-primary ml-auto" />}
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          );
        })}
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className={`flex-1 overflow-hidden relative ${dragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onMouseDown={handleMouseDown}
        onWheel={handleWheel}
        onContextMenu={(e) => {
          // Allow right-click context menu on nodes, prevent on canvas background
          if (!(e.target as HTMLElement).closest('[data-node]')) {
            e.preventDefault();
          }
        }}
      >
        {/* Dot grid background */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle, var(--color-border) 0.3px, transparent 0.3px)',
          backgroundSize: `${14 * scale}px ${14 * scale}px`,
          opacity: 0.1,
        }} />

        {/* Tree content - SVG + nodes */}
        <div
          className="absolute"
          style={{
            left: '50%',
            top: 30,
            transform: `translate(calc(-50% + ${position.x}px), ${position.y}px) scale(${scale})`,
            transformOrigin: 'center top',
            width: treeW + 40,
            height: treeH + 40,
            padding: 20,
          }}
        >
          {/* SVG connector layer */}
          <svg
            className="absolute inset-0 pointer-events-none"
            style={{ width: treeW + 40, height: treeH + 40, overflow: 'visible' }}
          >
            <g transform="translate(20, 20)">
              <ConnectorLines layout={layout} />
            </g>
          </svg>

          {/* Nodes layer */}
          <div className="absolute" style={{ left: 20, top: 20 }}>
            <TreeNode
              layout={layout}
              collapsed={collapsed}
              expandedNodes={expandedNodes}
              activeBranch={activeBranch}
              pinnedBranches={pinnedBranches}
              onToggleCollapse={handleToggleCollapse}
              onToggleExpand={handleToggleExpand}
              onSwitchBranch={(branchId) => { setActiveBranch(branchId); onBranchChange?.(branchId); }}
              onHover={setHoverInfo}
              onCreateNode={(node) => {
                const counter = newNodeCounter + 1;
                setNewNodeCounter(counter);
                const newBranchId = `branch-new-${counter}`;
                const newNode: BranchNode = {
                  id: `new-node-${counter}`,
                  role: node.role === 'user' ? 'user' : 'assistant',
                  label: node.label,
                  branchId: newBranchId,
                  preview: node.preview || `新分支节点 #${counter}`,
                  model: node.model || modelName,
                  assistantName: node.assistantName,
                  children: [],
                };
                const parentId = findParent(tree, node.id)?.id;
                if (parentId) {
                  setLocalNodes(prev => {
                    const next = new Map(prev);
                    const existing = next.get(parentId) || [];
                    next.set(parentId, [...existing, newNode]);
                    return next;
                  });
                } else {
                  setLocalNodes(prev => {
                    const next = new Map(prev);
                    const existing = next.get(node.id) || [];
                    next.set(node.id, [...existing, newNode]);
                    return next;
                  });
                }
                setActiveBranch(newBranchId);
                onBranchChange?.(newBranchId);
                showToast('已创建新分支并切换');
              }}
              onSetActiveBranch={(node) => {
                setActiveBranch(node.branchId);
                onBranchChange?.(node.branchId);
                showToast(`已切换到分支: ${node.branchId === 'main' ? '主线' : node.branchId}`);
              }}
              onPinBranch={(node) => {
                const bid = node.branchId;
                if (!pinnedBranches.has(bid)) {
                  const defaultName = bid === 'main' ? '\u4e3b\u7ebf'
                    : bid.replace('branch-', '').replace('ws', 'WebSocket').replace('vue', 'Vue').replace('alt', '\u91cd\u65b0\u751f\u6210').replace('expert', '\u4ee3\u7801\u4e13\u5bb6');
                  setRenamingBranch(bid);
                  setRenameValue(defaultName);
                }
              }}
              onCopyBranch={() => {
                showToast(`\u5df2\u590d\u5236\u5206\u652f\u4e3a\u65b0\u8bdd\u9898`);
              }}
              onNodeContextMenu={handleNodeContextMenu}
            />
          </div>
        </div>

        {/* Bottom-left: Zoom & expand/collapse controls */}
        <div className="absolute bottom-3 left-3 flex flex-col bg-card/90 border border-border/25 rounded-lg overflow-hidden shadow-sm">
          <Button variant="ghost" size="icon-xs" onClick={expandAll} className="p-1.5 rounded-none border-b border-border/15" title={'\u5168\u90e8\u5c55\u5f00'}>
            <UnfoldVertical size={11} className="text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="icon-xs" onClick={collapseAll} className="p-1.5 rounded-none border-b border-border/15" title={'\u5168\u90e8\u6298\u53e0'}>
            <FoldVertical size={11} className="text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="icon-xs" onClick={zoomIn} className="p-1.5 rounded-none border-b border-border/15">
            <ZoomIn size={11} className="text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="icon-xs" onClick={zoomOut} className="p-1.5 rounded-none border-b border-border/15">
            <ZoomOut size={11} className="text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="icon-xs" onClick={fitView} className="p-1.5 rounded-none">
            <Maximize2 size={10} className="text-muted-foreground" />
          </Button>
        </div>

        {/* Bottom-right: label */}
        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          <span className="text-xs text-muted-foreground/50 tabular-nums">{Math.round(scale * 100)}%</span>
          <span className="text-xs text-muted-foreground/50">{'\u804a\u5929\u5386\u53f2'}</span>
        </div>

        {/* Legend */}
        <div className="absolute top-3 right-3 flex items-center gap-3 text-xs text-muted-foreground/50">
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-cherry-user/60" />
            <span>{'\u7528\u6237'}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-cherry-assistant/60" />
            <span>{'\u52a9\u624b'}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 border-t border-dashed border-muted-foreground/30" />
            <span>{'\u975e\u6d3b\u8dc3'}</span>
          </div>
        </div>
      </div>

      {/* Hover tooltip */}
      <HoverTooltip info={hoverInfo} />

      {/* Rename dialog for pinning a branch as a tab */}
      <AnimatePresence>
        {renamingBranch && (
          <div>
            <div className="absolute inset-0 z-[var(--z-overlay)] bg-foreground/20" onClick={() => setRenamingBranch(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.12 }}
              className="absolute z-[var(--z-modal)] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-popover border border-border/40 rounded-xl shadow-2xl p-4 w-[240px]"
            >
              <p className="text-xs text-foreground mb-2">{'\u8bbe\u7f6e\u5206\u652f\u6807\u7b7e\u540d\u79f0'}</p>
              <Input
                ref={renameInputRef}
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && renameValue.trim() && renamingBranch) {
                    setPinnedBranches(prev => {
                      const next = new Map(prev);
                      next.set(renamingBranch, renameValue.trim());
                      return next;
                    });
                    setActiveBranch(renamingBranch);
                    showToast(`\u5df2\u56fa\u5b9a\u5206\u652f: ${renameValue.trim()}`);
                    setRenamingBranch(null);
                  }
                  if (e.key === 'Escape') setRenamingBranch(null);
                }}
                autoFocus
                className="w-full px-2.5 py-1.5 text-xs"
                placeholder={'\u8f93\u5165\u5206\u652f\u540d\u79f0'}
              />
              <div className="flex items-center gap-2 mt-3">
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => setRenamingBranch(null)}
                  className="flex-1 px-3 py-1.5 text-xs border border-border/30 text-muted-foreground"
                >
                  {'\u53d6\u6d88'}
                </Button>
                <Button
                  variant="default"
                  size="xs"
                  onClick={() => {
                    if (renameValue.trim() && renamingBranch) {
                      setPinnedBranches(prev => {
                        const next = new Map(prev);
                        next.set(renamingBranch, renameValue.trim());
                        return next;
                      });
                      setActiveBranch(renamingBranch);
                      showToast(`\u5df2\u56fa\u5b9a\u5206\u652f: ${renameValue.trim()}`);
                      setRenamingBranch(null);
                    }
                  }}
                  className="flex-1 px-3 py-1.5 text-xs"
                >
                  {'\u786e\u5b9a'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[var(--z-modal)] px-4 py-2 rounded-lg bg-foreground/90 text-background text-xs shadow-lg pointer-events-none"
          >
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom node context menu (fixed position, works inside scaled canvas) */}
      {nodeMenu && (
        <div
          className="fixed z-[9999] bg-popover border border-border rounded-lg shadow-popover py-1 px-1 animate-in fade-in zoom-in-95 duration-100 min-w-[160px]"
          style={{ left: nodeMenu.x, top: nodeMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          {nodeMenu.node.role !== 'user' && (
            <button
              onClick={() => {
                const sourceNode = nodeMenu.node;
                const counter = newNodeCounter + 1;
                setNewNodeCounter(counter);
                const newBranchId = `branch-new-${counter}`;
                const newNode: BranchNode = {
                  id: `new-node-${counter}`,
                  role: sourceNode.role === 'user' ? 'user' : 'assistant',
                  label: sourceNode.label,
                  branchId: newBranchId,
                  preview: sourceNode.preview || `新分支节点 #${counter}`,
                  model: sourceNode.model || modelName,
                  assistantName: sourceNode.assistantName,
                  children: [],
                };
                const parentId = findParent(tree, sourceNode.id)?.id;
                if (parentId) {
                  setLocalNodes(prev => {
                    const next = new Map(prev);
                    const existing = next.get(parentId) || [];
                    next.set(parentId, [...existing, newNode]);
                    return next;
                  });
                } else {
                  setLocalNodes(prev => {
                    const next = new Map(prev);
                    const existing = next.get(sourceNode.id) || [];
                    next.set(sourceNode.id, [...existing, newNode]);
                    return next;
                  });
                }
                setActiveBranch(newBranchId);
                showToast('已创建新分支并切换');
                setNodeMenu(null);
              }}
              className="flex items-center gap-2.5 w-full px-2.5 py-[5px] text-xs text-foreground/80 hover:bg-accent/30 rounded-md transition-colors cursor-pointer text-left"
            >
              <Plus size={11} className="text-cherry-primary" />
              创建新节点
            </button>
          )}
          <button
            onClick={() => {
              setActiveBranch(nodeMenu.node.branchId);
              onBranchChange?.(nodeMenu.node.branchId);
              showToast(`已切换到分支: ${nodeMenu.node.branchId === 'main' ? '主线' : nodeMenu.node.branchId}`);
              setNodeMenu(null);
            }}
            disabled={activeBranch === nodeMenu.node.branchId}
            className="flex items-center gap-2.5 w-full px-2.5 py-[5px] text-xs text-foreground/80 hover:bg-accent/30 rounded-md transition-colors cursor-pointer text-left disabled:opacity-40 disabled:cursor-default"
          >
            <Star size={11} className="text-accent-amber/70" />
            设置为活跃分支
            {activeBranch === nodeMenu.node.branchId && <Check size={9} className="text-cherry-primary ml-auto" />}
          </button>
          <button
            onClick={() => {
              const bid = nodeMenu.node.branchId;
              if (!pinnedBranches.has(bid)) {
                const defaultName = bid === 'main' ? '主线' : bid.replace('branch-', '').replace('ws', 'WebSocket').replace('vue', 'Vue').replace('alt', '重新生成').replace('expert', '代码专家');
                setRenamingBranch(bid);
                setRenameValue(defaultName);
              }
              setNodeMenu(null);
            }}
            disabled={pinnedBranches.has(nodeMenu.node.branchId)}
            className="flex items-center gap-2.5 w-full px-2.5 py-[5px] text-xs text-foreground/80 hover:bg-accent/30 rounded-md transition-colors cursor-pointer text-left disabled:opacity-40 disabled:cursor-default"
          >
            <Pencil size={11} className="text-muted-foreground" />
            固定为标签
            {pinnedBranches.has(nodeMenu.node.branchId) && <Check size={9} className="text-cherry-primary ml-auto" />}
          </button>
          <div className="h-px bg-border/30 my-0.5" />
          <button
            onClick={() => {
              if (onCopyAsTopic) {
                const truncatedMessages = getMessagesUpToNode(messages, nodeMenu.node.id, tree);
                onCopyAsTopic(truncatedMessages, nodeMenu.node.id);
              }
              showToast('已复制为新话题');
              setNodeMenu(null);
            }}
            className="flex items-center gap-2.5 w-full px-2.5 py-[5px] text-xs text-foreground/80 hover:bg-accent/30 rounded-md transition-colors cursor-pointer text-left"
          >
            <Copy size={11} className="text-muted-foreground" />
            复制为新话题
          </button>
        </div>
      )}
    </motion.div>
  );
}