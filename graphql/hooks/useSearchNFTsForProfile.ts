import { useGraphQLSDK } from 'graphql/client/useGraphQLSDK';
import { Nft, PageInfo, } from 'graphql/generated/types';
import useDebounce from 'hooks/useDebounce';
import { useDefaultChainId } from 'hooks/useDefaultChainId';
import { isNullOrEmpty } from 'utils/format';

import useSWR, { mutate } from 'swr';
import { PartialDeep } from 'type-fest';

export interface SearchNFTsForProfileQueryData {
  nfts: PartialDeep<Nft>[];
  pageInfo: PageInfo;
  totalItems: number,
  loading: boolean;
  mutate: () => void;
}

export function useSearchNFTsForProfile(
  url: string,
  query: string
): SearchNFTsForProfileQueryData {
  const sdk = useGraphQLSDK();
  const defaultChainId = useDefaultChainId();
  const debouncedSearch = useDebounce(query, 1000);

  const keyString =
    'SearchNFTsForProfile' +
    url +
    debouncedSearch +
    defaultChainId;

  const { data } = useSWR(keyString, async () => {
    if (isNullOrEmpty(debouncedSearch)) {
      return null;
    }
    const result = await sdk.SearchNFTsForProfile({
      input: {
        url,
        query: debouncedSearch,
        chainId: defaultChainId,
        pageInput: {
          first: 100
        }
      },
    });
    return result;
  }, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    refreshInterval: 0,
  });

  return {
    nfts: data?.searchNFTsForProfile.items,
    pageInfo: data?.searchNFTsForProfile.pageInfo,
    totalItems: data?.searchNFTsForProfile.totalItems,
    loading: data == null,
    mutate: () => {
      mutate(keyString);
    },
  };
}
