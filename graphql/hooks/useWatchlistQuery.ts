import { GraphQLContext } from 'graphql/client/GraphQLProvider';
import { useGraphQLSDK } from 'graphql/client/useGraphQLSDK';
import { ProfilesInput, WatchlistQuery } from 'graphql/generated/types';
import { isNullOrEmpty } from 'utils/format';

import { useContext, useState } from 'react';
import useSWR, { mutate } from 'swr';
import { useAccount } from 'wagmi';

export interface WatchlistQueryData {
  watchlist: WatchlistQuery;
  error: any;
  loading: boolean;
  mutate: () => void;
}

export function useWatchlistQuery(input: ProfilesInput): WatchlistQueryData {
  const sdk = useGraphQLSDK();

  const { address: currentAddress } = useAccount();
  const { signed } = useContext(GraphQLContext);

  const [loading, setLoading] = useState(false);

  const keyString = 'WatchlistQuery' + JSON.stringify(input) + signed + currentAddress;

  const { data, error } = useSWR(keyString, async () => {
    if (isNullOrEmpty(currentAddress) || !signed) {
      return;
    }
    setLoading(true);
    const result = await sdk.Watchlist({ input: input });
    setLoading(false);
    return result;
  });
  return {
    watchlist: data,
    loading: loading,
    error: error,
    mutate: () => {
      mutate(keyString);
    },
  };
}
