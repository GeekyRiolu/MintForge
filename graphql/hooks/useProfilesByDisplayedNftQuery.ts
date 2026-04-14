import { useGraphQLSDK } from 'graphql/client/useGraphQLSDK';
import { Profile } from 'graphql/generated/types';
import { isNullOrEmpty } from 'utils/format';

import useSWR, { mutate } from 'swr';
import { PartialDeep } from 'type-fest';

export interface ProfilesByDisplayedNftData {
  data: PartialDeep<Profile>[];
  loading: boolean;
  mutate: () => void;
}

/**
 * Query all Profiles that are currently displaying the given NFT.
 */
export function useProfilesByDisplayedNft(
  contractAddress: string,
  tokenId: string,
  chainId: string,
  showOnlyVisibleNFTProfile?: boolean
): ProfilesByDisplayedNftData {
  const sdk = useGraphQLSDK();
  const keyString = 'ProfilesByDisplayedNft ' + contractAddress + tokenId + chainId + showOnlyVisibleNFTProfile;

  const { data } = useSWR(keyString, async () => {
    if (isNullOrEmpty(contractAddress) || isNullOrEmpty(tokenId) || isNullOrEmpty(chainId)) {
      return [];
    }
    const result = await sdk.ProfilesByDisplayedNft({
      input: {
        collectionAddress: contractAddress,
        tokenId,
        chainId,
        showOnlyVisibleNFTProfile
      },
    });
    return result?.profilesByDisplayNft?.items ?? [];
  });
  return {
    data: data,
    loading: data == null,
    mutate: () => {
      mutate(keyString);
    },
  };
}
