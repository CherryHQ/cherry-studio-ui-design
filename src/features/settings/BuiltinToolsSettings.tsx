import { useState, type ReactNode } from 'react';
import { Check, ChevronDown, FileText, Globe, Mic, ScanText, Search, Volume2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@cherry-studio/ui';
import { Button } from '@cherrystudio/ui/components/primitives/button';
import { Switch } from '@cherrystudio/ui/components/primitives/switch';
import {
  useWorkspaceSettings,
  type BuiltinToolId,
  type SpeechProviderSettings,
  type ToolProviderFields,
} from '@/app/context/WorkspaceSettingsContext';

const TOOLS: { id: BuiltinToolId; name: string; Icon: typeof Globe }[] = [
  { id: 'browser', name: '浏览器', Icon: Globe },
  { id: 'search', name: '网络搜索', Icon: Search },
  { id: 'documents', name: '文档处理', Icon: FileText },
  { id: 'ocr', name: 'OCR', Icon: ScanText },
  { id: 'asr', name: 'ASR', Icon: Mic },
  { id: 'tts', name: 'TTS', Icon: Volume2 },
];

const SEARCH_PROVIDERS = [
  { id: 'tavily', name: 'Tavily', key: true, host: true },
  { id: 'zhipu', name: 'Zhipu', key: false, host: true, note: '密钥沿用模型服务里的智谱 API Key。此原型不读取真实密钥。' },
  { id: 'searxng', name: 'SearxNG', key: false, host: true, auth: true },
  { id: 'exa', name: 'Exa', key: true, host: true },
  { id: 'exa-mcp', name: 'Exa MCP', key: false, host: true, note: 'MCP 端点。演示不会连接该地址。' },
  { id: 'bocha', name: 'Bocha', key: true, host: true },
  { id: 'querit', name: 'Querit', key: true, host: true },
  { id: 'jina', name: 'Jina', key: true, host: true },
  { id: 'firecrawl', name: 'Firecrawl', key: true, host: true },
  { id: 'parallel', name: 'Parallel', key: true, host: true },
  { id: 'serply', name: 'Serply', key: true, host: true },
] as const;

const FETCH_PROVIDERS = [
  { id: 'jina', name: 'Jina', key: true, host: true },
  { id: 'fetch', name: 'fetch', key: false, host: false, note: '使用内置 fetch，不需要密钥或地址。' },
  { id: 'querit', name: 'Querit', key: true, host: true },
  { id: 'firecrawl', name: 'Firecrawl', key: true, host: true },
] as const;

const DOC_PROVIDERS = [
  { id: 'paddleocr', name: 'PaddleOCR', api: true, model: true },
  { id: 'local-document', name: '本地文档', api: false, model: false },
  { id: 'mineru', name: 'MinerU', api: true, model: false },
  { id: 'doc2x', name: 'Doc2x', api: true, model: false },
  { id: 'mistral', name: 'Mistral', api: true, model: false },
  { id: 'open-mineru', name: 'Open MinerU', api: true, model: false },
] as const;

const OCR_PROVIDERS = [
  { id: 'system', name: 'System OCR', api: false, model: false },
  { id: 'paddleocr', name: 'PaddleOCR', api: true, model: true },
  { id: 'local-paddleocr', name: '本地 PaddleOCR', api: false, model: false },
  { id: 'tesseract', name: 'Tesseract', api: false, model: false },
  { id: 'mistral', name: 'Mistral', api: true, model: false },
  { id: 'ovocr', name: 'Intel OV OCR', api: false, model: false },
] as const;

const DOC_MODELS = ['PaddleOCR-VL-1.5', 'PaddleOCR-VL-1.6', 'PaddleOCR-VL', 'PP-StructureV3'];
const OCR_MODELS = ['PP-OCRv6', 'PP-OCRv5'];
const TESSERACT_LANGS = [
  ['chi_sim+eng', '简体中文 + English'],
  ['chi_sim', '简体中文'],
  ['eng', 'English'],
  ['jpn', '日本語'],
] as const;

const selectTriggerClass = 'h-8 w-56 max-w-full bg-transparent font-normal shadow-none';

function FlatSelect({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  options: readonly { id: string; name: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger id={id} aria-label={label} className={selectTriggerClass}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="z-[var(--z-popover)]" position="popper">
        {options.map((option) => (
          <SelectItem key={option.id} value={option.id}>
            {option.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function TextField({
  id,
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <Label htmlFor={id} className="block space-y-2 border-t border-border py-3">
      <span className="text-sm">{label}</span>
      <Input
        id={id}
        aria-label={label}
        className="shadow-none"
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </Label>
  );
}

function patchFields(
  fields: Record<string, ToolProviderFields>,
  key: string,
  changes: Partial<ToolProviderFields>,
) {
  const current = fields[key];
  if (!current) return fields;
  return { ...fields, [key]: { ...current, ...changes } };
}

export function BuiltinToolsSettingsPage() {
  const settings = useWorkspaceSettings();
  const active = settings.builtinTool;
  return (
    <div className="flex min-h-0 flex-1">
      <nav aria-label="内置工具" className="border-border flex w-[150px] shrink-0 flex-col border-r">
        <p className="text-muted-foreground px-3 pt-4 pb-2 text-xs font-medium">工具</p>
        <div className="min-h-0 flex-1 space-y-1 overflow-y-auto px-2.5 pb-3">
          {TOOLS.map(({ id, name, Icon }) => (
            <Button
              key={id}
              variant="ghost"
              size="sm"
              aria-pressed={active === id}
              className={`h-9 w-full justify-start gap-2 rounded-xl px-2 shadow-none ${active === id ? 'bg-accent text-foreground' : 'text-muted-foreground'}`}
              onClick={() => settings.setBuiltinTool(id)}
            >
              <Icon size={14} />
              <span className="truncate">{name}</span>
            </Button>
          ))}
        </div>
      </nav>
      <div className="min-w-0 flex-1 overflow-y-auto px-6 py-5">
        {active === 'browser' ? (
          <BrowserSettings />
        ) : active === 'search' ? (
          <SearchSettings />
        ) : active === 'documents' ? (
          <ProcessorSettings feature="doc" />
        ) : active === 'ocr' ? (
          <ProcessorSettings feature="ocr" />
        ) : (
          <SpeechSettings kind={active} />
        )}
      </div>
    </div>
  );
}

function BrowserSettings() {
  const { browserSettings, setBrowserSettings } = useWorkspaceSettings();
  const [dialog, setDialog] = useState<'import' | 'history' | 'clear' | null>(null);
  const [status, setStatus] = useState('');
  const copy = {
    import: ['导入浏览器数据', '演示导入。不会读取 Chrome、Safari 或其他浏览器的数据。'],
    history: ['浏览记录', '演示记录：example.com · 今天。不会打开真实历史。'],
    clear: ['清除浏览数据', '演示清除。没有删除历史、Cookie 或缓存。'],
  } as const;
  return (
    <div>
      <h2 className="text-sm font-medium">浏览器</h2>
      <div className="mt-4 border-t border-border">
        <ToggleRow
          id="browser-ai-control"
          title="允许 AI 控制浏览器"
          description="允许助手和智能体浏览和操作网页，无需逐次确认。开启后长期生效，直到你关闭。"
          checked={browserSettings.allowAiControl}
          onChange={(allowAiControl) => setBrowserSettings((current) => ({ ...current, allowAiControl }))}
        />
        <ToggleRow
          id="browser-open-links"
          title="通过内置浏览器打开网站链接"
          description="网站链接将在浏览器标签页中打开，并共享已有的网站数据。"
          checked={browserSettings.openLinksInBrowser}
          onChange={(openLinksInBrowser) => setBrowserSettings((current) => ({ ...current, openLinksInBrowser }))}
        />
      </div>
      <div className="mt-6 border-t border-border">
        {(
          [
            ['import', '导入浏览器数据', '从其他浏览器迁移浏览数据。', '导入'],
            ['history', '浏览记录', '查找并重新打开访问过的网页。', '管理'],
            ['clear', '清除浏览数据', '管理历史记录、网站数据和缓存文件。', '清除'],
          ] as const
        ).map(([kind, title, description, action]) => (
          <div key={kind} className="flex items-center justify-between gap-3 border-b border-border py-3">
            <div>
              <p className="text-sm">{title}</p>
              <p className="text-muted-foreground mt-1 text-xs">{description}</p>
            </div>
            <Button variant="outline" size="sm" className="shrink-0" onClick={() => setDialog(kind)}>
              {action}
            </Button>
          </div>
        ))}
      </div>
      {status && (
        <p role="status" className="text-muted-foreground mt-3 text-xs">
          {status}
        </p>
      )}
      <Dialog open={dialog !== null} onOpenChange={(open) => !open && setDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialog ? copy[dialog][0] : ''}</DialogTitle>
            <DialogDescription>{dialog ? copy[dialog][1] : ''}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="emphasis"
              size="sm"
              onClick={() => {
                if (dialog) setStatus(copy[dialog][1]);
                setDialog(null);
              }}
            >
              知道了
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ToggleRow({
  id,
  title,
  description,
  checked,
  onChange,
}: {
  id: string;
  title: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border py-3">
      <div>
        <Label htmlFor={id} className="text-sm">
          {title}
        </Label>
        <p className="text-muted-foreground mt-1 text-xs leading-5">{description}</p>
      </div>
      <Switch id={id} aria-label={title} size="xs" className="shadow-none" checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function SearchSettings() {
  const settings = useWorkspaceSettings();
  const [advanced, setAdvanced] = useState(false);
  const search = SEARCH_PROVIDERS.find((item) => item.id === settings.searchProviderId) ?? SEARCH_PROVIDERS[0];
  const fetchProvider = FETCH_PROVIDERS.find((item) => item.id === settings.fetchProviderId) ?? FETCH_PROVIDERS[0];
  const searchFields = settings.toolFields[`search:${search.id}`];
  const fetchFields = settings.toolFields[`fetch:${fetchProvider.id}`];
  const update = (key: string, changes: Partial<ToolProviderFields>) =>
    settings.setToolFields((current) => patchFields(current, key, changes));
  return (
    <div className="space-y-6">
      <ProviderBlock
        title="搜索服务商"
        titleId="search-provider-title"
        description="专为 LLM 优化的搜索引擎。演示不会发起搜索。"
        selectId="search-provider"
        value={search.id}
        options={SEARCH_PROVIDERS}
        onChange={settings.setSearchProviderId}
      >
        {searchFields && (
          <CredentialFields
            idPrefix={`search-${search.id}`}
            fields={searchFields}
            showKey={search.key}
            showHost={search.host}
            showAuth={'auth' in search && search.auth}
            note={'note' in search ? search.note : undefined}
            onChange={(changes) => update(`search:${search.id}`, changes)}
          />
        )}
        <Button
          variant="ghost"
          size="sm"
          className="mt-2 px-0 shadow-none"
          aria-expanded={advanced}
          onClick={() => setAdvanced((open) => !open)}
        >
          高级设置
          <ChevronDown size={14} className={advanced ? 'rotate-180' : ''} />
        </Button>
        {advanced && (
          <div className="space-y-3 border-t border-border pt-3">
            <Label htmlFor="search-max-results" className="block space-y-2">
              <span className="text-sm">搜索结果个数</span>
              <Input
                id="search-max-results"
                aria-label="搜索结果个数"
                className="shadow-none"
                type="number"
                min={1}
                max={100}
                value={settings.searchAdvanced.maxResults}
                onChange={(event) =>
                  settings.setSearchAdvanced((current) => ({
                    ...current,
                    maxResults: Math.min(100, Math.max(1, Number(event.target.value) || 1)),
                  }))
                }
              />
            </Label>
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="search-compression">压缩方法</Label>
              <FlatSelect
                id="search-compression"
                label="压缩方法"
                value={settings.searchAdvanced.compression}
                options={[
                  { id: 'none', name: '不压缩' },
                  { id: 'cutoff', name: '按长度截断' },
                ]}
                onChange={(compression) =>
                  settings.setSearchAdvanced((current) => ({
                    ...current,
                    compression: compression === 'cutoff' ? 'cutoff' : 'none',
                  }))
                }
              />
            </div>
            {settings.searchAdvanced.compression === 'cutoff' && (
              <Label htmlFor="search-cutoff" className="block space-y-2">
                <span className="text-sm">截断长度</span>
                <Input
                  id="search-cutoff"
                  aria-label="截断长度"
                  className="shadow-none"
                  type="number"
                  min={1}
                  value={settings.searchAdvanced.cutoffLimit}
                  onChange={(event) =>
                    settings.setSearchAdvanced((current) => ({
                      ...current,
                      cutoffLimit: Math.max(1, Number(event.target.value) || 1),
                    }))
                  }
                />
              </Label>
            )}
            <Label htmlFor="search-blacklist" className="block space-y-2">
              <span className="text-sm">黑名单</span>
              <Textarea
                id="search-blacklist"
                aria-label="搜索黑名单"
                className="shadow-none"
                value={settings.searchAdvanced.blacklist}
                placeholder="每行一个域名或规则"
                onChange={(event) =>
                  settings.setSearchAdvanced((current) => ({ ...current, blacklist: event.target.value }))
                }
              />
            </Label>
          </div>
        )}
      </ProviderBlock>
      <ProviderBlock
        title="URL 获取服务商"
        titleId="fetch-provider-title"
        description="用于检索并提取网页正文。演示不会抓取网页。"
        selectId="fetch-provider"
        value={fetchProvider.id}
        options={FETCH_PROVIDERS}
        onChange={settings.setFetchProviderId}
      >
        {fetchFields && (
          <CredentialFields
            idPrefix={`fetch-${fetchProvider.id}`}
            fields={fetchFields}
            showKey={fetchProvider.key}
            showHost={fetchProvider.host}
            note={'note' in fetchProvider ? fetchProvider.note : undefined}
            onChange={(changes) => update(`fetch:${fetchProvider.id}`, changes)}
          />
        )}
      </ProviderBlock>
      <div className="flex items-center justify-between gap-4 border-t border-border py-3">
        <Label htmlFor="model-web-tools">优先使用模型内置 Web 工具</Label>
        <Switch
          id="model-web-tools"
          aria-label="优先使用模型内置 Web 工具"
          size="xs"
          className="shadow-none"
          checked={settings.modelToolsPreferred}
          onCheckedChange={settings.setModelToolsPreferred}
        />
      </div>
    </div>
  );
}

function ProviderBlock({
  title,
  titleId,
  description,
  selectId,
  value,
  options,
  onChange,
  children,
}: {
  title: string;
  titleId: string;
  description: string;
  selectId: string;
  value: string;
  options: readonly { id: string; name: string }[];
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={titleId} className="border-b border-border pb-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 id={titleId} className="text-sm font-medium">
            {title}
          </h2>
          <p className="text-muted-foreground mt-1 text-xs leading-5">{description}</p>
        </div>
        <FlatSelect id={selectId} label={title} value={value} options={options} onChange={onChange} />
      </div>
      {children}
    </section>
  );
}

function CredentialFields({
  idPrefix,
  fields,
  showKey,
  showHost,
  showAuth = false,
  note,
  onChange,
}: {
  idPrefix: string;
  fields: ToolProviderFields;
  showKey: boolean;
  showHost: boolean;
  showAuth?: boolean;
  note?: string;
  onChange: (changes: Partial<ToolProviderFields>) => void;
}) {
  return (
    <div>
      {showKey && (
        <TextField
          id={`${idPrefix}-key`}
          label="API 密钥"
          type="password"
          value={fields.apiKey}
          placeholder="仅保存在当前演示中"
          onChange={(apiKey) => onChange({ apiKey })}
        />
      )}
      {showAuth && (
        <>
          <TextField
            id={`${idPrefix}-username`}
            label="用户名"
            value={fields.username}
            onChange={(username) => onChange({ username })}
          />
          <TextField
            id={`${idPrefix}-password`}
            label="密码"
            type="password"
            value={fields.password}
            onChange={(password) => onChange({ password })}
          />
        </>
      )}
      {showHost && (
        <TextField
          id={`${idPrefix}-endpoint`}
          label="API 地址"
          value={fields.endpoint}
          onChange={(endpoint) => onChange({ endpoint })}
        />
      )}
      {note && <p className="text-muted-foreground pt-2 text-xs leading-5">{note}</p>}
    </div>
  );
}

function ProcessorSettings({ feature }: { feature: 'doc' | 'ocr' }) {
  const settings = useWorkspaceSettings();
  const providers = feature === 'doc' ? DOC_PROVIDERS : OCR_PROVIDERS;
  const selectedId = feature === 'doc' ? settings.documentProcessorId : settings.ocrProcessorId;
  const setSelectedId = feature === 'doc' ? settings.setDocumentProcessorId : settings.setOcrProcessorId;
  const provider = providers.find((item) => item.id === selectedId) ?? providers[0];
  const fieldKey = `${feature}:${provider.id}`;
  const current = settings.toolFields[fieldKey];
  const models = feature === 'doc' ? DOC_MODELS : OCR_MODELS;
  const update = (changes: Partial<ToolProviderFields>) =>
    settings.setToolFields((fields) => patchFields(fields, fieldKey, changes));
  return (
    <section aria-labelledby={`${feature}-title`}>
      <div className="flex items-start justify-between gap-3 border-b border-border pb-3">
        <div>
          <h2 id={`${feature}-title`} className="text-sm font-medium">
            {feature === 'doc' ? '文档处理' : 'OCR'}
          </h2>
          <p className="text-muted-foreground mt-1 text-xs">选择一个服务商。字段只保存在这次演示里，不会上传文件。</p>
        </div>
        <FlatSelect
          id={`${feature}-provider`}
          label={feature === 'doc' ? '文档处理服务商' : 'OCR 服务商'}
          value={provider.id}
          options={providers}
          onChange={setSelectedId}
        />
      </div>
      {provider.id === 'system' && (
        <p className="text-muted-foreground border-b border-border py-3 text-xs leading-5">
          演示状态：生产环境会检测 macOS Live Text / Windows OCR。此原型不检查本机引擎，也不需要 API 密钥。
        </p>
      )}
      {provider.id === 'ovocr' && (
        <p className="text-muted-foreground border-b border-border py-3 text-xs leading-5">
          生产环境仅当文件处理服务报告 Intel NPU 可用时显示 OV OCR。此原型不检测本机平台。
        </p>
      )}
      {(provider.id === 'local-document' || provider.id === 'local-paddleocr') && (
        <p className="text-muted-foreground border-b border-border py-3 text-xs leading-5">
          需要可下载的本地模型。此原型不下载，也不检查本机是否已安装。
        </p>
      )}
      {provider.id === 'tesseract' && current && (
        <div className="flex items-center justify-between gap-3 border-b border-border py-3">
          <Label htmlFor="tesseract-language">识别语言</Label>
          <FlatSelect
            id="tesseract-language"
            label="识别语言"
            value={current.language || 'chi_sim+eng'}
            options={TESSERACT_LANGS.map(([id, name]) => ({ id, name }))}
            onChange={(language) => update({ language })}
          />
        </div>
      )}
      {current && provider.api && (
        <>
          <TextField
            id={`${fieldKey}-key`}
            label="API 密钥"
            type="password"
            value={current.apiKey}
            placeholder="仅保存在当前演示中"
            onChange={(apiKey) => update({ apiKey })}
          />
          <TextField
            id={`${fieldKey}-endpoint`}
            label="API 地址"
            value={current.endpoint}
            onChange={(endpoint) => update({ endpoint })}
          />
        </>
      )}
      {current && provider.model && (
        <div className="flex items-center justify-between gap-3 border-t border-border py-3">
          <Label htmlFor={`${fieldKey}-model`}>解析模型</Label>
          <FlatSelect
            id={`${fieldKey}-model`}
            label="解析模型"
            value={models.includes(current.model) ? current.model : models[0]}
            options={models.map((model) => ({ id: model, name: model }))}
            onChange={(model) => update({ model })}
          />
        </div>
      )}
      {provider.id === 'paddleocr' && feature === 'doc' && (
        <p className="text-muted-foreground text-xs leading-5">
          可以使用 PaddleOCR 官方支持的 Docker 镜像本地部署，部署后填入 API 地址即可。{' '}
          <a
            className="underline"
            href="https://github.com/PaddlePaddle/PaddleOCR"
            target="_blank"
            rel="noreferrer"
          >
            查看部署文档
          </a>
        </p>
      )}
    </section>
  );
}

function SpeechSettings({ kind }: { kind: 'asr' | 'tts' }) {
  const { speechProviders, setSpeechProviders, speechProviderIds, setSpeechProviderIds, toolSamples, setToolSamples, toolResults, setToolResults } =
    useWorkspaceSettings();
  const providers = speechProviders[kind];
  const provider = providers.find((item) => item.id === speechProviderIds[kind]) ?? providers[0];
  const sampleKey = `${kind}:${provider.id}`;
  const sample =
    toolSamples[sampleKey] ??
    (kind === 'tts' ? '你好，我是 Pi Agent，很高兴和你一起工作。' : '帮我整理今天的产品设计重点。');
  const patch = (changes: Partial<SpeechProviderSettings>) =>
    setSpeechProviders((previous) => ({
      ...previous,
      [kind]: previous[kind].map((item) => (item.id === provider.id ? { ...item, ...changes } : item)),
    }));
  return (
    <section aria-labelledby={`${kind}-title`} className="space-y-4">
      <div className="flex items-start justify-between gap-3 border-b border-border pb-3">
        <div>
          <h2 id={`${kind}-title`} className="text-sm font-medium">
            {provider.name}
          </h2>
          <p className="text-muted-foreground mt-1 text-xs">{provider.description}</p>
        </div>
        <div className="flex items-center gap-3">
          <FlatSelect
            id={`${kind}-provider`}
            label={kind === 'asr' ? 'ASR 服务商' : 'TTS 服务商'}
            value={provider.id}
            options={providers}
            onChange={(id) => setSpeechProviderIds((current) => ({ ...current, [kind]: id }))}
          />
          <Switch
            aria-label={`启用 ${provider.name}`}
            size="xs"
            className="shadow-none"
            checked={provider.enabled}
            onCheckedChange={(enabled) => patch({ enabled })}
          />
        </div>
      </div>
      <TextField
        id={`${kind}-${provider.id}-model`}
        label={provider.local ? '本地引擎' : '模型 / 音色'}
        value={provider.model}
        onChange={(model) => patch({ model })}
      />
      <TextField
        id={`${kind}-${provider.id}-endpoint`}
        label={provider.local ? '本地服务地址' : 'API 地址'}
        value={provider.endpoint}
        placeholder={provider.local ? '留空使用系统引擎' : 'https://api.example.com/v1'}
        onChange={(endpoint) => patch({ endpoint })}
      />
      {!provider.local && (
        <TextField
          id={`${kind}-${provider.id}-key`}
          label="API 密钥"
          type="password"
          value={provider.apiKey}
          placeholder="仅保存在当前演示中"
          onChange={(apiKey) => patch({ apiKey })}
        />
      )}
      <Label htmlFor={`${kind}-${provider.id}-sample`} className="block space-y-2 border-t border-border pt-3">
        <span className="text-sm">{kind === 'tts' ? '试听文本' : '识别结果示例'}</span>
        <Textarea
          id={`${kind}-${provider.id}-sample`}
          aria-label={kind === 'tts' ? '试听文本' : '识别结果示例'}
          className="shadow-none"
          value={sample}
          onChange={(event) => setToolSamples((previous) => ({ ...previous, [sampleKey]: event.target.value }))}
        />
      </Label>
      <Button
        variant="outline"
        size="sm"
        disabled={!provider.enabled || !sample.trim()}
        onClick={() =>
          setToolResults((previous) => ({
            ...previous,
            [sampleKey]: `${provider.name} · ${kind === 'tts' ? '试听' : '识别'}演示：${sample}`,
          }))
        }
      >
        <Check size={13} />
        {kind === 'tts' ? '试听演示' : '运行识别示例'}
      </Button>
      <p className="text-muted-foreground text-xs">演示测试不会调用真实服务。</p>
      {toolResults[sampleKey] && (
        <p role="status" className="text-xs leading-6">
          {toolResults[sampleKey]}
        </p>
      )}
    </section>
  );
}
