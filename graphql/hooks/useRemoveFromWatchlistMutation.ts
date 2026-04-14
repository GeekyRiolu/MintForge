import { useGraphQLSDK } from 'graphql/client/useGraphQLSDK';
import { Maybe, Scalars } from 'graphql/generated/types';

import { useCallback, useState } from 'react';

export interface RemoveFromWatchlistResult {
  removing: boolean;
  error: string | null;
  removeFromWatchlist: (id: Scalars['ID']) => Promise<boolean>;
}

/**
 * Removes the profile with given ID from the logged in user's watchlist.
 */
export function useRemoveFromWatchlistMutation(): RemoveFromWatchlistResult {
  const sdk = useGraphQLSDK();

  const [error, setError] = useState<Maybe<string>>(null);
  const [loading, setLoading] = useState(false);

  const removeFromWatchlist = useCallback(
    async (id: Scalars['ID']) => {
      if (id == null) {
        return false;
      }
      setLoading(true);
      try {
        await sdk.RemoveFromWatchlist({
          id: id,
        });

        setLoading(false);

        return true;
      } catch (err) {
        setLoading(false);
        setError('Watchlist removal failed. Please try again.');
        return false;
      }
    },
    [sdk]
  );

  return {
    removing: loading,
    error: error,
    removeFromWatchlist: removeFromWatchlist,
  };
}
