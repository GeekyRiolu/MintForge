import { useGraphQLSDK } from 'graphql/client/useGraphQLSDK';
import { ActivityStatus, Maybe, UpdateReadOutput } from 'graphql/generated/types';

import { useCallback, useState } from 'react';

export interface UpdateActivityStatusResult {
  loading: boolean;
  error: string | null;
  updateActivityStatus: (ids: string[], status: ActivityStatus) => Promise<UpdateReadOutput>;
}

/**
 * Updates the activities with the given IDs to have the given status.
 */
export function useUpdateActivityStatusMutation(): UpdateActivityStatusResult {
  const sdk = useGraphQLSDK();

  const [error, setError] = useState<Maybe<string>>(null);
  const [loading, setLoading] = useState(false);

  const updateActivityStatus = useCallback(
    async (ids: string[], status: ActivityStatus) => {
      setLoading(true);
      try {
        const result = await sdk.UpdateActivityStatus({
          ids,
          status
        });

        if (!result) {
          throw Error('UpdateActivityStatus mutation failed.');
        }

        setLoading(false);
        return result?.updateStatusByIds;
      } catch (err) {
        setLoading(false);
        setError('UpdateActivityStatus failed. Please try again.');
        return null;
      }
    },
    [sdk]
  );

  return {
    loading,
    error,
    updateActivityStatus,
  };
}
