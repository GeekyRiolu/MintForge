import { GraphQLContext } from 'graphql/client/GraphQLProvider';
import { useGraphQLSDK } from 'graphql/client/useGraphQLSDK';
import { MyNfTsQuery } from 'graphql/generated/types';
import { Doppler, getEnv } from 'utils/env';

import { useContext } from 'react';
import useSWR, { mutate } from 'swr';
import { Address, useNetwork } from 'wagmi';

export interface AssetsData {
  data: MyNfTsQuery;
  totalItems: number;
  loading: boolean;
  mutate: () => void;
}

export function useMyAssetsQuery(first: number, afterCursor: string, currentAddress: Address): AssetsData {
  const sdk = useGraphQLSDK();
  const { signed } = useContext(GraphQLContext);
  const { chain } = useNetwork();
  const keyString = 'MyAssetsQuery' +
    currentAddress +
    chain?.id +
    signed +
    first +
    afterCursor;

  const { data } = useSWR(keyString, async () => {
    if (!currentAddress || !signed) {
      return { myNFTs: { items: [], totalItems: 0, loading: false } };
    }
    const result: MyNfTsQuery = await sdk.MyNFTs({
      input: {
        pageInput: { first: first, afterCursor: afterCursor },
        ownedByWallet: true
      }
    });
    return result;
  });
  
  return {
    data: data,
    totalItems: data?.myNFTs?.totalItems ?? 0,
    loading: data == null,
    mutate: () => {
      mutate(keyString);
    },
  };
}
