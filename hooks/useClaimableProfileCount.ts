
import { Maybe } from 'graphql/generated/types';
import { isNullOrEmpty } from 'utils/format';

import { useAllContracts } from './contracts/useAllContracts';
import { useOwnedGenesisKeyTokens } from './useOwnedGenesisKeyTokens';

import { BigNumber } from 'ethers';
import { useState } from 'react';
import useSWR, { mutate } from 'swr';

export interface ClaimableCount {
  tokenId: number,
  claimable: number;
}

export interface ClaimableProfileCountResult {
  claimable: Maybe<ClaimableCount[]>;
  totalClaimable: Maybe<number>;
  loading: boolean;
  mutate: () => void;
}

/**
 * For a given address, return the number of remaining Profile claims on a per-GK basis
 */
export function useClaimableProfileCount(address: string): ClaimableProfileCountResult {
  const { profileAuction } = useAllContracts();
  const [loading, setLoading] = useState(false);

  const { data: ownedGKTokens } = useOwnedGenesisKeyTokens(address);

  const keyString = 'ClaimableProfileCount ' + address + ownedGKTokens?.length;

  const { data } = useSWR(keyString,
    async () => {
      if (
        isNullOrEmpty(address)
      ) {
        return {
          claimableCounts: [],
          total: 0
        };
      }
      setLoading(true);
      try {
        const isWhitelistPhaseOnly: boolean = await profileAuction.genKeyWhitelistOnly();

        const promises: Promise<ClaimableCount>[] = (ownedGKTokens ?? []).map(async (token) => {
          const claimedByThisTokenId = await profileAuction.genesisKeyClaimNumber(BigNumber.from(token?.id?.tokenId).toNumber());
          return {
            tokenId: BigNumber.from(token?.id?.tokenId).toNumber(),
            claimable: (isWhitelistPhaseOnly ? 4 : 7) - claimedByThisTokenId.toNumber()
          } as ClaimableCount;
        });

        const claimableCounts: ClaimableCount[] = await Promise.all(promises);
        const total = claimableCounts.reduce((
          previousValue: number,
          currentValue: ClaimableCount,
        ) => previousValue + currentValue.claimable, 0);

        setLoading(false);
        return {
          claimableCounts,
          totalClaimable: total
        };
      } catch(error) {
        setLoading(false);
        return {
          claimableCounts: [],
          totalClaimable: 0,
        };
      }
    });

  return {
    claimable: data?.claimableCounts ?? null,
    totalClaimable: data?.totalClaimable ?? null,
    loading,
    mutate: () => {
      mutate(keyString);
    },
  };
}
