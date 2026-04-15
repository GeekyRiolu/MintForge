import type { NextApiRequest, NextApiResponse } from 'next';

type UploadImageRequest = {
  type: 'image';
  imageUrl: string;
  filename?: string;
};

type UploadMetadataRequest = {
  type: 'metadata';
  metadata: Record<string, unknown>;
};

type UploadRequest = UploadImageRequest | UploadMetadataRequest;

type UploadResponse = {
  success: boolean;
  hash?: string;
  ipfsUrl?: string;
  error?: string;
};

type PinataFileResponse = {
  IpfsHash: string;
};

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '12mb',
    },
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UploadResponse>,
) {
  if (req.method !== 'POST') {
    return res
      .status(405)
      .json({ success: false, error: 'Method not allowed' });
  }

  const pinataApiKey = process.env.NEXT_PUBLIC_PINATA_API_KEY;
  const pinataApiSecret = process.env.PINATA_API_SECRET;

  if (!pinataApiKey || !pinataApiSecret) {
    return res
      .status(500)
      .json({ success: false, error: 'Pinata credentials not configured' });
  }

  try {
    const body = req.body as Partial<UploadRequest>;
    const result =
      body.type === 'image'
        ? await uploadImage(body, pinataApiKey, pinataApiSecret)
        : await uploadMetadata(body, pinataApiKey, pinataApiSecret);

    return res.status(200).json({
      success: true,
      hash: result.hash,
      ipfsUrl: `ipfs://${result.hash}`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'IPFS upload failed';
    return res.status(400).json({ success: false, error: message });
  }
}

async function uploadImage(
  body: Partial<UploadRequest>,
  pinataApiKey: string,
  pinataApiSecret: string,
): Promise<{ hash: string }> {
  if (body.type !== 'image' || typeof body.imageUrl !== 'string') {
    throw new Error('Image URL is required');
  }

  const imageResponse = await fetch(body.imageUrl);
  if (!imageResponse.ok) {
    throw new Error('Failed to fetch image');
  }

  const contentType =
    imageResponse.headers.get('content-type')?.split(';')[0] || 'image/png';
  const imageBlob = new Blob([await imageResponse.arrayBuffer()], {
    type: contentType,
  });
  const formData = new FormData();
  formData.append('file', imageBlob, body.filename || `ai-nft-${Date.now()}.png`);

  const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: {
      pinata_api_key: pinataApiKey,
      pinata_secret_api_key: pinataApiSecret,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Pinata image upload failed: ${response.statusText}`);
  }

  const data = (await response.json()) as PinataFileResponse;
  return { hash: data.IpfsHash };
}

async function uploadMetadata(
  body: Partial<UploadRequest>,
  pinataApiKey: string,
  pinataApiSecret: string,
): Promise<{ hash: string }> {
  if (
    body.type !== 'metadata' ||
    !body.metadata ||
    typeof body.metadata !== 'object'
  ) {
    throw new Error('Metadata is required');
  }

  const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
    method: 'POST',
    headers: {
      pinata_api_key: pinataApiKey,
      pinata_secret_api_key: pinataApiSecret,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body.metadata),
  });

  if (!response.ok) {
    throw new Error(`Pinata metadata upload failed: ${response.statusText}`);
  }

  const data = (await response.json()) as PinataFileResponse;
  return { hash: data.IpfsHash };
}
