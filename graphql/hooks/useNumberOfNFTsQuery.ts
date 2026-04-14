import { useGraphQLSDK } from 'graphql/client/useGraphQLSDK';
import { NumberOfNfTsQuery, NumberOfNfTsQueryVariables } from 'graphql/generated/types';

import useSWR, { mutate } from 'swr';

export interface NumberOfNFTsQueryData {
  data: NumberOfNfTsQuery;
  loading: boolean;
  mutate: () => void;
}

export function useNumberOfNFTsQuery(input: NumberOfNfTsQueryVariables): NumberOfNFTsQueryData {
  const sdk = useGraphQLSDK();
  
  const keyString =
      'NumberOfNFTsQuery' +
      input?.contract +
      input?.chainId;
      
  const { data } = useSWR(keyString, async () => {
    try {
      const result = await sdk.NumberOfNFTs(input);
      return result;
    } catch (error) {
      console.log('Failed to load number of nfts.');
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