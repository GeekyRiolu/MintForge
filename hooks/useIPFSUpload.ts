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
 * Uses the server-side IPFS API route so provider secrets stay off the client
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
        const response = await fetch('/api/ipfs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'image',
            imageUrl,
            filename: filename || `ai-nft-${Date.now()}.png`,
          }),
        });

        const result = (await response.json()) as {
          success: boolean;
          hash?: string;
          ipfsUrl?: string;
          error?: string;
        };

        if (!response.ok || !result.success || !result.hash || !result.ipfsUrl) {
          throw new Error(result.error || 'Failed to upload to IPFS');
        }

        setState(prev => ({
          ...prev,
          isLoading: false,
          isSuccess: true,
          ipfsHash: result.hash,
          ipfsUrl: result.ipfsUrl,
        }));

        return {
          success: true,
          ipfsUrl: result.ipfsUrl,
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
