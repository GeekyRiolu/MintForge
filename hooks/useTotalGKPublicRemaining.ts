import { Maybe } from 'graphql/generated/types';

import { useAllContracts } from './contracts/useAllContracts';

import { BigNumber } from 'ethers';
import { useState } from 'react';
import useSWR, { mutate } from 'swr';

export interface GKPublicRemainingResult {
  totalRemaining: Maybe<BigNumber>
  loading: boolean
  mutate: () => void
}
export function useTotalGKPublicRemaining(): GKPublicRemainingResult {
  const { genesisKey } = useAllContracts();
  const [loading, setLoading] = useState(false);
  const keyString = 'useTotalGKPublicRemaining';

  const { data } = useSWR(keyString, async () => {
    setLoading(true);
    const [
      remainingTeamAdvisorGrant, publicBought
    ] = await Promise.all([
      genesisKey.remainingTeamAdvisorGrant(),
      genesisKey.latestClaimTokenId()
    ]);
    setLoading(false);
    const remainder = BigNumber.from(5000).sub(publicBought).sub(remainingTeamAdvisorGrant);
    return remainder.gte(0) ? remainder : BigNumber.from(0);
  });
  return {
    totalRemaining: data ?? null,
    loading,
    mutate: () => {
      mutate(keyString);
    },
  };
}
