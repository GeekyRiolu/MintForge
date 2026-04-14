import type { NextApiRequest, NextApiResponse } from 'next';

type ResponseData = {
  success: boolean;
  images?: string[];
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { prompt } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ success: false, error: 'Prompt is required' });
  }

  try {
    // Using Hugging Face Inference API with free models
    // Model: Stable Diffusion v2.1 (free tier available)
    const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;

    if (!HF_API_KEY) {
      // Fallback: Generate placeholder images for demo
      const images = generatePlaceholderImages(prompt);
      return res.status(200).json({ success: true, images });
    }

    const images: string[] = [];

    // Generate 3 images with different parameters
    for (let i = 0; i < 3; i++) {
      try {
        const response = await fetch(
          'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1',
          {
            headers: { Authorization: `Bearer ${HF_API_KEY}` },
            method: 'POST',
            body: JSON.stringify({
              inputs: `${prompt}, NFT art style, digital art, high quality, 4k`,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`HF API error: ${response.statusText}`);
        }

        const blob = await response.blob();
        const base64 = await blob.text();
        images.push(`data:image/png;base64,${base64}`);
      } catch (error) {
        console.error('Error generating image', error);
        // Add placeholder on error
        images.push(generatePlaceholderImage(prompt, i));
      }
    }

    res.status(200).json({ success: true, images });
  } catch (error) {
    console.error('Generation error:', error);
    res
      .status(500)
      .json({ success: false, error: 'Failed to generate images' });
  }
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
