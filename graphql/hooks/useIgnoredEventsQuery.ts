import { useGraphQLSDK } from 'graphql/client/useGraphQLSDK';
import { IgnoredEventsInput,IgnoredEventsQuery } from 'graphql/generated/types';

import useSWR, { mutate } from 'swr';

export interface IgnoredEventsQueryData {
  data: IgnoredEventsQuery;
  loading: boolean;
  mutate: () => void;
}

export function useIgnoredEventsQuery(input: IgnoredEventsInput): IgnoredEventsQueryData {
  const sdk = useGraphQLSDK();
  
  const keyString =
      'IgnoredEventsQuery' +
      input.profileUrl +
      input.walletAddress +
      input?.chainId;
  
  const { data } = useSWR(keyString, async () => {
    try {
      const result = await sdk.IgnoredEvents({ input: input });
      return result;
    } catch (error) {
      console.log('Failed to load leaderboard.');
    }
  });

  const loading = !data;

  return {
    data: data,
    loading: loading,
    mutate: () => {
      mutate(keyString);
    },
  };
}