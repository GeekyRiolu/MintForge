import { useGraphQLSDK } from 'graphql/client/useGraphQLSDK';
import { Maybe } from 'graphql/generated/types';

import { useCallback, useState } from 'react';

export interface AddToWatchlistResult {
  removing: boolean;
  error: string | null;
  addToWatchlist: (url: string) => Promise<boolean>;
}

/**
 * Adds the profile with given ID to the logged in user's watchlist.
 */
export function useAddToWatchlistMutation(): AddToWatchlistResult {
  const sdk = useGraphQLSDK();

  const [error, setError] = useState<Maybe<string>>(null);
  const [loading, setLoading] = useState(false);

  const addToWatchlist = useCallback(
    async (url: string) => {
      setLoading(true);
      try {
        await sdk.AddToWatchlist({
          url: url,
        });

        setLoading(false);
        return true;
      } catch (err) {
        setLoading(false);
        console.log(err);
        setError('Add to watchlist failed. Please try again.');
        return false;
      }
    },
    [sdk]
  );

  return {
    removing: loading,
    error: error,
    addToWatchlist: addToWatchlist,
  };
}
