import { useGraphQLSDK } from 'graphql/client/useGraphQLSDK';
import { GetSalesQuery, TransactionSalesInput } from 'graphql/generated/types';
import { isNullOrEmpty } from 'utils/format';

import { useCallback, useState } from 'react';

export interface GetSalesData {
  getSales: (input: TransactionSalesInput) => Promise<GetSalesQuery>;
  loading: boolean;
}

export function useGetSales(): GetSalesData {
  const sdk = useGraphQLSDK();
  const [loading, setLoading] = useState(false);

  const getSales = useCallback(async (input: TransactionSalesInput) => {
    if (isNullOrEmpty(input.contractAddress)) {
      return null;
    }
    try {
      setLoading(true);
      const result = await sdk.GetSales({ input });
      setLoading(false);
      return result;
    } catch (error) {
      setLoading(false);
      // todo: handle the error based on the error code.
      return null;
    }
  }, [sdk]);

  return {
    getSales,
    loading: loading,
  };
}
