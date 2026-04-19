// Canonical location for painting/ImagePage
// Physically inlined from @/app/components/image/ImagePage
// No compliance issues — all imports use @/ aliases, no regex literals, no <> fragments

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGlobalActions } from '@/app/context/GlobalActionContext';
import { copyToClipboard } from '@/app/utils/clipboard';
import { Button } from '@cherry-studio/ui';
import { EmptyState } from '@/app/components/ui/EmptyState';
import {
  Sparkles, Settings, Download, X, Copy, Check, Heart,
  Wand2, Send, ChevronDown, ChevronLeft, ChevronRight,
  Square, RectangleHorizontal, RectangleVertical, Maximize2,
  ZoomIn, Shuffle, Brush, ArrowUpRight, Clock,
  SlidersHorizontal, Filter, Star, LayoutGrid, Loader2,
  MousePointer2, Undo2, Redo2, Crop, Play, Plus,
  Share2, ArrowLeft, PanelRightClose, PanelRightOpen,
  Image as ImageIcon, ExternalLink, AlertTriangle, RefreshCw,
} from 'lucide-react';
import type {
  GeneratedImage, ImageMode, AspectRatio, ImageSize, GenerationParams,
} from './mockData';
import {
  IMAGE_MODELS, MOCK_IMAGES, RATIO_DIMENSIONS, SIZE_LABELS,
} from './mockData';

// ===========================
// Main Page
// ===========================

