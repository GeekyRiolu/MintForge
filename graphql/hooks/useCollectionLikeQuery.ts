import { useGraphQLSDK } from 'graphql/client/useGraphQLSDK';
import { useNonProfileModal } from 'hooks/state/useNonProfileModal';
import { useUser } from 'hooks/state/useUser';
import { useDefaultChainId } from 'hooks/useDefaultChainId';

import useSWR, { mutate } from 'swr';
import { useAccount } from 'wagmi';

export interface CollectionLikeCountData {
  data: { __typename?: 'CollectionInfo'; collection?: { __typename?: 'Collection'; likeCount?: number; isLikedByUser?: boolean; isLikedBy?: boolean; }; }
  loading: boolean;
  mutate: () => void;
}

export function useCollectionLikeCountQuery(contracts: string[]): CollectionLikeCountData {
  const sdk = useGraphQLSDK();
  const { likeId } = useNonProfileModal();
  const defaultChainId = useDefaultChainId();
  const { currentProfileId } = useUser();
  const { address: currentAccount } = useAccount();
  const keyString = 'CollectionLikeQuery' + contracts + defaultChainId + likeId + currentProfileId + currentAccount;

  const inputs = contracts && contracts?.map((contract) => (
    {
      chainId: defaultChainId,
      contract,
      network: 'ethereum',
    }
  ));

  const { data } = useSWR(keyString, async () => {
    if (!defaultChainId || !contracts) {
      return {};
    }
    const result = await sdk.CollectionsLikeCount({
      input: inputs,
      likedById: currentProfileId
    });
    return result?.collections ?? {};
  });

  return {
    data: data,
    loading: data == null,
    mutate: () => {
      mutate(keyString);
    },
  };
}
