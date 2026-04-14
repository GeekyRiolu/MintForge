import { useGraphQLSDK } from 'graphql/client/useGraphQLSDK';
import { NftsForCollectionsInput, NftsForCollectionsQuery } from 'graphql/generated/types';
import { isNullOrEmpty } from 'utils/format';

import { useCallback, useState } from 'react';

export interface FetchCollectionNFTsData {
  fetchNFTsForCollections: (input: NftsForCollectionsInput) => Promise<NftsForCollectionsQuery>;
  loading: boolean;
}

export function useFetchNFTsForCollections(): FetchCollectionNFTsData {
  const sdk = useGraphQLSDK();
  const [loading, setLoading] = useState(false);

  const fetchNFTsForCollections = useCallback(async (input: NftsForCollectionsInput) => {
    if (isNullOrEmpty(input.collectionAddresses) || input.collectionAddresses.length < 1) {
      return null;
    }
    try {
      setLoading(true);
      const result = await sdk.NftsForCollections({ input });
      setLoading(false);
      return result;
    } catch (error) {
      setLoading(false);
      // todo: handle the error based on the error code.
      return null;
    }
  }, [sdk]);

  return {
    fetchNFTsForCollections,
    loading: loading,
  };
}
