# 输入框文件去重 Popover — 设计文档

- **日期**：2026-05-29
- **分支**：`eurfelux/input-file`
- **参考**：[CherryHQ/cherry-studio#15400](https://github.com/CherryHQ/cherry-studio/issues/15400)（内容级去重；本 demo 取其"让用户选择如何处理"的 UI 变体）

## 1. 目标

在聊天输入框区域加入一个**可交互的 demo**：用户上传文件后，当 main（后端）在自己的存储里发现**内容相同**的已存副本时，以 popover 形式给出三个处理选项，并支持完整键盘操作。

### 必须满足
- 以 **popover** 形式呈现，**悬浮在输入栏正上方**、**与输入栏不相交**（留间隙）。
- 三个选项：`1. 复用已有的文件`、`2. 覆盖已有的文件`、`3. 二者都保留`。
- 正文：`发现内容相同的文件 {fileName}，请决定如何处理`。
- 键盘 `1 / 2 / 3` 作为快捷键**直接选择并确认**。
- 键盘**方向键 `↑/↓` 移动高亮 + `Enter` 确认**。
- 默认高亮**复用已有的文件**。
- 用户**决策完成前**，输入栏即出现一枚 **loading 态 file chip**（表示文件已上传、正等待 main 处理 / 用户决策）；确认后 resolve 成最终态，取消则移除。

### 非目标
- 不接真实后端 / 不做真实文件哈希（本仓库是纯 UI 原型，全部 mock）。
- 不实现 issue #15400 里的 `contentHash` 数据库方案。
- 不改动 RichComposer / Popover 的对外 API。`InlineAttachmentChip` / `ComposerAttachment` **新增一个向后兼容的可选字段 `loading?`**（见 §5.3）；chip 的"复用/覆盖/双份"徽标仍为可选增强、默认不做。
- 不弹 toast / 通知——chip 的 loading→最终态变化即反馈。

## 2. 关键语义（来自用户澄清）

"已存在"指**文件已在 main-side 存储过**，而非输入栏里已有 chip。用户这次上传的文件，无论选哪个，**都会在输入栏里变成一枚附件 chip**（用户本就要把它附到消息里）；三个选项的差别只在 **main-side 存储**：

| 选项 | main-side 行为 | 输入栏结果 |
|---|---|---|
| 复用已有 | 直接引用 main 已存的那份，不写新文件 | 加 1 枚 chip |
| 覆盖已有 | 把本次文件上传到 main 覆盖那份，再拿回可消费对象（仍一份） | 加 1 枚 chip |
| 二者都保留 | 也用本次上传的，但 main 存两份相同文件（新文件为默认） | 加 1 枚 chip |

→ 三种情况输入栏都**只加一枚 chip**（loading → 最终态），视觉结果一致（差别只在后端）。**这枚 chip 的状态变化本身就是反馈，不额外弹 toast。**

## 3. 落点

实际可见的聊天输入栏在 `src/app/components/assistant/AssistantRunPage.tsx`（`MainContent` 在 `menuItemId === 'chat'` 时渲染 `AssistantRunPage`；`HomePage`/`ChatPage` 未接入路由，忽略）。

输入栏已有一套 **mock 附件系统**可复用：
- `inlineAttachments: ComposerAttachment[]`（state，约 `line 1918`）—— 预置 3 枚 chip。
- `demoAttachmentPool`（ref，约 `line 1943`）—— 5 个演示文件池 + `demoPoolCursor` 游标。
- `addDemoAttachment`（约 `line 1952`）—— 取池中下一个并 append。
- `removeInlineAttachment`（约 `line 1961`）。
- 输入栏容器：`line 2425` 的 `<div className="relative rounded-xl border ...">`，内部已用 `absolute bottom-full mb-1` 放置 slash / @ 菜单（"浮在输入栏上方"的现成范式）。

附件入口（两处，均接入去重流程）：
- 全工具栏模式：Paperclip 按钮 `line 2631`，现 `onClick={addDemoAttachment}`。
- 极简输入模式：「添加图片或附件」`DropdownMenuItem` `line 2570`，**当前无 onClick**。

## 4. 方案选型

popover 实现采用**设计系统的 Radix `Popover` + `PopoverAnchor`**（`@cherry-studio/ui`，`packages/ui/src/components/ui/popover.tsx`），而非仿 slash/@ 的 `absolute bottom-full` 定位 div：

- Radix Popover 打开时自动把焦点移入 content（`onOpenAutoFocus`），`1/2/3`/方向键等**不会漏进 contentEditable 输入框**；关闭时把焦点交还输入框。
- `side="top"` + `sideOffset` 天然满足"悬浮上方、留间隙、不相交"。
- 是真正的 "popover"，样式（`shadow-popover`、动画、`z-[var(--z-popover)]`）与项目一致。

定位被 div 方案的劣势：需手动管焦点或加全局 keydown 监听，`1/2/3` 容易误入输入框。

## 5. 架构与数据流

### 5.1 新组件 `DuplicateFilePopover`（自包含）

文件：`src/app/components/shared/Chat/DuplicateFilePopover.tsx`

```ts
type DuplicateChoice = 'reuse' | 'overwrite' | 'keep-both';

interface DuplicateFilePopoverProps {
  /** 非 null 即打开；携带本次"上传"文件名用于正文。 */
  state: { fileName: string } | null;
  /** 用户确认某选项。 */
  onResolve: (choice: DuplicateChoice) => void;
  /** Esc / 点外部 / 关闭 = 取消上传（不加 chip）。 */
  onCancel: () => void;
  /** 锚点：输入栏容器，作为 PopoverAnchor 的 asChild 子元素。 */
  children: React.ReactNode;
}
```

渲染结构：

```tsx
<Popover open={state !== null} onOpenChange={(o) => { if (!o && confirmed === null) onCancel(); }}>
  <PopoverAnchor asChild>{children}</PopoverAnchor>
  {state !== null && (
    <PopoverContent
      side="top"
      align="start"
      sideOffset={10}
      avoidCollisions={false}   /* 永远在上方，不翻到下面 */
      className="w-80 p-0"       /* 自定义内边距，容纳标题/选项/页脚 */
      onKeyDown={handleKey}
      onCloseAutoFocus={(e) => e.preventDefault()}   /* 阻止 Radix 默认聚焦锚点；焦点由父级 composerRef.focus() 接管 */
    >
      …标题 + 三选项 + 页脚提示…
    </PopoverContent>
  )}
</Popover>
```

内容布局（沿用设计系统 token：`bg-popover`、`text-popover-foreground`、`bg-accent` 高亮、`text-muted-foreground` 副文案）：
- **标题区**：`发现内容相同的文件 ` + `<span 文件名 medium>` ；下一行副文案 `请决定如何处理`。
- **三选项**：每行 = 数字徽标 `1/2/3` + 文案；高亮行底色 `bg-accent` 且右侧显示 `⏎`。鼠标 hover 同步更新高亮 index。点击该行 = `confirm`。**被确认的那行**：数字徽标换成 success `✓`（`Check`，`text-success` + `animate-in zoom-in-50` 弹入），随后整个 popover 才关闭（见 §6 确认动画）。
- **页脚**：`1 / 2 / 3 快捷选择 · ↑↓ 移动 · Enter 确认 · Esc 取消`（`text-muted-foreground` 小字）。

内部状态：
- `highlight: number`（0/1/2），`state` 变为非 null 时（`useEffect`）重置为 **0（复用）**。
- `confirmed: number | null`：已选中的选项 index（进入 success 动画）；`null` = 尚未确认。`state` 变非 null 时一并重置为 `null`。
- `timerRef`：动画后触发 `onResolve` 的定时器；组件卸载 / 重开时 `clearTimeout`。

统一确认入口 `confirm(index)`（确认即播动画、延迟关闭，见 §6）：
```ts
const confirm = (index: number) => {
  if (confirmed !== null) return;                 // 动画进行中，忽略
  setConfirmed(index);                            // 触发该选项徽标的 success ✓ 动画
  timerRef.current = window.setTimeout(() => onResolve(OPTIONS[index].choice), 600);
};
```

键盘处理 `handleKey`（全部 `preventDefault` + `stopPropagation`，防漏进输入框；`confirmed !== null` 时直接吞掉所有按键）：
- `'1' | '2' | '3'` → `confirm(n - 1)`。
- `ArrowUp` → `highlight = (highlight + 2) % 3`；`ArrowDown` → `(highlight + 1) % 3`（循环）。
- `Enter` → `confirm(highlight)`。
- `Escape` → 交由 Radix 触发 `onOpenChange(false)` → `onCancel`（仅当 `confirmed === null`）。

选项常量（单一数据源）：
```ts
const OPTIONS = [
  { choice: 'reuse',     label: '复用已有的文件' },
  { choice: 'overwrite', label: '覆盖已有的文件' },
  { choice: 'keep-both', label: '二者都保留' },
] as const;
```

### 5.2 `AssistantRunPage` 接线

新增状态（记录待决策文件名 + 它在输入栏里那枚 loading chip 的 id）：
```ts
const [dupState, setDupState] = useState<{ fileName: string; chipId: string } | null>(null);
```

`handleAttachClick`，**替换** `addDemoAttachment`（后者删除——原本仅被 Paperclip 按钮调用，两处入口改走去重后无其它引用，留着会触发 `--max-warnings 0` 未使用告警）。点击即「上传」：**立刻插入一枚 loading chip**，同时打开 popover：
```ts
const handleAttachClick = useCallback(() => {
  if (dupState) return;                 // 决策进行中，忽略重复点击
  const pool = demoAttachmentPool.current;
  if (pool.length === 0) return;
  const next = pool[demoPoolCursor.current % pool.length];
  demoPoolCursor.current += 1;
  const chipId = `att-${Date.now()}`;
  setInlineAttachments(list => [...list, { ...next, id: chipId, loading: true }]);  // loading chip
  setDupState({ fileName: next.name, chipId });                                     // 打开 popover
}, [dupState]);
```

确认 / 取消（决策前 chip 处于 loading；确认 → 把那枚 chip resolve 成最终态【即反馈，不弹 toast】，取消 → 移除它。state 更新器保持纯函数）。三种选择视觉结果一致，故 `resolveDuplicate` 无需 `choice` 参数；popover 内部仍用 `choice` 做键盘选择，`onResolve(choice)` 传给 `() => void` 在 TS 中合法：
```ts
const resolveDuplicate = useCallback(() => {
  if (!dupState) return;
  const { chipId } = dupState;
  setInlineAttachments(list => list.map(a => a.id === chipId ? { ...a, loading: false } : a)); // loading → 最终态
  setDupState(null);
  composerRef.current?.focus();
}, [dupState]);

const cancelDuplicate = useCallback(() => {
  if (dupState) setInlineAttachments(list => list.filter(a => a.id !== dupState.chipId)); // 移除 loading chip
  setDupState(null);
  composerRef.current?.focus();
}, [dupState]);
```

接线点：
- Paperclip 按钮 `line 2631`：`onClick={addDemoAttachment}` → `onClick={handleAttachClick}`。
- 「添加图片或附件」`DropdownMenuItem` `line 2570`：加 `onSelect={handleAttachClick}`（仅对 `item.id === 'attach'`）。
- 用 `<DuplicateFilePopover state={dupState} onResolve={resolveDuplicate} onCancel={cancelDuplicate}>` 包裹 `line 2425` 的输入栏容器 `div` 作为锚点。

### 5.3 `InlineAttachmentChip` / `ComposerAttachment` 新增 `loading?`

文件：`packages/ui/src/components/ui/inline-attachment-chip.tsx`

- `InlineAttachmentChipProps` 增加 `loading?: boolean`（`ComposerAttachment extends InlineAttachmentChipProps` 自动继承；`RichComposer` 已用 `{...att}` 透传，零额外改动）。
- `loading === true` 时渲染**精简的 loading pill**：复用同一套 pill chrome 类名，但
  - 用 `Loader2`（lucide，`animate-spin text-muted-foreground`）替换类型图标 / 图片缩略图；
  - **跳过** hover 预览 `Popover` 包裹与移除按钮（决策中无可预览、不可移除）；
  - 整体 `opacity` 略降以示"处理中"。
- 把 pill 基础类名抽成局部常量 `CHIP_BASE`，loading 与正常两分支共用，避免重复。

```tsx
if (loading) {
  return (
    <span contentEditable={false} data-slot="inline-attachment-chip" data-chip-loading
      className={cn(CHIP_BASE, "opacity-70", className)} title={name}>
      <Loader2 size={10} strokeWidth={2} className="flex-shrink-0 animate-spin text-muted-foreground" />
      <span className="truncate max-w-[180px]">{name}</span>
      {ext && <span className="opacity-50 uppercase tracking-wide text-[9px]">{ext}</span>}
    </span>
  );
}
// 否则走原有 <Popover>…</Popover>（hover 预览 + 移除）渲染
```

## 6. 边界与细节

- **每次点击都弹**（用户选择"点击即模拟重复"）：演示用，稳定可触发；轮换池中文件名以展示不同文件。
- **文件名**：用本次"上传"文件（池中当前项）的 `name`，写入 popover 正文与 loading chip。
- **确认动画**：选中（`1/2/3` / `Enter` / 点击）后 popover **不立即关闭**——被选项徽标先播 success `✓` 弹入动画，约 600ms 后才 `onResolve`（关 popover + loading chip 同步落定）；动画期间吞掉按键、忽略外部关闭（`confirmed !== null` 守卫）。
- **loading chip 时序**：点击即插入 loading chip → popover 决策 → 确认动画播完后同一 id 的 chip `loading: false` 变最终态；取消时按 id 移除。
- **不相交保证**：`side="top"` + `sideOffset={10}` + `avoidCollisions={false}`；聊天消息区在输入栏上方，空间充足，不会被裁切。
- **焦点**：打开时 Radix 自动聚焦 content（拦截键盘）；确认/取消后 `composerRef.current?.focus()` 交还输入框。
- **取消**：Esc / 点外部 / `onOpenChange(false)` → 移除 loading chip、不弹 toast。
- **可选增强（默认不做）**：给 chip 加 `复用/覆盖/双份` 小徽标，需扩展 `InlineAttachmentChip`，不在本次范围。

## 7. 改动文件清单

1. 🆕 `src/app/components/shared/Chat/DuplicateFilePopover.tsx` —— popover + 键盘逻辑 + 选项 success 确认动画（自包含，导出 `DuplicateFilePopover` 与 `DuplicateChoice`）。
2. ✏️ `src/app/components/assistant/AssistantRunPage.tsx` —— `dupState` 状态、`handleAttachClick`（替换并删除 `addDemoAttachment`）、`resolveDuplicate` / `cancelDuplicate`、两处入口接线、包裹锚点。
3. ✏️ `packages/ui/src/components/ui/inline-attachment-chip.tsx` —— `InlineAttachmentChipProps` 增加 `loading?`；loading 态渲染旋转图标的精简 pill（跳过预览/移除），基础类名抽 `CHIP_BASE` 共用。

## 8. 验证

- `pnpm lint`（项目 `--max-warnings 0`）通过。
- 手动验证：
  - 点击回形针 → **立刻**出现一枚旋转中的 loading chip，且 popover 浮现于输入栏上方、与之不相交；
  - `1/2/3` / `↑↓`+`Enter` / 点击 均可选；默认高亮"复用"；
  - 选中后**该选项数字徽标变成 success `✓` 弹入动画**，popover 短暂停留（~600ms）后才关闭；其间 chip 仍 loading、按键被吞掉；
  - popover 关闭后 loading chip **原地变为最终态**（旋转图标 → 类型图标、可 hover 预览 / 移除）——chip 状态变化即反馈，无 toast；
  - Esc / 点外部取消（未确认时）→ loading chip 消失。
