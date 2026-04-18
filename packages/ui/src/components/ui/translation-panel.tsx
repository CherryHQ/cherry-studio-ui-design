"use client"

import * as React from "react"
import { ArrowLeftRight, ArrowRight, Volume2, Copy, Check } from "lucide-react"
import { cn } from "../../lib/utils"
import { Button } from "./button"
import { Textarea } from "./textarea"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "./select"
import { Badge } from "./badge"
import { Separator } from "./separator"
import { ScrollArea } from "./scroll-area"

/* ═══════════════════════════════════════════
   Types
   ═══════════════════════════════════════════ */

export interface TranslationLanguage {
  value: string
  label: string
}

export interface TranslationPanelProps extends Omit<React.ComponentProps<"div">, "onCopy"> {
  /** Source language value */
  sourceLanguage: string
  /** Target language value */
  targetLanguage: string
  onSourceLanguageChange: (lang: string) => void
  onTargetLanguageChange: (lang: string) => void
  onSwapLanguages?: () => void
  /** Available languages for selection */
  languages: TranslationLanguage[]
  /** Languages available as source (defaults to languages) */
  sourceLanguages?: TranslationLanguage[]

  /** Source text */
  sourceText: string
  onSourceTextChange: (text: string) => void
  /** Translated text (controlled) */
  translatedText: string

  /** Translate action */
  onTranslate: () => void
  isTranslating?: boolean

  /** Optional callbacks */
  onSpeak?: (text: string, lang: string) => void
  onCopy?: (text: string) => void

  /** Settings slot */
  showSettings?: boolean
  onToggleSettings?: () => void
  settingsContent?: React.ReactNode

  /** History slot */
  showHistory?: boolean
  onToggleHistory?: () => void
  historyContent?: React.ReactNode

  /** Toolbar extra — slot for expert/model selectors, etc. */
  toolbarExtra?: React.ReactNode

  /** Labels for i18n */
  labels?: {
    sourcePlaceholder?: string
    targetPlaceholder?: string
    translateButton?: string
    translating?: string
    characters?: string
    words?: string
    sourceLabel?: string
    targetLabel?: string
  }
}

/* ═══════════════════════════════════════════
   Component
   ═══════════════════════════════════════════ */

