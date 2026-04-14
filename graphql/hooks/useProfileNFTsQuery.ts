import { useGraphQLSDK } from 'graphql/client/useGraphQLSDK';
import { Maybe, Nft, PageInfo } from 'graphql/generated/types';
import { useUser } from 'hooks/state/useUser';
import { Doppler, getEnv } from 'utils/env';
import { isNullOrEmpty } from 'utils/format';
import { profileSaveCounter } from 'utils/helpers';

import { useAtom } from 'jotai';
import useSWR, { mutate } from 'swr';
import { PartialDeep } from 'type-fest';
export interface ProfileNFTsQueryData {
  nfts: PartialDeep<Nft>[];
  pageInfo: PageInfo;
  totalItems: number,
  loading: boolean;
  mutate: () => void;
}

export interface ProfileNFTsQueryInput {
  profileId: string;
  chainId: Maybe<string>;
  first: number;
  beforeCursor?: string;
  query?: string;
}

export function useProfileNFTsQuery(
  {
    profileId,
    chainId,
    first,
    beforeCursor,
    query
  }: ProfileNFTsQueryInput
): ProfileNFTsQueryData {
  const sdk = useGraphQLSDK();
  const [savedCount,] = useAtom(profileSaveCounter);
  const { currentProfileId } = useUser();
  const inputChainId = chainId || getEnv(Doppler.NEXT_PUBLIC_CHAIN_ID);

  const shouldFetch = !([!first, isNullOrEmpty(profileId)].includes(true));

  const args = {
    chainId: inputChainId,
    first,
    profileId,
    beforeCursor,
    savedCount,
    query,
    currentProfileId
  };
  const keyString = () => shouldFetch ? { query: 'ProfileNFTsQuery ', args } : null;

  const { data, isLoading } = useSWR(keyString, async (
    {
      args: {
        first,
        beforeCursor,
        profileId,
        query
      }
    }) =>
    await sdk.ProfileNFTs({
      input: {
        pageInput: { first, beforeCursor },
        profileId,
        query
      },
      likedById: currentProfileId,
    })
  );

  return {
    nfts: data?.updateNFTsForProfile.items,
    pageInfo: data?.updateNFTsForProfile.pageInfo,
    totalItems: data?.updateNFTsForProfile.totalItems,
    loading: isLoading,
    mutate: () => {
      mutate(keyString());
    },
  };
}
