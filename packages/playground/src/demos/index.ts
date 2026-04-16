import { ButtonDemo } from "./ButtonDemo"
import { ButtonGroupDemo } from "./ButtonGroupDemo"
import { BadgeDemo } from "./BadgeDemo"
import { InputDemo } from "./InputDemo"
import { InputGroupDemo } from "./InputGroupDemo"
import { CheckboxRadioSwitchDemo } from "./CheckboxRadioSwitchDemo"
import { SelectDemo } from "./SelectDemo"
import { SliderProgressDemo } from "./SliderProgressDemo"
import { DialogSheetDrawerDemo } from "./DialogSheetDrawerDemo"
import { AlertDialogDemo } from "./AlertDialogDemo"
import { PopoverTooltipDemo } from "./PopoverTooltipDemo"
import { HoverCardDemo } from "./HoverCardDemo"
import { DropdownContextMenuDemo } from "./DropdownContextMenuDemo"
import { TabsDemo } from "./TabsDemo"
import { AccordionCollapsibleDemo } from "./AccordionCollapsibleDemo"
import { CardDemo } from "./CardDemo"
import { TableDemo } from "./TableDemo"
import { FormDemo } from "./FormDemo"
import { CalendarDemo } from "./CalendarDemo"
import { CommandDemo } from "./CommandDemo"
import { NavigationBreadcrumbDemo } from "./NavigationBreadcrumbDemo"
import { NavigationMenuDemo } from "./NavigationMenuDemo"
import { AvatarDemo } from "./AvatarDemo"
import { CarouselDemo } from "./CarouselDemo"
import { PaginationDemo } from "./PaginationDemo"
import { SkeletonDemo } from "./SkeletonDemo"
import { SonnerDemo } from "./SonnerDemo"
import { ToggleDemo } from "./ToggleDemo"
import { ResizableDemo } from "./ResizableDemo"
import { ScrollAreaDemo } from "./ScrollAreaDemo"
import { InputOtpDemo } from "./InputOtpDemo"
import { MenubarDemo } from "./MenubarDemo"
import { ChartDemo } from "./ChartDemo"
import { AspectRatioDemo } from "./AspectRatioDemo"
import { EmptyFieldItemDemo } from "./EmptyFieldItemDemo"
import { SeparatorDemo } from "./SeparatorDemo"
import { KbdDemo } from "./KbdDemo"
import { SpinnerDemo } from "./SpinnerDemo"
import { ThemePreviewDemo } from "./ThemePreviewDemo"
import { FormRowDemo } from "./FormRowDemo"
import { ConfigSectionDemo } from "./ConfigSectionDemo"
import { InlineSelectDemo } from "./InlineSelectDemo"
import { TreeNavDemo } from "./TreeNavDemo"
import { FilterSidebarDemo } from "./FilterSidebarDemo"
import { ComposerDemo } from "./ComposerDemo"
import { MessageBubbleDemo } from "./MessageBubbleDemo"
import { ResourceCardDemo } from "./ResourceCardDemo"
import { WorkflowStepsDemo } from "./WorkflowStepsDemo"
import { SidebarDemo } from "./SidebarDemo"
import { DataTableDemo } from "./DataTableDemo"
import { FileUploadDemo } from "./FileUploadDemo"
import { DatePickerComboboxDemo } from "./DatePickerComboboxDemo"
import { DatePickerDemo } from "./DatePickerDemo"
import { ComboboxDemo } from "./ComboboxDemo"
import { ChatModuleDemo } from "./ChatModuleDemo"
import { SettingsModuleDemo } from "./SettingsModuleDemo"
import { ExploreModuleDemo } from "./ExploreModuleDemo"
import { SimpleTooltipDemo } from "./SimpleTooltipDemo"
import { AlertDemo } from "./AlertDemo"
import { BrandLogosDemo } from "./BrandLogosDemo"
import { PickerPanelDemo } from "./PickerPanelDemo"
import { VarManagerDemo } from "./VarManagerDemo"
import { SearchDialogDemo } from "./SearchDialogDemo"
import { TabBarDemo } from "./TabBarDemo"
import { FileGridListDemo } from "./FileGridListDemo"
import { TranslateModuleDemo } from "./TranslateModuleDemo"
import { NoteModuleDemo } from "./NoteModuleDemo"
import { ImageModuleDemo } from "./ImageModuleDemo"
import { KnowledgeModuleDemo } from "./KnowledgeModuleDemo"
import { DashboardModuleDemo } from "./DashboardModuleDemo"
import { ShortcutEditorDemo } from "./ShortcutEditorDemo"
import { ParallelResponseDemo } from "./ParallelResponseDemo"
import { ChatDetailPanelDemo } from "./ChatDetailPanelDemo"
import { AppLauncherDemo } from "./AppLauncherDemo"
import { GenerativeUIDemo } from "./GenerativeUIDemo"
import { ModelServiceDemo } from "./ModelServiceDemo"
import { MCPServiceDemo } from "./MCPServiceDemo"
import { ThinkingBlockDemo } from "./ThinkingBlockDemo"
import { CodeBlockDemo } from "./CodeBlockDemo"
import { AttachmentListDemo } from "./AttachmentListDemo"
import { AgentConfigDemo } from "./AgentConfigDemo"
import { AssistantConfigDemo } from "./AssistantConfigDemo"
import { TopicHistoryDemo } from "./TopicHistoryDemo"
import { ExtensionsDemo } from "./ExtensionsDemo"
import { LibraryDemo } from "./LibraryDemo"
import { MiniAppsDemo } from "./MiniAppsDemo"
import { CodeToolDemo } from "./CodeToolDemo"
import { HomeDemo } from "./HomeDemo"
import { ChatSettingsDemo } from "./ChatSettingsDemo"
import { WebSearchConfigDemo } from "./WebSearchConfigDemo"
import { AtMentionPickerDemo } from "./AtMentionPickerDemo"
import { AppSidebarDemo } from "./AppSidebarDemo"
import { AppTabBarDemo } from "./AppTabBarDemo"
import { ChatMessageDemo } from "./ChatMessageDemo"
import { ChatInterfaceDemo } from "./ChatInterfaceDemo"
import { ModelPickerPanelDemo } from "./ModelPickerPanelDemo"
import { AssistantPickerPanelDemo } from "./AssistantPickerPanelDemo"
import { NotificationPanelDemo } from "./NotificationPanelDemo"
import { NotificationItemDemo } from "./NotificationItemDemo"
import { ErrorBoundaryDemo } from "./ErrorBoundaryDemo"
import { ShareModalDemo } from "./ShareModalDemo"
import { SettingsModalDemo } from "./SettingsModalDemo"
import { PlanCardDemo } from "./PlanCardDemo"
import { FloatingWindowDemo } from "./FloatingWindowDemo"
import { NewTabDialogDemo } from "./NewTabDialogDemo"
import { DragGhostDemo } from "./DragGhostDemo"
import { TabContextMenuDemo } from "./TabContextMenuDemo"
import { BranchTreeDemo } from "./BranchTreeDemo"
import { ProviderStatusDemo } from "./ProviderStatusDemo"
import { AISDKChatDemo } from "./AISDKChatDemo"
import { ToolCallDemo } from "./ToolCallDemo"
import { ToolbarDemo } from "./ToolbarDemo"

