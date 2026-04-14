import { useGraphQLSDK } from 'graphql/client/useGraphQLSDK';
import { Maybe, MutationUpdateNftMemoArgs } from 'graphql/generated/types';

import { useCallback, useState } from 'react';

export interface UpdateNftMemoResult {
  loading: boolean;
  error: string | null;
  updateNftmemo: (input: MutationUpdateNftMemoArgs) => Promise<boolean>;
}

export function useUpdateNftMemoMutation(): UpdateNftMemoResult {
  const sdk = useGraphQLSDK();

  const [error, setError] = useState<Maybe<string>>(null);
  const [loading, setLoading] = useState(false);

  const updateNftmemo = useCallback(
    async (input: MutationUpdateNftMemoArgs) => {
      setLoading(true);
      try {
        await sdk.UpdateNFTMemo(input);
        setLoading(false);
        return true;
      } catch (err) {
        setLoading(false);
        setError('Mutation failed. Please try again.');
        return false;
      }
    },
    [sdk]
  );
  return {
    loading: loading,
    error: error,
    updateNftmemo: updateNftmemo,
  };
}
