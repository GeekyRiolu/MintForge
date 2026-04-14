import { useGraphQLSDK } from 'graphql/client/useGraphQLSDK';
import { Maybe, Scalars } from 'graphql/generated/types';

import { useCallback, useState } from 'react';

export interface ProfileClaimedResult {
  removing: boolean;
  error: string | null;
  profileClaimed: (
    profileID: Scalars['ID'],
    walletID: Scalars['ID'],
    txHash: string
  ) => Promise<boolean>;
}

/**
 * Tells the server that the given Profile has been claimed by the given Wallet, 
 * in the given Transaction.
 */
export function useProfileClaimedMutation(): ProfileClaimedResult {
  const sdk = useGraphQLSDK();

  const [error, setError] = useState<Maybe<string>>(null);
  const [loading, setLoading] = useState(false);

  const profileClaimed = useCallback(
    async (
      profileID: Scalars['ID'],
      walletID: Scalars['ID'],
      txHash: string
    ) => {
      setLoading(true);
      try {
        const result = await sdk.ProfileClaimed({
          input: {
            profileId: profileID,
            walletId: walletID,
            txHash: txHash
          }
        });

        if (!result) {
          throw Error('ProfileClaimed mutation failed.');
        }

        setLoading(false);
        return true;
      } catch (err) {
        setLoading(false);
        setError('ProfileClaimed mutation failed. Please try again.');
        return false;
      }
    },
    [sdk]
  );

  return {
    removing: loading,
    error: error,
    profileClaimed: profileClaimed,
  };
}
