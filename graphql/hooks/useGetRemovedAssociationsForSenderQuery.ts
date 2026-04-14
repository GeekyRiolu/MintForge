import { useGraphQLSDK } from 'graphql/client/useGraphQLSDK';
import { GetRemovedAssociationsForSenderQuery, QueryGetRemovedAssociationsForSenderArgs } from 'graphql/generated/types';

import useSWR, { mutate } from 'swr';

export interface GetRemovedAssociationsForSenderQueryData {
  data: GetRemovedAssociationsForSenderQuery
  loading: boolean;
  mutate: () => void;
}

export function useGetRemovedAssociationsForSender(input: QueryGetRemovedAssociationsForSenderArgs): GetRemovedAssociationsForSenderQueryData {
  const sdk = useGraphQLSDK();
  const keyString =
      'GetRemovedAssociationsForSenderQuery' + input.profileUrl;
  
  const { data } = useSWR(keyString, async () => {
    try {
      const result = await sdk.GetRemovedAssociationsForSender({
        profileUrl: input.profileUrl
      });
      return result;
    } catch (error) {
      console.log('Failed to removed associations for sender');
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