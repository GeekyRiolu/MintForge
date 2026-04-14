import { useGraphQLSDK } from 'graphql/client/useGraphQLSDK';
import { Maybe } from 'graphql/generated/types';
import { isNullOrEmpty } from 'utils/format';

import useSWR from 'swr';

export interface ProfileVisibleNFTCountQueryData {
  totalItems: number;
  loading: boolean;
}

export function useProfileVisibleNFTCount(
  profileIds: string[],
  chainId: Maybe<string>,
): ProfileVisibleNFTCountQueryData {
  const sdk = useGraphQLSDK();

  const keyString = 'ProfileVisibleNFTCountQuery' +
    JSON.stringify(profileIds) +
    chainId;

  const { data } = useSWR(keyString, async () => {
    if (isNullOrEmpty(profileIds)) {
      return null;
    }
    const result = await sdk.ProfileVisibleNFTCount({
      profileIds,
      chainId
    });

    return result;
  });

  return {
    totalItems: data?.profileVisibleNFTCount[0]?.visibleNFTs,
    loading: !data
  };
}
