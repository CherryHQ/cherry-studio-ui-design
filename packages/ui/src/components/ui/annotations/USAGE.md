# Annotation Tool 标注工具使用说明

在运行中的 UI 上直接点击元素添加标注，记录样式/布局/交互问题，一键生成 AI 修复 Prompt。

---

## 快捷键

| 快捷键 | 功能 |
|---|---|
| `⌘⇧X` | 开关标注模式 |
| `⌘⇧F` | 复制 AI Prompt 到剪贴板 |
| `⌘⇧E` | 导出标注 JSON 文件 |
| `⌘⇧D` | 清除全部标注 |
| `Esc` | 关闭当前气泡 |
| `⌘Enter` | 保存标注 |

> Windows/Linux 下将 `⌘` 替换为 `Ctrl`。

---

## 基本操作

### 1. 开启标注模式

- 点击右下角 💬 按钮，或按 `⌘⇧X`
- 光标变为十字准星，表示已进入标注模式

### 2. 选择元素

- **鼠标悬停**：自动高亮当前元素，标签显示元素名称
- **滚轮上滚**：选择父元素（往外层走）
- **滚轮下滚**：回到子元素（往内层走）
- 标签左侧显示深度指示器 `↕ 2/5`，帮助定位层级

### 3. 添加标注

1. **点击**选中的元素
2. 弹出标注气泡，选择**分类**：
   - **Style** — 字号、颜色、间距、圆角、阴影
   - **Layout** — 对齐、宽高、排列、溢出、响应式
   - **Interaction** — hover/active/loading 状态、动画、键盘操作
   - **Content** — 文案、空态、图标、多语言
   - **Bug** — 显示异常、功能失效、性能问题
   - **Other** — 讨论、组件替换、代码重构
3. 点击**预设模板**快速填入常见问题，或直接输入描述
4. 按 `⌘Enter` 或点击 **Save** 保存

### 4. 查看标注

- 页面上的**编号圆点**表示已有标注，点击查看详情
- 详情气泡显示：评论内容、时间戳、元素路径、源文件推断、元素尺寸

### 5. 样式对比 (Style Diff)

- 在标注详情中点击 **Show style diff**
- 对比标注时记录的 CSS 值与当前实际值
- 变化项高亮显示：~~旧值~~ → 新值
- 快速确认"这个问题修了没有"

### 6. 编辑/解决/删除

| 按钮 | 功能 |
|---|---|
| 📋 | 复制该条标注为 AI Prompt |
| ✏️ | 编辑标注内容 |
| ✓ | 标记为已解决（圆点变绿） |
| 🗑️ | 删除标注 |

---

## 标注列表

点击右下角菜单按钮 → **Show List**，打开标注列表面板：

- 按**分类筛选**：点击 Filter 按钮，按 Bug/Style/Layout 等分类过滤
- 每个分类显示数量
- 点击列表项自动**滚动定位**到对应元素
- Active 和 Resolved 分组显示

---

## 导出与 AI 协作

### 复制 AI Prompt（推荐）

按 `⌘⇧F` 或菜单 → **Copy AI Prompt**

复制结构化修复指令，直接粘贴给 Claude/GPT，包含：
- 问题描述和分类
- 源文件路径
- 元素选择器和 className
- 当前 CSS 样式值

### 单条标注复制

在标注详情中点击 📋 按钮，只复制当前这一条的 AI Prompt。

### 导出 JSON

按 `⌘⇧E` 或菜单 → **Export JSON**

导出完整标注数据，包含所有元素信息、样式快照、AI Prompt。

### 导入 JSON

菜单 → **Import JSON**

从文件导入标注，支持导出格式和原始数组格式，按 ID 去重合并。适合团队间共享标注。

---

## 接入方式

```tsx
import {
  AnnotationProvider,
  AnnotationOverlay,
  AnnotationToggle,
  AnnotationList,
} from "@cherry-studio/ui"

function App() {
  const [listOpen, setListOpen] = useState(false)

  return (
    <AnnotationProvider
      page="chat"                        // 当前页面标识
      boundarySelector="#app-root"       // 覆盖层作用域
      storageKey="my-annotations"        // localStorage key
      appName="my-app"                   // 导出 JSON 中的 app 名
    >
      <YourAppContent />
      <AnnotationOverlay />
      <AnnotationToggle
        onToggleList={() => setListOpen(v => !v)}
        listOpen={listOpen}
      />
      <AnnotationList
        open={listOpen}
        onClose={() => setListOpen(false)}
      />
    </AnnotationProvider>
  )
}
```

### Props

| Prop | Type | Default | 说明 |
|---|---|---|---|
| `page` | `string` | **必填** | 当前页面 ID，标注按此筛选 |
| `boundarySelector` | `string` | `"#cherry-app-root"` | 覆盖层根元素选择器 |
| `storageKey` | `string` | `"cherry-annotations"` | localStorage 存储 key |
| `appName` | `string` | `"cherry-studio"` | 导出时写入的应用名 |

---

## 标注数据结构

每条标注自动记录：

| 字段 | 说明 |
|---|---|
| `selector` | CSS 选择器路径，用于重新定位元素 |
| `elementLabel` | 元素标签，如 `div.sidebar "Settings"` |
| `breadcrumb` | 组件路径，如 `ChatPage > MessageList > ChatMessage` |
| `category` | 分类：style / layout / interaction / content / bug / other |
| `sourceHint` | 推断的源文件路径 |
| `computedStyles` | 14 项 CSS 计算值快照 |
| `className` | 原始 className，便于 grep 搜索 |
| `rect` | 元素尺寸 |
| `position` | 元素内的点击位置 (0-1) |
