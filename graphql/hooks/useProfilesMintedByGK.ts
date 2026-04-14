import { useGraphQLSDK } from 'graphql/client/useGraphQLSDK';
import { ProfilesMintedByGkQuery } from 'graphql/generated/types';
import { isNullOrEmpty } from 'utils/format';

import { useState } from 'react';
import useSWR, { mutate } from 'swr';

export interface ProfilesMintedByGKQueryData {
  data: ProfilesMintedByGkQuery;
  loading: boolean;
  mutate: () => void;
}

export function useProfilesMintedByGKQuery(tokenId: string, chainId?: string): ProfilesMintedByGKQueryData {
  const sdk = useGraphQLSDK();
  const [loading, setLoading] = useState(false);

  const keyString =
    'profilesMintedByGKQuery' +
    tokenId +
    chainId;

  const { data } = useSWR(keyString, async () => {
    if (isNullOrEmpty(tokenId) || isNullOrEmpty(chainId)) {
      return { profilesMintedByGK: [] };
    }
    setLoading(true);
    try {
      const result = await sdk.ProfilesMintedByGK({ tokenId, chainId });
      setLoading(false);
      return result;
    } catch (error) {
      setLoading(false);
      console.log('Failed to load profiles minted by GK.');
    }
  }, {
    revalidateOnFocus: false
  });
  return {
    data: data,
    loading: loading,
    mutate: () => {
      mutate(keyString);
    },
  };
}
