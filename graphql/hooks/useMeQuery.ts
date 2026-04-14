import { GraphQLContext } from 'graphql/client/GraphQLProvider';
import { useGraphQLSDK } from 'graphql/client/useGraphQLSDK';
import { User } from 'graphql/generated/types';
import { useSupportedNetwork } from 'hooks/useSupportedNetwork';
import { isNullOrEmpty } from 'utils/format';

import { useContext, useState } from 'react';
import useSWR, { mutate } from 'swr';
import { PartialDeep } from 'type-fest';
import { useAccount, useNetwork } from 'wagmi';

export interface MeQueryData {
  loading: boolean;
  me: PartialDeep<User>;
  usernameFound: string | null;
  userEmailFound: string | null;
  userEmailVerified: boolean;
  mutate: () => void;
}

export function useMeQuery(): MeQueryData {
  const sdk = useGraphQLSDK();
  const { address: currentAddress } = useAccount();
  const { chain } = useNetwork();
  const { signed } = useContext(GraphQLContext);
  const { isSupported } = useSupportedNetwork();

  const [loading, setLoading] = useState(false);

  const keyString = 'MeQuery' + currentAddress + signed + chain?.id;

  const { data } = useSWR(keyString, async () => {
    if (isNullOrEmpty(currentAddress) || !signed || !isSupported) {
      return null;
    }
    setLoading(true);
    try {
      const result = await sdk.Me();
      setLoading(false);
      return result?.me;
    } catch (error) {
      setLoading(false);
      return null;
    }
  }, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    refreshInterval: 0,
  });

  return {
    loading: loading,
    me: data,
    usernameFound: data?.username,
    userEmailFound: data?.email,
    userEmailVerified: data?.isEmailConfirmed ?? false,
    mutate: () => {
      mutate(keyString);
    },
  };
}
