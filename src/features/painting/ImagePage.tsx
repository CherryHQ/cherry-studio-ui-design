// Canonical location for painting/ImagePage
// Physically inlined from @/app/components/image/ImagePage
// No compliance issues — all imports use @/ aliases, no regex literals, no <> fragments

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGlobalActions } from '@/app/context/GlobalActionContext';
import { copyToClipboard } from '@/app/utils/clipboard';
import { Button, Textarea, EmptyState, ToggleGroup, ToggleGroupItem, Popover, PopoverTrigger, PopoverContent, BrandLogo, Switch, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@cherry-studio/ui';
import type { ModelInfo } from '@cherry-studio/ui';
import { ModelPickerPanel } from '@/app/components/shared/ModelPickerPanel';
import {
  Sparkles, Settings, Download, X, Copy, Check, Heart,
  Wand2, Send, ChevronDown, ChevronLeft, ChevronRight,
  Square, RectangleHorizontal, RectangleVertical, Maximize2,
  ZoomIn, Shuffle, Brush, ArrowUpRight, Clock,
  SlidersHorizontal, Filter, Star, LayoutGrid, Loader2,
  MousePointer2, Undo2, Redo2, Crop, Play, Plus,
  Share2, ArrowLeft, PanelRightClose, PanelRightOpen,
  Image as ImageIcon, ExternalLink, AlertTriangle, RefreshCw, Trash2,
  Video, Volume2, Mic, Globe, Music, Upload, Layers, BarChart3, Zap,
} from 'lucide-react';
import type {
  GeneratedImage, ImageMode, AspectRatio, ImageSize, GenerationParams,
} from './mockData';
import {
  IMAGE_MODELS, MOCK_IMAGES, RATIO_DIMENSIONS, SIZE_LABELS,
} from './mockData';
import { useRecycleBin } from '@/app/context/RecycleBinContext';

// Adapt IMAGE_MODELS to ModelInfo for ModelPickerPanel
const IMAGE_MODELS_AS_MODEL_INFO: ModelInfo[] = IMAGE_MODELS.map(m => ({
  id: m.id,
  name: m.name,
  provider: m.provider,
  capabilities: [],
}));

const IMAGE_PROVIDER_COLORS: Record<string, string> = {
  Midjourney: 'bg-foreground',
  OpenAI: 'bg-emerald-600',
  'Stability AI': 'bg-violet-500',
  'Black Forest Labs': 'bg-amber-600',
  Ideogram: 'bg-blue-500',
  Google: 'bg-blue-500',
};

// ===========================
// Main Page
// ===========================

type CreationKind = 'image' | 'video';

export function ImagePage() {
  const { openSettings: onOpenSettings } = useGlobalActions();
  const [kind, setKind] = useState<CreationKind>('image');
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

  // Delete a painting → move to recycle bin with 5-second undo toast.
  // Lightweight path (no confirm dialog) since paintings are easy to
  // re-generate and the toast already gives an instant revert.
  const { moveToBin: moveToRecycleBin } = useRecycleBin();
  const handleDeletePainting = useCallback((img: GeneratedImage) => {
    setImages(prev => prev.filter(i => i.id !== img.id));
    if (selectedImage?.id === img.id) {
      // Replacement selection — first remaining image, or undefined.
      const remaining = images.filter(i => i.id !== img.id);
      if (remaining.length > 0) setSelectedImage(remaining[0]);
    }
    moveToRecycleBin(
      {
        id: `bin-painting-${img.id}-${Date.now()}`,
        type: 'painting',
        name: img.prompt || '未命名绘图',
        icon: '🎨',
        meta: `${img.model} · ${img.width}×${img.height}`,
        source: 'manual',
      },
      {
        onUndo: () => setImages(prev => [img, ...prev]),
      },
    );
  }, [images, selectedImage, moveToRecycleBin]);

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
      <TopToolbar kind={kind} onKindChange={setKind} view={view} onViewChange={setView} />

      {kind === 'video' ? (
        <VideoMode />
      ) : (
        <>
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
                onDelete={handleDeletePainting}
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
        </>
      )}
    </div>
  );
}

// ===========================
// Video mode — full creation surface
// ===========================
//
// Mirrors the image-mode shell (left handle / center canvas / right control
// panel / bottom prompt bar) so the user feels at home. Mock-only: clicking
// "generate" simulates a progress curve like the image flow.

type VideoAspect = 'auto' | '16:9' | '4:3' | '1:1' | '3:4' | '9:16' | '21:9';
type VideoDuration = 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15;
type VideoResolution = '480p' | '720p' | '1080p';
type VideoMotion = 'low' | 'medium' | 'high';
type GenerateMethod = 'reference' | 'edit' | 'frames';
type CreationKindInBar = 'video' | 'image' | 'audio';

interface VideoModel {
  id: string;
  name: string;
  provider: string;
  tier: string;
}

interface GeneratedVideo {
  id: string;
  poster: string;            // still-frame URL acting as preview
  prompt: string;
  model: string;
  aspect: VideoAspect;
  duration: VideoDuration;
  resolution: VideoResolution;
  motion: VideoMotion;
  createdAt: string;
  status: 'generating' | 'completed' | 'failed';
  progress?: number;
  favorite?: boolean;
}

const VIDEO_MODELS: VideoModel[] = [
  { id: 'sora-1',       name: 'Sora',         provider: 'OpenAI',  tier: 'Pro' },
  { id: 'runway-gen3',  name: 'Gen-3 Alpha',  provider: 'Runway',  tier: 'Pro' },
  { id: 'veo-2',        name: 'Veo 2',        provider: 'Google',  tier: 'Pro' },
  { id: 'kling-1.5',    name: 'Kling 1.5',    provider: 'Kling',   tier: 'Std' },
  { id: 'minimax-h-01', name: 'Hailuo 01',    provider: 'MiniMax', tier: 'Std' },
  { id: 'pika-2',       name: 'Pika 2.0',     provider: 'Pika',    tier: 'Std' },
];

const VIDEO_PROVIDER_COLORS: Record<string, string> = {
  OpenAI:  'bg-emerald-600',
  Runway:  'bg-zinc-700',
  Google:  'bg-blue-500',
  Kling:   'bg-fuchsia-500',
  MiniMax: 'bg-orange-500',
  Pika:    'bg-violet-500',
};

// Poster frames — Unsplash cinematic stills. Same imagery style as the
// image-mode mocks so the visual language stays consistent.
const VIDEO_POSTERS = [
  'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=900&auto=format',
  'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=900&auto=format',
  'https://images.unsplash.com/photo-1454789548928-9efd52dc4031?w=900&auto=format',
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=900&auto=format',
  'https://images.unsplash.com/photo-1493514789931-586cb221d7a7?w=900&auto=format',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=900&auto=format',
];

const VIDEO_PROMPTS = [
  'Slow dolly through a neon-lit Tokyo alley after rain, reflections shimmering',
  'Aerial shot over a snowy mountain range at golden hour, lens flare',
  'Cinematic close-up: hand pouring espresso into a glass, steam rising',
  'Cyberpunk hover-car drifting between skyscrapers, motion blur',
  'Time-lapse of clouds rolling over a coastal lighthouse',
  'Macro: water droplets falling on a leaf, sunlight refracting',
];

