import { useGraphQLSDK } from 'graphql/client/useGraphQLSDK';
import { CollectionInfo } from 'graphql/generated/types';
import { useUser } from 'hooks/state/useUser';

import useSWR, { mutate } from 'swr';
import { PartialDeep } from 'type-fest';

export type CollectionResponse = PartialDeep<CollectionInfo>;

export interface CollectionData {
  data: CollectionResponse;
  error: Error | undefined;
  loading: boolean;
  mutate: () => void;
}

export function useCollectionQuery(args: { chainId: string, contract: string } | { chainId: string, slug: string }): CollectionData {
  let query = { type: undefined, value: undefined };
  // Set query type
  if ('contract' in args) query = { type: 'contract', value: args.contract };
  if ('slug' in args) query = { type: 'slug', value: args.slug };

  const { chainId } = args;
  const sdk = useGraphQLSDK();
  const { currentProfileId } = useUser();
  const keyString = ['CollectionQuery', query.value, chainId, currentProfileId];
  const input = {
    input: query.type === 'contract'
      ? {
        chainId,
        contract: query.value,
        network: 'ethereum',
      }
      : {
        chainId,
        slug: query.value,
        network: 'ethereum'
      },
    likedById: currentProfileId
  };

  const { data, error, isLoading } = useSWR(keyString, async () => {
    if (!chainId || !query.value) return {};
    return await sdk.Collection(input).then(data => data?.collection ?? {});
  });

  return {
    data: data,
    error,
    loading: isLoading,
    mutate: () => {
      mutate(keyString);
    },
  };
}
