import type { NextApiRequest, NextApiResponse } from 'next';

type ResponseData = {
  success: boolean;
  status?: string;
  images?: string[];
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
) {
  if (req.method !== 'GET') {
    return res
      .status(405)
      .json({ success: false, error: 'Method not allowed' });
  }

  const { taskId } = req.query;

  if (!taskId || typeof taskId !== 'string') {
    return res
      .status(400)
      .json({ success: false, error: 'Task ID is required' });
  }

  const result = await checkFreepikTask(taskId);

  if (!result.success && result.status === 'FAILED') {
    return res.status(400).json(result);
  }

  if (!result.success && result.status) {
    return res.status(202).json(result);
  }

  if (!result.success) {
    return res.status(500).json(result);
  }

  return res.status(200).json(result);
}

export async function checkFreepikTask(
  taskId: string,
): Promise<ResponseData> {
  try {
    const freepikApiKey = process.env.FREEPIK_API_KEY;

    if (!freepikApiKey) {
      return {
        success: false,
        error: 'Freepik API key not configured',
      };
    }

    console.log('[Freepik Check] Polling task:', taskId);

    const response = await fetch(`https://api.freepik.com/v1/ai/mystic/${taskId}`, {
      method: 'GET',
      headers: {
        'x-freepik-api-key': freepikApiKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Freepik Check] API Error:', response.status, errorText);
      throw new Error(`Freepik API error: ${response.statusText}`);
    }

    const data = await response.json();
    const status = data.data?.status as string | undefined;

    console.log('[Freepik Check] Status:', status);

    if (status === 'COMPLETED' && data.data?.generated) {
      console.log('[Freepik Check] Task completed, fetching images...');
      const images: string[] = [];

      for (const imageUrl of data.data.generated as string[]) {
        try {
          const imageResponse = await fetch(imageUrl);
          if (!imageResponse.ok) {
            throw new Error(
              `Failed to fetch image: ${imageResponse.statusText}`,
            );
          }

          const arrayBuffer = await imageResponse.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const base64 = buffer.toString('base64');
          const mimeType =
            imageResponse.headers.get('content-type')?.split(';')[0] ??
            'image/png';
          images.push(`data:${mimeType};base64,${base64}`);
        } catch (error) {
          console.error('[Freepik Check] Error fetching image:', error);
        }
      }

      return {
        success: images.length > 0,
        status,
        images,
      };
    }

    if (status === 'FAILED') {
      return {
        success: false,
        status,
        error: 'Image generation failed',
      };
    }

    return {
      success: false,
      status,
      error: 'Still processing',
    };
  } catch (error) {
    console.error('[Freepik Check] Error:', error);
    return {
      success: false,
      error: 'Failed to check task status',
    };
  }
}
