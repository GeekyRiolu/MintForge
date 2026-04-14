import { AlchemyOwnedNFT } from 'types';
import { getNftsByContractAndOwner } from 'utils/alchemyNFT';
import { Doppler,getEnv } from 'utils/env';
import { isNullOrEmpty } from 'utils/format';
import { getAddress } from 'utils/httpHooks';

import useSWR, { mutate } from 'swr';
import { useNetwork } from 'wagmi';

export interface ProfileTokenResults {
  profileTokens: AlchemyOwnedNFT[];
  error: any;
  mutate: () => void;
}

export function useNftProfileTokens(owner: string): ProfileTokenResults {
  const { chain } = useNetwork();

  const keyString = 'NftProfileTokens ' + owner + chain?.id;

  const { data, error } = useSWR(keyString, async () => {
    if (isNullOrEmpty(owner) || owner == null) {
      return null;
    }

    const result = await getNftsByContractAndOwner(
      owner,
      getAddress('nftProfile', chain?.id ?? getEnv(Doppler.NEXT_PUBLIC_CHAIN_ID)),
      chain?.id ?? getEnv(Doppler.NEXT_PUBLIC_CHAIN_ID),
      null // pageKey
    );
    const ownedTokens = result?.ownedNfts;
    let pageKey = result?.pageKey;
    while (pageKey != null) {
      // There are further pages to load.
      const nextPage = await getNftsByContractAndOwner(
        owner,
        getAddress('nftProfile', chain?.id ?? getEnv(Doppler.NEXT_PUBLIC_CHAIN_ID)),
        chain?.id ?? getEnv(Doppler.NEXT_PUBLIC_CHAIN_ID),
        pageKey
      );
      ownedTokens.push(...nextPage?.ownedNfts as AlchemyOwnedNFT[]);
      pageKey = nextPage?.pageKey;
    }
    return ownedTokens;
  });

  return {
    profileTokens: data ?? [],
    error: error,
    mutate: () => {
      mutate(keyString);
    },
  };
}
