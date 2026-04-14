import { useGraphQLSDK } from 'graphql/client/useGraphQLSDK';
import { ProfileLayoutType, UpdateProfileInput, UpdateProfileMutation } from 'graphql/generated/types';

import useSWRMutation from 'swr/mutation';

export interface UpdateProfileResult {
  data: UpdateProfileMutation;
  updating: boolean;
  error: string | null;
  updateProfile: (input: UpdateProfileInput) => Promise<boolean>;
}

/**
 * Removes the profile with given ID from the logged in user's watchlist.
 */
export function useUpdateProfileMutation(): UpdateProfileResult {
  const sdk = useGraphQLSDK();
  const mutateProfile = async (url: string, { arg }: {arg: UpdateProfileInput}) => await sdk.UpdateProfile({ input: arg?.layoutType !== null ? arg : { ...arg, layoutType: ProfileLayoutType.Default } });

  const { data, error, isMutating, trigger } = useSWRMutation('ProfileUpdateMutation', mutateProfile);

  return {
    data: data,
    error,
    updating: isMutating,
    updateProfile: async (args: UpdateProfileInput)=> {
      const result = await trigger(args);
      if (result) {
        return true;
      }
      return false;
    },
  };
}
