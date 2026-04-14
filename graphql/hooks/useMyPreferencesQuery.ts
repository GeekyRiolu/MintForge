import { GraphQLContext } from 'graphql/client/GraphQLProvider';
import { useGraphQLSDK } from 'graphql/client/useGraphQLSDK';
import { UserPreferences } from 'graphql/generated/types';
import { isNullOrEmpty } from 'utils/format';

import { useContext, useState } from 'react';
import useSWR, { mutate } from 'swr';
import { PartialDeep } from 'type-fest';
import { useAccount } from 'wagmi';

export interface MyPreferencesQueryData {
  loading: boolean;
  myPreferences: PartialDeep<UserPreferences>;
  mutate: () => void;
}

export function useMyPreferencesQuery(): MyPreferencesQueryData {
  const sdk = useGraphQLSDK();
  const { address: currentAddress } = useAccount();
  const { signed } = useContext(GraphQLContext);

  const [loading, setLoading] = useState(false);

  const keyString = 'MyPreferencesQuery' + currentAddress + signed;

  const { data } = useSWR(keyString, async () => {
    if (isNullOrEmpty(currentAddress) || !signed) {
      return null;
    }
    setLoading(true);
    try {
      const result = await sdk.MyPreferences();
      setLoading(false);
      return result?.me;
    } catch (error) {
      setLoading(false);
      return null;
    }
  });
  return {
    loading: loading,
    myPreferences: data?.preferences,
    mutate: () => {
      mutate(keyString);
    },
  };
}
