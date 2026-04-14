import { useGraphQLSDK } from 'graphql/client/useGraphQLSDK';
import { Maybe, Scalars, SendReferEmailOutput } from 'graphql/generated/types';

import { useCallback, useState } from 'react';

export interface SendReferEmailResult {
  loading: boolean;
  error: string | null;
  sendReferEmail: (profileUrl: Scalars['String'], emails: Array<Scalars['String']>) => Promise<SendReferEmailOutput>;
}

export function useSendReferEmailMutation(): SendReferEmailResult {
  const sdk = useGraphQLSDK();
  const [error, setError] = useState<Maybe<string>>(null);
  const [loading, setLoading] = useState(false);

  const sendReferEmail = useCallback(
    async (profileUrl: Scalars['String'], emails: Array<Scalars['String']>) => {
      setLoading(true);
      try {
        const result = await sdk.SendReferEmail({
          input : {
            profileUrl,
            emails
          }
        });

        if (!result) {
          throw Error('SendReferEmailMutation mutation failed.');
        }

        setLoading(false);
        return result?.sendReferEmail;
      } catch (err) {
        setLoading(false);
        setError('SendReferEmailMutation failed. Please try again.');
        return null;
      }
    },
    [sdk]
  );

  return {
    loading,
    error,
    sendReferEmail,
  };
}
