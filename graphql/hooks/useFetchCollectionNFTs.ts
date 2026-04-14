import { useGraphQLSDK } from 'graphql/client/useGraphQLSDK';
import { CollectionNfTsInput, CollectionNfTsQuery } from 'graphql/generated/types';
import { isNullOrEmpty } from 'utils/format';

import { useCallback, useState } from 'react';

export interface FetchCollectionNFTsData {
  fetchCollectionsNFTs: (input: CollectionNfTsInput) => Promise<CollectionNfTsQuery>;
  loading: boolean;
}

export function useFetchCollectionNFTs(): FetchCollectionNFTsData {
  const sdk = useGraphQLSDK();
  const [loading, setLoading] = useState(false);

  const fetchCollectionsNFTs = useCallback(async (input: CollectionNfTsInput) => {
    if (isNullOrEmpty(input.collectionAddress)) {
      return null;
    }
    try {
      setLoading(true);
      const result = await sdk.CollectionNFTs({ input });
      setLoading(false);
      return result;
    } catch (error) {
      setLoading(false);
      // todo: handle the error based on the error code.
      return null;
    }
  }, [sdk]);

  return {
    fetchCollectionsNFTs,
    loading: loading,
  };
}
