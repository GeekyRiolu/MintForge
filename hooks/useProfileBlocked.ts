import { useGraphQLSDK } from 'graphql/client/useGraphQLSDK';
import { isNullOrEmpty } from 'utils/format';

import useSWR, { mutate } from 'swr';

export interface ProfileBlocklistResult {
  blocked: boolean;
  loading: boolean;
  error: any;
  mutate: () => void;
}

export function useProfileBlocked(inputURL: string, blockReserved: boolean): ProfileBlocklistResult {
  const sdk = useGraphQLSDK();

  const keyString = 'ProfileBlocklist' + inputURL + blockReserved;

  const { data, error } = useSWR(keyString, async () => {
    if (isNullOrEmpty(inputURL)) {
      return false;
    }

    const data = await sdk.ProfileBlocklist({
      url: inputURL,
      blockReserved
    });

    return data?.blockedProfileURI;
  });

  return {
    blocked: data ?? false,
    loading: data == null,
    error: error,
    mutate: () => {
      mutate(keyString);
    },
  };
}
