import { useGraphQLSDK } from 'graphql/client/useGraphQLSDK';
import { Maybe } from 'graphql/generated/types';

import { useCallback, useState } from 'react';

export interface ResendEmailResult {
  loading: boolean;
  error: string | null;
  resendEmail: () => void;
}

export function useResendEmailMutation(): ResendEmailResult {
  const sdk = useGraphQLSDK();

  const [error, setError] = useState<Maybe<string>>(null);
  const [loading, setLoading] = useState(false);

  const resendEmail = useCallback(async () => {
    setLoading(true);
    try {
      await sdk.ResendEmail();
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError('Mutation failed. Please try again.');
    }
  }, [sdk]);

  return {
    loading: loading,
    error: error,
    resendEmail: resendEmail,
  };
}