export function ImagePage() {
  const { openSettings: onOpenSettings } = useGlobalActions();
  const [view, setView] = useState<'create' | 'gallery'>('create');
  const [images, setImages] = useState<GeneratedImage[]>(MOCK_IMAGES);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage>(MOCK_IMAGES[0]);
  const [previewMode, setPreviewMode] = useState(false);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [detailImage, setDetailImage] = useState<GeneratedImage | null>(null);

  const [params, setParams] = useState<GenerationParams>({
    model: 'midjourney-v6',
    mode: 'quality',
    ratio: '1:1',
    size: 'large',
    count: 1,
    prompt: '',
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [genProgress, setGenProgress] = useState(0);
  const [generatingIds, setGeneratingIds] = useState<string[]>([]);

  const handleGenerate = useCallback(() => {
    if (!params.prompt.trim() || isGenerating) return;
    const count = params.count;
    const groupId = `batch-${Date.now()}`;
    const dims = RATIO_DIMENSIONS[params.ratio];

    const newImages: GeneratedImage[] = Array.from({ length: count }, (_, i) => ({
      id: `gen-${Date.now()}-${i}`,
      url: '',
      prompt: params.prompt,
      model: params.model,
      mode: params.mode,
      ratio: params.ratio,
      size: params.size,
      seed: Math.floor(Math.random() * 999999),
      width: dims.w,
      height: dims.h,
      createdAt: new Date().toISOString(),
      favorite: false,
      status: 'generating' as const,
      progress: 0,
      groupId,
    }));

    const newIds = newImages.map(img => img.id);
    setGeneratingIds(newIds);
    setImages(prev => [...newImages, ...prev]);
    setSelectedImage(newImages[0]);
    setIsGenerating(true);
    setGenProgress(0);

    const completedExisting = MOCK_IMAGES.filter(img => img.status === 'completed');
    const progressIntervals = newIds.map((id, idx) => {
      let progress = 0;
      const speed = 0.8 + Math.random() * 0.6;
      const willFail = count > 1 && idx === count - 1 && Math.random() < 0.35;
      const failAt = 40 + Math.random() * 40;

      return setInterval(() => {
        progress += (Math.random() * 10 + 2) * speed;

        if (willFail && progress >= failAt) {
          setImages(prev => prev.map(img =>
            img.id === id ? {
              ...img,
              status: 'failed' as const,
              progress: undefined,
              errorMessage: ['Content policy violation detected', 'Model inference timeout: exceeded 120s', 'GPU out of memory error', 'Rate limit exceeded'][Math.floor(Math.random() * 4)],
            } : img
          ));
          clearInterval(progressIntervals[idx]);
          setGeneratingIds(prev => {
            const next = prev.filter(gid => gid !== id);
            if (next.length === 0) setIsGenerating(false);
            return next;
          });
          return;
        }

        if (progress >= 100) {
          const donorImg = completedExisting[Math.floor(Math.random() * completedExisting.length)];
          setImages(prev => prev.map(img =>
            img.id === id ? {
              ...img,
              status: 'completed' as const,
              progress: undefined,
              url: donorImg?.url || '',
            } : img
          ));
          clearInterval(progressIntervals[idx]);
          setGeneratingIds(prev => {
            const next = prev.filter(gid => gid !== id);
            if (next.length === 0) setIsGenerating(false);
            return next;
          });
        } else {
          setImages(prev => prev.map(img =>
            img.id === id ? { ...img, progress } : img
          ));
        }
      }, 250 + idx * 100);
    });

  }, [params, isGenerating]);

  const handleSelectRecent = useCallback((img: GeneratedImage) => {
    setSelectedImage(img);
    setParams(p => ({
      ...p,
      prompt: img.prompt,
      model: img.model,
      mode: img.mode,
      ratio: img.ratio,
      size: img.size,
    }));
  }, []);

  const handleRemix = useCallback((img: GeneratedImage) => {
    setView('create');
    setPreviewMode(false);
    handleSelectRecent(img);
  }, [handleSelectRecent]);

  const toggleFavorite = useCallback((id: string) => {
    setImages(prev => prev.map(img =>
      img.id === id ? { ...img, favorite: !img.favorite } : img
    ));
  }, []);

  const handleImageClick = useCallback((img: GeneratedImage) => {
    setSelectedImage(img);
    setPreviewMode(true);
  }, []);

  const selectedIdx = images.findIndex(i => i.id === selectedImage?.id);
  const navigateImage = useCallback((dir: -1 | 1) => {
    const nextIdx = selectedIdx + dir;
    if (nextIdx >= 0 && nextIdx < images.length) {
      setSelectedImage(images[nextIdx]);
    }
  }, [selectedIdx, images]);

  if (IMAGE_MODELS.length === 0) {
    return (
      <div className="flex flex-col h-full bg-background select-none relative">
        <EmptyState
          preset="no-model"
          description={'\u8bf7\u5148\u524d\u5f80\u8bbe\u7f6e\u9875\u9762\u6dfb\u52a0\u7ed8\u56fe\u6a21\u578b\uff0c\u624d\u80fd\u5f00\u59cb\u521b\u4f5c'}
          actionLabel={'\u524d\u5f80\u8bbe\u7f6e'}
          onAction={onOpenSettings}
        />
      </div>
    );
  }

  if (previewMode) {
    return (
      <PreviewPage
        images={images}
        selected={selectedImage}
        onSelect={setSelectedImage}
        onBack={() => setPreviewMode(false)}
        onNavigate={navigateImage}
        onToggleFavorite={toggleFavorite}
        onShowDetail={setDetailImage}
        detailImage={detailImage}
        onCloseDetail={() => setDetailImage(null)}
        onRemix={handleRemix}
      />
    );
  }

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden relative">
      <TopToolbar view={view} onViewChange={setView} />

      <div className="flex-1 flex overflow-hidden relative">
        {view === 'create' ? (
          <div className="contents">
            <VerticalToolHandle
              showRightPanel={showRightPanel}
              onToggleRightPanel={() => setShowRightPanel(!showRightPanel)}
            />

            <CanvasArea
              image={selectedImage}
              images={images}
              currentIndex={selectedIdx}
              onNavigate={navigateImage}
              onClickImage={handleImageClick}
              onSelectImage={handleSelectRecent}
            />

            <HistoryStrip
              images={images}
              selectedId={selectedImage?.id}
              onSelect={handleSelectRecent}
            />

            <AnimatePresence>
              {showRightPanel && (
                <ControlPanel
                  params={params}
                  onChange={setParams}
                  onClose={() => setShowRightPanel(false)}
                />
              )}
            </AnimatePresence>
          </div>
        ) : (
          <GalleryGrid
            images={images}
            onSelect={handleImageClick}
            onToggleFavorite={toggleFavorite}
          />
        )}
      </div>

      {view === 'create' && (
        <PromptBar
          params={params}
          onChange={setParams}
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
        />
      )}
    </div>
  );
}

// ===========================
// Top Toolbar
// ===========================

function TopToolbar({ view, onViewChange }: {
  view: 'create' | 'gallery';
  onViewChange: (v: 'create' | 'gallery') => void;
}) {
  return (
    <div className="flex items-center justify-between px-3 h-[40px] bg-background shrink-0">
      <div className="flex items-center gap-0.5 bg-muted/40 rounded-lg p-0.5">
        {(['create', 'gallery'] as const).map(tab => (
          <Button
            key={tab}
            variant="ghost"
            size="xs"
            onClick={() => onViewChange(tab)}
            className={`h-auto px-3 py-[4px] text-xs transition-all duration-150 ${
              view === tab
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground/60 hover:text-foreground/80'
            }`}
          >
            {tab === 'create' ? '\u521b\u4f5c' : '\u753b\u5eca'}
          </Button>
        ))}
      </div>
      <div className="flex items-center gap-1">
        <Button variant="outline" size="xs" className="h-auto gap-1.5 px-3 py-[5px] border-border/50 text-xs text-foreground/70 hover:bg-muted/40">
          {'\u5bfc\u51fa'}
        </Button>
      </div>
    </div>
  );
}

// ===========================
// Left History Strip (with hover enlarge)
// ===========================

function HistoryStrip({ images, selectedId, onSelect }: {
  images: GeneratedImage[];
  selectedId?: string;
  onSelect: (img: GeneratedImage) => void;
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className="w-[54px] shrink-0 flex flex-col items-center py-2 gap-1 bg-background overflow-y-auto [&::-webkit-scrollbar]:w-0">
      <Button variant="ghost" size="icon-sm" className="w-8 h-8 rounded-full bg-muted/30 text-muted-foreground/40 hover:bg-muted/50 hover:text-foreground/60 mb-1">
        <Clock size={12} />
      </Button>
      {images.map(img => (
        <div key={img.id} className="relative">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onSelect(img)}
            onMouseEnter={() => setHoveredId(img.id)}
            onMouseLeave={() => setHoveredId(null)}
            className={`w-9 h-9 rounded-xl overflow-hidden shrink-0 transition-all duration-150 relative ${
              selectedId === img.id
                ? 'ring-[1.5px] ring-cherry-primary/60 ring-offset-1 ring-offset-background scale-105'
                : 'opacity-70 hover:opacity-100 hover:scale-105'
            }`}
          >
            {img.status === 'failed' ? (
              <div className="w-full h-full bg-rose-500/10 flex items-center justify-center">
                <AlertTriangle size={10} className="text-rose-400" />
              </div>
            ) : img.status === 'generating' ? (
              <div className="w-full h-full bg-cherry-active-bg flex items-center justify-center">
                <Loader2 size={10} className="text-cherry-primary animate-spin" />
              </div>
            ) : (
              <img src={img.url} alt="" className="w-full h-full object-cover" />
            )}
          </Button>

          <AnimatePresence>
            {hoveredId === img.id && img.status === 'completed' && (
              <motion.div
                initial={{ opacity: 0, x: 4, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 4, scale: 0.9 }}
                transition={{ duration: 0.15 }}
                className="absolute right-[46px] top-1/2 -translate-y-1/2 z-50 pointer-events-none"
              >
                <div className="w-[180px] rounded-xl overflow-hidden shadow-2xl shadow-black/20 border border-border/40 bg-background">
                  <img src={img.url} alt="" className="w-full aspect-square object-cover" />
                  <div className="px-2.5 py-2 border-t border-border/20">
                    <p className="text-[9px] text-foreground/60 line-clamp-2 leading-relaxed">{img.prompt}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[8px] text-muted-foreground/50">{img.ratio}</span>
                      <span className="text-[8px] text-muted-foreground/50">{img.mode}</span>
                      <span className="text-[8px] text-cherry-primary/70">{IMAGE_MODELS.find(m => m.id === img.model)?.name}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

// ===========================
// Right Floating Control Panel
// ===========================

function ControlPanel({ params, onChange, onClose }: {
  params: GenerationParams;
  onChange: (p: GenerationParams) => void;
  onClose: () => void;
}) {
  const [modelOpen, setModelOpen] = useState(false);
  const selectedModel = IMAGE_MODELS.find(m => m.id === params.model);

  const ratioIcons: Record<AspectRatio, React.ReactNode> = {
    '1:1': <Square size={11} />,
    '16:9': <RectangleHorizontal size={11} />,
    '9:16': <RectangleVertical size={11} />,
    '4:3': <Maximize2 size={11} />,
  };

  return (
    <motion.div
      initial={{ x: 16, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 16, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="absolute right-3 top-3 bottom-3 z-20 w-[230px] bg-background/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/12 border border-border/40 flex flex-col overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <span className="text-xs text-foreground/85 tracking-wider">{'\u53c2\u6570\u8bbe\u7f6e'}</span>
        <Button variant="ghost" size="icon-xs" onClick={onClose} className="p-0.5 text-muted-foreground/70 hover:text-foreground/90">
          <X size={11} />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4 [&::-webkit-scrollbar]:w-[2px] [&::-webkit-scrollbar-thumb]:bg-border/30">
        <PanelSection label="Model">
          <div className="relative">
            <Button
              variant="ghost"
              size="xs"
              onClick={() => setModelOpen(!modelOpen)}
              className="h-auto w-full flex items-center justify-between gap-2 px-2.5 py-[6px] rounded-lg bg-muted/35 hover:bg-muted/50 text-xs"
            >
              <div className="flex items-center gap-1.5 truncate">
                <Sparkles size={9} className="text-cherry-primary shrink-0" />
                <span className="truncate text-foreground/80">{selectedModel?.name}</span>
              </div>
              <ChevronDown size={9} className={`text-muted-foreground/40 transition-transform ${modelOpen ? 'rotate-180' : ''}`} />
            </Button>
            <AnimatePresence>
              {modelOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.1 }}
                  className="absolute top-full left-0 right-0 mt-1 z-30 rounded-xl bg-popover border border-border/40 shadow-xl overflow-hidden"
                >
                  {IMAGE_MODELS.map(m => (
                    <Button
                      key={m.id}
                      variant="ghost"
                      size="xs"
                      onClick={() => { onChange({ ...params, model: m.id }); setModelOpen(false); }}
                      className={`h-auto w-full flex items-center gap-2 px-3 py-[6px] text-xs transition-colors ${
                        params.model === m.id
                          ? 'bg-cherry-active-bg text-cherry-primary-dark'
                          : 'text-foreground/60 hover:bg-muted/40'
                      }`}
                    >
                      <Sparkles size={8} className={params.model === m.id ? 'text-cherry-primary' : 'text-muted-foreground/30'} />
                      <div className="text-left">
                        <div>{m.name}</div>
                        <div className="text-[8.5px] text-muted-foreground/40">{m.provider}</div>
                      </div>
                    </Button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </PanelSection>

        <PanelSection label="Mode">
          <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-muted/30">
            {(['standard', 'quality', 'speed'] as const).map(mode => (
              <Button
                key={mode}
                variant="ghost"
                size="xs"
                onClick={() => onChange({ ...params, mode })}
                className={`h-auto flex-1 py-[4px] rounded-md text-[9.5px] transition-all duration-150 ${
                  params.mode === mode
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground/50 hover:text-foreground/70'
                }`}
              >
                {mode === 'standard' ? 'Standard' : mode === 'quality' ? 'Quality' : 'Speed'}
              </Button>
            ))}
          </div>
        </PanelSection>

        <PanelSection label="Dimensions">
          <div className="grid grid-cols-4 gap-1.5">
            {(Object.keys(ratioIcons) as AspectRatio[]).map(ratio => (
              <Button
                key={ratio}
                variant="ghost"
                size="xs"
                onClick={() => onChange({ ...params, ratio })}
                className={`h-auto flex flex-col items-center gap-1 py-1.5 rounded-lg transition-all duration-150 ${
                  params.ratio === ratio
                    ? 'bg-cherry-active-bg text-cherry-primary-dark ring-1 ring-cherry-ring'
                    : 'bg-muted/25 text-muted-foreground/60 hover:bg-muted/40 hover:text-foreground/75'
                }`}
              >
                {ratioIcons[ratio]}
                <span className="text-[8px]">{ratio}</span>
              </Button>
            ))}
          </div>
          <div className="text-[8.5px] text-muted-foreground/55 mt-1.5 text-center">
            {RATIO_DIMENSIONS[params.ratio].w} x {RATIO_DIMENSIONS[params.ratio].h}
          </div>
        </PanelSection>

        <PanelSection label="Size">
          <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-muted/30">
            {(['small', 'medium', 'large'] as const).map(size => (
              <Button
                key={size}
                variant="ghost"
                size="xs"
                onClick={() => onChange({ ...params, size })}
                className={`h-auto flex-1 py-[4px] rounded-md text-[9.5px] transition-all duration-150 ${
                  params.size === size
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground/50 hover:text-foreground/70'
                }`}
              >
                {SIZE_LABELS[size]}
              </Button>
            ))}
          </div>
        </PanelSection>

        <PanelSection label="Count">
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4].map(n => (
              <Button
                key={n}
                variant="ghost"
                size="xs"
                onClick={() => onChange({ ...params, count: n })}
                className={`h-auto flex-1 py-[5px] rounded-lg text-xs transition-all duration-150 ${
                  params.count === n
                    ? 'bg-cherry-active-bg text-cherry-primary-dark ring-1 ring-cherry-ring'
                    : 'bg-muted/25 text-muted-foreground/45 hover:bg-muted/40 hover:text-foreground/60'
                }`}
              >
                {n}
              </Button>
            ))}
          </div>
        </PanelSection>
      </div>
    </motion.div>
  );
}

function PanelSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[9px] text-foreground/80 uppercase tracking-wider mb-1.5">{label}</div>
      {children}
    </div>
  );
}

// ===========================
// Canvas Area (Center)
// ===========================

function CanvasArea({ image, images, currentIndex, onNavigate, onClickImage, onSelectImage }: {
  image: GeneratedImage | null;
  images: GeneratedImage[];
  currentIndex: number;
  onNavigate: (dir: -1 | 1) => void;
  onClickImage: (img: GeneratedImage) => void;
  onSelectImage: (img: GeneratedImage) => void;
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle, currentColor 0.5px, transparent 0.5px)',
          backgroundSize: '20px 20px',
        }}
      />

      {image ? (
        <div className="relative flex items-center justify-center flex-1 w-full px-16">
          {currentIndex > 0 && (
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => onNavigate(-1)}
              className="absolute left-4 z-10 p-1.5 rounded-full bg-background/80 border-border/40 shadow-lg text-muted-foreground/50 hover:text-foreground/80 hover:bg-background"
            >
              <ChevronLeft size={16} />
            </Button>
          )}
          {currentIndex < images.length - 1 && (
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => onNavigate(1)}
              className="absolute right-14 z-10 p-1.5 rounded-full bg-background/80 border-border/40 shadow-lg text-muted-foreground/50 hover:text-foreground/80 hover:bg-background"
            >
              <ChevronRight size={16} />
            </Button>
          )}

          <motion.div
            key={image.id}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="relative cursor-pointer group"
            onClick={() => image.status === 'completed' ? onClickImage(image) : undefined}
          >
            {image.status === 'failed' ? (
              <div className="rounded-2xl bg-muted/15 border border-rose-500/20 shadow-2xl shadow-black/10 flex flex-col items-center justify-center gap-3 px-12 py-16">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center">
                  <AlertTriangle size={20} className="text-rose-400" />
                </div>
                <div className="text-xs text-foreground/60">{'\u751f\u6210\u5931\u8d25'}</div>
                <div className="text-[9px] text-rose-400/70 text-center max-w-[260px] leading-relaxed">
                  {image.errorMessage || 'An unknown error occurred'}
                </div>
                <Button variant="ghost" size="xs" className="h-auto mt-1 gap-1.5 px-3 py-[5px] rounded-lg bg-rose-500/10 text-rose-500 text-xs hover:bg-rose-500/20">
                  <RefreshCw size={9} />
                  Retry
                </Button>
              </div>
            ) : image.status === 'generating' ? (
              <div className="rounded-2xl bg-muted/15 border border-cherry-ring shadow-2xl shadow-black/10 flex flex-col items-center justify-center gap-3 px-16 py-16">
                <div className="relative w-12 h-12">
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-cherry-ring"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  />
                  <motion.div
                    className="absolute inset-1 rounded-full border-2 border-t-cherry-primary border-r-transparent border-b-transparent border-l-transparent"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                  />
                </div>
                <div className="text-xs text-muted-foreground/70">{'\u751f\u6210\u4e2d...'}</div>
                <div className="w-32 h-[3px] rounded-full bg-muted/40 overflow-hidden">
                  <motion.div
                    className="h-full bg-cherry-primary rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(image.progress || 0, 100)}%` }}
                  />
                </div>
                <div className="text-[9px] text-muted-foreground/50 tabular-nums">{Math.min(Math.round(image.progress || 0), 100)}%</div>
                {image.groupId && (
                  <div className="text-[8px] text-muted-foreground/35 mt-1">{'\u6279\u91cf\u751f\u6210\u8fdb\u884c\u4e2d'}</div>
                )}
              </div>
            ) : (
              <div className="rounded-2xl overflow-hidden shadow-2xl shadow-black/10 bg-muted/10">
                <img
                  src={image.url}
                  alt={image.prompt}
                  className="max-h-[calc(100vh-240px)] max-w-full object-contain"
                />
              </div>
            )}
          </motion.div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 text-muted-foreground/30">
          <ImageIcon size={36} strokeWidth={1} />
          <span className="text-xs">{'\u8f93\u5165\u63d0\u793a\u8bcd\u5f00\u59cb\u521b\u4f5c'}</span>
        </div>
      )}

      {image && (
        <div className="flex items-center gap-1.5 py-3">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => onNavigate(-1)}
            disabled={currentIndex === 0}
            className="p-1 text-muted-foreground/35 hover:text-foreground/60 disabled:opacity-20"
          >
            <ChevronLeft size={14} />
          </Button>
          {images.slice(Math.max(0, currentIndex - 2), Math.min(images.length, currentIndex + 3)).map((img, i) => {
            const realIdx = Math.max(0, currentIndex - 2) + i;
            return (
              <Button
                key={img.id}
                variant="ghost"
                size="icon-xs"
                onClick={() => onSelectImage(images[realIdx])}
                className={`w-[5px] h-[5px] p-0 rounded-full transition-all duration-200 ${
                  realIdx === currentIndex
                    ? 'bg-foreground/60 scale-125'
                    : 'bg-muted-foreground/25 hover:bg-muted-foreground/40'
                }`}
              />
            );
          })}
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => onNavigate(1)}
            disabled={currentIndex === images.length - 1}
            className="p-1 text-muted-foreground/35 hover:text-foreground/60 disabled:opacity-20"
          >
            <ChevronRight size={14} />
          </Button>
        </div>
      )}
    </div>
  );
}

