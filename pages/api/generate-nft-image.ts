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

    return await generateWithCloudflare(prompt);
  } catch (error) {
    console.error('Generation error:', error);
    return { success: false, error: 'Failed to generate images' };
  }
}

async function fetchWithTimeout(
  input: RequestInfo,
  init: RequestInit = {},
  timeout = 3000000, // 3000 seconds
) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    // @ts-ignore
    const resp = await fetch(input, { ...init, signal: controller.signal });
    return resp;
  } finally {
    clearTimeout(id);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
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

    const response = await fetchWithTimeout('https://api.freepik.com/v1/ai/mystic', {
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

    const contentType = response.headers.get('content-type') ?? '';

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Freepik] API Error:', response.status, contentType, errorText?.slice?.(0, 1000));
      throw new Error('Freepik API error');
    }

    if (!contentType.includes('application/json')) {
      const text = await response.text();
      console.error('[Freepik] Unexpected non-JSON response:', contentType, text?.slice?.(0, 1000));
      // Treat as transient/unexpected and fallback to Hugging Face
      throw new Error('Freepik returned non-JSON response');
    }

    const data = await response.json();
    const taskId = data.data?.task_id ?? data.task_id ?? data?.id;
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

async function generateWithCloudflare(
  prompt: string,
): Promise<GenerateNftImagesResult> {
  const cloudflareApiToken = process.env.CLOUDFLARE_API_TOKEN ?? '';
  const cloudflareAccountId = process.env.CLOUDFLARE_ACCOUNT_ID ?? '';

  console.log('[Cloudflare] API Key present:', !!cloudflareApiToken);
  console.log('[Cloudflare] Account ID present:', !!cloudflareAccountId);
  console.log('[Cloudflare] Prompt:', prompt);

  if (!cloudflareApiToken || !cloudflareAccountId) {
    console.log('[Cloudflare] Missing config, falling back to Replicate');
    return generateWithReplicate(prompt);
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
      300000,
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
      throw new Error('Cloudflare API error');
    }

    if (!contentType.includes('application/json')) {
      const text = await response.text();
      console.error(
        '[Cloudflare] Unexpected non-JSON response:',
        contentType,
        text?.slice?.(0, 1000),
      );
      throw new Error('Cloudflare returned non-JSON response');
    }

    const data = await response.json();
    const imageData =
      typeof data?.result?.image === 'string' ? data.result.image : '';

    if (!imageData) {
      console.error(
        '[Cloudflare] No image returned:',
        JSON.stringify(data).slice(0, 1000),
      );
      throw new Error('Cloudflare returned no image');
    }

    return {
      success: true,
      images: [ensureDataUrl(imageData)],
      provider: 'cloudflare',
    };
  } catch (error) {
    console.error('[Cloudflare] Error:', error);
    return generateWithReplicate(prompt);
  }
}

