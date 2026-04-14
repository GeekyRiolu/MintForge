import { useGraphQLSDK } from 'graphql/client/useGraphQLSDK';

import { useState } from 'react';
import useSWR, { mutate } from 'swr';

export function useIsProfileCustomized(profileUrl: string, chainId?: string) {
  const sdk = useGraphQLSDK();
  const [loading, setLoading] = useState(false);

  const keyString = `isProfileCustomized${profileUrl}${chainId}`;

  const { data } = useSWR(keyString, async () => {
    setLoading(true);
    try {
      const result = await sdk.isProfileCustomized({ url: profileUrl, chainId: chainId ?? null });
      setLoading(false);
      return result;
    } catch (error) {
      setLoading(false);
      console.log('Failed to get profile customization status');
    }
  }
  );
  return {
    data: data,
    loading: loading,
    mutate: () => {
      mutate(keyString);
    }
  };
}