const MOCK_VIDEOS: GeneratedVideo[] = VIDEO_POSTERS.map((url, i) => ({
  id: `vid-${i}`,
  poster: url,
  prompt: VIDEO_PROMPTS[i],
  model: VIDEO_MODELS[i % VIDEO_MODELS.length].id,
  aspect: (['16:9', '9:16', '16:9', '1:1', '16:9', '4:3'] as VideoAspect[])[i],
  duration: ([5, 4, 10, 6, 8, 5] as VideoDuration[])[i],
  resolution: (['1080p', '720p', '1080p', '720p', '1080p', '720p'] as VideoResolution[])[i],
  motion: (['medium', 'high', 'low', 'medium', 'high', 'low'] as VideoMotion[])[i],
  createdAt: new Date(Date.now() - i * 3600_000).toISOString(),
  status: 'completed',
  favorite: i === 0,
}));

const ASPECT_DIMENSIONS: Record<VideoAspect, { w: number; h: number }> = {
  'auto': { w: 1920, h: 1080 },
  '16:9': { w: 1920, h: 1080 },
  '4:3':  { w: 1440, h: 1080 },
  '1:1':  { w: 1080, h: 1080 },
  '3:4':  { w: 1080, h: 1440 },
  '9:16': { w: 1080, h: 1920 },
  '21:9': { w: 2520, h: 1080 },
};

const ALL_DURATIONS: VideoDuration[] = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

interface VideoParams {
  model: string;
  method: GenerateMethod;
  aspect: VideoAspect;
  duration: VideoDuration;
  resolution: VideoResolution;
  motion: VideoMotion;
  audio: boolean;
  webSearch: boolean;
  startFrame: string | null;
  endFrame: string | null;
  inputKind: CreationKindInBar;
  prompt: string;
}

function VideoMode() {
  const [videos, setVideos] = useState<GeneratedVideo[]>(MOCK_VIDEOS);
  const [selected, setSelected] = useState<GeneratedVideo>(MOCK_VIDEOS[0]);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [params, setParams] = useState<VideoParams>({
    model: 'sora-1',
    method: 'reference',
    aspect: '16:9',
    duration: 5,
    resolution: '720p',
    motion: 'medium',
    audio: true,
    webSearch: false,
    startFrame: null,
    endFrame: null,
    inputKind: 'video',
    prompt: '',
  });

  const selectedIdx = videos.findIndex(v => v.id === selected?.id);
  const navigate = useCallback((dir: -1 | 1) => {
    const next = selectedIdx + dir;
    if (next >= 0 && next < videos.length) setSelected(videos[next]);
  }, [selectedIdx, videos]);

  const handleGenerate = useCallback(() => {
    if (!params.prompt.trim() || isGenerating) return;
    const id = `gen-vid-${Date.now()}`;
    const poster = VIDEO_POSTERS[Math.floor(Math.random() * VIDEO_POSTERS.length)];
    const generating: GeneratedVideo = {
      id, poster: '', prompt: params.prompt, model: params.model,
      aspect: params.aspect, duration: params.duration,
      resolution: params.resolution, motion: params.motion,
      createdAt: new Date().toISOString(),
      status: 'generating', progress: 0,
    };
    setVideos(prev => [generating, ...prev]);
    setSelected(generating);
    setIsGenerating(true);

    let progress = 0;
    const tick = setInterval(() => {
      progress += 4 + Math.random() * 8;
      if (progress >= 100) {
        clearInterval(tick);
        setVideos(prev => prev.map(v => v.id === id ? { ...v, status: 'completed', progress: undefined, poster } : v));
        setSelected(prev => prev?.id === id ? { ...prev, status: 'completed', progress: undefined, poster } : prev);
        setIsGenerating(false);
      } else {
        setVideos(prev => prev.map(v => v.id === id ? { ...v, progress } : v));
        setSelected(prev => prev?.id === id ? { ...prev, progress } : prev);
      }
    }, 280);
  }, [params, isGenerating]);

  return (
    <>
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left vertical tool handle (decorative — mirrors image mode) */}
        <div className="w-[44px] shrink-0 flex flex-col items-center py-3 gap-1.5 border-r border-border/30 bg-background">
          {[Wand2, Brush, Crop, Shuffle].map((Icon, i) => (
            <Button key={i} variant="ghost" size="icon-sm" className="rounded-lg text-muted-foreground/50 hover:text-foreground hover:bg-accent/40">
              <Icon size={13} />
            </Button>
          ))}
        </div>

        <VideoCanvas video={selected} videos={videos} currentIndex={selectedIdx} onNavigate={navigate} />

        <VideoHistoryStrip videos={videos} selectedId={selected?.id} onSelect={setSelected} />

        <AnimatePresence>
          {showRightPanel && (
            <VideoControlPanel params={params} onChange={setParams} onClose={() => setShowRightPanel(false)} />
          )}
        </AnimatePresence>
      </div>

      <VideoPromptBar params={params} onChange={setParams} onGenerate={handleGenerate} isGenerating={isGenerating} />
    </>
  );
}

function VideoCanvas({ video, videos, currentIndex, onNavigate }: {
  video: GeneratedVideo | null;
  videos: GeneratedVideo[];
  currentIndex: number;
  onNavigate: (dir: -1 | 1) => void;
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle, currentColor 0.5px, transparent 0.5px)',
          backgroundSize: '20px 20px',
        }}
      />

      {video ? (
        <div className="relative flex items-center justify-center flex-1 w-full px-16">
          {currentIndex > 0 && (
            <Button variant="outline" size="icon-sm" onClick={() => onNavigate(-1)}
              className="absolute left-4 z-10 p-1.5 rounded-full bg-background/80 border-border/40 shadow-lg text-muted-foreground/50 hover:text-foreground hover:bg-background">
              <ChevronLeft size={16} />
            </Button>
          )}
          {currentIndex < videos.length - 1 && (
            <Button variant="outline" size="icon-sm" onClick={() => onNavigate(1)}
              className="absolute right-14 z-10 p-1.5 rounded-full bg-background/80 border-border/40 shadow-lg text-muted-foreground/50 hover:text-foreground hover:bg-background">
              <ChevronRight size={16} />
            </Button>
          )}

          <motion.div
            key={video.id}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="relative"
          >
            {video.status === 'generating' ? (
              <div className="rounded-2xl bg-muted/15 border border-cherry-ring shadow-2xl shadow-black/10 flex flex-col items-center justify-center gap-3 px-16 py-16 aspect-video w-[640px]">
                <div className="relative w-12 h-12">
                  <motion.div className="absolute inset-0 rounded-full border-2 border-cherry-ring"
                    animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} />
                  <motion.div className="absolute inset-1 rounded-full border-2 border-t-cherry-primary border-r-transparent border-b-transparent border-l-transparent"
                    animate={{ rotate: -360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }} />
                </div>
                <div className="text-xs text-muted-foreground/60">视频渲染中…</div>
                <div className="w-40 h-[3px] rounded-full bg-muted/40 overflow-hidden">
                  <motion.div className="h-full bg-cherry-primary rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(video.progress || 0, 100)}%` }} />
                </div>
                <div className="text-xs text-muted-foreground/50 tabular-nums">{Math.min(Math.round(video.progress || 0), 100)}%</div>
              </div>
            ) : video.status === 'failed' ? (
              <div className="rounded-2xl bg-muted/15 border border-destructive/20 shadow-2xl shadow-black/10 flex flex-col items-center justify-center gap-3 px-12 py-16 aspect-video w-[640px]">
                <AlertTriangle size={20} className="text-destructive" />
                <div className="text-xs text-muted-foreground">渲染失败</div>
                <Button variant="ghost" size="xs" className="mt-1 gap-1.5 px-3 rounded-lg bg-destructive/10 text-destructive text-xs hover:bg-destructive/20">
                  <RefreshCw size={9} />Retry
                </Button>
              </div>
            ) : (
              <div className="rounded-2xl overflow-hidden shadow-2xl shadow-black/10 bg-muted/10 relative group">
                <img src={video.poster} alt={video.prompt}
                  className="max-h-[calc(100vh-260px)] max-w-full object-contain"
                  style={{ aspectRatio: video.aspect.replace(':', ' / ') }} />
                {/* Play overlay */}
                <button className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors">
                  <span className="w-14 h-14 rounded-full bg-white/95 text-foreground flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                    <Play size={20} className="ml-0.5" fill="currentColor" />
                  </span>
                </button>
                {/* Bottom meta strip */}
                <div className="absolute left-0 right-0 bottom-0 px-4 py-2.5 bg-gradient-to-t from-black/55 to-transparent text-white text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-white/15 backdrop-blur">{video.duration}s</span>
                    <span className="px-1.5 py-0.5 rounded bg-white/15 backdrop-blur">{video.resolution}</span>
                    <span className="px-1.5 py-0.5 rounded bg-white/15 backdrop-blur">{video.aspect}</span>
                  </div>
                  <span className="text-white/80">{VIDEO_MODELS.find(m => m.id === video.model)?.name}</span>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 text-muted-foreground/50">
          <Video size={36} strokeWidth={1} />
          <span className="text-xs">输入提示词开始视频创作</span>
        </div>
      )}
    </div>
  );
}

