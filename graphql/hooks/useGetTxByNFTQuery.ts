import { useGraphQLSDK } from 'graphql/client/useGraphQLSDK';
import { GetTxByNft, PageInput } from 'graphql/generated/types';
import { Doppler,getEnv } from 'utils/env';
import { isNullOrEmpty } from 'utils/format';

import useSWR, { mutate } from 'swr';
import { useNetwork } from 'wagmi';

export interface TxData {
  data: GetTxByNft;
  loading: boolean;
  mutate: () => void;
}

export function useGetTxByNFTQuery(contractAddress: string, tokenId: string, type: string, pageInput: PageInput): TxData {
  const sdk = useGraphQLSDK();
  const { chain } = useNetwork();

  const keyString = 'GetTxByNFTQuery ' + String(chain?.id || getEnv(Doppler.NEXT_PUBLIC_CHAIN_ID)) + contractAddress + tokenId + pageInput?.afterCursor;

  const { data } = useSWR(keyString, async () => {
    if(chain?.id !== 1 && getEnv(Doppler.NEXT_PUBLIC_CHAIN_ID) !== '1') {
      return null;
    }
    if(isNullOrEmpty(contractAddress) || tokenId == null) {
      return null;
    }

    const result = await sdk.GetTxByNFT({
      input: {
        contractAddress,
        tokenId,
        type: [type],
        pageInput
      }
    });
    return result;
  });

  return {
    data: data?.getTxByNFT ?? null,
    loading: data == null,
    mutate: () => {
      mutate(keyString);
    },
  };
}
