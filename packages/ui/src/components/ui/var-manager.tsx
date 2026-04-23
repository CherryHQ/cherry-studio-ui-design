"use client"

import * as React from "react"
import { useState } from "react"
import {
  Plus, Trash2, ChevronDown, X, Search,
  Variable, Braces, Hash, ToggleLeft, ListOrdered, FileJson,
  Clock, Calendar, Bot, Globe, Fingerprint, MessageCircle,
  Settings2, Lock, Eye, EyeOff,
} from "lucide-react"
import { cn } from "../../lib/utils"
import { Button } from "./button"
import { Label } from "./label"
import { Input } from "./input"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"
import { Separator } from "./separator"
import { ScrollArea } from "./scroll-area"
import { Tabs, TabsList, TabsTrigger } from "./tabs"

/* ===========================
   Types
   =========================== */

export type VarType = "string" | "number" | "boolean" | "array" | "json" | "secret"

export interface VariableDef {
  id: string
  name: string
  defaultValue: string
  description: string
  type: VarType
  isSystem?: boolean
}

/* ===========================
   Constants
   =========================== */

export const VAR_TYPE_CONFIG: Record<VarType, { label: string; icon: React.ElementType; colorClass: string; bgClass: string }> = {
  string:  { label: "String",  icon: Braces,      colorClass: "text-accent-blue",    bgClass: "bg-accent-blue-muted" },
  number:  { label: "Number",  icon: Hash,        colorClass: "text-accent-amber",   bgClass: "bg-accent-amber-muted" },
  boolean: { label: "Boolean", icon: ToggleLeft,   colorClass: "text-muted-foreground", bgClass: "bg-muted" },
  array:   { label: "Array",   icon: ListOrdered,  colorClass: "text-accent-purple",  bgClass: "bg-accent-purple-muted" },
  json:    { label: "JSON",    icon: FileJson,     colorClass: "text-accent-orange",  bgClass: "bg-accent-orange-muted" },
  secret:  { label: "Secret",  icon: EyeOff,       colorClass: "text-accent-pink",    bgClass: "bg-accent-pink-muted" },
}

export const SYSTEM_VARIABLES: VariableDef[] = [
  { id: "sys-1", name: "current_date",    defaultValue: "", description: "Current date (YYYY-MM-DD)",       type: "string", isSystem: true },
  { id: "sys-2", name: "current_time",    defaultValue: "", description: "Current time (HH:mm:ss)",        type: "string", isSystem: true },
  { id: "sys-3", name: "model_name",      defaultValue: "", description: "Current model name",             type: "string", isSystem: true },
  { id: "sys-4", name: "conversation_id", defaultValue: "", description: "Current conversation ID",        type: "string", isSystem: true },
  { id: "sys-5", name: "user_locale",     defaultValue: "", description: "User system locale",             type: "string", isSystem: true },
  { id: "sys-6", name: "message_count",   defaultValue: "", description: "Message count in conversation",  type: "number", isSystem: true },
]

export const SYSTEM_VAR_ICONS: Record<string, React.ElementType> = {
  current_date: Calendar,
  current_time: Clock,
  model_name: Bot,
  conversation_id: Fingerprint,
  user_locale: Globe,
  message_count: MessageCircle,
}

/* ===========================
   TypeSelect Dropdown
   =========================== */

function TypeSelect({ value, onChange }: { value: VarType; onChange: (t: VarType) => void }) {
  const [open, setOpen] = useState(false)
  const tc = VAR_TYPE_CONFIG[value]
  const Icon = tc.icon

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="xs"
          className="w-full px-2 bg-accent/10 text-xs text-foreground hover:border-border/80"
        >
          <Icon size={14} className={tc.colorClass} />
          <span className="flex-1 text-left truncate">{tc.label}</span>
          <ChevronDown size={12} className="text-muted-foreground/30" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="p-1 w-auto min-w-[100px]">
        {(Object.keys(VAR_TYPE_CONFIG) as VarType[]).map(t => {
          const cfg = VAR_TYPE_CONFIG[t]
          const TIcon = cfg.icon
          return (
            <Button
              key={t}
              variant="ghost"
              size="xs"
              onClick={() => { onChange(t); setOpen(false) }}
              className={cn(
                "w-full px-2 text-xs",
                value === t
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
              )}
            >
              <TIcon size={10} className={cfg.colorClass} />
              <span>{cfg.label}</span>
            </Button>
          )
        })}
      </PopoverContent>
    </Popover>
  )
}

/* ===========================
   VarManager (Panel)
   =========================== */

