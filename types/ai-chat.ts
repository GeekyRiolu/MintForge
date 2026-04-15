import type { UIMessage } from 'ai';

export type ImageGenerationProvider = 'cloudflare';

export type GeneratedImagesData = {
  images: string[];
  prompt: string;
  provider: ImageGenerationProvider;
};

export type AIChatMessage = UIMessage<
  never,
  {
    generatedImages: GeneratedImagesData;
  }
>;
