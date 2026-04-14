import { Maybe } from 'graphql/generated/types';
import { useInsiderReservedProfiles } from 'hooks/useInsiderReservedProfiles';

import { useAllContracts } from './contracts/useAllContracts';
import { useGenesisKeyInsiderMerkleCheck } from './merkle/useGenesisKeyInsiderMerkleCheck';

import { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { useAccount } from 'wagmi';

export interface MintedReservedProfileCountResults {
  mintedReservedProfileCount: Maybe<number>;
  loading: boolean;
  error: any;
  mutate: () => void;
}

export function useMintedReservedProfileCount(): MintedReservedProfileCountResults {
  const { address: currentAddress } = useAccount();
  const { reservedProfiles } = useInsiderReservedProfiles();
  const { nftProfile } = useAllContracts();

  const [loading, setLoading] = useState(false);

  const keyString = 'mintedReservedProfileCounts ' + reservedProfiles?.length;
  const insiderMerkleData = useGenesisKeyInsiderMerkleCheck(currentAddress ?? null);

  const { data, error } = useSWR(keyString, async () => {
    if (insiderMerkleData == null) {
      return 0;
    }

    if ((reservedProfiles?.length ?? 0) === 0) {
      return 2;
    }

    setLoading(true);

    const statusPromises = reservedProfiles?.map((reservedURI) => {
      return nftProfile
        .profileOwner(reservedURI)
        .then(() => Promise.resolve(true))
        .catch(() => Promise.resolve(false));
    }) ?? [];

    const statuses = await Promise.all(statusPromises);
    const result = statuses.filter(Boolean).length;

    setLoading(false);
    return result;
  }, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    refreshInterval: 0,
  });
  
  return {
    mintedReservedProfileCount: data ?? null,
    loading,
    error: error,
    mutate: () => {
      mutate(keyString);
    },
  };
}
