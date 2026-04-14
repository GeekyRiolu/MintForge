import { GraphQLContext } from 'graphql/client/GraphQLProvider';
import { useGraphQLSDK } from 'graphql/client/useGraphQLSDK';
import { Maybe } from 'graphql/generated/types';
import { isNullOrEmpty } from 'utils/format';

import { useContext } from 'react';
import useSWR, { mutate } from 'swr';
import { useAccount } from 'wagmi';

export interface ProfileClaimHashResult {
  profileClaimHash: Maybe<{
    hash: string,
    signature: string,
  }>;
  mutate: () => void;
}

export function useGetProfileClaimHash(profileUrl: string) {
  const { address: currentAddress } = useAccount();
  const sdk = useGraphQLSDK();
  const { signed } = useContext(GraphQLContext);

  const keyString = 'useGetProfileClaimHash' + currentAddress + profileUrl;

  const { data } = useSWR(
    isNullOrEmpty(currentAddress) || isNullOrEmpty(profileUrl) ? null : keyString,
    async () => {
      if (isNullOrEmpty(currentAddress) || !signed || isNullOrEmpty(profileUrl)) {
        return null;
      }

      const data = await sdk.SignHashProfile({ profileUrl });
      return data?.signHashProfile;
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 0,
    }
  );

  return {
    profileClaimHash: data,
    mutate: () => {
      mutate(keyString);
    }
  };
}
