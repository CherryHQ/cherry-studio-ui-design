import React, { useState } from "react"
import { TranslationPanel, Button, Badge, ScrollArea } from "@cherry-studio/ui"
import { Section, type PropDef } from "../components/Section"
import { Clock, Star, ArrowRight } from "lucide-react"

const LANGUAGES = [
  { value: "auto", label: "Auto Detect" },
  { value: "zh", label: "Chinese" },
  { value: "en", label: "English" },
  { value: "ja", label: "Japanese" },
  { value: "ko", label: "Korean" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
]

const TARGET_LANGUAGES = LANGUAGES.filter(l => l.value !== "auto")

const HISTORY = [
  { id: 0, source: "人工智能正在改变我们的生活方式", translated: "AI is transforming the way we live", srcLang: "zh", tgtLang: "en", time: "10:32" },
  { id: 1, source: "The quick brown fox jumps over the lazy dog.", translated: "敏捷的棕色狐狸跳过了懒惰的狗。", srcLang: "en", tgtLang: "zh", time: "10:15" },
  { id: 2, source: "桜の花が満開になると春を感じます", translated: "When cherry blossoms are in full bloom, you feel spring", srcLang: "ja", tgtLang: "en", time: "09:48" },
]

const panelProps: PropDef[] = [
  { name: "sourceLanguage", type: "string", description: "Source language value" },
  { name: "targetLanguage", type: "string", description: "Target language value" },
  { name: "sourceText", type: "string", description: "Source text content" },
  { name: "translatedText", type: "string", description: "Translated text content" },
  { name: "onTranslate", type: "() => void", description: "Translate action" },
  { name: "isTranslating", type: "boolean", default: "false", description: "Loading state" },
  { name: "languages", type: "TranslationLanguage[]", description: "Available languages" },
  { name: "showHistory", type: "boolean", default: "false", description: "Show history panel" },
]

export function TranslationPanelDemo() {
  const [srcLang, setSrcLang] = useState("auto")
  const [tgtLang, setTgtLang] = useState("en")
  const [sourceText, setSourceText] = useState("")
  const [translatedText, setTranslatedText] = useState("")
  const [isTranslating, setIsTranslating] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [starredIds, setStarredIds] = useState<Set<number>>(new Set([0]))

  const handleTranslate = () => {
    if (!sourceText.trim()) return
    setIsTranslating(true)
    setTimeout(() => {
      setTranslatedText(`[Mock] Translation of "${sourceText.slice(0, 40)}..." into ${tgtLang}.`)
      setIsTranslating(false)
    }, 800)
  }

  const handleSwap = () => {
    if (srcLang === "auto") return
    const tmp = srcLang
    setSrcLang(tgtLang)
    setTgtLang(tmp)
    if (translatedText) {
      const tmpText = sourceText
      setSourceText(translatedText)
      setTranslatedText(tmpText)
    }
  }

  const handleSpeak = (text: string) => {
    speechSynthesis.cancel()
    speechSynthesis.speak(new SpeechSynthesisUtterance(text))
  }

  return (
    <>
      <Section
        title="Basic Translation"
        props={panelProps}
        code={`<TranslationPanel
  sourceLanguage={srcLang}
  targetLanguage={tgtLang}
  onSourceLanguageChange={setSrcLang}
  onTargetLanguageChange={setTgtLang}
  onSwapLanguages={handleSwap}
  languages={LANGUAGES}
  sourceText={sourceText}
  onSourceTextChange={setSourceText}
  translatedText={translatedText}
  onTranslate={handleTranslate}
  isTranslating={isTranslating}
  onSpeak={handleSpeak}
/>`}
      >
        <div className="rounded-[24px] border bg-background overflow-hidden max-w-3xl">
          <TranslationPanel
            sourceLanguage={srcLang}
            targetLanguage={tgtLang}
            onSourceLanguageChange={setSrcLang}
            onTargetLanguageChange={setTgtLang}
            onSwapLanguages={handleSwap}
            languages={TARGET_LANGUAGES}
            sourceLanguages={LANGUAGES}
            sourceText={sourceText}
            onSourceTextChange={setSourceText}
            translatedText={translatedText}
            onTranslate={handleTranslate}
            isTranslating={isTranslating}
            onSpeak={handleSpeak}
          />
        </div>
      </Section>

      <Section
        title="With History Panel"
        code={`<TranslationPanel showHistory historyContent={...} />`}
      >
        <div className="rounded-[24px] border bg-background overflow-hidden max-w-4xl">
          <div className="flex items-center justify-end px-4 py-2 border-b border-border/30">
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => setShowHistory(v => !v)}
              className={showHistory ? "text-foreground bg-accent" : "text-muted-foreground"}
            >
              <Clock size={14} />
            </Button>
          </div>
          <TranslationPanel
            sourceLanguage={srcLang}
            targetLanguage={tgtLang}
            onSourceLanguageChange={setSrcLang}
            onTargetLanguageChange={setTgtLang}
            onSwapLanguages={handleSwap}
            languages={TARGET_LANGUAGES}
            sourceLanguages={LANGUAGES}
            sourceText={sourceText}
            onSourceTextChange={setSourceText}
            translatedText={translatedText}
            onTranslate={handleTranslate}
            isTranslating={isTranslating}
            onSpeak={handleSpeak}
            showHistory={showHistory}
            historyContent={
              <>
                <div className="h-11 flex items-center justify-between px-3 border-b border-border/40 flex-shrink-0">
                  <div className="flex items-center gap-1.5">
                    <Clock size={12} className="text-muted-foreground" />
                    <span className="text-sm tracking-tight font-medium">History</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">{HISTORY.length}</Badge>
                </div>
                <ScrollArea className="flex-1">
                  {HISTORY.map(h => (
                    <div
                      key={h.id}
                      className="px-3 py-2.5 border-b border-border/20 hover:bg-accent/30 transition-colors cursor-pointer group"
                      onClick={() => { setSourceText(h.source); setTranslatedText(h.translated) }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground/50">
                          <span>{h.srcLang}</span>
                          <ArrowRight size={9} />
                          <span>{h.tgtLang}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-muted-foreground/30">{h.time}</span>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={e => { e.stopPropagation(); setStarredIds(prev => { const n = new Set(prev); n.has(h.id) ? n.delete(h.id) : n.add(h.id); return n }) }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-5 w-5"
                          >
                            <Star size={11} className={starredIds.has(h.id) ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30"} />
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-foreground/60 truncate">{h.source}</p>
                      <p className="text-xs text-muted-foreground/40 truncate mt-0.5">{h.translated}</p>
                    </div>
                  ))}
                </ScrollArea>
              </>
            }
          />
        </div>
      </Section>
    </>
  )
}
