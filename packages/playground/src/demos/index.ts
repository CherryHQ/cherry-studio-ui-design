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
import { MiscDemo } from "./MiscDemo"

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
  { id: "empty", title: "Empty State", category: "Data Display", description: "空状态占位组件", component: EmptyFieldItemDemo },

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
  { id: "misc", title: "Separator / Kbd / Spinner", category: "Layout", description: "分隔线、键盘按键、加载器等", component: MiscDemo },
]