async function generateWithReplicate(
  prompt: string,
): Promise<GenerateNftImagesResult> {
  const replicateApiKey =
    process.env.REPLICATE_API_TOKEN ??
    process.env.REPLICATE_API_KEY ??
    '';

  const replicateEnvName = process.env.REPLICATE_API_TOKEN
    ? 'REPLICATE_API_TOKEN'
    : process.env.REPLICATE_API_KEY
    ? 'REPLICATE_API_KEY'
    : null;

  console.log(
    '[Replicate] API Key present:',
    !!replicateApiKey,
    replicateEnvName ? `via ${replicateEnvName}` : '',
  );
  console.log('[Replicate] Prompt:', prompt);

  if (!replicateApiKey) {
    console.log('[Replicate] No API key, falling back to Hugging Face');
    return generateWithHuggingFace(prompt);
  }

  try {
    const enhancedPrompt = `${prompt}, NFT art style, digital art, high quality, 4k`;
    const model = process.env.REPLICATE_MODEL ?? 'black-forest-labs/flux-schnell';
    const response = await fetchWithTimeout(
      `https://api.replicate.com/v1/models/${model}/predictions`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${replicateApiKey}`,
          'Content-Type': 'application/json',
          Prefer: 'wait',
        },
        body: JSON.stringify({
          input: {
            prompt: enhancedPrompt,
            aspect_ratio: '1:1',
            output_format: 'png',
          },
        }),
      },
      300000,
    );

    const contentType = response.headers.get('content-type') ?? '';

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        '[Replicate] API Error:',
        response.status,
        contentType,
        errorText?.slice?.(0, 1000),
      );
      throw new Error('Replicate API error');
    }

    if (!contentType.includes('application/json')) {
      const text = await response.text();
      console.error(
        '[Replicate] Unexpected non-JSON response:',
        contentType,
        text?.slice?.(0, 1000),
      );
      throw new Error('Replicate returned non-JSON response');
    }

    const data = await response.json();
    const outputs = Array.isArray(data.output)
      ? data.output
      : typeof data.output === 'string'
      ? [data.output]
      : [];

    if (data.status && data.status !== 'succeeded') {
      console.error('[Replicate] Prediction did not complete:', data.status, JSON.stringify(data).slice(0, 1000));
      throw new Error(`Replicate prediction ${data.status}`);
    }

    if (!outputs.length) {
      throw new Error('Replicate returned no output');
    }

    const images: string[] = [];

    for (const output of outputs) {
      if (typeof output !== 'string') {
        continue;
      }

      const imageResp = await fetchWithTimeout(output);
      const imageContentType = imageResp.headers.get('content-type') ?? '';

      if (!imageResp.ok || !imageContentType.startsWith('image/')) {
        console.error(
          '[Replicate] Output fetch failed or non-image:',
          output,
          imageResp.status,
          imageContentType,
        );
        continue;
      }

      const arrayBuffer = await imageResp.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64 = buffer.toString('base64');
      const mime = imageContentType.split(';')[0] ?? 'image/png';
      images.push(`data:${mime};base64,${base64}`);
    }

    if (!images.length) {
      throw new Error('Replicate returned no downloadable images');
    }

    return {
      success: true,
      images,
      provider: 'replicate',
    };
  } catch (error) {
    console.error('[Replicate] Error:', error);
    return generateWithHuggingFace(prompt);
  }
}

async function generateWithHuggingFace(
  prompt: string,
): Promise<GenerateNftImagesResult> {
  
  const huggingFaceApiKey =
    process.env.HUGGINGFACE_API_KEY ??
    process.env.HF_API_TOKEN ??
    process.env.HF_API_KEY ??
    process.env.HF_TOKEN ??
    process.env.HF_KEY ??
    '';

  const huggingFaceEnvName = process.env.HUGGINGFACE_API_KEY
    ? 'HUGGINGFACE_API_KEY'
    : process.env.HF_API_TOKEN
    ? 'HF_API_TOKEN'
    : process.env.HF_API_KEY
    ? 'HF_API_KEY'
    : process.env.HF_TOKEN
    ? 'HF_TOKEN'
    : process.env.HF_KEY
    ? 'HF_KEY'
    : null;

  console.log('[HuggingFace] API Key present:', !!huggingFaceApiKey, huggingFaceEnvName ? `via ${huggingFaceEnvName}` : '');
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

      // Try a few times in case the model is cold or the inference endpoint returns an intermittent HTML "inactivity" page.
      const model = process.env.HUGGINGFACE_MODEL ?? 'runwayml/stable-diffusion-v1-5';
      const url = `https://api-inference.huggingface.co/models/${model}`;

      let response: Response | null = null;
      let lastError: unknown = null;

      for (let attempt = 1; attempt <= 3; attempt += 1) {
        try {
          response = await fetchWithTimeout(
            url,
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${huggingFaceApiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                inputs: enhancedPrompt,
                options: { wait_for_model: true },
              }),
            },
            3000000,
          );

          console.log(`[HuggingFace] Attempt ${attempt} response status: ${response.status}`);

          const contentType = response.headers.get('content-type') ?? '';

          // If we receive HTML or an error status, try again (up to attempts)
          if (!response.ok || contentType.includes('text/html')) {
            const text = await response.text();
            lastError = new Error(`HF attempt ${attempt} failed: ${response.status} ${contentType} ${String(text).slice(0, 500)}`);
            console.warn('[HuggingFace] Non-success or HTML response, retrying:', lastError);
            if (attempt < 3) await sleep(1500 * attempt);
            continue;
          }

          // success-ish, break out and handle below
          break;
        } catch (err) {
          lastError = err;
          console.warn(`[HuggingFace] Attempt ${attempt} error:`, err);
          if (attempt < 3) await sleep(1500 * attempt);
        }
      }

      if (!response) {
        console.error('[HuggingFace] No response after retries', lastError);
        throw lastError ?? new Error('No HuggingFace response');
      }

      const contentType = response.headers.get('content-type') ?? '';

      if (!response.ok) {
        const errText = await response.text();
        console.error('[HuggingFace] API Error after retries:', response.status, contentType, errText?.slice?.(0, 1000));
        throw new Error('HuggingFace API error');
      }

      if (contentType.startsWith('image/')) {
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64 = buffer.toString('base64');
        console.log(
          `[HuggingFace] Image ${index + 1} generated, size: ${base64.length} bytes`,
        );
        const mime = response.headers.get('content-type')?.split(';')[0] ?? 'image/png';
        images.push(`data:${mime};base64,${base64}`);
      } else if (contentType.includes('application/json')) {
        const json = await response.json();

        const extracted = extractBase64FromHFJson(json);
        if (extracted.length) {
          images.push(...extracted.map((b64) => ensureDataUrl(b64)));
        } else {
          const urls = collectImageUrls(json);
          for (const imageUrl of urls) {
            try {
              const imageResp = await fetchWithTimeout(imageUrl);
              const imgCT = imageResp.headers.get('content-type') ?? '';
              if (!imageResp.ok || !imgCT.startsWith('image/')) {
                console.error('[HuggingFace] Image URL fetch failed or non-image:', imageUrl, imageResp.status);
                continue;
              }
              const ab = await imageResp.arrayBuffer();
              const buf = Buffer.from(ab);
              const b64 = buf.toString('base64');
              const mime = imgCT.split(';')[0] ?? 'image/png';
              images.push(`data:${mime};base64,${b64}`);
            } catch (err) {
              console.error('[HuggingFace] Error fetching image URL from JSON:', err);
            }
          }

          if (images.length === 0) {
            console.error('[HuggingFace] No images found in JSON response:', JSON.stringify(json).slice(0, 1000));
            throw new Error('HuggingFace returned JSON without images');
          }
        }
      } else {
        const text = await response.text();
        console.error('[HuggingFace] Unexpected content-type:', contentType, text?.slice?.(0, 1000));
        throw new Error('HuggingFace returned unexpected response');
      }
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

function extractBase64FromHFJson(json: any): string[] {
  const results: string[] = [];
  const seen = new Set<any>();

  function walk(node: any) {
    if (!node || seen.has(node)) return;
    seen.add(node);

    if (typeof node === 'string') {
      const s = node as string;
      if (s.startsWith('data:') && s.includes('base64,')) {
        const parts = s.split('base64,');
        if (parts.length > 1) results.push(parts[1]);
        return;
      }

      const base64Only = /^[A-Za-z0-9+/=]+$/.test(s);
      if (s.length > 100 && base64Only) {
        results.push(s);
      }

      return;
    }

    if (Array.isArray(node)) {
      for (const item of node) walk(item);
      return;
    }

    if (typeof node === 'object') {
      for (const v of Object.values(node)) walk(v);
      return;
    }
  }

  walk(json);
  return results;
}

function collectImageUrls(json: any): string[] {
  const urls: string[] = [];
  const seen = new Set<any>();

  function walk(node: any) {
    if (!node || seen.has(node)) return;
    seen.add(node);

    if (typeof node === 'string') {
      const s = node as string;
      if (s.startsWith('http://') || s.startsWith('https://')) {
        urls.push(s);
      }
      return;
    }

    if (Array.isArray(node)) {
      for (const item of node) walk(item);
      return;
    }

    if (typeof node === 'object') {
      for (const v of Object.values(node)) walk(v);
      return;
    }
  }

  walk(json);
  return Array.from(new Set(urls));
}

function ensureDataUrl(b64OrData: string): string {
  if (!b64OrData) return '';
  if (b64OrData.startsWith('data:')) return b64OrData;
  return `data:image/png;base64,${b64OrData}`;
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
