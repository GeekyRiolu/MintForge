import { useGraphQLSDK } from 'graphql/client/useGraphQLSDK';
import { ContractSalesStatistics } from 'graphql/generated/types';
import { Doppler, getEnv } from 'utils/env';
import { isNullOrEmpty } from 'utils/format';

import useSWRImmutable, { mutate } from 'swr';
import { useNetwork } from 'wagmi';

export interface ContractSalesStatisticsData {
  data: ContractSalesStatistics;
  loading: boolean;
  mutate: () => void;
}

export function useGetContractSalesStatisticsQuery(contractAddress: string): ContractSalesStatisticsData {
  const sdk = useGraphQLSDK();
  const { chain } = useNetwork();
  const shouldFetch = !isNullOrEmpty(contractAddress);
  const keyString = () => shouldFetch
    ? {
      query: 'GetContractSalesStatisticsQuery',
      args: {
        chainId: String(chain?.id || getEnv(Doppler.NEXT_PUBLIC_CHAIN_ID)),
        contractAddress
      }
    }
    : null;

  const { data } = useSWRImmutable(keyString, async ({ args: { contractAddress } }) => await sdk.GetContractSalesStatistics({
    input: {
      contractAddress
    }
  }), {
    dedupingInterval: 30000,
    errorRetryCount: 1,
    errorRetryInterval: 30000
  });

  return {
    data: data?.getContractSalesStatistics ?? null,
    loading: data == null,
    mutate: () => {
      mutate(keyString);
    },
  };
}
