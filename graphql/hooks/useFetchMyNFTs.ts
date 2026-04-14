import { useGraphQLSDK } from 'graphql/client/useGraphQLSDK';
import { NfTsOutput, PageInput } from 'graphql/generated/types';
import { isNullOrEmpty } from 'utils/format';

import { useCallback, useState } from 'react';
import { PartialDeep } from 'type-fest';
import { useAccount } from 'wagmi';

export interface FetchMyNFTsData {
  fetchMyNFTs: (pageInput: PageInput) => Promise<PartialDeep<NfTsOutput>>;
  loading: boolean;
}

export function useFetchMyNFTs(): FetchMyNFTsData {
  const sdk = useGraphQLSDK();
  const [loading, setLoading] = useState(false);
  const { address: currentAddress } = useAccount();

  const fetchMyNFTs = useCallback(async (pageInput: PageInput) => {
    if (isNullOrEmpty(currentAddress)) {
      return null;
    }
    try {
      setLoading(true);
      const result = await sdk.MyNFTs({
        input: {
          pageInput
        }
      });
      setLoading(false);
      return result.myNFTs;
    } catch (error) {
      setLoading(false);
      // todo: handle the error based on the error code.
      return null;
    }
  }, [currentAddress, sdk]);

  return {
    fetchMyNFTs,
    loading: loading,
  };
}
