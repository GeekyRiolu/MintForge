import { useGraphQLSDK } from 'graphql/client/useGraphQLSDK';
import { Maybe, UpdateProfileViewInput, UpdateProfileViewMutation } from 'graphql/generated/types';

import { useCallback, useState } from 'react';

export interface UpdateProfileViewMutationResult {
  updating: boolean;
  error: string | null;
  updateProfileView: (input: UpdateProfileViewInput) => Promise<Maybe<UpdateProfileViewMutation>>;
}

export function useUpdateProfileViewMutation(): UpdateProfileViewMutationResult {
  const sdk = useGraphQLSDK();

  const [error, setError] = useState<Maybe<string>>(null);
  const [loading, setLoading] = useState(false);

  const updateProfileView = useCallback(async (input: UpdateProfileViewInput) => {
    setLoading(true);
    try {
      const result = await sdk.UpdateProfileView({
        input: {
          profileViewType: input.profileViewType,
          url: input.url
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
    updateProfileView,
  };
}
