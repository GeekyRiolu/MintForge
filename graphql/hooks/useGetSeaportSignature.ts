import { useGraphQLSDK } from 'graphql/client/useGraphQLSDK';
import { GetSeaportSignaturesQuery, Scalars } from 'graphql/generated/types';
import { isNullOrEmpty } from 'utils/format';

import { useCallback } from 'react';

export interface SeaportSignaturesData {
  fetchSeaportSignature: (orderHashes: string[]) => Promise<GetSeaportSignaturesQuery>
}

export function useGetSeaportSignature(): SeaportSignaturesData {
  const sdk = useGraphQLSDK();

  const fetchSeaportSignature = useCallback(
    async (orderHashes: Array<Scalars['String']>) => {
      if (isNullOrEmpty(orderHashes)) {
        return null;
      }
      try {
        const result = await sdk.GetSeaportSignatures(
          {
            'input': {
              'orderHashes': orderHashes
            }
          }
        );

        if (!result) {
          console.log('GetSeaportSignatures query failed.');
        }
        return result;
      } catch (err) {
        console.log('GetSeaportSignatures query failed.', err);
        return null;
      }
    },
    [sdk]
  );

  return {
    fetchSeaportSignature
  };
}
