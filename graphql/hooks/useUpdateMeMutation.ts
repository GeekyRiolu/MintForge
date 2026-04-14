import { useGraphQLSDK } from 'graphql/client/useGraphQLSDK';
import { Maybe, UpdateUserInput } from 'graphql/generated/types';

import { useCallback, useState } from 'react';

export interface UpdateMeResult {
  loading: boolean;
  error: string | null;
  updateMe: (input: UpdateUserInput) => Promise<boolean>;
}

export function useUpdateMeMutation(): UpdateMeResult {
  const sdk = useGraphQLSDK();

  const [error, setError] = useState<Maybe<string>>(null);
  const [loading, setLoading] = useState(false);

  const updateMe = useCallback(
    async (input: UpdateUserInput) => {
      setLoading(true);
      try {
        await sdk.UpdateMe({ input: input });
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
    updateMe: updateMe,
  };
}