export interface VarManagerProps {
  /** System (read-only) variables */
  systemVars: VariableDef[]
  /** User-defined custom variables */
  userVars: VariableDef[]
  /** Close callback */
  onClose: () => void
  /** Insert variable name into editor */
  onInsert: (name: string) => void
  /** Add a new variable, returns its ID */
  onAdd: () => string
  /** Update a variable field */
  onUpdate: (id: string, field: keyof VariableDef, value: string) => void
  /** Update variable type */
  onUpdateType: (id: string, type: VarType) => void
  /** Remove a variable */
  onRemove: (id: string) => void
  /** Panel position */
  position?: "left" | "right"
  /** Hide backdrop overlay */
  noBackdrop?: boolean
  /** Custom position styles */
  positionStyle?: React.CSSProperties
  className?: string
}

function SecretInput({ value, onChange, placeholder, className, onClick }: {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  className?: string
  onClick?: (e: React.MouseEvent) => void
}) {
  const [visible, setVisible] = useState(false)
  return (
    <div className="relative">
      <Input
        type={visible ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={cn(className, "pr-7")}
        onClick={onClick}
      />
      <Button
        variant="ghost"
        size="icon-xs"
        type="button"
        className="absolute right-1 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground hover:text-foreground"
        onClick={(e) => { e.stopPropagation(); setVisible(!visible) }}
      >
        {visible ? <EyeOff size={10} /> : <Eye size={10} />}
      </Button>
    </div>
  )
}

function VarManager({
  systemVars,
  userVars,
  onClose,
  onInsert,
  onAdd,
  onUpdate,
  onUpdateType,
  onRemove,
  position = "right",
  noBackdrop = false,
  positionStyle,
  className,
  ref,
}: VarManagerProps & { ref?: React.Ref<HTMLDivElement> }) {
  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState<"all" | "system" | "custom">("all")
  const [editingId, setEditingId] = useState<string | null>(null)

  const handleAdd = () => {
    const newId = onAdd()
    setEditingId(newId)
    if (activeTab === "system") setActiveTab("custom")
  }

  const filteredSystem = systemVars.filter(v =>
    v.name.toLowerCase().includes(search.toLowerCase()) || v.description.toLowerCase().includes(search.toLowerCase())
  )
  const filteredUser = userVars.filter(v =>
    v.name.toLowerCase().includes(search.toLowerCase()) || v.description.toLowerCase().includes(search.toLowerCase())
  )

  const showSystem = activeTab === "all" || activeTab === "system"
  const showCustom = activeTab === "all" || activeTab === "custom"

  return (
    <div ref={ref} data-slot="var-manager" className="tracking-[-0.14px]">
      {/* Backdrop */}
      {!noBackdrop && (
        <div
          className="absolute inset-0 z-[var(--z-overlay)] bg-foreground/15"
          onClick={onClose}
        />
      )}
      {/* Drawer Panel */}
      <div
        className={cn(
          "absolute z-[var(--z-modal)] top-2 bottom-2 w-[320px] bg-popover rounded-[var(--radius-card)] border border-border shadow-popover flex flex-col overflow-hidden",
          !positionStyle && (position === "left" ? "left-2" : "right-2"),
          className,
        )}
        style={positionStyle}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-shrink-0 px-5 pt-5 pb-3 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-[var(--radius-button)] bg-accent-violet-muted flex items-center justify-center">
                <Variable size={14} className="text-accent-violet" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-foreground">Variables</h3>
                <p className="text-xs text-muted-foreground">{systemVars.length + userVars.length} variables</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onClose}
              className="w-7 h-7 text-muted-foreground hover:text-foreground"
            >
              <X size={14} />
            </Button>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search variables..."
              className="h-auto pl-7 pr-3 py-1.5 bg-accent/10 text-xs"
            />
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "all" | "system" | "custom")}>
            <TabsList className="bg-muted/30 h-auto p-0.5">
              {([
                { id: "all" as const, label: "All", count: systemVars.length + userVars.length },
                { id: "system" as const, label: "System", count: systemVars.length },
                { id: "custom" as const, label: "Custom", count: userVars.length },
              ]).map(tab => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="px-2.5 text-xs gap-1"
                >
                  <span>{tab.label}</span>
                  <span className="text-xs text-muted-foreground">{tab.count}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
        <div className="px-5 py-3">
          {/* System Variables */}
          {showSystem && filteredSystem.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">System</span>
                <Separator className="flex-1" />
              </div>
              <div className="space-y-1">
                {filteredSystem.map(v => {
                  const SysIcon = SYSTEM_VAR_ICONS[v.name] || Variable
                  return (
                    <div
                      key={v.id}
                      className="group flex items-center gap-2.5 px-3 py-2 rounded-[var(--radius-button)] hover:bg-accent/20 transition-colors cursor-pointer"
                      onClick={() => onInsert(v.name)}
                    >
                      <div className="w-7 h-7 rounded-[var(--radius-button)] bg-accent-emerald-muted flex items-center justify-center flex-shrink-0">
                        <SysIcon size={12} className="text-accent-emerald" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-foreground font-mono">{v.name}</span>
                          <span className={cn("text-xs px-1.5 py-px rounded-full", VAR_TYPE_CONFIG[v.type].bgClass, VAR_TYPE_CONFIG[v.type].colorClass)}>
                            {VAR_TYPE_CONFIG[v.type].label}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{v.description}</p>
                      </div>
                      <Lock size={12} className="text-muted-foreground flex-shrink-0" />
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Custom Variables */}
          {showCustom && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Custom</span>
                <Separator className="flex-1" />
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={handleAdd}
                  className="h-auto px-1 py-0 text-xs text-accent-violet hover:text-accent-violet/80"
                >
                  <Plus size={12} />
                  <span>Add</span>
                </Button>
              </div>
              <div className="space-y-1">
                {filteredUser.length === 0 && (
                  <div className="text-center py-6">
                    <Variable size={20} className="text-muted-foreground/40 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">No custom variables</p>
                    <Button variant="ghost" size="xs" onClick={handleAdd} className="h-auto px-1 py-0 text-xs text-accent-violet hover:text-accent-violet/80 mt-1">
                      Create variable
                    </Button>
                  </div>
                )}
                {filteredUser.map(v => {
                  const tc = VAR_TYPE_CONFIG[v.type]
                  const TypeIcon = tc.icon
                  const isEditing = editingId === v.id

                  return (
                    <div key={v.id}>
                      <div
                        className={cn(
                          "group flex items-center gap-2.5 px-3 py-2 rounded-[var(--radius-button)] transition-colors cursor-pointer",
                          isEditing ? "bg-accent/30" : "hover:bg-accent/20"
                        )}
                        onClick={() => { if (!isEditing) onInsert(v.name) }}
                      >
                        <div className={cn("w-7 h-7 rounded-[var(--radius-button)] flex items-center justify-center flex-shrink-0", tc.bgClass)}>
                          <TypeIcon size={12} className={tc.colorClass} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-foreground font-mono">{v.name || "unnamed"}</span>
                            <span className={cn("text-xs px-1.5 py-px rounded-full", tc.bgClass, tc.colorClass)}>
                              {tc.label}
                            </span>
                            {v.defaultValue && (
                              <span className="text-xs text-muted-foreground font-mono">= {v.defaultValue}</span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">{v.description || "No description"}</p>
                        </div>
                        <div
                          className="flex items-center gap-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={e => e.stopPropagation()}
                        >
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => setEditingId(isEditing ? null : v.id)}
                            className="w-5 h-5 text-muted-foreground hover:text-foreground"
                          >
                            <Settings2 size={12} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => onRemove(v.id)}
                            className="w-5 h-5 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 size={12} />
                          </Button>
                        </div>
                      </div>
                      {/* Inline edit panel */}
                      {isEditing && (
                        <div className="px-3 pb-2 pt-1 space-y-2 ml-9">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label className="text-xs text-muted-foreground mb-0.5 block">Name</Label>
                              <Input
                                value={v.name}
                                onChange={e => onUpdate(v.id, "name", e.target.value)}
                                className="h-auto px-2 py-1 bg-accent/10 text-xs font-mono"
                                onClick={e => e.stopPropagation()}
                              />
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground mb-0.5 block">Type</Label>
                              <div onClick={e => e.stopPropagation()}>
                                <TypeSelect value={v.type} onChange={t => onUpdateType(v.id, t)} />
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label className="text-xs text-muted-foreground mb-0.5 block">Default</Label>
                              {v.type === "secret" ? (
                                <SecretInput
                                  value={v.defaultValue}
                                  onChange={e => onUpdate(v.id, "defaultValue", e.target.value)}
                                  placeholder="Secret value"
                                  className="h-auto px-2 py-1 bg-accent/10 text-xs"
                                  onClick={e => e.stopPropagation()}
                                />
                              ) : (
                                <Input
                                  value={v.defaultValue}
                                  onChange={e => onUpdate(v.id, "defaultValue", e.target.value)}
                                  placeholder="Default value"
                                  className="h-auto px-2 py-1 bg-accent/10 text-xs"
                                  onClick={e => e.stopPropagation()}
                                />
                              )}
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground mb-0.5 block">Description</Label>
                              <Input
                                value={v.description}
                                onChange={e => onUpdate(v.id, "description", e.target.value)}
                                placeholder="Variable description..."
                                className="h-auto px-2 py-1 bg-accent/10 text-xs text-muted-foreground"
                                onClick={e => e.stopPropagation()}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
        </ScrollArea>

        {/* Footer */}
        <div className="flex-shrink-0 px-5 py-3 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            onClick={handleAdd}
            className="w-full bg-accent-violet-muted text-accent-violet text-xs hover:bg-accent-violet-muted/80 border-accent-violet/15"
          >
            <Plus size={10} />
            <span>Add Custom Variable</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

export { VarManager, VarManager as VarManagerPanel, TypeSelect }
