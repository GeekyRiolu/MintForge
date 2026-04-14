import { TeamGKEvent } from 'constants/typechain/Genesis_key_team_claim';
import { Maybe } from 'graphql/generated/types';

import { useAllContracts } from './contracts/useAllContracts';

import { useState } from 'react';
import useSWR, { mutate } from 'swr';

export interface InsiderGenesisKeyIDsResult {
  data: Maybe<number[]>;
  loading: boolean;
  mutate: () => void;
}

export function useInsiderGenesisKeyIDs(): InsiderGenesisKeyIDsResult {
  const [loading, setLoading] = useState(false);
  const { genesisKeyTeamClaim } = useAllContracts();

  const keyString = 'useInsiderGenesisKeyIDs';

  const { data } = useSWR(keyString, async () => {
    setLoading(true);

    const reservedIDs: TeamGKEvent[] = await genesisKeyTeamClaim
      .queryFilter(genesisKeyTeamClaim.filters.TeamGK())
      .catch(() => Promise.resolve([]));

    setLoading(false);
    return reservedIDs?.map(
      (event: TeamGKEvent) => event.args.tokenId.toNumber()
    ) ?? [];
  }, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    refreshInterval: 0,
  });

  return {
    data: data ?? null,
    loading,
    mutate: () => {
      mutate(keyString);
    }
  };
}