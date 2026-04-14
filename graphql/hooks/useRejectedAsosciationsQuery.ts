import { useGraphQLSDK } from 'graphql/client/useGraphQLSDK';
import { GetRejectedAssociationsQuery } from 'graphql/generated/types';

import { useState } from 'react';
import useSWR, { mutate } from 'swr';

export interface GetRejectedAssociationsQueryData {
  data: GetRejectedAssociationsQuery;
  loading: boolean;
  mutate: () => void
}

export function useRejectedAssociationsQuery(profileUrl: string) {
  const sdk = useGraphQLSDK();
  const [loading, setLoading] = useState(false);

  const keyString = `GetApprovedAssociationsQuery${profileUrl}`;

  const { data } = useSWR(keyString, async () => {
    setLoading(true);
    try {
      const result = await sdk.GetRejectedAssociations({ profileUrl: profileUrl });
      setLoading(false);
      return result;
    } catch (error) {
      setLoading(false);
      console.log('Failed to get rejected associations');
    }
  });
  return {
    data: data,
    loading: loading,
    mutate: () => {
      mutate(keyString);
    }
  };
}