export const demos = [
  // Forms
  { id: "button", title: "Button", category: "Forms", description: "按钮组件，支持多种变体和尺寸", component: ButtonDemo },
  { id: "button-group", title: "Button Group", category: "Forms", description: "按钮组，分割按钮", component: ButtonGroupDemo },
  { id: "input", title: "Input & Textarea", category: "Forms", description: "文本输入框和多行输入", component: InputDemo },
  { id: "input-group", title: "Input Group", category: "Forms", description: "输入框组合（前缀/后缀）", component: InputGroupDemo },
  { id: "checkbox", title: "Checkbox / Radio / Switch", category: "Forms", description: "复选框、单选框、开关", component: CheckboxRadioSwitchDemo },
  { id: "select", title: "Select", category: "Forms", description: "下拉选择器", component: SelectDemo },
  { id: "slider", title: "Slider & Progress", category: "Forms", description: "滑块和进度条", component: SliderProgressDemo },
  { id: "form", title: "Form", category: "Forms", description: "表单验证与布局", component: FormDemo },
  { id: "calendar", title: "Calendar", category: "Forms", description: "日历选择器", component: CalendarDemo },
  { id: "input-otp", title: "Input OTP", category: "Forms", description: "验证码输入", component: InputOtpDemo },
  { id: "toggle", title: "Toggle & Toggle Group", category: "Forms", description: "切换按钮和切换组", component: ToggleDemo },
  { id: "date-picker", title: "DatePicker", category: "Forms", description: "日期选择器（单选/范围/预设）", component: DatePickerDemo },
  { id: "combobox", title: "Combobox", category: "Forms", description: "搜索下拉选择器（单选/多选）", component: ComboboxDemo },

  // Data Display
  { id: "badge", title: "Badge", category: "Data Display", description: "徽标组件", component: BadgeDemo },
  { id: "card", title: "Card", category: "Data Display", description: "卡片容器", component: CardDemo },
  { id: "table", title: "Table", category: "Data Display", description: "数据表格", component: TableDemo },
  { id: "avatar", title: "Avatar", category: "Data Display", description: "头像组件", component: AvatarDemo },
  { id: "skeleton", title: "Skeleton", category: "Data Display", description: "骨架屏加载占位", component: SkeletonDemo },
  { id: "carousel", title: "Carousel", category: "Data Display", description: "轮播组件", component: CarouselDemo },
  { id: "scroll-area", title: "Scroll Area", category: "Data Display", description: "自定义滚动区域", component: ScrollAreaDemo },
  { id: "chart", title: "Chart", category: "Data Display", description: "数据图表（Bar/Area）", component: ChartDemo },
  { id: "aspect-ratio", title: "Aspect Ratio", category: "Data Display", description: "宽高比容器", component: AspectRatioDemo },
  { id: "empty", title: "Empty / Field / Item", category: "Data Display", description: "空状态 + 表单字段 + 列表项", component: EmptyFieldItemDemo },
  { id: "alert", title: "Alert", category: "Data Display", description: "提示/警告/成功/错误信息块", component: AlertDemo },

  // Overlay
  { id: "dialog", title: "Dialog / Sheet / Drawer", category: "Overlay", description: "对话框、侧边面板、底部抽屉", component: DialogSheetDrawerDemo },
  { id: "alert-dialog", title: "Alert Dialog", category: "Overlay", description: "确认对话框", component: AlertDialogDemo },
  { id: "popover", title: "Popover & Tooltip", category: "Overlay", description: "弹出气泡和提示", component: PopoverTooltipDemo },
  { id: "hover-card", title: "Hover Card", category: "Overlay", description: "悬浮预览卡片", component: HoverCardDemo },
  { id: "dropdown", title: "Dropdown & Context Menu", category: "Overlay", description: "下拉菜单和右键菜单", component: DropdownContextMenuDemo },
  { id: "command", title: "Command", category: "Overlay", description: "命令面板 (⌘K)", component: CommandDemo },
  { id: "sonner", title: "Toast (Sonner)", category: "Overlay", description: "轻量级通知提示", component: SonnerDemo },

  // Navigation
  { id: "tabs", title: "Tabs", category: "Navigation", description: "标签页切换", component: TabsDemo },
  { id: "accordion", title: "Accordion & Collapsible", category: "Navigation", description: "手风琴折叠面板", component: AccordionCollapsibleDemo },
  { id: "nav-menu", title: "Navigation Menu", category: "Navigation", description: "导航下拉菜单", component: NavigationMenuDemo },
  { id: "breadcrumb", title: "Breadcrumb", category: "Navigation", description: "面包屑导航", component: NavigationBreadcrumbDemo },
  { id: "pagination", title: "Pagination", category: "Navigation", description: "分页导航", component: PaginationDemo },
  { id: "menubar", title: "Menubar", category: "Navigation", description: "菜单栏", component: MenubarDemo },

  // Layout
  { id: "resizable", title: "Resizable Panels", category: "Layout", description: "可调整尺寸的面板", component: ResizableDemo },
  { id: "separator", title: "Separator", category: "Layout", description: "分隔线（水平/垂直/带标签）", component: SeparatorDemo },
  { id: "kbd", title: "Kbd", category: "Layout", description: "键盘按键快捷键展示", component: KbdDemo },
  { id: "spinner", title: "Spinner", category: "Layout", description: "加载动画（尺寸/文字/按钮内）", component: SpinnerDemo },

  // Cherry Composite
  { id: "form-row", title: "FormRow & SectionHeader", category: "Cherry Composite", description: "表单行布局、区块标题", component: FormRowDemo },
  { id: "config-section", title: "ConfigSection & PanelHeader", category: "Cherry Composite", description: "配置区块、面板头部", component: ConfigSectionDemo },
  { id: "inline-select", title: "InlineSelect", category: "Cherry Composite", description: "紧凑型下拉选择器", component: InlineSelectDemo },
  { id: "tree-nav", title: "TreeNav", category: "Cherry Composite", description: "树形导航组件（文件树/知识库）", component: TreeNavDemo },
  { id: "filter-sidebar", title: "FilterSidebar", category: "Cherry Composite", description: "筛选侧栏（文件/资源/库管理）", component: FilterSidebarDemo },
  { id: "composer", title: "Composer", category: "Cherry Composite", description: "聊天输入框（自适应高度/快捷键）", component: ComposerDemo },
  { id: "message-bubble", title: "Chat & MessageBubble", category: "Cherry Composite", description: "聊天界面/消息气泡/空状态", component: MessageBubbleDemo },
  { id: "resource-card", title: "ResourceCard / FileCard / StatusBadge", category: "Cherry Composite", description: "资源卡片/文件卡片/状态徽章", component: ResourceCardDemo },
  { id: "workflow-steps", title: "WorkflowSteps", category: "Cherry Composite", description: "工作流步骤面板（Agent 执行流程）", component: WorkflowStepsDemo },
  { id: "simple-tooltip", title: "SimpleTooltip", category: "Cherry Composite", description: "简化 Tooltip（Cherry API 兼容）", component: SimpleTooltipDemo },
  { id: "brand-logos", title: "Brand Logos", category: "Cherry Composite", description: "品牌 Logo 图标（OpenAI/Anthropic/Google 等）+ LetterBadge", component: BrandLogosDemo },
  { id: "picker-panel", title: "PickerPanel", category: "Cherry Composite", description: "通用选择面板（模型选择/助手选择）", component: PickerPanelDemo },
  { id: "var-manager", title: "VarManager", category: "Cherry Composite", description: "变量管理面板（API Key/环境变量）", component: VarManagerDemo },

  // Layout (extended)
  { id: "sidebar-shadcn", title: "Sidebar (Shadcn)", category: "Layout", description: "Shadcn Sidebar 完整展示（展开/折叠/菜单）", component: SidebarDemo },

  // Patterns (composed from primitives)
  { id: "data-table", title: "DataTable", category: "Patterns", description: "数据表格（排序/筛选/分页/选择/操作）", component: DataTableDemo },
  { id: "date-picker-combobox", title: "DatePicker & Combobox", category: "Patterns", description: "日期选择器 + 搜索下拉（Popover 组合模式）", component: DatePickerComboboxDemo },
  { id: "file-upload", title: "File Upload & Attachments", category: "Patterns", description: "文件上传（拖拽/点击/进度/列表）+ 附件列表", component: FileUploadDemo },
  { id: "file-grid-list", title: "File Grid / List View", category: "Patterns", description: "文件网格/列表切换视图", component: FileGridListDemo },

  // 🖥️ Modules
  { id: "chat-module", title: "Chat Module", category: "🖥️ Modules", description: "完整聊天界面（Composer + MessageBubble + ChatContainer）", component: ChatModuleDemo },
  { id: "settings-module", title: "Settings Module", category: "🖥️ Modules", description: "设置页面（PanelHeader + ConfigSection + FormRow + InlineSelect）", component: SettingsModuleDemo },
  { id: "explore-module", title: "Explore Module", category: "🖥️ Modules", description: "资源发现页（ResourceCard + Tabs + 搜索过滤）", component: ExploreModuleDemo },
  { id: "search-dialog", title: "Search Dialog (⌘K)", category: "🖥️ Modules", description: "全局搜索对话框（Command + Dialog 组合）", component: SearchDialogDemo },
  { id: "tab-bar", title: "Tab Bar", category: "🖥️ Modules", description: "多标签管理（Tabs + 右键菜单 + 固定/关闭）", component: TabBarDemo },
  { id: "translate-module", title: "Translate Module", category: "🖥️ Modules", description: "翻译页面（双栏翻译 + 翻译专家选择）", component: TranslateModuleDemo },
  { id: "note-module", title: "Note Editor Module", category: "🖥️ Modules", description: "笔记编辑器（文件树 + 编辑器 + AI 助手）", component: NoteModuleDemo },
  { id: "image-module", title: "Image Gen Module", category: "🖥️ Modules", description: "AI 绘画页面（参数控制 + 图片画廊）", component: ImageModuleDemo },
  { id: "knowledge-module", title: "Knowledge Base Module", category: "🖥️ Modules", description: "知识库管理（数据源 + RAG 设置 + 检索测试）", component: KnowledgeModuleDemo },
  { id: "dashboard-module", title: "Dashboard Module", category: "🖥️ Modules", description: "数据仪表盘（统计卡片 + 图表 + 模型用量表）", component: DashboardModuleDemo },
  { id: "shortcut-editor", title: "Shortcut Editor", category: "🖥️ Modules", description: "快捷键编辑器（分组 Accordion + Kbd + Switch）", component: ShortcutEditorDemo },

  // Patterns (Cherry-specific)
  { id: "parallel-response", title: "Parallel Response", category: "Patterns", description: "多模型并行响应（布局切换 + ThinkingBlock + CodeBlock）", component: ParallelResponseDemo },
  { id: "chat-detail-panel", title: "Chat Detail Panel", category: "Patterns", description: "消息详情面板（Token 统计 + JSON 查看器）", component: ChatDetailPanelDemo },
  { id: "app-launcher", title: "App Launcher", category: "Patterns", description: "应用启动器（网格 + 搜索 + 管理模式）", component: AppLauncherDemo },
  { id: "generative-ui", title: "Generative UI", category: "Patterns", description: "AI 生成式 UI 交互（按钮选择 + 单选 + 确认框）", component: GenerativeUIDemo },
  { id: "model-service", title: "Model Service Config", category: "Patterns", description: "模型服务配置（API Key + 模型列表 + 能力标签）", component: ModelServiceDemo },
  { id: "mcp-service", title: "MCP Service Manager", category: "Patterns", description: "MCP 服务管理（服务卡片 + 工具列表 + 连接状态）", component: MCPServiceDemo },

  // Cherry Composite (extended)
  { id: "thinking-block", title: "ThinkingBlock", category: "Cherry Composite", description: "AI 思考过程展示（展开/折叠/耗时）", component: ThinkingBlockDemo },
  { id: "code-block", title: "CodeBlock", category: "Cherry Composite", description: "代码块（语法高亮/行号/多语言）", component: CodeBlockDemo },
  { id: "attachment-list", title: "AttachmentList", category: "Cherry Composite", description: "附件列表（文件/图片/进度/可删除）", component: AttachmentListDemo },

  // 🖥️ Modules (extended)
  { id: "agent-config", title: "Agent Config", category: "🖥️ Modules", description: "Agent 配置页（身份/模型/工具选择）", component: AgentConfigDemo },
  { id: "assistant-config", title: "Assistant Config", category: "🖥️ Modules", description: "助手配置（资料/模型/知识库/工具）", component: AssistantConfigDemo },
  { id: "topic-history", title: "Topic History", category: "🖥️ Modules", description: "话题历史（搜索/网格列表切换/标签筛选）", component: TopicHistoryDemo },
  { id: "extensions", title: "Extensions Market", category: "🖥️ Modules", description: "扩展市场（安装/推荐/搜索）", component: ExtensionsDemo },
  { id: "library", title: "Resource Library", category: "🖥️ Modules", description: "资源库（文件树 + 网格列表 + 搜索排序）", component: LibraryDemo },
  { id: "mini-apps", title: "Mini Apps", category: "🖥️ Modules", description: "迷你应用网格（搜索 + 自定义添加）", component: MiniAppsDemo },
  { id: "code-tool", title: "Code Tool", category: "🖥️ Modules", description: "代码工具配置（环境选择 + 参数设置）", component: CodeToolDemo },
  { id: "home", title: "Home / Welcome", category: "🖥️ Modules", description: "欢迎首页（搜索 + 快捷操作 + 最近会话）", component: HomeDemo },
  { id: "chat-settings", title: "Chat Settings", category: "🖥️ Modules", description: "聊天设置面板（模型参数 + 显示选项）", component: ChatSettingsDemo },
  { id: "web-search-config", title: "Web Search Config", category: "🖥️ Modules", description: "搜索引擎配置（提供商 + API Key + 参数）", component: WebSearchConfigDemo },

  // Patterns (extended)
  { id: "at-mention-picker", title: "@Mention Picker", category: "Patterns", description: "@提及选择器（分类标签 + 滚动列表）", component: AtMentionPickerDemo },
  { id: "branch-tree", title: "Branch Tree", category: "Patterns", description: "对话分支树（缩进 + 连接线 + 分支切换）", component: BranchTreeDemo },
  { id: "provider-status", title: "Provider Status", category: "Patterns", description: "服务商状态卡片（状态指示 + 延迟进度条）", component: ProviderStatusDemo },
  { id: "ai-sdk-chat", title: "AI SDK Chat", category: "Patterns", description: "AI SDK 聊天集成（Composer + MessageBubble + StreamingText）", component: AISDKChatDemo },
  { id: "tool-call", title: "Tool Call Card", category: "Patterns", description: "工具调用卡片（参数/状态/结果展示）", component: ToolCallDemo },
  { id: "toolbar", title: "Toolbar", category: "Cherry Composite", description: "工具栏（水平/垂直布局 + 分隔符）", component: ToolbarDemo },

  // App Shell
  { id: "app-sidebar", title: "AppSidebar", category: "App Shell", description: "应用侧边栏（菜单/搜索/Logo/标签）", component: AppSidebarDemo },
  { id: "app-tab-bar", title: "AppTabBar", category: "App Shell", description: "多标签栏（主题切换/流量灯/固定标签）", component: AppTabBarDemo },
  { id: "floating-window", title: "FloatingWindow", category: "App Shell", description: "浮动窗口（拖拽/关闭/重新附加）", component: FloatingWindowDemo },
  { id: "new-tab-dialog", title: "NewTabDialog", category: "App Shell", description: "新标签对话框（搜索/应用网格/历史）", component: NewTabDialogDemo },
  { id: "drag-ghost", title: "DragGhost", category: "App Shell", description: "标签拖拽幽灵预览", component: DragGhostDemo },
  { id: "tab-context-menu", title: "TabContextMenu", category: "App Shell", description: "标签右键菜单（固定/关闭/停靠）", component: TabContextMenuDemo },

  // Chat Components
  { id: "chat-message", title: "ChatMessage", category: "Chat Components", description: "聊天消息（用户/助手/Markdown/操作）", component: ChatMessageDemo },
  { id: "chat-interface", title: "ChatInterface", category: "Chat Components", description: "完整聊天界面（MessageList + Composer）", component: ChatInterfaceDemo },

  // Picker Panels
  { id: "model-picker-panel", title: "ModelPickerPanel", category: "Picker Panels", description: "模型选择面板（分组/能力标签/多选）", component: ModelPickerPanelDemo },
  { id: "assistant-picker-panel", title: "AssistantPickerPanel", category: "Picker Panels", description: "助手选择面板（搜索/Emoji/多选）", component: AssistantPickerPanelDemo },

  // Notifications
  { id: "notification-panel", title: "NotificationPanel", category: "Notifications", description: "通知面板（标签过滤/计数徽章）", component: NotificationPanelDemo },
  { id: "notification-item", title: "NotificationItem", category: "Notifications", description: "通知项（已读/未读/徽章图标）", component: NotificationItemDemo },

  // Error Handling
  { id: "error-boundary", title: "ErrorBoundary", category: "Error Handling", description: "错误边界（捕获渲染错误/重试）", component: ErrorBoundaryDemo },

  // Modals
  { id: "share-modal", title: "ShareModal", category: "Modals", description: "分享对话框（成员列表/链接复制）", component: ShareModalDemo },
  { id: "settings-modal", title: "SettingsModal", category: "Modals", description: "设置对话框（侧栏导航/分区内容）", component: SettingsModalDemo },

  // Pricing
  { id: "plan-card", title: "PlanCard", category: "Pricing", description: "定价卡片（Free/Creator/Studio）", component: PlanCardDemo },

  // Theme
  { id: "theme", title: "Theme Preview", category: "Theme", description: "主题配色、间距、圆角、字体预览", component: ThemePreviewDemo },
]
