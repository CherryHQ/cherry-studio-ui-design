# To Claude Code: Cherry Studio V2 — 架构优化与后端联调准备指令

> **项目路径**: `/Users/siin/Downloads/Cherry Studio UI`  
> **核心约束**: ① 不修改任何 UI 样式与交互行为 ② 不实现后端逻辑  
> **目标**: 代码架构质量提升 + 为后端联调创造清晰接口

---

## 0. 前置扫描（执行前必读）

```bash
# 确认当前状态
grep -rn "USE_MOCK\|VITE_" src/ --include="*.ts" --include="*.tsx"
grep -rn "useEffect" src/ --include="*.ts" --include="*.tsx" | wc -l
grep -rn ": any" src/ --include="*.ts" --include="*.tsx"
find src/ -name "*.tsx" -exec awk 'END{if(NR>300) print NR"\t"FILENAME}' {} \;
```

---

## 1. 环境变量标准化（后端联调首要任务）

### 1.1 创建 `.env.example`（当前项目缺失此文件）

新建项目根目录 `.env.example`，内容如下：

```bash
# =============================================
# Cherry Studio V2 — Environment Variables
# 复制此文件为 .env.local，填入实际值
# =============================================

# API 基础地址（后端服务地址）
VITE_API_BASE_URL=http://localhost:8000/api/v1

# WebSocket 地址（如需实时功能）
VITE_WS_URL=ws://localhost:8000/ws

# Mock 模式开关（true=前端 Mock，false=对接真实后端）
# 联调时设为 false
VITE_USE_MOCK=true

# 请求超时（毫秒）
VITE_REQUEST_TIMEOUT=30000

# 应用版本
VITE_APP_VERSION=2.0.0
```

同时新建 `.env.local`（不提交 git），并将 `.env.local` 加入 `.gitignore`：

```bash
# .gitignore 追加
.env.local
.env.*.local
```

### 1.2 类型安全化环境变量（修改 `src/app/config/env.ts`）

```typescript
// [src/app/config/env.ts](src/app/config/env.ts) — 当前代码已有此文件，补充类型声明
// 在文件头部追加 Vite env 类型声明（无需另建文件）

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_WS_URL: string;
  readonly VITE_USE_MOCK: string;
  readonly VITE_REQUEST_TIMEOUT: string;
  readonly VITE_APP_VERSION: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

---

## 2. Mock 数据与真实代码隔离

### 2.1 问题

当前 `src/app/config/constants.ts`（313行）中混合了：
- ✅ 真实需要的静态配置（menuItems、侧边栏断点）
- ❌ 应由后端提供的 Mock 数据（知识库列表、工具列表、MCP 服务器、插件）

### 2.2 拆分方案

将 `constants.ts` 中的 Mock 数据移出，**不改变任何导出接口**（现有组件代码零改动）：

**保留在 `constants.ts` 的内容**（纯静态 UI 配置）：
- `menuItems` — 菜单项定义
- `sidebarBreakpoints` — 侧边栏宽度断点
- `resourceTypeConfigs` — 资源类型配置
- `tagColors` — 标签颜色映射
- `avatarOptions` — 头像选项

**迁移到 `src/app/mock/constants.mock.ts` 的内容**（后端联调时替换）：
- `mockKnowledgeBases` — 知识库列表
- `mockBuiltinTools` — 内置工具
- `mockMCPServers` — MCP 服务器
- `mockInstalledPlugins` — 已安装插件
- `mockModelProviders` — 模型提供商列表

```typescript
// src/app/mock/constants.mock.ts（新建）
// ⚠️ 以下数据为 Mock，联调时应替换为真实 API 调用

export const mockKnowledgeBases = [ /* 从 [constants.ts](constants.ts) 迁移 */ ];
export const mockBuiltinTools = [ /* 从 [constants.ts](constants.ts) 迁移 */ ];
export const mockMCPServers = [ /* 从 [constants.ts](constants.ts) 迁移 */ ];
// ...

// 在 [constants.ts](constants.ts) 中保持向后兼容的重导出
export { mockKnowledgeBases, mockBuiltinTools, mockMCPServers } from '../mock/constants.mock';
```

---

## 3. 类型系统加固（后端联调关键）

### 3.1 强制 `import type`（`consistent-type-imports`）

扫描并修复所有类型导入，**仅修改 import 语句，不改变任何业务逻辑**：

```typescript
// ❌ 当前：类型和值混合导入
import { Tab, MenuItem, ResourceItem } from '@/app/types';
import { ApiResponse, PaginatedResponse } from '@/app/types/api';

