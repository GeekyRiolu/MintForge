import { useGraphQLSDK } from 'graphql/client/useGraphQLSDK';
import { Maybe, UpdateHideIgnoredInput, UpdateHideIgnoredMutation } from 'graphql/generated/types';

import { useCallback, useState } from 'react';

export interface UpdateHideIgnoredMutationResult {
  updating: boolean;
  error: string | null;
  updateHideIgnored: (input: UpdateHideIgnoredInput) => Promise<Maybe<UpdateHideIgnoredMutation>>
}

export function useUpdateHideIgnored(): UpdateHideIgnoredMutationResult {
  const sdk = useGraphQLSDK();

  const [error, setError] = useState<Maybe<string>>(null);
  const [loading, setLoading] = useState(false);

  const updateHideIgnored = useCallback(async (input: UpdateHideIgnoredInput) => {
    setLoading(true);
    try {
      const result = await sdk.UpdateHideIgnored({
        input: {
          hideIgnored: input.hideIgnored,
          eventIdArray: input?.eventIdArray
        }
      });
      setLoading(false);
      return result;
    } catch (err) {
      setLoading(false);
      setError(
        'Error updating profile view'
      );
      return null;
    }
  }, [sdk]);

  return {
    updating: loading,
    error,
    updateHideIgnored,
  };
}
