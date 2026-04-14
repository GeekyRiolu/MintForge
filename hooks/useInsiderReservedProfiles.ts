import { GraphQLContext } from 'graphql/client/GraphQLProvider';
import { useGraphQLSDK } from 'graphql/client/useGraphQLSDK';
import { Maybe } from 'graphql/generated/types';
import { isNullOrEmpty } from 'utils/format';

import { useContext, useState } from 'react';
import useSWR, { mutate } from 'swr';
import { useAccount } from 'wagmi';

export interface InsiderReservedProfileResults {
  reservedProfiles: Maybe<string[]>;
  loading: boolean;
  error: any;
  mutate: () => void;
}

export function useInsiderReservedProfiles(): InsiderReservedProfileResults {
  const { address: currentAddress } = useAccount();
  const sdk = useGraphQLSDK();
  const { signed } = useContext(GraphQLContext);

  const [loading, setLoading] = useState(false);

  const keyString = 'InsiderReservedProfiles ' + currentAddress + signed;

  const { data, error } = useSWR(keyString, async () => {
    setLoading(true);
    if (isNullOrEmpty(currentAddress) || currentAddress == null) {
      return null;
    }

    const data = await sdk.InsiderReservedProfiles({
      input: {
        address: currentAddress,
      }
    });
    setLoading(false);
    return data?.insiderReservedProfiles ?? [];
  });

  return {
    reservedProfiles: data ?? null,
    loading,
    error: error,
    mutate: () => {
      mutate(keyString);
    },
  };
}
