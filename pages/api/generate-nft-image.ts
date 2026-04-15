import type { NextApiRequest, NextApiResponse } from 'next';

type ResponseData = {
  success: boolean;
  images?: string[];
  error?: string;
};

type GenerationSuccess = {
  success: true;
  images: string[];
  provider: 'cloudflare';
};

type GenerationFailure = {
  success: false;
  error: string;
};

export type GenerateNftImagesResult = GenerationSuccess | GenerationFailure;

type CloudflareImageResponse = {
  result?: {
    image?: unknown;
  };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
) {
  if (req.method !== 'POST') {
    return res
      .status(405)
      .json({ success: false, error: 'Method not allowed' });
  }

  const { prompt } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res
      .status(400)
      .json({ success: false, error: 'Prompt is required' });
  }

  const result = await generateNftImages(prompt);

  if (!result.success) {
    return res.status(500).json({ success: false, error: result.error });
  }

  return res.status(200).json({ success: true, images: result.images });
}

export async function generateNftImages(
  prompt: string,
): Promise<GenerateNftImagesResult> {
  return generateWithCloudflare(prompt);
}

async function fetchWithTimeout(
  input: Parameters<typeof fetch>[0],
  init: Parameters<typeof fetch>[1] = {},
  timeout = 300000,
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

async function generateWithCloudflare(
  prompt: string,
): Promise<GenerateNftImagesResult> {
  const cloudflareApiToken = process.env.CLOUDFLARE_API_TOKEN ?? '';
  const cloudflareAccountId = process.env.CLOUDFLARE_ACCOUNT_ID ?? '';

  console.log('[Cloudflare] API Key present:', !!cloudflareApiToken);
  console.log('[Cloudflare] Account ID present:', !!cloudflareAccountId);
  console.log('[Cloudflare] Prompt:', prompt);

  if (!cloudflareApiToken || !cloudflareAccountId) {
    return {
      success: false,
      error: 'Cloudflare image generation is not configured',
    };
  }

  try {
    const enhancedPrompt = `${prompt}, NFT art style, digital art, high quality, 4k`;
    const model =
      process.env.CLOUDFLARE_IMAGE_MODEL ??
      '@cf/black-forest-labs/flux-1-schnell';

    const response = await fetchWithTimeout(
      `https://api.cloudflare.com/client/v4/accounts/${cloudflareAccountId}/ai/run/${model}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${cloudflareApiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: enhancedPrompt,
          width: 1024,
          height: 1024,
          num_steps: 4,
        }),
      },
    );

    const contentType = response.headers.get('content-type') ?? '';

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        '[Cloudflare] API Error:',
        response.status,
        contentType,
        errorText?.slice?.(0, 1000),
      );

      return {
        success: false,
        error: 'Failed to generate images with Cloudflare',
      };
    }

    if (!contentType.includes('application/json')) {
      const text = await response.text();
      console.error(
        '[Cloudflare] Unexpected non-JSON response:',
        contentType,
        text?.slice?.(0, 1000),
      );

      return {
        success: false,
        error: 'Failed to generate images with Cloudflare',
      };
    }

    const data = (await response.json()) as CloudflareImageResponse;
    const imageData =
      typeof data.result?.image === 'string' ? data.result.image : '';

    if (!imageData) {
      console.error(
        '[Cloudflare] No image returned:',
        JSON.stringify(data).slice(0, 1000),
      );

      return {
        success: false,
        error: 'Failed to generate images with Cloudflare',
      };
    }

    return {
      success: true,
      images: [ensureDataUrl(imageData)],
      provider: 'cloudflare',
    };
  } catch (error) {
    console.error('[Cloudflare] Error:', error);

    return {
      success: false,
      error: 'Failed to generate images with Cloudflare',
    };
  }
}

function ensureDataUrl(base64Image: string): string {
  if (base64Image.startsWith('data:')) {
    return base64Image;
  }

  return `data:image/png;base64,${base64Image}`;
}
