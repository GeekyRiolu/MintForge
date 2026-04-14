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

    console.log('[NFT Generator] API Key present:', !!HF_API_KEY);
    console.log('[NFT Generator] Prompt:', prompt);

    if (!HF_API_KEY) {
      console.log('[NFT Generator] No API key, using placeholders');
      // Fallback: Generate placeholder images for demo
      const images = generatePlaceholderImages(prompt);
      return res.status(200).json({ success: true, images });
    }

    const images: string[] = [];

    // Generate 3 images with different parameters
    for (let i = 0; i < 3; i++) {
      try {
        const enhancedPrompt = `${prompt}, NFT art style, digital art, high quality, 4k${i > 0 ? `, variation ${i + 1}` : ''}`;
        
        console.log(`[NFT Generator] Generating image ${i + 1}/3...`);
        
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

        console.log(`[NFT Generator] Response status: ${response.status}`);

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`[NFT Generator] HF API Error:`, response.status, errorText);
          throw new Error(`HF API error: ${response.statusText}`);
        }

        // Response is binary image data (PNG)
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64 = buffer.toString('base64');
        console.log(`[NFT Generator] Image ${i + 1} generated, size: ${base64.length} bytes`);
        images.push(`data:image/png;base64,${base64}`);
      } catch (error) {
        console.error(`[NFT Generator] Error generating image ${i + 1}:`, error);
        // Add placeholder on error
        images.push(generatePlaceholderImage(prompt, i));
      }
    }

    console.log('[NFT Generator] All images generated successfully');
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
