import type { NextApiRequest, NextApiResponse } from 'next';

type ResponseData = {
  success: boolean;
  images?: string[];
  error?: string;
  taskId?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { prompt, useFreepik } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ success: false, error: 'Prompt is required' });
  }

  try {
    // Check if user wants to use Freepik Mystic API
    if (useFreepik) {
      return await generateWithFreepik(prompt, res);
    }

    // Default: Use Hugging Face Stable Diffusion
    return await generateWithHuggingFace(prompt, res);
  } catch (error) {
    console.error('Generation error:', error);
    res
      .status(500)
      .json({ success: false, error: 'Failed to generate images' });
  }
}

async function generateWithFreepik(
  prompt: string,
  res: NextApiResponse<ResponseData>
): Promise<void> {
  const FREEPIK_API_KEY = process.env.FREEPIK_API_KEY;

  if (!FREEPIK_API_KEY) {
    console.log('[Freepik] No API key found, falling back to Hugging Face');
    return generateWithHuggingFace(prompt, res);
  }

  try {
    console.log('[Freepik] Generating image with Mystic API...');

    const enhancedPrompt = `${prompt}, NFT art style, digital art, high quality, 4k, professional`;

    const response = await fetch('https://api.freepik.com/v1/ai/mystic', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-freepik-api-key': FREEPIK_API_KEY,
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
    console.log('[Freepik] Task created:', data.data?.task_id);

    if (data.data?.task_id) {
      // Freepik uses async generation, return task ID for polling
      res.status(202).json({
        success: true,
        taskId: data.data.task_id,
        images: [],
      });
    } else {
      throw new Error('No task ID returned from Freepik');
    }
  } catch (error) {
    console.error('[Freepik] Error:', error);
    // Fallback to Hugging Face
    return generateWithHuggingFace(prompt, res);
  }
}

async function generateWithHuggingFace(
  prompt: string,
  res: NextApiResponse<ResponseData>
): Promise<void> {
  const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;

  console.log('[HuggingFace] API Key present:', !!HF_API_KEY);
  console.log('[HuggingFace] Prompt:', prompt);

  if (!HF_API_KEY) {
    console.log('[HuggingFace] No API key, using placeholders');
    const images = generatePlaceholderImages(prompt);
    return res.status(200).json({ success: true, images });
  }

  const images: string[] = [];

  // Generate 3 images
  for (let i = 0; i < 3; i++) {
    try {
      const enhancedPrompt = `${prompt}, NFT art style, digital art, high quality, 4k${i > 0 ? `, variation ${i + 1}` : ''}`;

      console.log(`[HuggingFace] Generating image ${i + 1}/3...`);

      const response = await fetch(
        'https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5',
        {
          headers: {
            Authorization: `Bearer ${HF_API_KEY}`,
            'Content-Type': 'application/json',
          },
          method: 'POST',
          body: JSON.stringify({
            inputs: enhancedPrompt,
          }),
        }
      );

      console.log(`[HuggingFace] Response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[HuggingFace] API Error:`, response.status, errorText);
        throw new Error(`HF API error: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64 = buffer.toString('base64');
      console.log(`[HuggingFace] Image ${i + 1} generated, size: ${base64.length} bytes`);
      images.push(`data:image/png;base64,${base64}`);
    } catch (error) {
      console.error(`[HuggingFace] Error generating image ${i + 1}:`, error);
      images.push(generatePlaceholderImage(prompt, i));
    }
  }

  console.log('[HuggingFace] All images generated successfully');
  res.status(200).json({ success: true, images });
}

function generatePlaceholderImages(prompt: string): string[] {
  return Array.from({ length: 3 }, (_, i) =>
    generatePlaceholderImage(prompt, i)
  );
}

function generatePlaceholderImage(prompt: string, index: number): string {
  // Create a colorful SVG placeholder
  const colors = [
    '#6366f1',
    '#8b5cf6',
    '#d946ef',
    '#ec4899',
    '#f43f5e',
    '#f97316'
  ];
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
