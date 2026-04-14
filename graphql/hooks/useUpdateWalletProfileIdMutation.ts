import { useGraphQLSDK } from 'graphql/client/useGraphQLSDK';
import { Maybe, MutationUpdateWalletProfileIdArgs, UpdateWalletProfileIdMutation } from 'graphql/generated/types';

import { useCallback, useState } from 'react';

export interface UpdateWalletProfileIdMutationResult {
  updating: boolean
  error: string | null;
  updateWalletProfileId: (input: MutationUpdateWalletProfileIdArgs) => Promise<Maybe<UpdateWalletProfileIdMutation>>;
}

export function useUpdateWalletProfileIdMutation(): UpdateWalletProfileIdMutationResult {
  const sdk = useGraphQLSDK();

  const [error, setError] = useState<Maybe<string>>(null);
  const [loading, setLoading] = useState(false);

  const updateWalletProfileId = useCallback(async (input: MutationUpdateWalletProfileIdArgs) => {
    setLoading(true);
    try {
      const result = await sdk.UpdateWalletProfileId({
        profileId: input.profileId
      });
      setLoading(false);
      return result;
    } catch (err) {
      setLoading(false);
      setError(
        'Error updating wallet profile id'
      );
      return null;
    }
  }, [sdk]);

  return {
    updating: loading,
    error,
    updateWalletProfileId,
  };
}