// ✅ 修复后：类型使用 import type
import type { Tab, MenuItem, ResourceItem } from '@/app/types';
import type { ApiResponse, PaginatedResponse } from '@/app/types/api';
```

**优先处理文件**（按后端联调重要性排序）：
1. `src/app/services/chatService.ts`
2. `src/app/services/resourceService.ts`
3. `src/app/services/apiClient.ts`
4. `src/app/hooks/useChatStream.ts`
5. `src/app/context/SettingsContext.tsx`
6. `src/app/context/GlobalActionContext.tsx`
7. `src/app/components/CherryStudio.tsx`

### 3.2 消除 `any` 类型

扫描全部文件，将 `: any` 替换为精确类型，**重点关注服务层**：

```typescript
// ❌ 当前（apiClient.ts 中可能存在）
onApiError: ((error: any) => void) | null = null;

// ✅ 修复
import type { ApiError } from './apiClient';
onApiError: ((error: ApiError) => void) | null = null;
```

```typescript
// ❌ 当前（errorHandler.ts）
export function initGlobalErrorHandler(): void {
  onApiError((error: any) => { ... });
}

// ✅ 修复
import type { ApiError } from './apiClient';
export function initGlobalErrorHandler(): void {
  onApiError((error: ApiError) => { ... });
}
```

### 3.3 补充后端联调所需的类型定义

在 `src/app/types/api.ts` 中追加以下类型（供后端开发参考，**不改变任何现有类型**）：

```typescript
// =============================================
// 以下类型为后端联调契约，后端需实现对应接口
// =============================================

/** 认证 — 登录请求 */
export interface LoginRequest {
  username: string;
  password: string;
}

/** 认证 — 登录响应 */
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;     // 秒
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
}

/** 认证 — Token 刷新 */
export interface RefreshTokenRequest {
  refreshToken: string;
}

/** 用户设置持久化（对应后端 /api/v1/settings） */
export interface UserSettingsPayload {
  language: string;
  theme: 'light' | 'dark' | 'system';
  accentColor: string;
  zoom: number;
  globalFont: string;
  codeFont: string;
}

/** 模型提供商（对应后端 /api/v1/models/providers） */
export interface ModelProvider {
  id: string;
  name: string;
  models: ModelInfo[];
  isEnabled: boolean;
  apiKeyRequired: boolean;
}

/** MCP 服务器配置（对应后端 /api/v1/mcp/servers） */
export interface MCPServerConfig {
  id: string;
  name: string;
  url: string;
  status: 'connected' | 'disconnected' | 'error';
  tools: string[];
}
```

---

## 4. `<Activity>` 替换 CSS display 切换（性能架构）

### 4.1 问题定位

`src/app/components/MainContent.tsx` 中使用 CSS `display: none/flex` 切换 Tab 可见性。这与 React 并发模式不兼容，且 `<Activity mode="hidden">` 能让隐藏组件仍可接收状态更新。

### 4.2 修改方案（**零 UI 变化**）

```typescript
// [src/app/components/MainContent.tsx](src/app/components/MainContent.tsx) — 仅修改渲染逻辑，不改变任何样式

