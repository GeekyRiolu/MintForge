import { useGraphQLSDK } from 'graphql/client/useGraphQLSDK';
import { GetApprovedAssociationsQuery } from 'graphql/generated/types';

import { useState } from 'react';
import useSWR, { mutate } from 'swr';

export interface ApprovedAssociationsQueryData {
  data: GetApprovedAssociationsQuery;
  loading: boolean;
  mutate: () => void
}

export function useApprovedAssociationsQuery(profileUrl: string) {
  const sdk = useGraphQLSDK();
  const [loading, setLoading] = useState(false);

  const keyString = `GetApprovedAssociationsQuery${profileUrl}`;

  const { data } = useSWR(keyString, async () => {
    setLoading(true);
    try {
      const result = await sdk.getApprovedAssociations({ profileUrl: profileUrl });
      setLoading(false);
      return result;
    } catch (error) {
      setLoading(false);
      console.log('Failed to get approved associations');
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