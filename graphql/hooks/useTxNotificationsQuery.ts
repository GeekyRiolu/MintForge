import { useGraphQLSDK } from 'graphql/client/useGraphQLSDK';
import { ActivityExpiration, ActivityStatus, ActivityType, TxActivity } from 'graphql/generated/types';
import { isNullOrEmpty } from 'utils/format';

import { useCallback } from 'react';
import { mutate } from 'swr';
import useSWRImmutable from 'swr/immutable';
import { PartialDeep } from 'type-fest';

export interface TxNotificationsData {
  data: Array<PartialDeep<TxActivity>>;
  loading: boolean;
  mutate: () => void;
}

export function useTxNotificationsQuery(address: string, chainId: string, activityType: ActivityType): TxNotificationsData {
  const sdk = useGraphQLSDK();
  const keyString = 'TxNotificationsQuery' +
    chainId +
    address +
    activityType;

  const { data } = useSWRImmutable(keyString, async () => {
    if (isNullOrEmpty(address) || isNullOrEmpty(chainId)) {
      return [];
    }
    const result = await sdk.NotificationActivities({
      input: {
        pageInput: {
          first: 50,
        },
        walletAddress: address,
        activityType,
        chainId,
        status: ActivityStatus.Valid,
        read: false,
        expirationType: ActivityExpiration.Both
      }
    });
    return result?.getActivities?.items;
  });

  const mutateActivities = useCallback(() => {
    mutate(keyString);
  }, [keyString]);

  return {
    data: data ?? [],
    loading: data == null,
    mutate: mutateActivities,
  };
}
