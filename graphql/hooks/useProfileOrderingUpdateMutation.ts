import { useGraphQLSDK } from 'graphql/client/useGraphQLSDK';
import { OrderingUpdatesInput, ProfileNftOrderingUpdatesMutation } from 'graphql/generated/types';

import useSWRMutation from 'swr/mutation';

export interface OrderingUpdateResult {
  data: ProfileNftOrderingUpdatesMutation,
  loading: boolean;
  error: string | null;
  updateOrder: (input: OrderingUpdatesInput) => Promise<boolean>;
}

export function useProfileOrderingUpdateMutation(): OrderingUpdateResult {
  const sdk = useGraphQLSDK();
  const mutateNftOrder = async (url: string, { arg }: {arg: OrderingUpdatesInput}) => await sdk.ProfileNftOrderingUpdates({ input: arg });

  const { data, error, isMutating, trigger } = useSWRMutation('ProfileNftOrderingUpdateMutation', mutateNftOrder);

  return {
    data: data,
    error,
    loading: isMutating,
    updateOrder: async (args: OrderingUpdatesInput) => {
      const result = await trigger(args);
      if (result) {
        return true;
      }
      return false;
    },
  };
}
