import { useGraphQLSDK } from 'graphql/client/useGraphQLSDK';
import { AssociatedAddressesForContractQuery, QueryAssociatedAddressesForContractArgs } from 'graphql/generated/types';

import useSWR, { mutate } from 'swr';

export interface AssociatedAddressesForContractQueryData {
  data: AssociatedAddressesForContractQuery;
  loading: boolean;
  mutate: () => void
}

export function useAssociatedAddressesForContractQuery(input: QueryAssociatedAddressesForContractArgs): AssociatedAddressesForContractQueryData {
  const sdk = useGraphQLSDK();
  
  const keyString =
      'AssociatedAddressesForContractQuery' +
      input.contract;
  
  const { data } = useSWR(keyString, async () => {
    try {
      const result = await sdk.AssociatedAddressesForContract({ contract: input.contract });
      return result;
    } catch (error) {
      console.log('Failed to get associated addresses for contract');
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