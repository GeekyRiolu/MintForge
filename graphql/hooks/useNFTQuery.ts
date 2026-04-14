import { useGraphQLSDK } from 'graphql/client/useGraphQLSDK';
import { Nft } from 'graphql/generated/types';
import { useUser } from 'hooks/state/useUser';
import { useDefaultChainId } from 'hooks/useDefaultChainId';
import { Doppler, getEnv } from 'utils/env';
import { isNullOrEmpty } from 'utils/format';
import { getChainIdString } from 'utils/helpers';

import { BigNumber, BigNumberish } from 'ethers';
import { useCallback, useMemo } from 'react';
import useSWR, { mutate } from 'swr';
import { PartialDeep } from 'type-fest';

export type NftResponse = PartialDeep<Nft>

export interface NftData {
  data: NftResponse;
  loading: boolean;
  mutate: () => void;
}

// listingsOwner is optional, but if it is provided, it filters NFT listings by that address
export function useNftQuery(contract: string, id: BigNumberish, listingsOwner?: string): NftData {
  const sdk = useGraphQLSDK();
  const { currentProfileId } = useUser();
  const keyString = useMemo(() => (['NftQuery', contract, id, listingsOwner, currentProfileId]), [contract, id, listingsOwner, currentProfileId]);

  const defaultChainId = useDefaultChainId();

  const mutateThis = useCallback(() => {
    mutate(keyString);
  }, [keyString]);

  const stopFetch = [isNullOrEmpty(contract), id == null, getEnv(Doppler.NEXT_PUBLIC_CHAIN_ID) !== defaultChainId].includes(true);
  const { data } = useSWR(!stopFetch ? keyString : null, async () => {
    // All NFT IDs are stored in hex string format.
    const defaultInput = {
      chainId: getChainIdString(defaultChainId) ?? getEnv(Doppler.NEXT_PUBLIC_CHAIN_ID),
      contract,
      id: BigNumber.from(id).toHexString(),
      likedById: currentProfileId
    };
      
    const input = listingsOwner
      ? {
        ...defaultInput,
        listingsOwner
      }
      : defaultInput;

    const result = await sdk.Nft(input);
    return result?.nft;
  });
  return {
    data: data,
    loading: data == null,
    mutate: mutateThis,
  };
}