function VideoHistoryStrip({ videos, selectedId, onSelect }: {
  videos: GeneratedVideo[];
  selectedId?: string;
  onSelect: (v: GeneratedVideo) => void;
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  return (
    <div className="w-[54px] shrink-0 flex flex-col items-center py-2 gap-1 bg-background overflow-y-auto scrollbar-hide">
      <Button variant="ghost" size="icon-sm" className="rounded-full bg-muted/30 text-muted-foreground/40 hover:bg-accent/40 hover:text-foreground mb-1">
        <Clock size={12} />
      </Button>
      {videos.map(v => (
        <div key={v.id} className="relative">
          <Button variant="ghost" size="icon-sm"
            onClick={() => onSelect(v)}
            onMouseEnter={() => setHoveredId(v.id)}
            onMouseLeave={() => setHoveredId(null)}
            className={`w-9 h-9 rounded-xl overflow-hidden shrink-0 transition-all duration-150 relative ${
              selectedId === v.id
                ? 'ring-[1.5px] ring-cherry-primary/60 ring-offset-1 ring-offset-background scale-105'
                : 'opacity-70 hover:opacity-100 hover:scale-105'
            }`}
          >
            {v.status === 'generating' ? (
              <div className="w-full h-full bg-cherry-active-bg flex items-center justify-center">
                <Loader2 size={10} className="text-cherry-primary animate-spin" />
              </div>
            ) : v.status === 'failed' ? (
              <div className="w-full h-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle size={10} className="text-destructive" />
              </div>
            ) : (
              <div className="relative w-full h-full">
                <img src={v.poster} alt="" className="w-full h-full object-cover" />
                <span className="absolute inset-0 flex items-center justify-center bg-black/15">
                  <Play size={10} className="text-white" fill="currentColor" />
                </span>
              </div>
            )}
          </Button>

          <AnimatePresence>
            {hoveredId === v.id && v.status === 'completed' && (
              <motion.div
                initial={{ opacity: 0, x: 4, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 4, scale: 0.9 }}
                transition={{ duration: 0.15 }}
                className="absolute right-[46px] top-1/2 -translate-y-1/2 z-[var(--z-popover)] pointer-events-none"
              >
                <div className="w-[200px] rounded-xl overflow-hidden shadow-2xl shadow-black/20 border border-border/40 bg-background">
                  <div className="relative">
                    <img src={v.poster} alt="" className="w-full aspect-video object-cover" />
                    <span className="absolute right-2 bottom-2 px-1.5 py-0.5 rounded bg-black/70 text-white text-xs">{v.duration}s</span>
                  </div>
                  <div className="px-2.5 py-2 border-t border-border/30">
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{v.prompt}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-xs text-muted-foreground/50">{v.aspect}</span>
                      <span className="text-xs text-muted-foreground/50">{v.resolution}</span>
                      <span className="text-xs text-cherry-primary/70">{VIDEO_MODELS.find(m => m.id === v.model)?.name}</span>
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

function VideoControlPanel({ params, onChange, onClose }: {
  params: VideoParams;
  onChange: (p: VideoParams) => void;
  onClose: () => void;
}) {
  const [modelOpen, setModelOpen] = useState(false);
  const selectedModel = VIDEO_MODELS.find(m => m.id === params.model);

  // The Size grid renders 7 tiles: Auto + 6 aspect ratios. Each shows a
  // mini ratio glyph (drawn as a div proportioned to the actual ratio).
  const sizeTiles: { value: VideoAspect; label: string }[] = [
    { value: 'auto', label: 'Auto' },
    { value: '16:9', label: '16:9' },
    { value: '4:3',  label: '4:3' },
    { value: '1:1',  label: '1:1' },
    { value: '3:4',  label: '3:4' },
    { value: '9:16', label: '9:16' },
    { value: '21:9', label: '21:9' },
  ];

  return (
    <motion.div
      initial={{ x: 16, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 16, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="absolute right-3 top-3 bottom-3 z-[var(--z-dropdown)] w-[280px] bg-background/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/12 border border-border/40 flex flex-col overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <span className="text-xs text-foreground tracking-wider">Generate method</span>
        <Button variant="ghost" size="icon-xs" onClick={onClose} className="p-0.5 text-muted-foreground/60 hover:text-foreground">
          <X size={11} />
        </Button>
      </div>

      {/* Method tabs — Reference / Edit / Frames */}
      <div className="px-4 pb-3">
        <div className="flex items-center gap-0.5 bg-muted/40 rounded-lg p-0.5">
          {(['reference', 'edit', 'frames'] as GenerateMethod[]).map(m => (
            <Button size="inline" key={m} variant="ghost"
              onClick={() => onChange({ ...params, method: m })}
              className={`flex-1 px-3 py-[5px] text-xs transition-all duration-150 capitalize ${
                params.method === m
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground/60 hover:text-foreground'
              }`}
            >
              {m}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4 scrollbar-thin-xs">
        {/* Model — kept as the first param even though not in reference,
            because every video model has very different output character. */}
        <PanelSection label="Model">
          <Popover open={modelOpen} onOpenChange={setModelOpen}>
            <PopoverTrigger asChild>
              <Button size="inline" variant="ghost"
                className="w-full flex items-center justify-between gap-2 px-2.5 py-[6px] rounded-lg bg-muted/35 hover:bg-accent/40 text-xs"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className={`w-3.5 h-3.5 rounded shrink-0 ${VIDEO_PROVIDER_COLORS[selectedModel?.provider || ''] || 'bg-muted'}`} />
                  <span className="text-foreground truncate">{selectedModel?.name}</span>
                </div>
                <ChevronDown size={9} className={`text-muted-foreground/40 transition-transform ${modelOpen ? 'rotate-180' : ''}`} />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="p-1 w-[var(--radix-popover-trigger-width)] min-w-[200px]">
              {VIDEO_MODELS.map(m => (
                <Button key={m.id} size="inline" variant="ghost"
                  onClick={() => { onChange({ ...params, model: m.id }); setModelOpen(false); }}
                  className={`w-full flex items-center gap-2 justify-start px-2 py-[6px] text-xs rounded-md ${
                    params.model === m.id ? 'bg-cherry-active-bg text-cherry-primary-dark' : 'text-foreground hover:bg-accent/40'
                  }`}
                >
                  <span className={`w-3.5 h-3.5 rounded shrink-0 ${VIDEO_PROVIDER_COLORS[m.provider]}`} />
                  <span className="flex-1 text-left">{m.name}</span>
                  <span className="text-xs text-muted-foreground/50">{m.tier}</span>
                </Button>
              ))}
            </PopoverContent>
          </Popover>
        </PanelSection>

        {/* Size — 3-col grid of ratio tiles with mini glyph */}
        <PanelSection label="Size">
          <div className="grid grid-cols-3 gap-1.5">
            {sizeTiles.map(tile => (
              <Button size="inline" key={tile.value} variant="ghost"
                onClick={() => onChange({ ...params, aspect: tile.value })}
                className={`flex flex-col items-center gap-1.5 py-2 rounded-lg transition-all duration-150 ${
                  params.aspect === tile.value
                    ? 'bg-cherry-active-bg text-cherry-primary-dark ring-1 ring-cherry-ring'
                    : 'bg-muted/25 text-muted-foreground/70 hover:bg-accent/40 hover:text-foreground'
                }`}
              >
                <AspectGlyph value={tile.value} active={params.aspect === tile.value} />
                <span className="text-xs">{tile.label}</span>
              </Button>
            ))}
          </div>
        </PanelSection>

        {/* Resolution */}
        <PanelSection label="Resolution">
          <ToggleGroup type="single" size="xs" value={params.resolution}
            onValueChange={(v) => v && onChange({ ...params, resolution: v as VideoResolution })}
            className="w-full"
          >
            <ToggleGroupItem value="480p"  className="flex-1 text-xs">480p</ToggleGroupItem>
            <ToggleGroupItem value="720p"  className="flex-1 text-xs">720p</ToggleGroupItem>
            <ToggleGroupItem value="1080p" className="flex-1 text-xs">1080p</ToggleGroupItem>
          </ToggleGroup>
        </PanelSection>

        {/* Duration — 4×3 grid of seconds tiles 4s..15s */}
        <PanelSection label="Duration">
          <div className="grid grid-cols-4 gap-1.5">
            {ALL_DURATIONS.map(d => (
              <Button size="inline" key={d} variant="ghost"
                onClick={() => onChange({ ...params, duration: d })}
                className={`py-1.5 rounded-lg text-xs transition-all duration-150 ${
                  params.duration === d
                    ? 'bg-cherry-active-bg text-cherry-primary-dark ring-1 ring-cherry-ring'
                    : 'bg-muted/25 text-muted-foreground/60 hover:bg-accent/40 hover:text-foreground'
                }`}
              >
                {d}s
              </Button>
            ))}
          </div>
        </PanelSection>

        {/* Audio toggle */}
        <div className="flex items-center justify-between py-1.5">
          <div className="flex items-center gap-2">
            <Volume2 size={13} className="text-muted-foreground/70" />
            <span className="text-xs text-foreground">Audio</span>
          </div>
          <Switch
            checked={params.audio}
            onCheckedChange={(v) => onChange({ ...params, audio: v })}
          />
        </div>

        {/* Web search toggle */}
        <div className="flex items-center justify-between py-1.5 border-t border-border/30 pt-3">
          <div className="flex items-center gap-2">
            <Globe size={13} className="text-muted-foreground/70" />
            <span className="text-xs text-foreground">Web search</span>
          </div>
          <Switch
            checked={params.webSearch}
            onCheckedChange={(v) => onChange({ ...params, webSearch: v })}
          />
        </div>
      </div>
    </motion.div>
  );
}

/** Mini visual glyph showing the aspect ratio as a proportional rectangle. */
function AspectGlyph({ value, active }: { value: VideoAspect; active: boolean }) {
  if (value === 'auto') {
    return (
      <div className={`w-5 h-4 rounded-[3px] border-[1.5px] border-dashed flex items-center justify-center ${
        active ? 'border-cherry-primary-dark' : 'border-muted-foreground/40'
      }`}>
        <span className="text-[7px] leading-none font-medium">A</span>
      </div>
    );
  }
  // Drive box size from the actual ratio so the proportions read correctly.
  const ratios: Record<Exclude<VideoAspect, 'auto'>, { w: number; h: number }> = {
    '16:9': { w: 22, h: 12 },
    '4:3':  { w: 20, h: 15 },
    '1:1':  { w: 16, h: 16 },
    '3:4':  { w: 12, h: 16 },
    '9:16': { w: 10, h: 18 },
    '21:9': { w: 24, h: 10 },
  };
  const { w, h } = ratios[value as Exclude<VideoAspect, 'auto'>];
  return (
    <div
      style={{ width: `${w}px`, height: `${h}px` }}
      className={`rounded-[3px] border-[1.5px] ${active ? 'border-cherry-primary-dark bg-cherry-primary/10' : 'border-muted-foreground/40'}`}
    />
  );
}

function VideoPromptBar({ params, onChange, onGenerate, isGenerating }: {
  params: VideoParams;
  onChange: (p: VideoParams) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}) {
  const selectedModel = VIDEO_MODELS.find(m => m.id === params.model);
  const credits = 90;

  // Frame slots are meaningful for the Frames method (start + end frame),
  // and the Reference method also accepts a reference image (single slot).
  // For Edit we hide them — you edit the existing canvas selection.
  const showFrames = params.method === 'frames';
  const showReferenceSlot = params.method === 'reference';

  return (
    <div className="shrink-0 flex justify-center px-6 pb-4 pt-2">
      <div className="relative w-full max-w-[680px] rounded-2xl border border-border/50 bg-background shadow-lg shadow-black/8 overflow-hidden">
        {/* Asset Library notice strip */}
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-border/40 bg-muted/30">
          <span className="text-xs text-muted-foreground leading-relaxed">
            Character assets must be approved via the Asset Library.
          </span>
          <Button variant="outline" size="xs" className="gap-1.5 shrink-0 border-border/50 text-xs">
            <Upload size={11} />
            Upload
          </Button>
        </div>

        {/* Frame slots — Start + End, or single Reference */}
        {(showFrames || showReferenceSlot) && (
          <div className="flex items-center gap-2 px-4 pt-3">
            {showFrames ? (
              <>
                <FrameSlot label="Start Frame" value={params.startFrame} onChange={(v) => onChange({ ...params, startFrame: v })} />
                <FrameSlot label="End Frame"   value={params.endFrame}   onChange={(v) => onChange({ ...params, endFrame:   v })} />
              </>
            ) : (
              <FrameSlot label="Reference" value={params.startFrame} onChange={(v) => onChange({ ...params, startFrame: v })} />
            )}
          </div>
        )}

        <Textarea
          value={params.prompt}
          onChange={e => onChange({ ...params, prompt: e.target.value })}
          placeholder="What are we creating today"
          rows={1}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onGenerate(); } }}
          className="w-full bg-transparent px-4 pt-3 pb-1.5 text-xs text-foreground placeholder:text-muted-foreground/60 resize-none outline-none"
        />

        {/* Bottom action row */}
        <div className="flex items-center justify-between gap-2 px-3.5 pb-3 pt-1">
          <div className="flex items-center gap-1">
            {/* Video Gen dropdown — switches input kind between Video/Image/Audio */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="inline" variant="ghost"
                  className="gap-1.5 px-2 py-1 text-xs text-foreground hover:bg-accent/40"
                >
                  <InputKindIcon kind={params.inputKind} />
                  <span>{params.inputKind === 'video' ? 'Video Gen' : params.inputKind === 'image' ? 'Image Gen' : 'Audio Gen'}</span>
                  <ChevronDown size={9} className="text-muted-foreground/40" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" side="top" className="min-w-[180px]">
                <DropdownMenuItem onClick={() => onChange({ ...params, inputKind: 'video' })}>
                  <Video size={12} /> Video
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onChange({ ...params, inputKind: 'image' })}>
                  <ImageIcon size={12} /> Image
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onChange({ ...params, inputKind: 'audio' })}>
                  <Music size={12} /> Audio
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Layers size={12} /> Select from Assets Library
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Settings — opens the Generate-method panel (right column). */}
            <Button variant="ghost" size="icon-xs" className="p-1.5 text-muted-foreground/60 hover:text-foreground hover:bg-accent/40" title="Generate method">
              <SlidersHorizontal size={12} />
            </Button>

            {/* Camera — capture/import */}
            <Button variant="ghost" size="icon-xs" className="p-1.5 text-muted-foreground/60 hover:text-foreground hover:bg-accent/40" title="Camera">
              <Video size={12} />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {/* Stats */}
            <Button variant="ghost" size="icon-xs" className="p-1.5 text-muted-foreground/60 hover:text-foreground hover:bg-accent/40" title="Usage">
              <BarChart3 size={12} />
            </Button>

            {/* Credit badge */}
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-muted/40 text-xs text-muted-foreground">
              <Zap size={10} className="text-amber-500 fill-amber-500" />
              <span className="tabular-nums">{credits}</span>
            </div>

            {/* Model selector */}
            <Popover>
              <PopoverTrigger asChild>
                <Button size="inline" variant="ghost"
                  className="gap-1 px-2 py-1 text-xs text-muted-foreground hover:bg-accent/40"
                >
                  <span className={`w-3 h-3 rounded ${VIDEO_PROVIDER_COLORS[selectedModel?.provider || ''] || 'bg-muted'}`} />
                  <span>{selectedModel?.name}</span>
                  <ChevronDown size={8} className="text-muted-foreground/40" />
                </Button>
              </PopoverTrigger>
              <PopoverContent side="top" align="end" className="p-1 w-[220px]">
                {VIDEO_MODELS.map(m => (
                  <Button key={m.id} size="inline" variant="ghost"
                    onClick={() => onChange({ ...params, model: m.id })}
                    className={`w-full flex items-center gap-2 justify-start px-2 py-[6px] text-xs rounded-md ${
                      params.model === m.id ? 'bg-cherry-active-bg text-cherry-primary-dark' : 'text-foreground hover:bg-accent/40'
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded shrink-0 ${VIDEO_PROVIDER_COLORS[m.provider]}`} />
                    <span className="flex-1 text-left">{m.name}</span>
                    <span className="text-xs text-muted-foreground/50">{m.tier}</span>
                  </Button>
                ))}
              </PopoverContent>
            </Popover>

            {/* Generate */}
            <Button variant="default" size="icon-sm"
              onClick={onGenerate}
              disabled={!params.prompt.trim() || isGenerating}
              className="p-1.5 rounded-lg disabled:opacity-30"
            >
              {isGenerating ? <Loader2 size={13} className="animate-spin" /> : <ArrowUpRight size={13} />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InputKindIcon({ kind }: { kind: CreationKindInBar }) {
  const cls = "text-muted-foreground";
  if (kind === 'video') return <Play size={11} className={cls} fill="currentColor" />;
  if (kind === 'image') return <ImageIcon size={11} className={cls} />;
  return <Music size={11} className={cls} />;
}

function FrameSlot({ label, value, onChange }: {
  label: string;
  value: string | null;
  onChange: (v: string | null) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={`relative w-[88px] h-[64px] rounded-lg border border-dashed flex flex-col items-center justify-center gap-1 transition-colors ${
            value
              ? 'border-cherry-ring bg-cherry-active-bg/40'
              : 'border-border/60 bg-muted/25 hover:bg-muted/40 hover:border-border'
          }`}
        >
          {value ? (
            <img src={value} alt={label} className="absolute inset-0 w-full h-full object-cover rounded-lg" />
          ) : (
            <>
              <ImageIcon size={14} className="text-muted-foreground/50" />
              <span className="text-xs text-muted-foreground/60 leading-tight text-center">{label}</span>
            </>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="top" className="min-w-[200px]">
        <DropdownMenuItem>
          <Upload size={12} /> Upload Image
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Layers size={12} /> Select from Assets Library
        </DropdownMenuItem>
        <DropdownMenuItem>
          <ImageIcon size={12} /> Select from Canvas
        </DropdownMenuItem>
        {value && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onChange(null)} variant="destructive">
              <Trash2 size={12} /> Remove
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ===========================
// Top Toolbar
// ===========================

function TopToolbar({ kind, onKindChange, view, onViewChange }: {
  kind: CreationKind;
  onKindChange: (k: CreationKind) => void;
  view: 'create' | 'gallery';
  onViewChange: (v: 'create' | 'gallery') => void;
}) {
  // Asset kind \u2192 drawing vs. video. Primary axis: which kind of media the
  // user is creating. Sub-tabs (create / gallery) only apply to drawing
  // mode; video shows a coming-soon panel.
  const kindOptions: { value: CreationKind; label: string; icon: typeof Brush }[] = [
    { value: 'image', label: '\u7ed8\u753b', icon: Brush },
    { value: 'video', label: '\u89c6\u9891', icon: Video },
  ];

  return (
    <div className="flex items-center justify-between px-3 h-[40px] bg-background shrink-0 gap-3">
      <div className="flex items-center gap-2">
        {/* Kind switch \u2014 \u7ed8\u753b / \u89c6\u9891 */}
        <div className="flex items-center gap-0.5 bg-muted/40 rounded-lg p-0.5">
          {kindOptions.map(opt => {
            const Icon = opt.icon;
            const active = kind === opt.value;
            return (
              <Button size="inline"
                key={opt.value}
                variant="ghost"
                onClick={() => onKindChange(opt.value)}
                className={`gap-1 px-2.5 py-[4px] text-xs transition-all duration-150 ${
                  active
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground/60 hover:text-foreground'
                }`}
              >
                <Icon size={12} />
                {opt.label}
              </Button>
            );
          })}
        </div>

        {/* View sub-tabs (create / gallery) \u2014 only meaningful for \u7ed8\u753b */}
        {kind === 'image' && (
          <div className="flex items-center gap-0.5 bg-muted/40 rounded-lg p-0.5">
            {(['create', 'gallery'] as const).map(tab => (
              <Button size="inline"
                key={tab}
                variant="ghost"
                onClick={() => onViewChange(tab)}
                className={`px-3 py-[4px] text-xs transition-all duration-150 ${
                  view === tab
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground/60 hover:text-foreground'
                }`}
              >
                {tab === 'create' ? '\u521b\u4f5c' : '\u753b\u5eca'}
              </Button>
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center gap-1">
        <Button variant="outline" size="xs" className="gap-1.5 px-3 border-border/50 text-xs text-foreground hover:bg-accent/40">
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
    <div className="w-[54px] shrink-0 flex flex-col items-center py-2 gap-1 bg-background overflow-y-auto scrollbar-hide">
      <Button variant="ghost" size="icon-sm" className="rounded-full bg-muted/30 text-muted-foreground/40 hover:bg-accent/40 hover:text-foreground mb-1">
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
              <div className="w-full h-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle size={10} className="text-destructive" />
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
                className="absolute right-[46px] top-1/2 -translate-y-1/2 z-[var(--z-popover)] pointer-events-none"
              >
                <div className="w-[180px] rounded-xl overflow-hidden shadow-2xl shadow-black/20 border border-border/40 bg-background">
                  <img src={img.url} alt="" className="w-full aspect-square object-cover" />
                  <div className="px-2.5 py-2 border-t border-border/30">
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{img.prompt}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-xs text-muted-foreground/50">{img.ratio}</span>
                      <span className="text-xs text-muted-foreground/50">{img.mode}</span>
                      <span className="text-xs text-cherry-primary/70">{IMAGE_MODELS.find(m => m.id === img.model)?.name}</span>
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
      className="absolute right-3 top-3 bottom-3 z-[var(--z-dropdown)] w-[230px] bg-background/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/12 border border-border/40 flex flex-col overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <span className="text-xs text-foreground tracking-wider">{'\u53c2\u6570\u8bbe\u7f6e'}</span>
        <Button variant="ghost" size="icon-xs" onClick={onClose} className="p-0.5 text-muted-foreground/60 hover:text-foreground">
          <X size={11} />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4 scrollbar-thin-xs">
        <PanelSection label="Model">
          <Popover open={modelOpen} onOpenChange={setModelOpen}>
            <PopoverTrigger asChild>
              <Button size="inline"
                variant="ghost"
                className="w-full flex items-center justify-between gap-2 px-2.5 py-[6px] rounded-lg bg-muted/35 hover:bg-accent/40 text-xs"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <BrandLogo id={selectedModel?.provider?.toLowerCase() || ''} fallbackLetter={selectedModel?.provider?.[0] || '?'} size={14} className="shrink-0" />
                  <span className="text-foreground">{selectedModel?.name}</span>
                </div>
                <ChevronDown size={9} className={`text-muted-foreground/40 transition-transform ${modelOpen ? 'rotate-180' : ''}`} />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="p-0 w-[420px]">
              <ModelPickerPanel
                models={IMAGE_MODELS_AS_MODEL_INFO}
                selectedModels={[params.model]}
                onSelectModel={(id) => onChange({ ...params, model: id })}
                multiModel={false}
                onToggleMultiModel={() => {}}
                providerColors={IMAGE_PROVIDER_COLORS}
                onClose={() => setModelOpen(false)}
                showMultiModelToggle={false}
              />
            </PopoverContent>
          </Popover>
        </PanelSection>

        <PanelSection label="Mode">
          <ToggleGroup type="single" size="xs" value={params.mode} onValueChange={(v) => v && onChange({ ...params, mode: v as typeof params.mode })} className="w-full">
            <ToggleGroupItem value="standard" className="flex-1 text-xs">Standard</ToggleGroupItem>
            <ToggleGroupItem value="quality" className="flex-1 text-xs">Quality</ToggleGroupItem>
            <ToggleGroupItem value="speed" className="flex-1 text-xs">Speed</ToggleGroupItem>
          </ToggleGroup>
        </PanelSection>

        <PanelSection label="Dimensions">
          <div className="grid grid-cols-4 gap-1.5">
            {(Object.keys(ratioIcons) as AspectRatio[]).map(ratio => (
              <Button size="inline"
                key={ratio}
                variant="ghost"
                onClick={() => onChange({ ...params, ratio })}
                className={`flex flex-col items-center gap-1 py-1.5 rounded-lg transition-all duration-150 ${
                  params.ratio === ratio
                    ? 'bg-cherry-active-bg text-cherry-primary-dark ring-1 ring-cherry-ring'
                    : 'bg-muted/25 text-muted-foreground/60 hover:bg-accent/40 hover:text-foreground'
                }`}
              >
                {ratioIcons[ratio]}
                <span className="text-xs">{ratio}</span>
              </Button>
            ))}
          </div>
          <div className="text-xs text-muted-foreground/60 mt-1.5 text-center">
            {RATIO_DIMENSIONS[params.ratio].w} x {RATIO_DIMENSIONS[params.ratio].h}
          </div>
        </PanelSection>

        <PanelSection label="Size">
          <Popover>
            <PopoverTrigger asChild>
              <Button size="inline"
                variant="ghost"
                className="w-full flex items-center justify-between gap-2 px-2.5 py-[6px] rounded-lg bg-muted/35 hover:bg-accent/40 text-xs"
              >
                <span className="text-foreground">{SIZE_LABELS[params.size]}</span>
                <ChevronDown size={9} className="text-muted-foreground/40" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="p-1 w-[var(--radix-popover-trigger-width)]">
              {(['small', 'medium', 'large'] as const).map(size => (
                <Button size="inline"
                  key={size}
                  variant="ghost"
                  onClick={() => onChange({ ...params, size })}
                  className={`w-full px-3 py-[6px] text-xs transition-colors ${
                    params.size === size
                      ? 'bg-cherry-active-bg text-cherry-primary-dark'
                      : 'text-muted-foreground hover:bg-accent/40'
                  }`}
                >
                  {SIZE_LABELS[size]}
                </Button>
              ))}
            </PopoverContent>
          </Popover>
        </PanelSection>

        <PanelSection label="Count">
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4].map(n => (
              <Button size="inline"
                key={n}
                variant="ghost"
                onClick={() => onChange({ ...params, count: n })}
                className={`flex-1 py-[5px] rounded-lg text-xs transition-all duration-150 ${
                  params.count === n
                    ? 'bg-cherry-active-bg text-cherry-primary-dark ring-1 ring-cherry-ring'
                    : 'bg-muted/25 text-muted-foreground/40 hover:bg-accent/40 hover:text-foreground'
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
      <div className="text-xs text-foreground uppercase tracking-wider mb-1.5">{label}</div>
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
              className="absolute left-4 z-10 p-1.5 rounded-full bg-background/80 border-border/40 shadow-lg text-muted-foreground/50 hover:text-foreground hover:bg-background"
            >
              <ChevronLeft size={16} />
            </Button>
          )}
          {currentIndex < images.length - 1 && (
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => onNavigate(1)}
              className="absolute right-14 z-10 p-1.5 rounded-full bg-background/80 border-border/40 shadow-lg text-muted-foreground/50 hover:text-foreground hover:bg-background"
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
              <div className="rounded-2xl bg-muted/15 border border-destructive/20 shadow-2xl shadow-black/10 flex flex-col items-center justify-center gap-3 px-12 py-16">
                <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle size={20} className="text-destructive" />
                </div>
                <div className="text-xs text-muted-foreground">{'\u751f\u6210\u5931\u8d25'}</div>
                <div className="text-xs text-destructive/70 text-center max-w-[260px] leading-relaxed">
                  {image.errorMessage || 'An unknown error occurred'}
                </div>
                <Button variant="ghost" size="xs" className="mt-1 gap-1.5 px-3 rounded-lg bg-destructive/10 text-destructive text-xs hover:bg-destructive/20">
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
                <div className="text-xs text-muted-foreground/60">{'\u751f\u6210\u4e2d...'}</div>
                <div className="w-32 h-[3px] rounded-full bg-muted/40 overflow-hidden">
                  <motion.div
                    className="h-full bg-cherry-primary rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(image.progress || 0, 100)}%` }}
                  />
                </div>
                <div className="text-xs text-muted-foreground/50 tabular-nums">{Math.min(Math.round(image.progress || 0), 100)}%</div>
                {image.groupId && (
                  <div className="text-xs text-muted-foreground/50 mt-1">{'\u6279\u91cf\u751f\u6210\u8fdb\u884c\u4e2d'}</div>
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
        <div className="flex flex-col items-center gap-3 text-muted-foreground/50">
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
            className="p-1 text-muted-foreground/40 hover:text-foreground disabled:opacity-30"
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
                    ? 'bg-foreground/50 scale-125'
                    : 'bg-muted-foreground/25 hover:bg-accent/40-foreground/40'
                }`}
              />
            );
          })}
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => onNavigate(1)}
            disabled={currentIndex === images.length - 1}
            className="p-1 text-muted-foreground/40 hover:text-foreground disabled:opacity-30"
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
        <Textarea
          value={params.prompt}
          onChange={e => onChange({ ...params, prompt: e.target.value })}
          placeholder={'\u63cf\u8ff0\u4f60\u60f3\u521b\u5efa\u7684 3D \u7269\u4f53\u6216\u573a\u666f...'}
          rows={1}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onGenerate(); } }}
          className="w-full bg-transparent px-4 pt-3 pb-1.5 text-xs text-foreground placeholder:text-muted-foreground/60 resize-none outline-none"
        />
        <div className="flex items-center justify-between px-3.5 pb-3 pt-2.5">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon-xs" className="p-1.5 text-muted-foreground/40 hover:text-foreground hover:bg-accent/40">
              <Plus size={13} />
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="xs" className="gap-1 px-2 text-xs text-cherry-text-muted hover:text-cherry-primary-dark hover:bg-cherry-active-bg">
                  <Sparkles size={10} />
                  <span>{'\u7075\u611f'}</span>
                  <ChevronDown size={8} />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" side="top" className="p-1.5 w-[220px]">
                <p className="text-xs text-muted-foreground/50 px-2 py-1 mb-0.5">灵感提示</p>
                {['赛博朋克风格的未来城市夜景', '水彩风格的山间小屋', '极简主义日式庭院', '梦幻星空下的灯塔', '蒸汽朋克风格的飞行器'].map(p => (
                  <Button variant="ghost" size="xs" key={p}
                    onClick={() => { const el = document.querySelector<HTMLTextAreaElement>('.prompt-input-painting'); if (el) { const nativeSet = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set; nativeSet?.call(el, p); el.dispatchEvent(new Event('input', { bubbles: true })); } }}
                    className="w-full justify-start px-2 py-[5px] text-xs text-muted-foreground hover:text-foreground rounded-md">
                    {p}
                  </Button>
                ))}
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex items-center gap-2">
            <Popover open={modelDropdownOpen} onOpenChange={setModelDropdownOpen}>
              <PopoverTrigger asChild>
                <Button size="inline"
                  variant="ghost"
                  className="gap-1 px-2 py-1 text-xs text-muted-foreground hover:bg-accent/40"
                >
                  <BrandLogo id={selectedModel?.provider?.toLowerCase() || ''} fallbackLetter={selectedModel?.provider?.[0] || '?'} size={14} className="shrink-0" />
                  <span>{selectedModel?.name || 'Select Model'}</span>
                  <ChevronDown size={8} className={`text-muted-foreground/40 transition-transform ${modelDropdownOpen ? 'rotate-180' : ''}`} />
                </Button>
              </PopoverTrigger>
              <PopoverContent side="top" align="end" className="p-0 w-[420px]">
                <ModelPickerPanel
                  models={IMAGE_MODELS_AS_MODEL_INFO}
                  selectedModels={[params.model]}
                  onSelectModel={(id) => onChange({ ...params, model: id })}
                  multiModel={false}
                  onToggleMultiModel={() => {}}
                  providerColors={IMAGE_PROVIDER_COLORS}
                  onClose={() => setModelDropdownOpen(false)}
                  showMultiModelToggle={false}
                />
              </PopoverContent>
            </Popover>
            <Button
              variant="default"
              size="icon-sm"
              onClick={onGenerate}
              disabled={!params.prompt.trim() || isGenerating}
              className="relative p-1.5 rounded-lg disabled:opacity-30"
            >
              {isGenerating ? <Loader2 size={13} className="animate-spin" /> : <ArrowUpRight size={13} />}
              {params.count > 1 && !isGenerating && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[14px] h-[14px] rounded-full bg-cherry-primary text-white text-xs flex items-center justify-center">
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

function GalleryGrid({ images, onSelect, onToggleFavorite, onDelete }: {
  images: GeneratedImage[];
  onSelect: (img: GeneratedImage) => void;
  onToggleFavorite: (id: string) => void;
  onDelete: (img: GeneratedImage) => void;
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
      <div className="flex items-center justify-between px-5 py-2 border-b border-border/30">
        <div className="flex items-center gap-1">
          <Button size="inline"
            variant="ghost"
            onClick={() => setFilter('all')}
            className={`gap-1 px-2 py-[4px] text-xs transition-colors ${
              filter === 'all' ? 'bg-muted/50 text-foreground' : 'text-muted-foreground/50 hover:text-foreground'
            }`}
          >
            <LayoutGrid size={9} /> All
          </Button>
          <Button size="inline"
            variant="ghost"
            onClick={() => setFilter('favorites')}
            className={`gap-1 px-2 py-[4px] text-xs transition-colors ${
              filter === 'favorites' ? 'bg-muted/50 text-foreground' : 'text-muted-foreground/50 hover:text-foreground'
            }`}
          >
            <Star size={9} /> Favorites
          </Button>
          <div className="w-px h-3.5 bg-border/30 mx-1" />
          {(['all', '1:1', '16:9', '9:16', '4:3'] as const).map(r => (
            <Button size="inline"
              key={r}
              variant="ghost"
              onClick={() => setRatioFilter(r)}
              className={`px-1.5 py-[3px] text-xs transition-colors ${
                ratioFilter === r
                  ? 'bg-cherry-active-bg text-cherry-primary-dark'
                  : 'text-muted-foreground/40 hover:text-foreground'
              }`}
            >
              {r === 'all' ? 'All' : r}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground/40">{filtered.length} images</span>
          <Button size="inline"
            variant="ghost"
            onClick={() => setSort(s => s === 'newest' ? 'oldest' : 'newest')}
            className="gap-1 px-2 py-[3px] text-xs text-muted-foreground/40 hover:text-foreground hover:bg-accent/40"
          >
            <SlidersHorizontal size={9} />
            {sort === 'newest' ? 'Newest' : 'Oldest'}
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
        {filtered.length === 0 ? (
          <EmptyState preset="no-image" />
        ) : (
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
                  <div className="w-full h-full bg-destructive/8 flex flex-col items-center justify-center gap-1.5">
                    <AlertTriangle size={14} className="text-destructive/70" />
                    <span className="text-xs text-destructive/50">{'\u5931\u8d25'}</span>
                  </div>
                ) : img.status === 'generating' ? (
                  <div className="w-full h-full bg-cherry-active-bg flex flex-col items-center justify-center gap-1.5">
                    <Loader2 size={14} className="text-cherry-primary/60 animate-spin" />
                    <span className="text-xs text-cherry-primary/50">{Math.min(Math.round(img.progress || 0), 100)}%</span>
                  </div>
                ) : (
                  <img src={img.url} alt={img.prompt} className="w-full h-full object-cover" />
                )}
              </div>
              <div className="absolute top-1.5 left-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="px-1 py-0.5 rounded bg-muted0 backdrop-blur-sm text-xs text-white/70">
                  {img.ratio}
                </span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute top-1.5 right-1.5 flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={e => { e.stopPropagation(); onToggleFavorite(img.id); }}
                    className="p-1 bg-foreground/40 backdrop-blur-sm"
                    title="收藏"
                  >
                    <Heart size={9} className={img.favorite ? 'text-accent-pink fill-accent-pink' : 'text-white/60'} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={e => { e.stopPropagation(); onDelete(img); }}
                    className="p-1 bg-foreground/40 backdrop-blur-sm hover:bg-destructive/60"
                    title="移到回收站"
                  >
                    <Trash2 size={9} className="text-white/60" />
                  </Button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5">
                  <div className="text-xs text-white/80 line-clamp-1">{img.prompt}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        )}
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
      <div className="flex items-center justify-between px-3 h-[40px] border-b border-border/30 shrink-0">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onBack}
          className="p-1.5 text-muted-foreground/50 hover:text-foreground hover:bg-accent/40"
        >
          <X size={14} />
        </Button>

        <div className="flex items-center gap-1 overflow-x-auto max-w-[60%] scrollbar-hide">
          <Button variant="ghost" size="icon-xs" className="p-1 text-muted-foreground/50 hover:text-foreground shrink-0">
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
          <Button variant="ghost" size="icon-xs" className="p-1.5 text-muted-foreground/40 hover:text-foreground hover:bg-accent/40">
            <Download size={13} />
          </Button>
          <Button variant="ghost" size="icon-xs" className="p-1.5 text-muted-foreground/40 hover:text-foreground hover:bg-accent/40">
            <Share2 size={13} />
          </Button>
          <Button size="inline"
            variant="default"
            onClick={() => onShowDetail(selected)}
            className="gap-1.5 px-3 py-[5px] rounded-lg text-xs ml-1"
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
          className="absolute left-4 z-10 p-1.5 rounded-full bg-background/70 border-border/30 text-muted-foreground/40 hover:text-foreground hover:bg-background"
        >
          <ChevronLeft size={18} />
        </Button>

        {selectedIdx < images.length - 1 && (
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => onNavigate(1)}
            className="absolute right-4 z-10 p-1.5 rounded-full bg-background/70 border-border/30 text-muted-foreground/40 hover:text-foreground hover:bg-background"
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
      className="absolute right-4 top-4 bottom-4 w-[260px] z-[var(--z-dropdown)] bg-background/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/12 border border-border/40 flex flex-col overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-border/30">
        <div className="flex items-center gap-1.5">
          <ImageIcon size={11} className="text-muted-foreground/50" />
          <span className="text-xs text-foreground">{'\u56fe\u7247\u8be6\u60c5'}</span>
        </div>
        <Button variant="ghost" size="icon-xs" onClick={onClose} className="p-0.5 text-muted-foreground/40 hover:text-foreground">
          <X size={11} />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scrollbar-thin-xs">
        <div className="rounded-xl overflow-hidden bg-muted/15">
          <img src={image.url} alt="" className="w-full aspect-square object-cover" />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-muted-foreground/50 tracking-wider">{'\u63d0\u793a\u8bcd'}</span>
            <Button variant="ghost" onClick={copyPrompt} className="gap-0.5 p-0 text-xs text-muted-foreground/40 hover:text-foreground" size="inline">
              {copied ? <Check size={7} className="text-cherry-primary" /> : <Copy size={7} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </Button>
          </div>
          <p className="text-xs text-foreground leading-relaxed">{image.prompt}</p>
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
        <Button size="inline"
          variant="ghost"
          onClick={() => onRemix(image)}
          className="flex-1 gap-1 py-[6px] rounded-lg bg-cherry-active-bg text-cherry-primary-dark text-xs hover:bg-cherry-active-border"
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
              ? 'bg-destructive/12 text-destructive'
              : 'bg-muted/30 text-muted-foreground/40 hover:text-foreground'
          }`}
        >
          <Heart size={11} className={image.favorite ? 'fill-accent-pink' : ''} />
        </Button>
        <Button variant="ghost" size="icon-xs" className="p-[7px] rounded-lg bg-muted/30 text-muted-foreground/40 hover:text-foreground">
          <Download size={11} />
        </Button>
      </div>
    </motion.div>
  );
}

function MetaRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-muted-foreground/50">{label}</span>
      <span className={`text-foreground ${mono ? 'font-mono text-xs' : ''}`}>{value}</span>
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
    <div className="absolute left-3 top-1/2 -translate-y-1/2 z-[var(--z-floating)] flex flex-col items-center gap-0.5 py-2 px-[5px] bg-background/90 backdrop-blur-xl rounded-2xl shadow-xl shadow-black/10 border border-border/40 transition-all duration-200">
      {tools.map((tool) => {
        if (tool.id.startsWith('divider')) {
          return <div key={tool.id} className="w-5 h-px bg-border/30 my-1" />;
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
                : 'text-muted-foreground hover:text-foreground hover:bg-accent/40'
            }`}
          >
            {tool.icon}
          </Button>
        );
      })}
    </div>
  );
}
