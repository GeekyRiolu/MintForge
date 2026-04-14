import { GraphQLContext } from 'graphql/client/GraphQLProvider';
import { useGraphQLSDK } from 'graphql/client/useGraphQLSDK';
import { Bid, NftType } from 'graphql/generated/types';
import { isNullOrEmpty } from 'utils/format';

import { useContext } from 'react';
import useSWR, { mutate } from 'swr';
import { PartialDeep } from 'type-fest';
import { useAccount } from 'wagmi';

export interface MyGKProfileBids {
  bids: PartialDeep<Bid>[];
  error: any;
  mutate: () => void;
}

export function useMyGKProfileBids(): MyGKProfileBids {
  const sdk = useGraphQLSDK();

  const { address: currentAddress } = useAccount();
  const { signed } = useContext(GraphQLContext);

  const keyString = 'MyGenesisKeyProfileBids ' + currentAddress + signed;

  const { data, error } = useSWR(keyString, async () => {
    if (isNullOrEmpty(currentAddress) || !signed) {
      return null;
    }
    const result = await sdk.MyBids({
      input: {
        pageInput: {
          first: 10
        },
        nftType: NftType.GenesisKeyProfile
      }
    });

    return result?.myBids?.items;
  });
  return {
    bids: data ?? [],
    error: error,
    mutate: () => {
      mutate(keyString);
    },
  };
}
