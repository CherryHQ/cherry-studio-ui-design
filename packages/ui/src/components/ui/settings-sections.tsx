"use client"

import * as React from "react"
import { RotateCcw, Eye, EyeOff } from "lucide-react"
import { cn } from "../../lib/utils"
import { ConfigSection } from "./config-section"
import { FormRow } from "./form-row"
import { InlineSelect } from "./inline-select"
import { Switch } from "./switch"
import { Slider } from "./slider"
import { Input } from "./input"
import { Button } from "./button"
import { Kbd } from "./kbd"

/* ═══════════════════════════════════════════
   1. GeneralSettings
   ═══════════════════════════════════════════ */

export interface GeneralSettingsProps {
  language: string
  onLanguageChange: (lang: string) => void
  languages: { value: string; label: string }[]
  theme: "light" | "dark" | "system"
  onThemeChange: (theme: string) => void
  fontSize: number
  onFontSizeChange: (size: number) => void
  sendOnEnter: boolean
  onSendOnEnterChange: (v: boolean) => void
  className?: string
}

function GeneralSettings({
  language,
  onLanguageChange,
  languages,
  theme,
  onThemeChange,
  fontSize,
  onFontSizeChange,
  sendOnEnter,
  onSendOnEnterChange,
  className,
}: GeneralSettingsProps) {
  const themeOptions = [
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
    { value: "system", label: "System" },
  ]

  return (
    <div data-slot="general-settings" className={cn("space-y-3", className)}>
      <ConfigSection title="Language & Region">
        <FormRow label="Language" desc="Interface display language">
          <InlineSelect
            value={language}
            onChange={onLanguageChange}
            options={languages}
          />
        </FormRow>
      </ConfigSection>

      <ConfigSection title="Appearance">
        <FormRow label="Theme" desc="Color scheme preference">
          <InlineSelect
            value={theme}
            onChange={onThemeChange}
            options={themeOptions}
          />
        </FormRow>
        <FormRow label="Font Size" desc="Base font size for the interface">
          <div className="flex items-center gap-2">
            <Slider
              min={12}
              max={20}
              step={1}
              value={[fontSize]}
              onValueChange={v => onFontSizeChange(v[0])}
              className="w-24"
            />
            <span className="text-xs text-muted-foreground tabular-nums w-8 text-right">{fontSize}px</span>
          </div>
        </FormRow>
      </ConfigSection>

      <ConfigSection title="Input">
        <FormRow label="Send on Enter" desc="Press Enter to send messages, Shift+Enter for new line">
          <Switch checked={sendOnEnter} onCheckedChange={onSendOnEnterChange} />
        </FormRow>
      </ConfigSection>
    </div>
  )
}

/* ═══════════════════════════════════════════
   2. ModelSettings
   ═══════════════════════════════════════════ */

export interface ModelProvider {
  id: string
  name: string
  logo: React.ReactNode
  apiKey: string
  baseUrl?: string
  enabled: boolean
}

export interface ModelSettingsProps {
  providers: ModelProvider[]
  onProviderChange: (id: string, changes: Partial<ModelProvider>) => void
  defaultModel: string
  onDefaultModelChange: (model: string) => void
  models: { value: string; label: string }[]
  className?: string
}

function ModelSettings({
  providers,
  onProviderChange,
  defaultModel,
  onDefaultModelChange,
  models,
  className,
}: ModelSettingsProps) {
  const [visibleKeys, setVisibleKeys] = React.useState<Set<string>>(new Set())

  const toggleKeyVisibility = (id: string) => {
    setVisibleKeys(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <div data-slot="model-settings" className={cn("space-y-3", className)}>
      <ConfigSection title="Default Model">
        <FormRow label="Model" desc="Default model for new conversations">
          <InlineSelect
            value={defaultModel}
            onChange={onDefaultModelChange}
            options={models}
          />
        </FormRow>
      </ConfigSection>

      <ConfigSection title="Providers">
        {providers.map(provider => (
          <div key={provider.id} className="py-2 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex-shrink-0">{provider.logo}</span>
                <span className="text-xs font-medium text-foreground">{provider.name}</span>
              </div>
              <Switch
                checked={provider.enabled}
                onCheckedChange={v => onProviderChange(provider.id, { enabled: v })}
              />
            </div>
            {provider.enabled && (
              <div className="space-y-1.5 pl-0.5">
                <div className="flex items-center gap-1.5">
                  <Input
                    type={visibleKeys.has(provider.id) ? "text" : "password"}
                    value={provider.apiKey}
                    onChange={e => onProviderChange(provider.id, { apiKey: e.target.value })}
                    placeholder="API Key"
                    className="flex-1 h-7 text-xs"
                  />
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => toggleKeyVisibility(provider.id)}
                    className="text-muted-foreground"
                  >
                    {visibleKeys.has(provider.id) ? <EyeOff size={12} /> : <Eye size={12} />}
                  </Button>
                </div>
                {provider.baseUrl !== undefined && (
                  <Input
                    value={provider.baseUrl}
                    onChange={e => onProviderChange(provider.id, { baseUrl: e.target.value })}
                    placeholder="Base URL (optional)"
                    className="h-7 text-xs"
                  />
                )}
              </div>
            )}
          </div>
        ))}
      </ConfigSection>
    </div>
  )
}

