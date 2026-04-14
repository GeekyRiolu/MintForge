import { useAllContracts } from 'hooks/contracts/useAllContracts';

import { BigNumber } from 'ethers';
import { useState } from 'react';
import useSWR, { mutate,SWRConfiguration } from 'swr';

export interface ProfileTokenOwner {
  profileOwner: string | null;
  loading: boolean;
  mutate: () => void;
}

export function useProfileTokenOwner(
  tokenId: BigNumber,
  options?: SWRConfiguration
): ProfileTokenOwner {
  const [loading, setLoading] = useState(false);
  const { nftProfile } = useAllContracts();

  const keyString = 'ProfileTokenOwner ' + tokenId?.toString();

  const { data } = useSWR(keyString, async () => {
    if (tokenId == null) {
      return null;
    }
    try {
      setLoading(true);
      const result = await nftProfile.ownerOf(tokenId);
      setLoading(false);
      return result;
    } catch (error) {
      setLoading(false);
      console.log('Failed to fetch profile token ID. It is likely unminted.');
      return null;
    }
  }, options);

  return {
    profileOwner: data,
    loading: loading,
    mutate: () => {
      mutate(keyString);
    },
  };
}
