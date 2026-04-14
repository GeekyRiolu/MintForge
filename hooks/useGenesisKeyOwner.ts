import { useAllContracts } from './contracts/useAllContracts';

import { BigNumber } from 'ethers';
import useSWR, { mutate } from 'swr';

export interface GenesisKeyOwnerResult {
  owner: string | null;
  key: string;
  mutate: () => void;
}

/**
 * Fetches the owner of the given Genesis Key.
 */
export function useGenesisKeyOwner(tokenId: BigNumber) {
  const { genesisKey } = useAllContracts();
  
  const keyString = 'GenesisKeyOwner' + tokenId;

  const { data } = useSWR(keyString, async () => {
    const owner = await genesisKey.ownerOf(tokenId);
    return owner;
  }, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    refreshInterval: 0,
  });

  return {
    owner: data,
    key: keyString,
    mutate: () => {
      mutate(keyString);
    }
  };
}