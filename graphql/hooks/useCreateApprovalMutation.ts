import { useGraphQLSDK } from 'graphql/client/useGraphQLSDK';
import { ApprovalInput, Maybe } from 'graphql/generated/types';

import { useCallback, useState } from 'react';

export interface CreateApprovalResult {
  creating: boolean;
  error: string | null;
  createApproval: (input: ApprovalInput) => Promise<boolean>;
}

/**
 * Provides a function to create an Approval with given input values.
 */
export function useCreateApprovalMutation(): CreateApprovalResult {
  const sdk = useGraphQLSDK();

  const [error, setError] = useState<Maybe<string>>(null);
  const [loading, setLoading] = useState(false);

  const createApproval = useCallback(
    async (input: ApprovalInput) => {
      setLoading(true);
      try {
        const result = await sdk.CreateApproval({
          input: input,
        });

        if (!result) {
          throw Error('CreateApproval mutation failed.');
        }

        setLoading(false);
        return true;
      } catch (err) {
        setLoading(false);
        setError('Approval Create failed. Please try again.');
        return false;
      }
    },
    [sdk]
  );

  return {
    creating: loading,
    error: error,
    createApproval: createApproval,
  };
}
