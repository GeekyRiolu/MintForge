import { useGraphQLSDK } from 'graphql/client/useGraphQLSDK';
import { Maybe } from 'graphql/generated/types';

import { useCallback, useState } from 'react';

export interface ConfirmEmailMutationResult {
  loading: boolean;
  error: string | null;
  confirmEmail: (token: string) => Promise<boolean>;
}

/**
 * provides the email verification mutation to the caller.
 * this function is called when the user submits a 6 digit
 * code to verify their email address.
 */
export function useConfirmEmailMutation(): ConfirmEmailMutationResult {
  const sdk = useGraphQLSDK();

  const [error, setError] = useState<Maybe<string>>(null);
  const [loading, setLoading] = useState(false);

  const confirmEmail = useCallback(
    async (token: string) => {
      setLoading(true);
      try {
        await sdk.ConfirmEmail({ token });
        setLoading(false);
        setError(null);
        return true;
      } catch (err) {
        // invalid inputs, or user creation failed.
        setLoading(false);
        setError('Sign up failed. Please try again.');
        return false;
      }
    },
    [sdk]
  );

  return {
    loading: loading,
    error: error,
    confirmEmail: confirmEmail,
  };
}
