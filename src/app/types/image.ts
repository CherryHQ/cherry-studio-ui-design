// ===========================
// Image Generation Types
// ===========================
// Types used by the Image Generation page.

export interface ImageModel {
  id: string;
  name: string;
  provider: string;
}

export type ImageMode = 'standard' | 'quality' | 'speed';
export type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3';
export type ImageSize = 'small' | 'medium' | 'large';

export interface GenerationParams {
  model: string;
  mode: ImageMode;
  ratio: AspectRatio;
  size: ImageSize;
  count: number;
  prompt: string;
  negativePrompt?: string;
  seed?: number;
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  negativePrompt?: string;
  model: string;
  mode: ImageMode;
  ratio: AspectRatio;
  size: ImageSize;
  seed: number;
  width: number;
  height: number;
  createdAt: string;
  favorite: boolean;
  status: 'completed' | 'generating' | 'failed';
  progress?: number;
  errorMessage?: string;
  groupId?: string;
}
