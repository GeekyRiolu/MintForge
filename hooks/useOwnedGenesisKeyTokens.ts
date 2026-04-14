import { Maybe } from 'graphql/generated/types';
import { AlchemyOwnedNFT } from 'types';
import { getNftsByContractAndOwner } from 'utils/alchemyNFT';
import { isNullOrEmpty } from 'utils/format';
import { getAddress } from 'utils/httpHooks';

import { useDefaultChainId } from './useDefaultChainId';

import { useState } from 'react';
import useSWR, { mutate } from 'swr';

/**
 * Return array of token information for the owned Genesis Key tokens for this address.
 * reminder: Genesis Key Token IDs are 1-indexed, not 0-indexed
 */
export function useOwnedGenesisKeyTokens(address: Maybe<string>): {
  data: Maybe<AlchemyOwnedNFT[]>,
  loading: boolean,
  mutate: () => void
} {
  const [loading, setLoading] = useState(false);
  const defaultChainId = useDefaultChainId();
  const keyString = 'OwnedGenesisKeyTokens' + address + defaultChainId;

  const { data } = useSWR(keyString, async () => {
    if (
      isNullOrEmpty(address) ||
      address == null
    ) {
      return [];
    }
    setLoading(true);

    const result = await getNftsByContractAndOwner(
      address,
      getAddress('genesisKey', defaultChainId),
      defaultChainId,
      null // pageKey
    );
    const ownedTokens = result?.ownedNfts;
    let pageKey = result?.pageKey;
    if (result?.pageKey) {
      // There are further pages to load.
      const nextPage = await getNftsByContractAndOwner(
        address,
        getAddress('genesisKey', defaultChainId),
        defaultChainId,
        pageKey
      );
      ownedTokens.push(...nextPage?.ownedNfts as AlchemyOwnedNFT[]);
      pageKey = nextPage?.pageKey;
    }

    setLoading(false);
    return ownedTokens;
  });

  return {
    data: data ?? null,
    loading,
    mutate: () => {
      mutate(keyString);
    }
  };
}
