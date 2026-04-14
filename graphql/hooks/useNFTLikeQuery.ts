import { useGraphQLSDK } from 'graphql/client/useGraphQLSDK';
import { useNonProfileModal } from 'hooks/state/useNonProfileModal';
import { useUser } from 'hooks/state/useUser';
import { useDefaultChainId } from 'hooks/useDefaultChainId';
import { Doppler, getEnv } from 'utils/env';
import { isNullOrEmpty } from 'utils/format';

import { BigNumber, BigNumberish } from 'ethers';
import { useCallback } from 'react';
import useSWR, { mutate } from 'swr';
import { useAccount } from 'wagmi';
export interface NftLikeData {
  data: { __typename?: 'NFT'; likeCount?: number; isLikedByUser?: boolean; isLikedBy?: boolean }
  loading: boolean;
  mutate: () => void;
}

export function useNftLikeQuery(contract: string, id: BigNumberish): NftLikeData {
  const sdk = useGraphQLSDK();
  const { likeId } = useNonProfileModal();
  const defaultChainId = useDefaultChainId();
  const { currentProfileId } = useUser();
  const { address: currentAccount } = useAccount();

  const keyString = 'NftLikeQuery' + contract + Number(id) + likeId + defaultChainId + currentProfileId + currentAccount;

  const mutateThis = useCallback(() => {
    mutate(keyString);
  }, [keyString]);

  const stopFetch = [getEnv(Doppler.NEXT_PUBLIC_CHAIN_ID) !== defaultChainId, isNullOrEmpty(contract), id === null].includes(true);
  const { data } = useSWR(!stopFetch ? keyString : null, async () => {
    const result = await sdk.NftLikeCount(
      {
        chainId: defaultChainId,
        contract,
        id: BigNumber.from(id).toHexString(),
        likedById: currentProfileId
      }
    );
    return result?.nft;
  });
  return {
    data: data,
    loading: data == null,
    mutate: mutateThis,
  };
}
