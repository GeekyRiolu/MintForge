import { Maybe } from 'graphql/generated/types';
import { getNftMetadata } from 'utils/alchemyNFT';
import { Doppler, getEnv } from 'utils/env';
import { getAddress } from 'utils/httpHooks';

import { BigNumberish } from 'ethers';
import useSWR from 'swr';
import { useNetwork } from 'wagmi';

export function useGenesisKeyMetadata(tokenId: BigNumberish | null): Maybe<any> {
  const { chain } = useNetwork();

  const keyString = 'GenesisKeyMetadata' + tokenId + chain?.id;

  const { data } = useSWR(
    keyString,
    async () => {
      if (tokenId == null) {
        return null;
      }
      const result = await getNftMetadata(
        getAddress('genesisKey', chain?.id ?? getEnv(Doppler.NEXT_PUBLIC_CHAIN_ID)),
        tokenId,
        chain?.id ?? getEnv(Doppler.NEXT_PUBLIC_CHAIN_ID)
      );
      
      return result;
    }
  );

  return data ?? null;
}