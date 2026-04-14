import { useGraphQLSDK } from 'graphql/client/useGraphQLSDK';
import { IgnoreAssociationsMutation, Maybe, MutationIgnoreAssociationsArgs } from 'graphql/generated/types';

import { useCallback, useState } from 'react';

export interface IgnoreAssociationsMutationResult {
  ignoring: boolean;
  error: string | null;
  ignoreAssociations: (input: MutationIgnoreAssociationsArgs) => Promise<Maybe<IgnoreAssociationsMutation>>;
}

export function useIgnoreAssociationsMutation(): IgnoreAssociationsMutationResult {
  const sdk = useGraphQLSDK();

  const [error, setError] = useState<Maybe<string>>(null);
  const [loading, setLoading] = useState(false);

  const ignoreAssociations = useCallback(async (input: MutationIgnoreAssociationsArgs) => {
    setLoading(true);
    try {
      const result = await sdk.IgnoreAssociations({
        eventIdArray: input.eventIdArray
      });
      setLoading(false);
      return result;
    } catch (err) {
      setLoading(false);
      setError(
        'Error ignoring association'
      );
      return null;
    }
  }, [sdk]);

  return {
    ignoring: loading,
    error,
    ignoreAssociations,
  };
}
