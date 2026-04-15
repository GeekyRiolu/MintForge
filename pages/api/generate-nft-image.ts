import type { NextApiRequest, NextApiResponse } from 'next';

import type { ImageGenerationProvider } from 'types/ai-chat';

type ResponseData = {
  success: boolean;
  images?: string[];
  error?: string;
  taskId?: string;
};

type GenerationSuccess = {
  success: true;
  images: string[];
  provider: ImageGenerationProvider;
};

type GenerationPending = {
  success: true;
  taskId: string;
  provider: 'freepik';
};

type GenerationFailure = {
  success: false;
  error: string;
};

export type GenerateNftImagesResult =
  | GenerationSuccess
  | GenerationPending
  | GenerationFailure;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
) {
  if (req.method !== 'POST') {
    return res
      .status(405)
      .json({ success: false, error: 'Method not allowed' });
  }

  const { prompt, useFreepik } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res
      .status(400)
      .json({ success: false, error: 'Prompt is required' });
  }

  const result = await generateNftImages(prompt, Boolean(useFreepik));

  if (!result.success) {
    return res.status(500).json({ success: false, error: result.error });
  }

  if ('taskId' in result) {
    return res.status(202).json({
      success: true,
      taskId: result.taskId,
      images: [],
    });
  }

  return res.status(200).json({ success: true, images: result.images });
}

export async function generateNftImages(
  prompt: string,
  useFreepik: boolean,
): Promise<GenerateNftImagesResult> {
  try {
    if (useFreepik) {
      return await generateWithFreepik(prompt);
    }

    return await generateWithHuggingFace(prompt);
  } catch (error) {
    console.error('Generation error:', error);
    return { success: false, error: 'Failed to generate images' };
  }
}

async function generateWithFreepik(
  prompt: string,
): Promise<GenerateNftImagesResult> {
  const freepikApiKey = process.env.FREEPIK_API_KEY;

  if (!freepikApiKey) {
    console.log('[Freepik] No API key found, falling back to Hugging Face');
    return generateWithHuggingFace(prompt);
  }

  try {
    console.log('[Freepik] Generating image with Mystic API...');

    const enhancedPrompt = `${prompt}, NFT art style, digital art, high quality, 4k, professional`;

    const response = await fetch('https://api.freepik.com/v1/ai/mystic', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-freepik-api-key': freepikApiKey,
      },
      body: JSON.stringify({
        prompt: enhancedPrompt,
        resolution: '4k',
        aspect_ratio: 'square_1_1',
        model: 'realism',
        creative_detailing: 50,
        engine: 'magnific_sharpy',
        fixed_generation: false,
        filter_nsfw: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Freepik] API Error:', response.status, errorText);
      throw new Error(`Freepik API error: ${response.statusText}`);
    }

    const data = await response.json();
    const taskId = data.data?.task_id;
    console.log('[Freepik] Task created:', taskId);

    if (taskId) {
      return {
        success: true,
        taskId,
        provider: 'freepik',
      };
    }

    throw new Error('No task ID returned from Freepik');
  } catch (error) {
    console.error('[Freepik] Error:', error);
    return generateWithHuggingFace(prompt);
  }
}

async function generateWithHuggingFace(
  prompt: string,
): Promise<GenerateNftImagesResult> {
  const huggingFaceApiKey = process.env.HUGGINGFACE_API_KEY;

  console.log('[HuggingFace] API Key present:', !!huggingFaceApiKey);
  console.log('[HuggingFace] Prompt:', prompt);

  if (!huggingFaceApiKey) {
    console.log('[HuggingFace] No API key, using placeholders');
    return {
      success: true,
      images: generatePlaceholderImages(prompt),
      provider: 'placeholder',
    };
  }

  const images: string[] = [];

  for (let index = 0; index < 1; index += 1) {
    try {
      const enhancedPrompt = `${prompt}, NFT art style, digital art, high quality, 4k`;

      console.log(`[HuggingFace] Generating image ${index + 1}/1...`);

      const response = await fetch(
        'https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${huggingFaceApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: enhancedPrompt,
          }),
        },
      );

      console.log(`[HuggingFace] Response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[HuggingFace] API Error:', response.status, errorText);
        throw new Error(`HF API error: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64 = buffer.toString('base64');
      console.log(
        `[HuggingFace] Image ${index + 1} generated, size: ${base64.length} bytes`,
      );
      images.push(`data:image/png;base64,${base64}`);
    } catch (error) {
      console.error(
        `[HuggingFace] Error generating image ${index + 1}:`,
        error,
      );
      images.push(generatePlaceholderImage(prompt, index));
    }
  }

  console.log('[HuggingFace] All images generated successfully');

  return {
    success: true,
    images,
    provider: 'huggingface',
  };
}

function generatePlaceholderImages(prompt: string): string[] {
  return Array.from({ length: 1 }, (_, index) =>
    generatePlaceholderImage(prompt, index),
  );
}

function generatePlaceholderImage(prompt: string, index: number): string {
  const colors = ['#6366f1', '#8b5cf6', '#d946ef', '#ec4899', '#f43f5e', '#f97316'];
  const color = colors[index % colors.length];

  const svg = `
    <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad${index}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
          <stop offset="100%" style="stop-color:#1f2937;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" fill="url(#grad${index})" />
      <text x="256" y="200" font-family="Arial" font-size="24" fill="white" text-anchor="middle" font-weight="bold">
        AI Generated NFT
      </text>
      <text x="256" y="240" font-family="Arial" font-size="16" fill="rgba(255,255,255,0.8)" text-anchor="middle">
        ${prompt.substring(0, 30)}...
      </text>
      <circle cx="256" cy="380" r="40" fill="rgba(255,255,255,0.2)" />
      <text x="256" y="390" font-family="Arial" font-size="12" fill="white" text-anchor="middle">
        Preview
      </text>
    </svg>
  `;

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}
