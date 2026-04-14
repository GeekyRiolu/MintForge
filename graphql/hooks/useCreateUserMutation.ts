import { useGraphQLSDK } from 'graphql/client/useGraphQLSDK';
import { Maybe, SignUpInput, SignUpMutation } from 'graphql/generated/types';

import { ethers } from 'ethers';
import { useCallback, useState } from 'react';

export interface CreateUserMutationProps {
  onCreateSuccess: () => void;
  onCreateFailure: () => void;
}

export interface CreateUserMutationResult {
  creating: boolean;
  error: string | null;
  createUser: (input: SignUpInput) => Promise<Maybe<SignUpMutation>>;
}

/**
 * provides the sign up function to the caller.
 * this function is called when the user submits an email address,
 * which we combine with a Wallet and other options to create the
 * unverified User in our system and send the email for verification.
 */
export function useCreateUserMutation({
  onCreateSuccess,
  onCreateFailure,
}: CreateUserMutationProps): CreateUserMutationResult {
  const sdk = useGraphQLSDK();

  const [error, setError] = useState<Maybe<string>>(null);
  const [loading, setLoading] = useState(false);

  const createUser = useCallback(async (input: SignUpInput) => {
    setLoading(true);
    try {
      const result = await sdk.SignUp({
        input: {
          avatarURL: input.avatarURL ?? undefined,
          email: input.email?.toLowerCase(),
          username: input.username?.toLowerCase(),
          referredBy:
            input.referredBy?.length === 0
              ? undefined
              : (input.referredBy as string),
          referredUrl:
              input.referredUrl?.length === 0
                ? undefined
                : (input.referredUrl as string)?.toLowerCase(),
          referralId:
              input.referralId?.length === 0
                ? undefined
                : (input.referralId as string),
          wallet: {
            address: ethers.utils.getAddress(input.wallet.address),
            chainId: input.wallet.chainId,
            network: input.wallet.network,
          },
        },
      });
      onCreateSuccess();
      setLoading(false);
      return result;
    } catch (err) {
      // invalid inputs, or user creation failed.
      onCreateFailure();
      setLoading(false);
      setError(
        err.message.includes('duplicate key value violates unique constraint')
          ? 'User already exists.' :
          err.message.includes('already exists')
            ? 'User with email ' + input.email?.toLowerCase() + ' already exists.'
            : 'Sign Up failed. Please try again.'
      );
      return null;
    }
  }, [onCreateFailure, onCreateSuccess, sdk]);

  return {
    creating: loading,
    error,
    createUser,
  };
}
