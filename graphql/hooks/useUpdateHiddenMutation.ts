import { useGraphQLSDK } from 'graphql/client/useGraphQLSDK';
import { Maybe, UpdateHiddenInput, UpdateUserInput } from 'graphql/generated/types';

import { useCallback, useState } from 'react';

export interface UpdateHiddenResult {
  loading: boolean;
  error: string | null;
  updateHidden: (input: UpdateHiddenInput) => Promise<boolean>;
}

export function useUpdateHiddenMutation(): UpdateHiddenResult {
  const sdk = useGraphQLSDK();

  const [error, setError] = useState<Maybe<string>>(null);
  const [loading, setLoading] = useState(false);

  const updateHidden = useCallback(
    async (input: UpdateHiddenInput) => {
      setLoading(true);
      try {
        await sdk.UpdateHidden({ input: input });
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
    updateHidden: updateHidden,
  };
}
