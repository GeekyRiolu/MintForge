import { useGraphQLSDK } from 'graphql/client/useGraphQLSDK';
import { Maybe } from 'graphql/generated/types';
import { isNullOrEmpty } from 'utils/format';

import delay from 'delay';
import { useCallback, useState } from 'react';

export interface RefreshNftResult {
  loading: boolean;
  success: boolean;
  error: string | null;
  refreshNft: (nftId: string) => Promise<boolean>
}

export function useRefreshNftMutation(): RefreshNftResult {
  const sdk = useGraphQLSDK();

  const [error, setError] = useState<Maybe<string>>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const refreshNft = useCallback(
    async (nftId: string) => {
      if(isNullOrEmpty(nftId)){
        return null;
      }
      setLoading(true);
      try {
        await delay(1000); // give more UI time for user
        await sdk.RefreshNft({ id: nftId });

        setSuccess(true);
        await delay(1000); // give more UI time for user

        setLoading(false);
        setSuccess(false);
        return true;
      } catch (err) {
        console.log('error: ', err);
        setLoading(false);
        setSuccess(false);
        setError('Mutation failed. Please try again.');
        return false;
      }
    },
    [sdk]
  );

  return {
    loading: loading,
    success: success,
    error: error,
    refreshNft: refreshNft,
  };
}
