import { useGraphQLSDK } from 'graphql/client/useGraphQLSDK';
import { Maybe, MutationUpdateReadByIdsArgs, UpdateReadByIdsMutation } from 'graphql/generated/types';

import { useCallback, useState } from 'react';

export interface UpdateReadByIdsMutationResult {
  updating: boolean;
  error: string | null;
  updateReadbyIds: (input: MutationUpdateReadByIdsArgs) => Promise<Maybe<UpdateReadByIdsMutation>>;
}

export function useUpdateReadByIdsMutation(): UpdateReadByIdsMutationResult {
  const sdk = useGraphQLSDK();

  const [error, setError] = useState<Maybe<string>>(null);
  const [loading, setLoading] = useState(false);

  const updateReadbyIds = useCallback(async (input: MutationUpdateReadByIdsArgs) => {
    setLoading(true);
    try {
      const result = await sdk.UpdateReadByIds({ ids: input.ids });
      setLoading(false);
      return result;
    } catch (err) {
      setLoading(false);
      setError(
        'Error updating read on activity'
      );
      return null;
    }
  }, [sdk]);

  return {
    updating: loading,
    error,
    updateReadbyIds,
  };
}
