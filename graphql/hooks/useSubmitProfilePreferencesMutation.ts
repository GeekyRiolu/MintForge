import { useGraphQLSDK } from 'graphql/client/useGraphQLSDK';
import { Maybe } from 'graphql/generated/types';

import { useCallback, useState } from 'react';

export interface SubmitProfilePreferencesResult {
  submitting: boolean;
  error: string | null;
  submitPreferences: (uris: string[]) => Promise<boolean>;
}

/**
 * Provides a function to submit 5-10 profile URI preferences for GK holders.
 */
export function useSubmitProfilePreferencesMutation(): SubmitProfilePreferencesResult {
  const sdk = useGraphQLSDK();

  const [error, setError] = useState<Maybe<string>>(null);
  const [loading, setLoading] = useState(false);

  const createBids = useCallback(
    async (uris: string[]) => {
      setLoading(true);
      try {
        const result = await sdk.SubmitProfilePreferences({
          input: {
            urls: uris
          },
        });

        if (!result) {
          throw Error('CreateBid mutation failed.');
        }

        setLoading(false);
        return true;
      } catch (err) {
        setLoading(false);
        setError('Bid Create failed. Please try again.');
        return false;
      }
    },
    [sdk]
  );

  return {
    submitting: loading,
    error: error,
    submitPreferences: createBids,
  };
}
