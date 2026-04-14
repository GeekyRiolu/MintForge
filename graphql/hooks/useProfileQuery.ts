import { useGraphQLSDK } from 'graphql/client/useGraphQLSDK';
import { ProfileQuery } from 'graphql/generated/types';
import { Doppler, getEnv } from 'utils/env';
import { getChainIdString, isNullOrEmpty } from 'utils/format';

import useSWRImmutable, { mutate,SWRConfiguration } from 'swr';
import { useNetwork } from 'wagmi';

export interface ProfileData {
  profileData: ProfileQuery;
  loading: boolean;
  error: any;
  mutate: () => void;
}

export function useProfileQuery(
  url: string, options?: SWRConfiguration
): ProfileData {
  const sdk = useGraphQLSDK();
  const { chain } = useNetwork();

  const keyString = () => !isNullOrEmpty(url) ? { query: 'ProfileQuery', args: { url, chainId: chain?.id } } : null;

  const { data, error } = useSWRImmutable(keyString, async () => {
    if (isNullOrEmpty(url)) {
      return null;
    }
    try {
      const result = await sdk.Profile({
        url,
        chainId: getChainIdString(chain?.id) ?? getEnv(Doppler.NEXT_PUBLIC_CHAIN_ID),
        likedById: ''
      });
      return result;
    } catch (error) {
      console.log('Failed to fetch profile. It might be unminted.');
      return null;
    }
  }, options);

  return {
    profileData: data,
    loading: data == null,
    error: error,
    mutate: () => {
      mutate(keyString);
    },
  };
}
