import { useGraphQLSDK } from 'graphql/client/useGraphQLSDK';
import { Maybe, UploadProfileImagesInput } from 'graphql/generated/types';

import { useCallback, useState } from 'react';

export interface UploadProfileImagesResult {
  updating: boolean;
  error: string | null;
  uploadProfileImages: (input: UploadProfileImagesInput) => Promise<boolean>;
}

/**
 * Uploads profile / cover images for processing and saving to this Profile entity.
 */
export function useUpdateProfileImagesMutation(): UploadProfileImagesResult {
  const sdk = useGraphQLSDK();

  const [error, setError] = useState<Maybe<string>>(null);
  const [loading, setLoading] = useState(false);

  const uploadProfileImages = useCallback(
    async (input: UploadProfileImagesInput) => {
      setLoading(true);
      try {
        await sdk.UploadProfileImages({
          input: input,
        });

        setLoading(false);

        return true;
      } catch (err) {
        setLoading(false);
        setError('Profile update failed. Please try again.');
        return false;
      }
    },
    [sdk]
  );

  return {
    updating: loading,
    error: error,
    uploadProfileImages,
  };
}
