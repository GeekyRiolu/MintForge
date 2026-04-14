import { useGraphQLSDK } from 'graphql/client/useGraphQLSDK';
import { LikeableType, Maybe } from 'graphql/generated/types';
import { useNonProfileModal } from 'hooks/state/useNonProfileModal';
import { useProfileSelectModal } from 'hooks/state/useProfileSelectModal';
import { useUser } from 'hooks/state/useUser';
import { useMyNftProfileTokens } from 'hooks/useMyNftProfileTokens';
import { isClient } from 'utils/ssr';

import * as gtag from 'lib/gtag';
import { useRouter } from 'next/router';
import { useCallback, useState } from 'react';
import { toast } from 'react-toastify';
import { useAccount } from 'wagmi';

export interface LikeMutationResult {
  likeLoading: boolean;
  likeError: string | null;
  setLike: () => Promise<{ __typename?: 'Like'; id?: string; createdAt?: any; updatedAt?: any; likedById?: string; likedId?: string; likedType?: LikeableType; }>

  unsetLikeLoading: boolean;
  unsetLikeError: string | null;
  unsetLike: () => Promise<boolean>
}

export function useSetLikeMutation(likedId: string, likedType: LikeableType, profileName?: string): LikeMutationResult {
  const { setLikeData } = useNonProfileModal();
  const { profileTokens: myOwnedProfileTokens } = useMyNftProfileTokens();
  const { setProfileSelectModalOpen } = useProfileSelectModal();
  const { forceReload } = useNonProfileModal();
  const router = useRouter();
  const { address: currentAddress, isConnected } = useAccount();
  const sdk = useGraphQLSDK();
  const [likeError, setLikeError] = useState<Maybe<string>>(null);
  const [likeLoading, setLikeLoading] = useState(false);
  const [unsetLikeError, setUnsetLikeError] = useState<Maybe<string>>(null);
  const [unsetLikeLoading, setUnsetLikeLoading] = useState(false);
  const { currentProfileId, user } = useUser();
  const checkSuccessMessage = (likeType) => {
    switch (likeType?.toLowerCase()) {
    case 'nft':
      return 'You liked an NFT!';
    case 'collection':
      return 'You liked a Collection!';
    case 'profile':
      return 'You liked a Profile!';
    default:
      return '';
    }
  };
  const setLike = useCallback(
    async () => {
      const location = router.pathname;
      const likeObject = {
        likedId: likedId,
        likedType: likedType,
        profileName: profileName,
        location: location
      };
      if (!user.currentProfileUrl && !currentProfileId && (!isConnected || !currentAddress)) {
        if(myOwnedProfileTokens && myOwnedProfileTokens.length){
          setProfileSelectModalOpen(true);
        }else{
          setLikeData(true, likeObject);
        }
        localStorage.setItem('nonAuthLikeObject', JSON.stringify(likeObject));
        return;
      }
      setLikeLoading(true);
      try {
        const result = await sdk.SetLike({
          input: {
            likedById: currentProfileId,
            likedId,
            likedType
          }
        });

        if (!result) {
          throw Error('SetLike mutation failed.');
        }
        const data = isClient ? localStorage.getItem('nonAuthLikeObject') : null;
        const storedLike = data ? JSON.parse(data) : null;
        if (storedLike && result) {
          forceReload(storedLike?.likedId, storedLike?.likedType);
          setTimeout(() => {
            if (isClient) {
              toast.success(checkSuccessMessage(storedLike?.likedType));
              localStorage.removeItem('nonAuthLikeObject');
            }
          }, 500);
        }
        setLikeLoading(false);
        gtag.event({
          category: 'social',
          action: `Liked-${likedType.toLowerCase()}`,
          label: likedId
        });
        return result?.setLike;
      } catch (err) {
        setLikeLoading(false);
        setLikeError('SetLike failed. Please try again.');
        localStorage.removeItem('nonAuthLikeObject');
        return null;
      }
    },
    [currentAddress, currentProfileId, forceReload, isConnected, likedId, likedType, myOwnedProfileTokens, profileName, router.pathname, sdk, setLikeData, setProfileSelectModalOpen, user.currentProfileUrl]
  );

  const unsetLike = useCallback(
    async () => {
      if (!user.currentProfileUrl && !currentProfileId) return;
      setUnsetLikeLoading(true);
      try {
        const result = await sdk.UnsetLike({
          input: {
            likedById: currentProfileId,
            likedId,
            likedType
          }
        });

        if (!result) {
          throw Error('UnsetLike mutation failed.');
        }

        setUnsetLikeLoading(false);
        gtag.event({
          category: 'social',
          action: `Unliked-${likedType}`,
          label: likedId
        });
        return result?.unsetLike;
      } catch (err) {
        setUnsetLikeLoading(false);
        setUnsetLikeError('UnsetLike failed. Please try again.');
        return null;
      }
    },
    [currentProfileId, likedId, likedType, sdk, user.currentProfileUrl]
  );

  return {
    likeLoading,
    likeError,
    setLike,
    unsetLikeLoading,
    unsetLikeError,
    unsetLike
  };
}
