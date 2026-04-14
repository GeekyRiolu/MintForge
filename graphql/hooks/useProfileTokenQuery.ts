import { useAllContracts } from 'hooks/contracts/useAllContracts';
import { isNullOrEmpty } from 'utils/format';

import { BigNumber } from '@ethersproject/bignumber';
import { useState } from 'react';
import useSWR, { mutate,SWRConfiguration } from 'swr';

export interface ProfileTokenData {
  profileTokenId: BigNumber | null;
  loading: boolean;
  mutate: () => void;
}

export function useProfileTokenQuery(
  url: string,
  options?: SWRConfiguration
): ProfileTokenData {
  const [loading, setLoading] = useState(false);
  const { nftProfile } = useAllContracts();

  const keyString = 'ProfileTokenQuery ' + url + nftProfile.address;

  const { data } = useSWR(keyString, async () => {
    if (isNullOrEmpty(url)) {
      return null;
    }
    try {
      setLoading(true);
      const result = await nftProfile.getTokenId(url);
      setLoading(false);
      return result;
    } catch (error) {
      setLoading(false);
      console.log('Failed to fetch profile token ID. It is likely unminted.');
      return null;
    }
  }, options);

  return {
    profileTokenId: data,
    loading: loading,
    mutate: () => {
      mutate(keyString);
    },
  };
}
