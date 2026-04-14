import { useGraphQLSDK } from 'graphql/client/useGraphQLSDK';
import { GetRemovedAssociationsForReceiverQuery } from 'graphql/generated/types';

import useSWR, { mutate } from 'swr';

export interface GetRemovedAssociationsForReceiverQueryData {
  data: GetRemovedAssociationsForReceiverQuery
  loading: boolean;
  mutate: () => void;
}

export function useGetRemovedAssociationsForReceiver(): GetRemovedAssociationsForReceiverQueryData {
  const sdk = useGraphQLSDK();
  
  const keyString =
      'GetRemovedAssociationsForReceiverQuery';
  
  const { data } = useSWR(keyString, async () => {
    try {
      const result = await sdk.GetRemovedAssociationsForReceiver();
      return result;
    } catch (error) {
      console.log('Failed to load Removed Associations For Receiver.');
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