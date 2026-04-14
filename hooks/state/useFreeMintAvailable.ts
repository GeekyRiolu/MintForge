import { Maybe } from 'graphql/generated/types';
import { useAllContracts } from 'hooks/contracts/useAllContracts';
import { isNullOrEmpty } from 'utils/format';

import { useState } from 'react';
import useSWR, { mutate } from 'swr';

export interface FreeMintAvailableResult {
  freeMintAvailable: Maybe<boolean>;
  loading: boolean;
  mutate: () => void;
}

export function useFreeMintAvailable(address: string): FreeMintAvailableResult {
  const { maxProfiles } = useAllContracts();
  const [loading, setLoading] = useState(false);

  const keyString = 'freeMintAvailable ' + address;

  const { data } = useSWR(keyString,
    async () => {
      if(
        isNullOrEmpty(address)
      ) {
        return false;
      }
      setLoading(true);
      try {
        const freeMintAvailable = await maxProfiles.publicMinted(address);
        setLoading(false);
        return freeMintAvailable.toNumber() === 0;
      } catch (e) {
        setLoading(false);
        console.log('error getting free mint status');
        return false;
      }
    });

  return {
    freeMintAvailable: data ?? null,
    loading,
    mutate: () => {
      mutate(keyString);
    }
  };
}