// ===========================
// Bottom Prompt Bar
// ===========================

function PromptBar({ params, onChange, onGenerate, isGenerating }: {
  params: GenerationParams;
  onChange: (p: GenerationParams) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}) {
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const selectedModel = IMAGE_MODELS.find(m => m.id === params.model);

  return (
    <div className="shrink-0 flex justify-center px-6 pb-4 pt-2">
      <div className="relative w-full max-w-[680px] rounded-2xl border border-border/50 bg-background shadow-lg shadow-black/8">
        <textarea
          value={params.prompt}
          onChange={e => onChange({ ...params, prompt: e.target.value })}
          placeholder={'\u63cf\u8ff0\u4f60\u60f3\u521b\u5efa\u7684 3D \u7269\u4f53\u6216\u573a\u666f...'}
          rows={1}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onGenerate(); } }}
          className="w-full bg-transparent px-4 pt-3 pb-1.5 text-xs text-foreground/80 placeholder:text-muted-foreground/40 resize-none outline-none"
        />
        <div className="flex items-center justify-between px-3 pb-2.5">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon-xs" className="p-1.5 text-muted-foreground/40 hover:text-foreground/70 hover:bg-muted/40">
              <Plus size={13} />
            </Button>
            <Button variant="ghost" size="xs" className="h-auto gap-1 px-2 py-1 text-[9.5px] text-cherry-text-muted hover:text-cherry-primary-dark hover:bg-cherry-active-bg">
              <Sparkles size={10} />
              <span>{'\u7075\u611f'}</span>
              <ChevronDown size={8} />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Button
                variant="ghost"
                size="xs"
                onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
                className="h-auto gap-1 px-2 py-1 text-xs text-foreground/60 hover:bg-muted/40"
              >
                <span>{selectedModel?.name || 'Select Model'}</span>
                <ChevronDown size={8} className={`text-muted-foreground/40 transition-transform ${modelDropdownOpen ? 'rotate-180' : ''}`} />
              </Button>
              <AnimatePresence>
                {modelDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    className="absolute bottom-full right-0 mb-2 w-48 bg-popover rounded-xl border border-border/40 shadow-xl z-50 overflow-hidden"
                  >
                    {IMAGE_MODELS.map(m => (
                      <Button
                        key={m.id}
                        variant="ghost"
                        size="xs"
                        onClick={() => { onChange({ ...params, model: m.id }); setModelDropdownOpen(false); }}
                        className={`h-auto w-full flex items-center gap-2 px-3 py-[6px] text-xs transition-colors ${
                          params.model === m.id
                            ? 'bg-cherry-active-bg text-cherry-primary-dark'
                            : 'text-foreground/60 hover:bg-muted/40'
                        }`}
                      >
                        <Sparkles size={8} className={params.model === m.id ? 'text-cherry-primary' : 'text-muted-foreground/30'} />
                        <span>{m.name}</span>
                      </Button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <Button
              variant="default"
              size="icon-sm"
              onClick={onGenerate}
              disabled={!params.prompt.trim() || isGenerating}
              className="relative p-1.5 rounded-lg bg-foreground text-background hover:bg-foreground/85 disabled:opacity-25"
            >
              {isGenerating ? <Loader2 size={13} className="animate-spin" /> : <ArrowUpRight size={13} />}
              {params.count > 1 && !isGenerating && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[14px] h-[14px] rounded-full bg-cherry-primary text-white text-[8px] flex items-center justify-center">
                  {params.count}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===========================
// Gallery Grid View
// ===========================

function GalleryGrid({ images, onSelect, onToggleFavorite }: {
  images: GeneratedImage[];
  onSelect: (img: GeneratedImage) => void;
  onToggleFavorite: (id: string) => void;
}) {
  const [filter, setFilter] = useState<'all' | 'favorites'>('all');
  const [ratioFilter, setRatioFilter] = useState<'all' | AspectRatio>('all');
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest');

  const filtered = images
    .filter(img => filter === 'all' || img.favorite)
    .filter(img => ratioFilter === 'all' || img.ratio === ratioFilter)
    .sort((a, b) => sort === 'newest'
      ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

  const getAspectClass = (ratio: AspectRatio) => {
    switch (ratio) {
      case '1:1': return 'aspect-square';
      case '16:9': return 'aspect-video';
      case '9:16': return 'aspect-[9/16]';
      case '4:3': return 'aspect-[4/3]';
      default: return 'aspect-square';
    }
  };

  return (
    <div className="h-full flex flex-col flex-1">
      <div className="flex items-center justify-between px-5 py-2 border-b border-border/40">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="xs"
            onClick={() => setFilter('all')}
            className={`h-auto gap-1 px-2 py-[4px] text-xs transition-colors ${
              filter === 'all' ? 'bg-muted/50 text-foreground' : 'text-muted-foreground/50 hover:text-foreground/70'
            }`}
          >
            <LayoutGrid size={9} /> All
          </Button>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => setFilter('favorites')}
            className={`h-auto gap-1 px-2 py-[4px] text-xs transition-colors ${
              filter === 'favorites' ? 'bg-muted/50 text-foreground' : 'text-muted-foreground/50 hover:text-foreground/70'
            }`}
          >
            <Star size={9} /> Favorites
          </Button>
          <div className="w-px h-3.5 bg-border/30 mx-1" />
          {(['all', '1:1', '16:9', '9:16', '4:3'] as const).map(r => (
            <Button
              key={r}
              variant="ghost"
              size="xs"
              onClick={() => setRatioFilter(r)}
              className={`h-auto px-1.5 py-[3px] text-[9px] transition-colors ${
                ratioFilter === r
                  ? 'bg-cherry-active-bg text-cherry-primary-dark'
                  : 'text-muted-foreground/40 hover:text-foreground/60'
              }`}
            >
              {r === 'all' ? 'All' : r}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-muted-foreground/40">{filtered.length} images</span>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => setSort(s => s === 'newest' ? 'oldest' : 'newest')}
            className="h-auto gap-1 px-2 py-[3px] text-[9px] text-muted-foreground/45 hover:text-foreground/60 hover:bg-muted/40"
          >
            <SlidersHorizontal size={9} />
            {sort === 'newest' ? 'Newest' : 'Oldest'}
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:bg-border/30">
        <div className="columns-3 sm:columns-4 md:columns-5 lg:columns-6 xl:columns-7 gap-2.5">
          {filtered.map((img, i) => (
            <motion.div
              key={img.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.02 }}
              className="group relative rounded-xl overflow-hidden cursor-pointer bg-muted/15 hover:ring-2 hover:ring-cherry-primary/25 transition-all duration-200 mb-2.5 break-inside-avoid"
              onClick={() => onSelect(img)}
            >
              <div className={getAspectClass(img.ratio)}>
                {img.status === 'failed' ? (
                  <div className="w-full h-full bg-rose-500/8 flex flex-col items-center justify-center gap-1.5">
                    <AlertTriangle size={14} className="text-rose-400/70" />
                    <span className="text-[7.5px] text-rose-400/50">{'\u5931\u8d25'}</span>
                  </div>
                ) : img.status === 'generating' ? (
                  <div className="w-full h-full bg-cherry-active-bg flex flex-col items-center justify-center gap-1.5">
                    <Loader2 size={14} className="text-cherry-primary/60 animate-spin" />
                    <span className="text-[7.5px] text-cherry-primary/50">{Math.min(Math.round(img.progress || 0), 100)}%</span>
                  </div>
                ) : (
                  <img src={img.url} alt={img.prompt} className="w-full h-full object-cover" />
                )}
              </div>
              <div className="absolute top-1.5 left-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="px-1 py-0.5 rounded bg-black/50 backdrop-blur-sm text-[7.5px] text-white/70">
                  {img.ratio}
                </span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute top-1.5 right-1.5">
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={e => { e.stopPropagation(); onToggleFavorite(img.id); }}
                    className="p-1 bg-black/40 backdrop-blur-sm"
                  >
                    <Heart size={9} className={img.favorite ? 'text-rose-400 fill-rose-400' : 'text-white/60'} />
                  </Button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5">
                  <div className="text-[8px] text-white/80 line-clamp-1">{img.prompt}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ===========================
// Preview Page
// ===========================

function PreviewPage({ images, selected, onSelect, onBack, onNavigate, onToggleFavorite, onShowDetail, detailImage, onCloseDetail, onRemix }: {
  images: GeneratedImage[];
  selected: GeneratedImage;
  onSelect: (img: GeneratedImage) => void;
  onBack: () => void;
  onNavigate: (dir: -1 | 1) => void;
  onToggleFavorite: (id: string) => void;
  onShowDetail: (img: GeneratedImage) => void;
  detailImage: GeneratedImage | null;
  onCloseDetail: () => void;
  onRemix: (img: GeneratedImage) => void;
}) {
  const selectedIdx = images.findIndex(i => i.id === selected.id);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && selectedIdx > 0) onNavigate(-1);
      if (e.key === 'ArrowRight' && selectedIdx < images.length - 1) onNavigate(1);
      if (e.key === 'Escape') onBack();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedIdx, images.length, onNavigate, onBack]);

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      <div className="flex items-center justify-between px-3 h-[40px] border-b border-border/40 shrink-0">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onBack}
          className="p-1.5 text-muted-foreground/50 hover:text-foreground/80 hover:bg-muted/40"
        >
          <X size={14} />
        </Button>

        <div className="flex items-center gap-1 overflow-x-auto max-w-[60%] [&::-webkit-scrollbar]:h-0">
          <Button variant="ghost" size="icon-xs" className="p-1 text-muted-foreground/35 hover:text-foreground/60 shrink-0">
            <MousePointer2 size={12} />
          </Button>
          {images.filter(img => img.status === 'completed').map(img => (
            <Button
              key={img.id}
              variant="ghost"
              size="icon-sm"
              onClick={() => onSelect(img)}
              className={`w-8 h-8 rounded-lg overflow-hidden shrink-0 p-0 transition-all duration-150 ${
                selected.id === img.id
                  ? 'ring-[1.5px] ring-cherry-primary/60 ring-offset-1 ring-offset-background'
                  : 'opacity-50 hover:opacity-90'
              }`}
            >
              <img src={img.url} alt="" className="w-full h-full object-cover" />
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-xs" className="p-1.5 text-muted-foreground/40 hover:text-foreground/70 hover:bg-muted/40">
            <Download size={13} />
          </Button>
          <Button variant="ghost" size="icon-xs" className="p-1.5 text-muted-foreground/40 hover:text-foreground/70 hover:bg-muted/40">
            <Share2 size={13} />
          </Button>
          <Button
            variant="default"
            size="xs"
            onClick={() => onShowDetail(selected)}
            className="h-auto gap-1.5 px-3 py-[5px] rounded-lg bg-foreground text-background text-xs hover:bg-foreground/85 ml-1"
          >
            Details
          </Button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center relative overflow-hidden">
        <Button
          variant="outline"
          size="icon-sm"
          onClick={onBack}
          className="absolute left-4 z-10 p-1.5 rounded-full bg-background/70 border-border/30 text-muted-foreground/40 hover:text-foreground/70 hover:bg-background"
        >
          <ChevronLeft size={18} />
        </Button>

        {selectedIdx < images.length - 1 && (
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => onNavigate(1)}
            className="absolute right-4 z-10 p-1.5 rounded-full bg-background/70 border-border/30 text-muted-foreground/40 hover:text-foreground/70 hover:bg-background"
          >
            <ChevronRight size={18} />
          </Button>
        )}

        <motion.div
          key={selected.id}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="p-8"
        >
          <div className="rounded-2xl overflow-hidden shadow-2xl shadow-black/10 bg-muted/5">
            <img
              src={selected.url}
              alt={selected.prompt}
              className="max-h-[calc(100vh-120px)] max-w-full object-contain"
            />
          </div>
        </motion.div>

        <AnimatePresence>
          {detailImage && (
            <DetailFloatingPanel
              image={detailImage}
              onClose={onCloseDetail}
              onRemix={onRemix}
              onToggleFavorite={onToggleFavorite}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ===========================
// Detail Floating Panel
// ===========================

function DetailFloatingPanel({ image, onClose, onRemix, onToggleFavorite }: {
  image: GeneratedImage;
  onClose: () => void;
  onRemix: (img: GeneratedImage) => void;
  onToggleFavorite: (id: string) => void;
}) {
  const [copied, setCopied] = useState(false);

  const copyPrompt = () => {
    copyToClipboard(image.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const model = IMAGE_MODELS.find(m => m.id === image.model);
  const date = new Date(image.createdAt);
  const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

  return (
    <motion.div
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 20, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="absolute right-4 top-4 bottom-4 w-[260px] z-30 bg-background/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/12 border border-border/40 flex flex-col overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-border/30">
        <div className="flex items-center gap-1.5">
          <ImageIcon size={11} className="text-muted-foreground/50" />
          <span className="text-xs text-foreground/70">{'\u56fe\u7247\u8be6\u60c5'}</span>
        </div>
        <Button variant="ghost" size="icon-xs" onClick={onClose} className="p-0.5 text-muted-foreground/40 hover:text-foreground/70">
          <X size={11} />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 [&::-webkit-scrollbar]:w-[2px] [&::-webkit-scrollbar-thumb]:bg-border/20">
        <div className="rounded-xl overflow-hidden bg-muted/15">
          <img src={image.url} alt="" className="w-full aspect-square object-cover" />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] text-muted-foreground/50 tracking-wider">{'\u63d0\u793a\u8bcd'}</span>
            <Button variant="ghost" size="xs" onClick={copyPrompt} className="h-auto gap-0.5 p-0 text-[8.5px] text-muted-foreground/40 hover:text-foreground/60">
              {copied ? <Check size={7} className="text-cherry-primary" /> : <Copy size={7} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </Button>
          </div>
          <p className="text-xs text-foreground/70 leading-relaxed">{image.prompt}</p>
        </div>

        <div className="space-y-[6px] rounded-xl bg-muted/25 p-3">
          <MetaRow label={'\u6a21\u578b'} value={model?.name || image.model} />
          <MetaRow label={'\u6a21\u5f0f'} value={image.mode} />
          <MetaRow label={'\u6bd4\u4f8b'} value={image.ratio} />
          <MetaRow label={'\u5c3a\u5bf8'} value={`${image.width} x ${image.height}`} />
          <MetaRow label={'\u79cd\u5b50'} value={String(image.seed)} mono />
          <MetaRow label={'\u521b\u5efa\u65f6\u95f4'} value={dateStr} />
        </div>
      </div>

      <div className="shrink-0 border-t border-border/30 p-3 flex items-center gap-1.5">
        <Button
          variant="ghost"
          size="xs"
          onClick={() => onRemix(image)}
          className="h-auto flex-1 gap-1 py-[6px] rounded-lg bg-cherry-active-bg text-cherry-primary-dark text-xs hover:bg-cherry-active-border"
        >
          <ArrowUpRight size={9} />
          Remix
        </Button>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => onToggleFavorite(image.id)}
          className={`p-[7px] rounded-lg ${
            image.favorite
              ? 'bg-rose-500/12 text-rose-500'
              : 'bg-muted/30 text-muted-foreground/40 hover:text-foreground/60'
          }`}
        >
          <Heart size={11} className={image.favorite ? 'fill-rose-500' : ''} />
        </Button>
        <Button variant="ghost" size="icon-xs" className="p-[7px] rounded-lg bg-muted/30 text-muted-foreground/40 hover:text-foreground/60">
          <Download size={11} />
        </Button>
      </div>
    </motion.div>
  );
}

function MetaRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between text-[9.5px]">
      <span className="text-muted-foreground/50">{label}</span>
      <span className={`text-foreground/70 ${mono ? 'font-mono text-[9px]' : ''}`}>{value}</span>
    </div>
  );
}

// ===========================
// Vertical Tool Handle
// ===========================

function VerticalToolHandle({ showRightPanel, onToggleRightPanel }: {
  showRightPanel: boolean;
  onToggleRightPanel: () => void;
}) {
  const [activeTool, setActiveTool] = useState<string>('select');

  const tools = [
    { id: 'panel', icon: <SlidersHorizontal size={13} />, label: showRightPanel ? 'Hide Parameters' : 'Show Parameters', action: onToggleRightPanel },
    { id: 'divider' },
    { id: 'select', icon: <MousePointer2 size={13} />, label: 'Select' },
    { id: 'crop', icon: <Crop size={13} />, label: 'Crop' },
    { id: 'brush', icon: <Brush size={13} />, label: 'Inpaint' },
    { id: 'zoom', icon: <ZoomIn size={13} />, label: 'Zoom' },
    { id: 'divider2' },
    { id: 'undo', icon: <Undo2 size={13} />, label: 'Undo' },
    { id: 'redo', icon: <Redo2 size={13} />, label: 'Redo' },
  ];

  return (
    <div className="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-0.5 py-2 px-[5px] bg-background/90 backdrop-blur-xl rounded-2xl shadow-xl shadow-black/10 border border-border/40 transition-all duration-200">
      {tools.map((tool) => {
        if (tool.id.startsWith('divider')) {
          return <div key={tool.id} className="w-5 h-px bg-border/35 my-1" />;
        }
        const isActive = tool.id !== 'panel' && tool.id !== 'undo' && tool.id !== 'redo' && activeTool === tool.id;
        return (
          <Button
            key={tool.id}
            variant="ghost"
            size="icon-xs"
            title={tool.label}
            onClick={() => {
              if (tool.action) {
                tool.action();
              } else if (tool.id !== 'undo' && tool.id !== 'redo') {
                setActiveTool(tool.id);
              }
            }}
            className={`p-[7px] rounded-xl transition-all duration-150 ${
              isActive
                ? 'bg-cherry-active-bg text-cherry-primary-dark shadow-sm'
                : 'text-foreground/65 hover:text-foreground/85 hover:bg-muted/50'
            }`}
          >
            {tool.icon}
          </Button>
        );
      })}
    </div>
  );
}