function TranslationPanel({
  sourceLanguage,
  targetLanguage,
  onSourceLanguageChange,
  onTargetLanguageChange,
  onSwapLanguages,
  languages,
  sourceLanguages,
  sourceText,
  onSourceTextChange,
  translatedText,
  onTranslate,
  isTranslating = false,
  onSpeak,
  onCopy,
  showHistory = false,
  historyContent,
  toolbarExtra,
  labels,
  className,
  children,
  ...props
}: TranslationPanelProps) {
  const [copied, setCopied] = React.useState(false)

  const l = {
    sourcePlaceholder: labels?.sourcePlaceholder ?? "Enter text to translate...",
    targetPlaceholder: labels?.targetPlaceholder ?? "Translation will appear here",
    translateButton: labels?.translateButton ?? "Translate",
    translating: labels?.translating ?? "Translating...",
    characters: labels?.characters ?? "chars",
    words: labels?.words ?? "words",
    sourceLabel: labels?.sourceLabel ?? "Source",
    targetLabel: labels?.targetLabel ?? "Target",
  }

  const srcLangs = sourceLanguages ?? languages

  const wordCount = (text: string) =>
    text.trim() ? text.trim().split(/\s+/).length : 0

  const handleCopy = (text: string) => {
    if (onCopy) {
      onCopy(text)
    } else {
      navigator.clipboard?.writeText(text)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div
      data-slot="translation-panel"
      className={cn("flex flex-col", className)}
      {...props}
    >
      {/* Language selector bar */}
      <div className="flex items-center justify-center gap-2 px-4 py-2 border-b border-border/30">
        <Select value={sourceLanguage} onValueChange={onSourceLanguageChange}>
          <SelectTrigger className="h-8 w-auto px-2.5 rounded-[var(--radius-button)] border-0 bg-transparent text-sm gap-1 hover:bg-accent/50" size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {srcLangs.map(lang => (
              <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {onSwapLanguages && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onSwapLanguages}
            className="rounded-full text-muted-foreground hover:text-foreground"
          >
            <ArrowLeftRight size={14} />
          </Button>
        )}

        <Select value={targetLanguage} onValueChange={onTargetLanguageChange}>
          <SelectTrigger className="h-8 w-auto px-2.5 rounded-[var(--radius-button)] border-0 bg-transparent text-sm gap-1 hover:bg-accent/50" size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {languages.map(lang => (
              <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {toolbarExtra}
      </div>

      {/* Dual-pane area */}
      <div className="flex-1 flex min-h-0">
        {/* Source pane */}
        <div className="flex-1 flex flex-col border-r border-border/30">
          <Textarea
            value={sourceText}
            onChange={e => onSourceTextChange(e.target.value)}
            placeholder={l.sourcePlaceholder}
            className="min-h-[180px] flex-1 rounded-none border-0 bg-transparent px-4 py-3 text-md tracking-[-0.14px] leading-6 text-foreground shadow-none placeholder:text-muted-foreground/40 focus-visible:ring-0 resize-none"
          />
          <div className="flex items-center justify-between px-4 py-2 border-t border-border/30">
            <Badge variant="secondary" className="text-xs px-1.5">
              {sourceText.length} {l.characters}
            </Badge>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon-xs" className="text-muted-foreground" onClick={() => handleCopy(sourceText)}>
                <Copy size={12} />
              </Button>
              {onSpeak && (
                <Button variant="ghost" size="icon-xs" className="text-muted-foreground" onClick={() => onSpeak(sourceText, sourceLanguage)}>
                  <Volume2 size={12} />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Target pane */}
        <div className="flex-1 flex flex-col">
          <ScrollArea className="flex-1 min-h-[180px]">
            <div className="px-4 py-3 text-md tracking-[-0.14px] leading-6 text-foreground">
              {isTranslating ? (
                <div className="flex items-center gap-2 text-muted-foreground/50">
                  <div className="w-3 h-3 border-2 border-foreground/20 border-t-foreground/60 rounded-full animate-spin" />
                  <span className="text-sm tracking-[-0.13px]">{l.translating}</span>
                </div>
              ) : translatedText ? (
                <p className="whitespace-pre-wrap">{translatedText}</p>
              ) : (
                <p className="text-muted-foreground/30">{l.targetPlaceholder}</p>
              )}
            </div>
          </ScrollArea>
          <div className="flex items-center justify-between px-4 py-2 border-t border-border/30">
            <Badge variant="secondary" className="text-xs px-1.5">
              {translatedText.length} {l.characters}
            </Badge>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon-xs" className="text-muted-foreground" onClick={() => handleCopy(translatedText)}>
                {copied ? <Check size={12} className="text-success" /> : <Copy size={12} />}
              </Button>
              {onSpeak && (
                <Button variant="ghost" size="icon-xs" className="text-muted-foreground" onClick={() => onSpeak(translatedText, targetLanguage)}>
                  <Volume2 size={12} />
                </Button>
              )}
              <Button size="xs" onClick={onTranslate} disabled={!sourceText.trim() || isTranslating} className="ml-1 gap-1">
                <ArrowRight size={12} />
                <span>{l.translateButton}</span>
              </Button>
            </div>
          </div>
        </div>

        {/* History side panel slot */}
        {showHistory && historyContent && (
          <div className="w-[280px] flex-shrink-0 border-l border-border/40 flex flex-col bg-background">
            {historyContent}
          </div>
        )}
      </div>

      {/* Status bar */}
      <Separator />
      <div className="flex items-center justify-between px-4 py-1.5 bg-muted/20 text-xs text-muted-foreground/60 tracking-[-0.12px] shrink-0">
        <span>{l.sourceLabel}: {sourceText.length} {l.characters} / {wordCount(sourceText)} {l.words}</span>
        <span>{l.targetLabel}: {translatedText.length} {l.characters} / {wordCount(translatedText)} {l.words}</span>
      </div>

      {children}
    </div>
  )
}

export { TranslationPanel }
