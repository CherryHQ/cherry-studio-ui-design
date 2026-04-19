import React, { useState } from 'react';
import { X, ChevronDown, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { motion } from 'motion/react';
import { Button, Input, Switch, Slider, InlineSelect, FormRow } from '@cherry-studio/ui';

// ===========================
// Collapsible Section
// ===========================
function Section({ title, defaultOpen = true, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border/15 last:border-b-0">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 py-2.5 w-full text-left text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        {open ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
        <span className="font-medium">{title}</span>
      </button>
      {open && <div className="pb-2">{children}</div>}
    </div>
  );
}

// ===========================
// ChatSettingsPanel
// ===========================
export function ChatSettingsPanel({ onClose }: { onClose: () => void }) {
  // OpenAI Settings
  const [serviceLevel, setServiceLevel] = useState('忽略');
  const [summaryMode, setSummaryMode] = useState('关闭');
  const [detailLevel, setDetailLevel] = useState('忽略');
  const [includeUsage, setIncludeUsage] = useState('忽略');

  // Message Settings
  const [showPrompt, setShowPrompt] = useState(true);
  const [useSerif, setUseSerif] = useState(true);
  const [autoFoldThinking, setAutoFoldThinking] = useState(true);
  const [showOutline, setShowOutline] = useState(true);
  const [msgStyle, setMsgStyle] = useState('气泡');
  const [multiModelStyle, setMultiModelStyle] = useState('横向排列');
  const [navButton, setNavButton] = useState('上下按钮');
  const [fontSize, setFontSize] = useState(50);

  // Math Formula Settings
  const [mathEngine, setMathEngine] = useState('KaTeX');
  const [enableDollar, setEnableDollar] = useState(true);

  // Code Block Settings
  const [codeStyle, setCodeStyle] = useState('auto');
  const [fancyCode, setFancyCode] = useState(true);
  const [codeExec, setCodeExec] = useState(true);
  const [execTimeout, setExecTimeout] = useState(2);
  const [codeEditor, setCodeEditor] = useState(true);
  const [highlightLine, setHighlightLine] = useState(true);
  const [foldControl, setFoldControl] = useState(true);
  const [autoComplete, setAutoComplete] = useState(true);
  const [shortcutKeys, setShortcutKeys] = useState(true);
  const [showLineNum, setShowLineNum] = useState(true);
  const [codeFoldable, setCodeFoldable] = useState(true);
  const [codeWrap, setCodeWrap] = useState(true);
  const [previewTool, setPreviewTool] = useState(true);

  // Input Settings
  const [showTokenCount, setShowTokenCount] = useState(true);
  const [longTextAsFile, setLongTextAsFile] = useState(false);
  const [mdInput, setMdInput] = useState(true);
  const [spaceTranslate, setSpaceTranslate] = useState(false);
  const [showTranslateConfirm, setShowTranslateConfirm] = useState(true);
  const [enableAtMenu, setEnableAtMenu] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(true);
  const [regenerateConfirm, setRegenerateConfirm] = useState(true);
  const [targetLang, setTargetLang] = useState('简体中文');
  const [sendKey, setSendKey] = useState('Enter');

  const toOpts = (arr: string[]) => arr.map(v => ({ value: v, label: v }));

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ type: 'spring', damping: 25, stiffness: 350 }}
      className="absolute top-2 right-2 bottom-2 w-[340px] z-40 flex flex-col bg-popover border border-border/30 rounded-2xl shadow-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="h-[38px] flex items-center justify-between px-3 flex-shrink-0 border-b border-border/30">
        <span className="text-xs text-foreground/80 flex items-center gap-1.5">
          <SlidersHorizontal size={11} className="text-muted-foreground/60" />
          参数设置
        </span>
        <Button
          variant="ghost"
          onClick={onClose}
          className="w-6 h-6 rounded-md p-0 text-muted-foreground/50 hover:text-foreground hover:bg-accent/30"
        >
          <X size={12} />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-1 [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:bg-border/25 [&::-webkit-scrollbar-thumb]:rounded-full">
        {/* OpenAI Settings */}
        <Section title="OpenAI 设置">
          <FormRow label="服务层级" desc=" ">
            <InlineSelect value={serviceLevel} options={toOpts(['忽略', '低', '中', '高'])} onChange={setServiceLevel} />
          </FormRow>
          <FormRow label="摘要模式" desc=" ">
            <InlineSelect value={summaryMode} options={toOpts(['关闭', '自动', '简洁', '详细'])} onChange={setSummaryMode} />
          </FormRow>
          <FormRow label="详细程度" desc=" ">
            <InlineSelect value={detailLevel} options={toOpts(['忽略', '简洁', '普通', '详细'])} onChange={setDetailLevel} />
          </FormRow>
          <FormRow label="包含用量" desc=" ">
            <InlineSelect value={includeUsage} options={toOpts(['忽略', '开启', '关闭'])} onChange={setIncludeUsage} />
          </FormRow>
        </Section>

        {/* Message Settings */}
        <Section title="消息设置">
          <FormRow label="显示提示词"><Switch checked={showPrompt} onCheckedChange={setShowPrompt} /></FormRow>
          <FormRow label="使用衬线字体"><Switch checked={useSerif} onCheckedChange={setUseSerif} /></FormRow>
          <FormRow label="思考内容自动折叠" desc=" "><Switch checked={autoFoldThinking} onCheckedChange={setAutoFoldThinking} /></FormRow>
          <FormRow label="显示消息大纲"><Switch checked={showOutline} onCheckedChange={setShowOutline} /></FormRow>
          <FormRow label="消息样式">
            <InlineSelect value={msgStyle} options={toOpts(['气泡', '卡片', '紧凑'])} onChange={setMsgStyle} />
          </FormRow>
          <FormRow label="多模型回答样式">
            <InlineSelect value={multiModelStyle} options={toOpts(['横向排列', '纵向排列', '标签切换'])} onChange={setMultiModelStyle} />
          </FormRow>
          <FormRow label="对话导航按钮">
            <InlineSelect value={navButton} options={toOpts(['上下按钮', '滚动条', '隐藏'])} onChange={setNavButton} />
          </FormRow>
          <FormRow label="消息字体大小" direction="vertical">
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground/40">A</span>
              <Slider value={[fontSize]} onValueChange={v => setFontSize(v[0])} max={100} step={1} className="flex-1" />
              <span className="text-sm text-muted-foreground/40">A</span>
            </div>
            <div className="text-center">
              <span className="text-xs text-muted-foreground/50 px-1.5 py-[1px] rounded bg-accent/40">默认</span>
            </div>
          </FormRow>
        </Section>

        {/* Math Formula Settings */}
        <Section title="数学公式设置" defaultOpen={false}>
          <FormRow label="数学公式引擎">
            <InlineSelect value={mathEngine} options={toOpts(['KaTeX', 'MathJax'])} onChange={setMathEngine} />
          </FormRow>
          <FormRow label="启用 $...$ " desc=" "><Switch checked={enableDollar} onCheckedChange={setEnableDollar} /></FormRow>
        </Section>

        {/* Code Block Settings */}
        <Section title="代码块设置" defaultOpen={false}>
          <FormRow label="代码风格">
            <InlineSelect value={codeStyle} options={toOpts(['auto', 'monokai', 'github', 'dracula', 'nord'])} onChange={setCodeStyle} />
          </FormRow>
          <FormRow label="花式代码块" desc=" "><Switch checked={fancyCode} onCheckedChange={setFancyCode} /></FormRow>
          <FormRow label="代码执行" desc=" "><Switch checked={codeExec} onCheckedChange={setCodeExec} /></FormRow>
          {codeExec && (
            <FormRow label="超时时间" desc=" ">
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  value={execTimeout}
                  onChange={e => setExecTimeout(Number(e.target.value))}
                  className="w-8 text-right text-xs text-foreground/70 bg-transparent h-auto py-0 px-0 border-0 shadow-none focus-visible:ring-0"
                  min={1}
                  max={60}
                />
              </div>
            </FormRow>
          )}
          <FormRow label="代码编辑器"><Switch checked={codeEditor} onCheckedChange={setCodeEditor} /></FormRow>
          <FormRow label="高亮当前行"><Switch checked={highlightLine} onCheckedChange={setHighlightLine} /></FormRow>
          <FormRow label="折叠控件"><Switch checked={foldControl} onCheckedChange={setFoldControl} /></FormRow>
          <FormRow label="自动补全"><Switch checked={autoComplete} onCheckedChange={setAutoComplete} /></FormRow>
          <FormRow label="快捷键"><Switch checked={shortcutKeys} onCheckedChange={setShortcutKeys} /></FormRow>
          <FormRow label="代码显示行号"><Switch checked={showLineNum} onCheckedChange={setShowLineNum} /></FormRow>
          <FormRow label="代码块可折叠"><Switch checked={codeFoldable} onCheckedChange={setCodeFoldable} /></FormRow>
          <FormRow label="代码块可换行"><Switch checked={codeWrap} onCheckedChange={setCodeWrap} /></FormRow>
          <FormRow label="启用预览工具" desc=" "><Switch checked={previewTool} onCheckedChange={setPreviewTool} /></FormRow>
        </Section>

        {/* Input Settings */}
        <Section title="输入设置" defaultOpen={false}>
          <FormRow label="显示预估 Token 数"><Switch checked={showTokenCount} onCheckedChange={setShowTokenCount} /></FormRow>
          <FormRow label="长文本粘贴为文件"><Switch checked={longTextAsFile} onCheckedChange={setLongTextAsFile} /></FormRow>
          <FormRow label="Markdown 渲染输入消息"><Switch checked={mdInput} onCheckedChange={setMdInput} /></FormRow>
          <FormRow label="3 个空格快速翻译"><Switch checked={spaceTranslate} onCheckedChange={setSpaceTranslate} /></FormRow>
          <FormRow label="显示翻译确认对话框"><Switch checked={showTranslateConfirm} onCheckedChange={setShowTranslateConfirm} /></FormRow>
          <FormRow label="启用 / 和 @ 触发快捷菜单"><Switch checked={enableAtMenu} onCheckedChange={setEnableAtMenu} /></FormRow>
          <FormRow label="删除消息前确认"><Switch checked={deleteConfirm} onCheckedChange={setDeleteConfirm} /></FormRow>
          <FormRow label="重新生成消息前确认"><Switch checked={regenerateConfirm} onCheckedChange={setRegenerateConfirm} /></FormRow>
          <FormRow label="目标语言">
            <InlineSelect value={targetLang} options={toOpts(['简体中文', '英语', '日语', '韩语', '法语', '德语'])} onChange={setTargetLang} />
          </FormRow>
          <FormRow label="发送快捷键">
            <InlineSelect value={sendKey} options={toOpts(['Enter', 'Ctrl+Enter', 'Shift+Enter'])} onChange={setSendKey} />
          </FormRow>
        </Section>

        {/* Bottom spacer */}
        <div className="h-2" />
      </div>
    </motion.div>
  );
}
