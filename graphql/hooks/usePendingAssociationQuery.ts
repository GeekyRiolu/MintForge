import { useGraphQLSDK } from 'graphql/client/useGraphQLSDK';

import useSWR, { mutate } from 'swr';

export function usePendingAssociationQuery() {
  const sdk = useGraphQLSDK();
  
  const keyString =
      'GetMyPendingAssociationsQuery';
  
  const { data } = useSWR(keyString, async () => {
    try {
      const result = await sdk.GetMyPendingAssociations();
      return result;
    } catch (error) {
      return null;
    }
  });
  return {
    data: data,
    loading: data == null,
    mutate: () => {
      mutate(keyString);
    },
  };
}