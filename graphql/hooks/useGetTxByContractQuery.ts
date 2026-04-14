import { useGraphQLSDK } from 'graphql/client/useGraphQLSDK';
import { GetTxByContract, PageInput } from 'graphql/generated/types';
import { Doppler, getEnv } from 'utils/env';
import { isNullOrEmpty } from 'utils/format';

import useSWR, { mutate } from 'swr';
import { useNetwork } from 'wagmi';

export interface TxData {
  data: GetTxByContract;
  loading: boolean;
  mutate: () => void;
}

export function useGetTxByContractQuery(contractAddress: string, pageInput: PageInput): TxData {
  const sdk = useGraphQLSDK();
  const { chain } = useNetwork();

  const keyString = 'GetTxByContractQuery ' + String(chain?.id || getEnv(Doppler.NEXT_PUBLIC_CHAIN_ID)) + contractAddress + pageInput?.afterCursor;

  const { data } = useSWR(keyString, async () => {
    if(chain?.id !== 1 && getEnv(Doppler.NEXT_PUBLIC_CHAIN_ID) !== '1') {
      return null;
    }
    if(isNullOrEmpty(contractAddress)) {
      return null;
    }

    const result = await sdk.GetTxByContract({
      input: {
        contractAddress,
        pageInput,
        type: ['all']
      }
    });
    return result;
  });

  return {
    data: data?.getTxByContract ?? null,
    loading: data == null,
    mutate: () => {
      mutate(keyString);
    },
  };
}
