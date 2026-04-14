import { useGraphQLSDK } from 'graphql/client/useGraphQLSDK';
import { PageInput, ProfileSortType, RecentProfilesQuery } from 'graphql/generated/types';
import { useUser } from 'hooks/state/useUser';

import useSWR, { mutate } from 'swr';

export interface RecentProfilesQueryData {
  data: RecentProfilesQuery;
  loading: boolean;
  mutate: () => void;
}

/**
 * Query all Profiles in reverse chronological order.
 */
export function useRecentProfilesQuery(pageInput: PageInput): RecentProfilesQueryData {
  const sdk = useGraphQLSDK();
  const { currentProfileId } = useUser();
  const keyString = 'RecentProfilesQuery ' + JSON.stringify(pageInput) + currentProfileId;

  const { data } = useSWR(keyString, async () => {
    const result = await sdk.RecentProfiles({
      input: {
        pageInput,
        sortBy: ProfileSortType.RecentUpdated
      },
      likedById: currentProfileId
    });
    return result;
  });
  return {
    data: data,
    loading: data == null,
    mutate: () => {
      mutate(keyString);
    },
  };
}
