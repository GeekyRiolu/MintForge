import { useGraphQLSDK } from 'graphql/client/useGraphQLSDK';
import { TopBidsInput, TopBidsQuery } from 'graphql/generated/types';

import { useState } from 'react';
import useSWR, { mutate } from 'swr';

export interface TopBidsQueryData {
  data: TopBidsQuery;
  loading: boolean;
  mutate: () => void;
}

/**
 * Queries all bids, and returns them in descending order by price.
 */
export function useTopBidsQuery(input: TopBidsInput): TopBidsQueryData {
  const sdk = useGraphQLSDK();
  const [loading, setLoading] = useState(false);

  const keyString =
    'TopBidsQuery ' +
    input?.profileId +
    input?.pageInput?.afterCursor +
    input?.pageInput?.first +
    input?.pageInput?.beforeCursor +
    input?.pageInput?.last;

  const { data } = useSWR(keyString, async () => {
    setLoading(true);
    try {
      const result = await sdk.TopBids({ input: input });
      setLoading(false);
      return result;
    } catch (error) {
      setLoading(false);
      console.log('Failed to load top Bids.');
    }
  });
  return {
    data: data,
    loading: loading,
    mutate: () => {
      mutate(keyString);
    },
  };
}
