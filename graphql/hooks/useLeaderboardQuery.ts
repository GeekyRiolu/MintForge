import { useGraphQLSDK } from 'graphql/client/useGraphQLSDK';
import { LeaderboardInput, LeaderboardQuery } from 'graphql/generated/types';

import { useState } from 'react';
import useSWR, { mutate } from 'swr';

export interface LeaderboardQueryData {
  data: LeaderboardQuery;
  loading: boolean;
  mutate: () => void;
}

export function useLeaderboardQuery(input: LeaderboardInput): LeaderboardQueryData {
  const sdk = useGraphQLSDK();
  const [loading, setLoading] = useState(false);
  
  const keyString =
      'LeaderboardQuery ' +
      input?.count +
      input?.pageInput?.afterCursor +
      input?.pageInput?.first +
      input?.pageInput?.beforeCursor +
      input?.pageInput?.last;
  
  const { data } = useSWR(keyString, async () => {
    setLoading(true);
    try {
      const result = await sdk.Leaderboard({ input: input });
      setLoading(false);
      return result;
    } catch (error) {
      setLoading(false);
      console.log('Failed to load leaderboard.');
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