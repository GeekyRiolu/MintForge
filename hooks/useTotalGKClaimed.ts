
import { isNullOrEmpty } from 'utils/format';

import { useAllContracts } from './contracts/useAllContracts';

import useSWR, { mutate } from 'swr';

export interface GKClaimedResult {
  totalClaimed: number
  mutate: () => void
}
export function useTotalGKClaimed(address: string): GKClaimedResult {
  const { genesisKey, genesisKeyTeamClaim } = useAllContracts();

  const keyString = 'useTotalGKClaimed ' + address;

  const { data } = useSWR(keyString, async () => {
    if (isNullOrEmpty(address)) {
      return null;
    }

    const events = await genesisKey.queryFilter(genesisKey.filters.ClaimedGenesisKey(address))
      .catch(() => Promise.resolve([]));
    const insiderEvents = await genesisKeyTeamClaim
      .queryFilter(genesisKeyTeamClaim.filters.ClaimedGenesisKey(address))
      .catch(() => Promise.resolve([]));

    return events?.length + insiderEvents?.length;
  });
  return {
    totalClaimed: data ?? 0,
    mutate: () => {
      mutate(keyString);
    },
  };
}