/* ═══════════════════════════════════════════
   3. ShortcutSettings
   ═══════════════════════════════════════════ */

export interface ShortcutItem {
  id: string
  label: string
  keys: string[]
  category: string
}

export interface ShortcutSettingsProps {
  shortcuts: ShortcutItem[]
  onShortcutChange: (id: string, keys: string[]) => void
  onReset?: () => void
  className?: string
}

function ShortcutSettings({
  shortcuts,
  onShortcutChange,
  onReset,
  className,
}: ShortcutSettingsProps) {
  const categories = React.useMemo(() => {
    const cats = new Map<string, ShortcutItem[]>()
    shortcuts.forEach(s => {
      const list = cats.get(s.category) || []
      list.push(s)
      cats.set(s.category, list)
    })
    return cats
  }, [shortcuts])

  return (
    <div data-slot="shortcut-settings" className={cn("space-y-3", className)}>
      {Array.from(categories.entries()).map(([category, items]) => (
        <ConfigSection
          key={category}
          title={category}
          actions={
            category === Array.from(categories.keys())[0] && onReset ? (
              <Button variant="ghost" size="xs" onClick={onReset} className="text-xs text-muted-foreground gap-1">
                <RotateCcw size={10} /> Reset
              </Button>
            ) : undefined
          }
        >
          {items.map(shortcut => (
            <FormRow key={shortcut.id} label={shortcut.label}>
              <div className="flex items-center gap-1">
                {shortcut.keys.map((key, i) => (
                  <React.Fragment key={i}>
                    {i > 0 && <span className="text-xs text-muted-foreground/30">+</span>}
                    <Kbd>{key}</Kbd>
                  </React.Fragment>
                ))}
              </div>
            </FormRow>
          ))}
        </ConfigSection>
      ))}
    </div>
  )
}

/* ═══════════════════════════════════════════
   4. DisplaySettings
   ═══════════════════════════════════════════ */

export interface DisplaySettingsProps {
  showAvatar: boolean
  onShowAvatarChange: (v: boolean) => void
  messageBubbleStyle: "bubble" | "flat"
  onBubbleStyleChange: (style: string) => void
  codeTheme: string
  onCodeThemeChange: (theme: string) => void
  codeThemes: { value: string; label: string }[]
  className?: string
}

function DisplaySettings({
  showAvatar,
  onShowAvatarChange,
  messageBubbleStyle,
  onBubbleStyleChange,
  codeTheme,
  onCodeThemeChange,
  codeThemes,
  className,
}: DisplaySettingsProps) {
  const bubbleOptions = [
    { value: "bubble", label: "Bubble" },
    { value: "flat", label: "Flat" },
  ]

  return (
    <div data-slot="display-settings" className={cn("space-y-3", className)}>
      <ConfigSection title="Messages">
        <FormRow label="Show Avatar" desc="Display user and assistant avatars in chat">
          <Switch checked={showAvatar} onCheckedChange={onShowAvatarChange} />
        </FormRow>
        <FormRow label="Message Style" desc="Bubble or flat message layout">
          <InlineSelect
            value={messageBubbleStyle}
            onChange={onBubbleStyleChange}
            options={bubbleOptions}
          />
        </FormRow>
      </ConfigSection>

      <ConfigSection title="Code">
        <FormRow label="Code Theme" desc="Syntax highlighting theme for code blocks">
          <InlineSelect
            value={codeTheme}
            onChange={onCodeThemeChange}
            options={codeThemes}
          />
        </FormRow>
      </ConfigSection>
    </div>
  )
}

/* ═══════════════════════════════════════════
   Exports
   ═══════════════════════════════════════════ */

export {
  GeneralSettings,
  ModelSettings,
  ShortcutSettings,
  DisplaySettings,
}
