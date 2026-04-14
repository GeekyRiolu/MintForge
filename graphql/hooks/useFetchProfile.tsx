import { useGraphQLSDK } from 'graphql/client/useGraphQLSDK';
import { ProfileQuery } from 'graphql/generated/types';
import { Doppler, getEnv } from 'utils/env';
import { isNullOrEmpty } from 'utils/format';
import { getChainIdString } from 'utils/helpers';

import { useCallback,useState } from 'react';
import { useNetwork } from 'wagmi';

export interface FetchProfile {
  fetchProfile: (url: string) => Promise<ProfileQuery>;
  loading: boolean;
}

export function useFetchProfile(): FetchProfile {
  const sdk = useGraphQLSDK();
  const { chain } = useNetwork();

  const [loading, setLoading] = useState(false);

  const fetchProfile = useCallback(async (url: string) => {
    if (isNullOrEmpty(url)) {
      return null;
    }
    try {
      setLoading(true);
      const result = await sdk.Profile({
        url,
        chainId: getChainIdString(chain?.id) ?? getEnv(Doppler.NEXT_PUBLIC_CHAIN_ID),
        likedById: ''
      });
      setLoading(false);
      return result;
    } catch (error) {
      setLoading(false);
      console.log('Failed to fetch profile. It might be unminted.');
      return null;
    }
  }, [chain?.id, sdk]);

  return {
    fetchProfile,
    loading: loading
  };
}
