import { useGraphQLSDK } from 'graphql/client/useGraphQLSDK';
import { Maybe, UpdateEmailInput } from 'graphql/generated/types';

import { useCallback, useState } from 'react';

export interface UpdateEmailResult {
  loading: boolean;
  error: string | null;
  updateEmail: (input: UpdateEmailInput) => Promise<boolean>;
}

export function useUpdateEmailMutation(): UpdateEmailResult {
  const sdk = useGraphQLSDK();

  const [error, setError] = useState<Maybe<string>>(null);
  const [loading, setLoading] = useState(false);

  const updateEmail = useCallback(
    async (input: UpdateEmailInput) => {
      setLoading(true);
      try {
        await sdk.UpdateEmail({ input: input });
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
    updateEmail: updateEmail,
  };
}
