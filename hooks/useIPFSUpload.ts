import { useCallback, useState } from 'react';

interface UploadState {
  isLoading: boolean;
  isSuccess: boolean;
  error: string | null;
  ipfsHash: string | null;
  ipfsUrl: string | null;
}

const INITIAL_STATE: UploadState = {
  isLoading: false,
  isSuccess: false,
  error: null,
  ipfsHash: null,
  ipfsUrl: null,
};

/**
 * Hook for uploading AI-generated images to IPFS
 * Uses Pinata or NFT.storage (configurable via NEXT_PUBLIC_IPFS_PROVIDER)
 */
export function useIPFSUpload() {
  const [state, setState] = useState<UploadState>(INITIAL_STATE);

  const upload = useCallback(
    async (imageUrl: string, filename?: string): Promise<{ success: boolean; ipfsUrl?: string; hash?: string; error?: string }> => {
      setState(prev => ({
        ...prev,
        isLoading: true,
        error: null,
      }));

      try {
        // Fetch the image
        const imageResponse = await fetch(imageUrl);
        if (!imageResponse.ok) {
          throw new Error('Failed to fetch image');
        }

        const blob = await imageResponse.blob();
        const file = new File(
          [blob],
          filename || `ai-nft-${Date.now()}.png`,
          { type: 'image/png' },
        );

        // Upload to IPFS
        const provider = process.env.NEXT_PUBLIC_IPFS_PROVIDER || 'nft-storage';
        let result;

        if (provider === 'pinata') {
          result = await uploadToPinata(file);
        } else {
          result = await uploadToNFTStorage(file);
        }

        const ipfsUrl = `ipfs://${result.hash}`;

        setState(prev => ({
          ...prev,
          isLoading: false,
          isSuccess: true,
          ipfsHash: result.hash,
          ipfsUrl: ipfsUrl,
        }));

        return {
          success: true,
          ipfsUrl,
          hash: result.hash,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Upload failed';
        console.error('IPFS upload error:', error);

        setState(prev => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));

        return {
          success: false,
          error: errorMessage,
        };
      }
    },
    [],
  );

  const reset = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  return { ...state, upload, reset };
}

/**
 * Upload image to Pinata
 */
async function uploadToPinata(file: File): Promise<{ hash: string }> {
  const apiKey = process.env.NEXT_PUBLIC_PINATA_API_KEY;
  const apiSecret = process.env.PINATA_API_SECRET;

  if (!apiKey || !apiSecret) {
    throw new Error('Pinata credentials not configured');
  }

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: {
      pinata_api_key: apiKey,
      pinata_secret_api_key: apiSecret,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Pinata upload failed: ${response.statusText}`);
  }

  const data = (await response.json()) as { IpfsHash: string };
  return { hash: data.IpfsHash };
}

/**
 * Upload image to NFT.storage
 */
async function uploadToNFTStorage(file: File): Promise<{ hash: string }> {
  const apiKey = process.env.NEXT_PUBLIC_NFT_STORAGE_KEY;

  if (!apiKey) {
    throw new Error('NFT_STORAGE_KEY not configured');
  }

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('https://api.nft.storage/upload', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`NFT.storage upload failed: ${response.statusText}`);
  }

  const data = (await response.json()) as { ok: boolean; value: { cid: string } };
  return { hash: data.value.cid };
}

/**
 * Convert IPFS URL to HTTP gateway URL for display
 * Useful for showing images in UI before minting
 */
export function getIPFSGatewayUrl(ipfsUrl: string): string {
  if (ipfsUrl.startsWith('ipfs://')) {
    const hash = ipfsUrl.replace('ipfs://', '');
    return `https://ipfs.io/ipfs/${hash}`;
  }
  return ipfsUrl;
}
