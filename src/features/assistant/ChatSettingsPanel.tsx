import React, { useState } from 'react';
import { X, ChevronDown, ChevronRight, HelpCircle, SlidersHorizontal } from 'lucide-react';
import { motion } from 'motion/react';

// ===========================
// Toggle Switch
// ===========================
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-[34px] h-[18px] rounded-full transition-colors flex-shrink-0 ${checked ? 'bg-cherry-primary' : 'bg-foreground/15'}`}
    >
      <div className={`absolute top-[2px] w-[14px] h-[14px] rounded-full bg-white shadow-sm transition-transform ${checked ? 'left-[17px]' : 'left-[2px]'}`} />
    </button>
  );
}

// ===========================
// Select Dropdown
// ===========================
function MiniSelect({ value, options, onChange }: { value: string; options: string[]; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1 text-[11px] text-foreground/70 hover:text-foreground transition-colors"
      >
        <span>{value}</span>
        <ChevronDown size={10} className="text-muted-foreground/40" />
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-1 w-28 bg-popover border border-border rounded-lg shadow-xl z-50 py-0.5">
          {options.map(opt => (
            <button
              key={opt}
              onClick={() => { onChange(opt); setOpen(false); }}
              className={`w-full text-left px-2.5 py-[5px] text-[10px] transition-colors ${opt === value ? 'text-foreground bg-foreground/8' : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'}`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ===========================
// Form Row
// ===========================
function FormRow({ label, help, children }: { label: string; help?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-[7px] min-h-[32px]">
      <span className="text-[11px] text-foreground/70 flex items-center gap-1">
        {label}
        {help && <HelpCircle size={10} className="text-muted-foreground/30" />}
      </span>
      <div className="flex items-center">{children}</div>
    </div>
  );
}

// ===========================
// Collapsible Section
// ===========================
function Section({ title, defaultOpen = true, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border/15 last:border-b-0">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 py-2.5 w-full text-left text-[11px] text-foreground/80 hover:text-foreground transition-colors"
      >
        {open ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
        <span>{title}</span>
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
        <span className="text-[11px] text-foreground/80 flex items-center gap-1.5">
          <SlidersHorizontal size={11} className="text-muted-foreground/60" />
          参数设置
        </span>
        <button
          onClick={onClose}
          className="w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground/50 hover:text-foreground hover:bg-accent/30 transition-colors"
        >
          <X size={12} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-1 [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:bg-border/25 [&::-webkit-scrollbar-thumb]:rounded-full">
        {/* OpenAI Settings */}
        <Section title="OpenAI 设置">
          <FormRow label="服务层级" help>
            <MiniSelect value={serviceLevel} options={['忽略', '低', '中', '高']} onChange={setServiceLevel} />
          </FormRow>
          <FormRow label="摘要模式" help>
            <MiniSelect value={summaryMode} options={['关闭', '自动', '简洁', '详细']} onChange={setSummaryMode} />
          </FormRow>
          <FormRow label="详细程度" help>
            <MiniSelect value={detailLevel} options={['忽略', '简洁', '普通', '详细']} onChange={setDetailLevel} />
          </FormRow>
          <FormRow label="包含用量" help>
            <MiniSelect value={includeUsage} options={['忽略', '开启', '关闭']} onChange={setIncludeUsage} />
          </FormRow>
        </Section>

        {/* Message Settings */}
        <Section title="消息设置">
          <FormRow label="显示提示词"><Toggle checked={showPrompt} onChange={setShowPrompt} /></FormRow>
          <FormRow label="使用衬线字体"><Toggle checked={useSerif} onChange={setUseSerif} /></FormRow>
          <FormRow label="思考内容自动折叠" help><Toggle checked={autoFoldThinking} onChange={setAutoFoldThinking} /></FormRow>
          <FormRow label="显示消息大纲"><Toggle checked={showOutline} onChange={setShowOutline} /></FormRow>
          <FormRow label="消息样式">
            <MiniSelect value={msgStyle} options={['气泡', '卡片', '紧凑']} onChange={setMsgStyle} />
          </FormRow>
          <FormRow label="多模型回答样式">
            <MiniSelect value={multiModelStyle} options={['横向排列', '纵向排列', '标签切换']} onChange={setMultiModelStyle} />
          </FormRow>
          <FormRow label="对话导航按钮">
            <MiniSelect value={navButton} options={['上下按钮', '滚动条', '隐藏']} onChange={setNavButton} />
          </FormRow>
          <div className="py-[7px]">
            <span className="text-[11px] text-foreground/70">消息字体大小</span>
            <div className="mt-2">
              <input
                type="range"
                min={0}
                max={100}
                value={fontSize}
                onChange={e => setFontSize(Number(e.target.value))}
                className="w-full h-[3px] rounded-full appearance-none bg-foreground/10 accent-cherry-primary [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cherry-primary [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:shadow-sm"
              />
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-[10px] text-muted-foreground/40">A</span>
                <span className="text-[10px] text-muted-foreground/50 px-1.5 py-[1px] rounded bg-accent/40">默认</span>
                <span className="text-[12px] text-muted-foreground/40">A</span>
              </div>
            </div>
          </div>
        </Section>

        {/* Math Formula Settings */}
        <Section title="数学公式设置" defaultOpen={false}>
          <FormRow label="数学公式引擎">
            <MiniSelect value={mathEngine} options={['KaTeX', 'MathJax']} onChange={setMathEngine} />
          </FormRow>
          <FormRow label="启用 $...$ " help><Toggle checked={enableDollar} onChange={setEnableDollar} /></FormRow>
        </Section>

        {/* Code Block Settings */}
        <Section title="代码块设置" defaultOpen={false}>
          <FormRow label="代码风格">
            <MiniSelect value={codeStyle} options={['auto', 'monokai', 'github', 'dracula', 'nord']} onChange={setCodeStyle} />
          </FormRow>
          <FormRow label="花式代码块" help><Toggle checked={fancyCode} onChange={setFancyCode} /></FormRow>
          <FormRow label="代码执行" help><Toggle checked={codeExec} onChange={setCodeExec} /></FormRow>
          {codeExec && (
            <FormRow label="超时时间" help>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={execTimeout}
                  onChange={e => setExecTimeout(Number(e.target.value))}
                  className="w-8 text-right text-[11px] text-foreground/70 bg-transparent outline-none"
                  min={1}
                  max={60}
                />
              </div>
            </FormRow>
          )}
          <FormRow label="代码编辑器"><Toggle checked={codeEditor} onChange={setCodeEditor} /></FormRow>
          <FormRow label="高亮当前行"><Toggle checked={highlightLine} onChange={setHighlightLine} /></FormRow>
          <FormRow label="折叠控件"><Toggle checked={foldControl} onChange={setFoldControl} /></FormRow>
          <FormRow label="自动补全"><Toggle checked={autoComplete} onChange={setAutoComplete} /></FormRow>
          <FormRow label="快捷键"><Toggle checked={shortcutKeys} onChange={setShortcutKeys} /></FormRow>
          <FormRow label="代码显示行号"><Toggle checked={showLineNum} onChange={setShowLineNum} /></FormRow>
          <FormRow label="代码块可折叠"><Toggle checked={codeFoldable} onChange={setCodeFoldable} /></FormRow>
          <FormRow label="代码块可换行"><Toggle checked={codeWrap} onChange={setCodeWrap} /></FormRow>
          <FormRow label="启用预览工具" help><Toggle checked={previewTool} onChange={setPreviewTool} /></FormRow>
        </Section>

        {/* Input Settings */}
        <Section title="输入设置" defaultOpen={false}>
          <FormRow label="显示预估 Token 数"><Toggle checked={showTokenCount} onChange={setShowTokenCount} /></FormRow>
          <FormRow label="长文本粘贴为文件"><Toggle checked={longTextAsFile} onChange={setLongTextAsFile} /></FormRow>
          <FormRow label="Markdown 渲染输入消息"><Toggle checked={mdInput} onChange={setMdInput} /></FormRow>
          <FormRow label="3 个空格快速翻译"><Toggle checked={spaceTranslate} onChange={setSpaceTranslate} /></FormRow>
          <FormRow label="显示翻译确认对话框"><Toggle checked={showTranslateConfirm} onChange={setShowTranslateConfirm} /></FormRow>
          <FormRow label="启用 / 和 @ 触发快捷菜单"><Toggle checked={enableAtMenu} onChange={setEnableAtMenu} /></FormRow>
          <FormRow label="删除消息前确认"><Toggle checked={deleteConfirm} onChange={setDeleteConfirm} /></FormRow>
          <FormRow label="重新生成消息前确认"><Toggle checked={regenerateConfirm} onChange={setRegenerateConfirm} /></FormRow>
          <FormRow label="目标语言">
            <MiniSelect value={targetLang} options={['简体中文', '英语', '日语', '韩语', '法语', '德语']} onChange={setTargetLang} />
          </FormRow>
          <FormRow label="发送快捷键">
            <MiniSelect value={sendKey} options={['Enter', 'Ctrl+Enter', 'Shift+Enter']} onChange={setSendKey} />
          </FormRow>
        </Section>

        {/* Bottom spacer */}
        <div className="h-2" />
      </div>
    </motion.div>
  );
}
