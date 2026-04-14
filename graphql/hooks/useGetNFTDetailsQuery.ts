import { useGraphQLSDK } from 'graphql/client/useGraphQLSDK';
import { NftDetail } from 'graphql/generated/types';
import { Doppler, getEnv } from 'utils/env';
import { isNullOrEmpty } from 'utils/format';

import useSWRImmutable, { mutate } from 'swr';
import { useNetwork } from 'wagmi';

export interface NFTDetailsData {
  data: NftDetail;
  error: Error | undefined;
  loading: boolean;
  mutate: () => void;
}

/**
 * A custom React hook that fetches NFT details data from the GraphQL API using the given contract address and token ID.
 * @param {string} contractAddress - The contract address of the NFT.
 * @param {string} tokenId - The token ID of the NFT.
 * @returns {NFTDetailsData} An object containing the NFT details data, error, loading state, and a mutate function to refetch the data.
 */
export function useGetNFTDetailsQuery(contractAddress: string, tokenId: string): NFTDetailsData {
  const sdk = useGraphQLSDK();
  const { chain } = useNetwork();
  const chainId = chain?.id ? String(chain?.id) : getEnv(Doppler.NEXT_PUBLIC_CHAIN_ID);
  const shouldFetch = !(isNullOrEmpty(contractAddress) || isNullOrEmpty(tokenId));

  const args = {
    chainId,
    contractAddress,
    tokenId
  };
  const keyString = () => shouldFetch ? { query: 'GetNFTDetailsQuery ', args } : null;

  const { data, isLoading, error } = useSWRImmutable(keyString, async (
    {
      args: {
        contractAddress,
        tokenId
      }
    }) => await sdk.GetNFTDetails({
    input: {
      contractAddress,
      tokenId
    }
  }), {
    dedupingInterval: 30000,
    errorRetryCount: 1,
    errorRetryInterval: 30000
  }
  );

  return {
    data: data?.getNFTDetails ?? null,
    error,
    loading: isLoading,
    mutate: () => {
      mutate(keyString);
    },
  };
}
