import { useGraphQLSDK } from 'graphql/client/useGraphQLSDK';
import { FollowersInput,ProfileFollowersQuery } from 'graphql/generated/types';

import useSWR, { mutate } from 'swr';

export interface ProfileFollowersQueryData {
  data: ProfileFollowersQuery;
  loading: boolean;
  mutate: () => void;
}

export function useProfileFollowersQuery(input: FollowersInput): ProfileFollowersQueryData {
  const sdk = useGraphQLSDK();

  const keyString = 'ProfileFollowersQuery' + input.profileId;

  const { data } = useSWR(keyString, async () => {
    if (input.profileId == null) {
      return null;
    }
    // todo: include pagination data
    const result = await sdk.ProfileFollowers({ input: input });
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
