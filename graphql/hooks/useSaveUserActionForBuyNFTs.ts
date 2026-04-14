import { useGraphQLSDK } from 'graphql/client/useGraphQLSDK';
import { Maybe } from 'graphql/generated/types';

import { useCallback, useState } from 'react';

export interface SaveUserActionForBuyNFTsResult {
  saving: boolean;
  error: string | null;
  saveUserActionForBuyNFTs: (profileUrl: string) => Promise<boolean>;
}

export function useSaveUserActionForBuyNFTsMutation(): SaveUserActionForBuyNFTsResult {
  const sdk = useGraphQLSDK();

  const [error, setError] = useState<Maybe<string>>(null);
  const [loading, setLoading] = useState(false);

  const saveUserActionForBuyNFTs = useCallback(
    async (profileUrl: string) => {
      if (profileUrl == null) {
        return false;
      }
      setLoading(true);
      try {
        await sdk.SaveUserActionForBuyNFTs({
          profileUrl,
        }).then((res) => console.log('ressy=>', res));

        setLoading(false);

        return true;
      } catch (err) {
        setLoading(false);
        setError('Save user action for buy nfts failed. Please try again.');
        return false;
      }
    },
    [sdk]
  );

  return {
    saving: loading,
    error: error,
    saveUserActionForBuyNFTs: saveUserActionForBuyNFTs,
  };
}
