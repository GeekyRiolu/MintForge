import { GraphQLContext } from 'graphql/client/GraphQLProvider';
import { useGraphQLSDK } from 'graphql/client/useGraphQLSDK';
import { Nft, PageInfo } from 'graphql/generated/types';
import { Doppler, getEnv } from 'utils/env';
import { profileSaveCounter } from 'utils/helpers';

import { useAtom } from 'jotai';
import { useContext } from 'react';
import useSWR, { mutate } from 'swr';
import { PartialDeep } from 'type-fest';
import { useAccount, useNetwork } from 'wagmi';

export interface NftsData {
  data: PartialDeep<Nft>[],
  pageInfo: PageInfo,
  totalItems: number,
  loading: boolean,
  mutate: () => void,
}

export interface NFTsQueryInput {
  first: number;
  profileId: string;
  beforeCursor?: string;
  query?: string;
  invalidateCache?: boolean;
}

export function useMyNFTsQuery({
  first,
  profileId,
  beforeCursor,
  query,
  invalidateCache
}: NFTsQueryInput): NftsData {
  const sdk = useGraphQLSDK();
  const { signed } = useContext(GraphQLContext);
  const { address: currentAddress } = useAccount();
  const { chain } = useNetwork();
  const chainId = String(chain?.id || getEnv(Doppler.NEXT_PUBLIC_CHAIN_ID));
  const [savedCount] = useAtom(profileSaveCounter);
  // const shouldFetch = !([Boolean(first), isNullOrEmpty(profileId)].includes(true));

  const args = {
    currentAddress,
    chainId,
    signed,
    first,
    profileId,
    beforeCursor,
    savedCount,
    query,
    invalidateCache
  };
  const keyString = { query: 'MyNFTsQuery ', args };

  const { data, isLoading } = useSWR(keyString, async (
    {
      args: {
        first,
        beforeCursor,
        profileId,
        invalidateCache,
        query
      }
    }) =>
    await sdk.MyNFTs({
      input: {
        pageInput: { first, beforeCursor },
        profileId,
        invalidateCache,
        ...(query && { query })
      }
    })
  );

  return {
    data: data?.myNFTs?.items ?? [],
    pageInfo: data?.myNFTs.pageInfo,
    totalItems: data?.myNFTs?.totalItems ?? 0,
    loading: isLoading,
    mutate: () => {
      mutate(keyString);
    },
  };
}