// ❌ 当前模式
{mountedTabIds.has([tab.id](http://tab.id)) && (
  <div
    key={[tab.id](http://tab.id)}
    style={{ display: isActive ? 'flex' : 'none', /* ... */ }}
  >
    <TabPageContent tab={tab} />
  </div>
)}

// ✅ 替换为 Activity（需 React 19+，项目已满足条件）
import { unstable_Activity as Activity } from 'react';

{mountedTabIds.has([tab.id](http://tab.id)) && (
  <Activity key={[tab.id](http://tab.id)} mode={isActive ? 'visible' : 'hidden'}>
    <div style={{ /* 原有的 flex 布局样式保持不变 */ }}>
      <TabPageContent tab={tab} />
    </div>
  </Activity>
)}
```

> **注意**：`Activity` 在 React 19 中仍以 `unstable_Activity` 导出，需确认项目 React 版本。如当前版本不支持，**跳过此项，保持现状**。

---

## 5. `useEffect` 优化（`useEffectEvent` 迁移）

**原则**：仅迁移"读取但不依赖"的场景，**不改变任何副作用的触发时机**。

### 5.1 `src/app/context/SettingsContext.tsx`

```typescript
// ❌ 当前：settings 对象整体作为依赖，导致频繁触发
useEffect(() => {
  document.documentElement.classList.toggle('dark', resolvedTheme === 'dark');
  document.documentElement.style.setProperty('--zoom', `${settings.zoom}`);
  // ... 多个 DOM 操作混在一个 effect
}, [resolvedTheme, settings]);

// ✅ 拆分为单一职责的独立 effect
// 主题应用（正确依赖）
useEffect(() => {
  document.documentElement.classList.toggle('dark', resolvedTheme === 'dark');
}, [resolvedTheme]);

// 缩放应用（仅依赖 zoom 值，而非整个 settings 对象）
useEffect(() => {
  document.documentElement.style.setProperty('--zoom', `${settings.zoom}`);
}, [settings.zoom]);

// 字体应用
useEffect(() => {
  document.documentElement.style.setProperty('--global-font', settings.globalFont);
}, [settings.globalFont]);
```

### 5.2 `src/app/hooks/useChatStream.ts`

```typescript
// ❌ 当前：回调函数（onComplete/onError）在 effect 依赖中不稳定
useEffect(() => {
  // ... 流式处理
  if (done) options.onComplete?.(content);
}, [options]); // options 对象每次渲染都是新引用

// ✅ 使用 useEffectEvent 稳定回调引用（React 19）
import { experimental_useEffectEvent as useEffectEvent } from 'react';

const handleComplete = useEffectEvent((finalContent: string) => {
  options.onComplete?.(finalContent);
});

const handleError = useEffectEvent((err: string) => {
  options.onError?.(err);
});
```

---

## 6. Context 性能优化（不改变任何功能）

### 6.1 问题：`GlobalActionContext` 混合 actions 和 state

`src/app/context/GlobalActionContext.tsx` 将 actions（稳定引用）和 state（会变化的值）放在同一 Context，导致所有消费者在 `libraryEditResourceId` 变化时都重渲染。

```typescript
// ❌ 当前：state 和 actions 混合
interface GlobalActions {
  openMiniApp: (app) => void;      // action（稳定）
  pinTab: (tabId) => void;          // action（稳定）
  // ...
  libraryEditResourceId: string | null;  // state（会变）
  libraryCreateType: '...' | null;       // state（会变）
}
```

```typescript
// ✅ 拆分为两个 Context（接口不变，仅内部拆分）

// GlobalActionsContext — 仅包含 actions（永远不变，不触发重渲染）
const GlobalActionsContext = createContext<GlobalActionFunctions>(null!);

// GlobalStateContext — 仅包含会变化的 state
const GlobalStateContext = createContext<GlobalActionState>(null!);

// 保持向后兼容的组合 Hook（现有组件代码零改动）
export function useGlobalActions(): GlobalActions {
  const actions = useContext(GlobalActionsContext);
  const state = useContext(GlobalStateContext);
  return { ...actions, ...state };
}
```

### 6.2 问题：`SettingsContext` 导致全局重渲染

```typescript
// ❌ 当前：任何设置变化，所有订阅组件全部重渲染
const SettingsContext = createContext<SettingsContextValue>({ settings, updateSetting, resolvedTheme });

// ✅ 将 dispatch 函数单独分离（updateSetting 是稳定引用，不需要随 state 重渲染）
const SettingsStateContext = createContext<AppSettings>(defaultSettings);
const SettingsDispatchContext = createContext<UpdateSettingFn>(noop);
const ResolvedThemeContext = createContext<string>('light');

// 保持向后兼容
export function useSettings() {
  return {
    settings: useContext(SettingsStateContext),
    updateSetting: useContext(SettingsDispatchContext),
    resolvedTheme: useContext(ResolvedThemeContext),
  };
}
```

---

## 7. 大组件拆分（仅代码组织，零 UI 变化）

### 7.1 `CherryStudio.tsx`（674 行）→ 拆分为逻辑 Hook

将状态逻辑提取为自定义 Hook，组件本身只负责 JSX 渲染：

```typescript
// src/app/hooks/useTabs.ts（新建）
// 提取自 [CherryStudio.tsx](CherryStudio.tsx) 中的 Tab 管理逻辑

export function useTabs() {
  // 迁移：tabs state, localStorage 持久化, addTab, closeTab, activateTab 等逻辑
  // 不改变任何行为，只是移出组件
  return { tabs, activeTabId, addTab, closeTab, activateTab, reorderTabs };
}

// src/app/hooks/useSidebarResize.ts（新建）
// 提取自 [CherryStudio.tsx](CherryStudio.tsx) 中的 Sidebar 宽度 + 拖拽逻辑
export function useSidebarResize(defaultWidth: number) {
  return { sidebarWidth, setSidebarWidth, isResizing };
}

// src/app/hooks/useFloatingWindows.ts（新建）
// 提取 FloatingWindow 管理逻辑
export function useFloatingWindows() {
  return { floatingWindows, openFloatingWindow, closeFloatingWindow };
}
```

目标：`CherryStudio.tsx` 行数从 674 行缩减到 **< 150 行**（纯 JSX 声明）。

### 7.2 `Sidebar.tsx`（618 行）→ 提取 Hook

```typescript
// src/app/hooks/useSidebarLayout.ts（新建）
// 仅计算 Sidebar 显示模式，不涉及任何样式

export type SidebarMode = 'hidden' | 'icon' | 'card' | 'full';

export function useSidebarMode(width: number): SidebarMode {
  if (width < 20) return 'hidden';
  if (width < 60) return 'icon';
  if (width < 100) return 'card';
  return 'full';
}
```

Sidebar.tsx 的 JSX 结构、样式类名、交互行为**全部保持不变**，仅将 Hook 逻辑提取出去。

---

## 8. 工程化配置

### 8.1 配置 oxlint

新建项目根目录 `oxlint.json`：

```json
{
  "$schema": "[https://raw.githubusercontent.com/oxc-project/oxlint/main/schema.json](https://raw.githubusercontent.com/oxc-project/oxlint/main/schema.json)",
  "rules": {
    "consistent-type-imports": "error",
    "no-unused-vars": "error",
    "prefer-const": "error",
    "eqeqeq": "error"
  },
  "ignorePatterns": ["src/app/mock/**", "*.config.*", "vite.config.ts"]
}
```

更新 `package.json`：

```json
{
  "scripts": {
    "lint": "oxlint src/",
    "lint:fix": "oxlint src/ --fix",
    "type-check": "tsc --noEmit"
  },
  "devDependencies": {
    "oxlint": "latest"
  }
}
```

### 8.2 TypeScript 路径补全（`tsconfig.json`）

确认 `tsconfig.json` 包含以下配置（已有则跳过）：

```json
{
  "compilerOptions": {
    "strict": true,
    "verbatimModuleSyntax": true,
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

> `verbatimModuleSyntax: true` 会强制要求类型导入使用 `import type`，与 oxlint 的 `consistent-type-imports` 规则协同。

---

## 9. 后端联调接口文档（供后端开发参考）

在项目根目录新建 `API_CONTRACT.md`，内容如下：

````markdown
# Cherry Studio V2 — API 接口契约

## 切换 Mock/真实 API

```bash
# .env.local
VITE_USE_MOCK=false          # 关闭 Mock，对接真实后端
VITE_API_BASE_URL=http://your-backend/api/v1
```

## 通用响应格式

```json
{
  "code": 0,
  "message": "success",
  "data": { ... },
  "timestamp": 1234567890
}
```

## 认证

所有请求在 Header 中携带：
```
Authorization: Bearer <accessToken>
```

## SSE 流式格式（聊天接口）

```
data: {"messageId":"xxx","delta":"你好","thinkingDelta":null,"done":false}
data: {"messageId":"xxx","delta":"","done":true,"usage":{"inputTokens":10,"outputTokens":50}}
data: [DONE]
```

## 接口清单

| 方法   | 路径                                    | 说明           |
|--------|----------------------------------------|----------------|
| POST   | /auth/login                            | 登录           |
| POST   | /auth/refresh                          | 刷新 Token     |
| GET    | /sessions                              | 会话列表       |
| POST   | /sessions                              | 创建会话       |
| DELETE | /sessions/{id}                         | 删除会话       |
| GET    | /sessions/{id}/messages                | 消息历史       |
| POST   | /sessions/{id}/chat                    | 发送消息(SSE)  |
| POST   | /sessions/{id}/messages/{mid}/stop     | 停止生成       |
| POST   | /files/upload                          | 文件上传       |
| GET    | /resources                             | 资源列表       |
| POST   | /resources                             | 创建资源       |
| GET    | /settings                              | 用户设置       |
| PUT    | /settings                              | 保存用户设置   |
| GET    | /models/providers                      | 模型提供商列表 |
| GET    | /mcp/servers                           | MCP 服务器列表 |