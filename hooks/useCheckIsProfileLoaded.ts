'use client';
import { useSetLikeMutation } from 'graphql/hooks/useLikeMutations';

import { useUser } from './state/useUser';

import { useEffect } from 'react';

export function useCheckIsProfileLoaded() {
  const { currentProfileId, user } = useUser();
  const isClient = typeof window !== 'undefined';
  const checkStoreUserLikes = () => {
    if (isClient) {
      const data = localStorage.getItem('nonAuthLikeObject');
      const likeObject = JSON.parse(data);
      return likeObject;
    }
  };
  const likeObject = checkStoreUserLikes();
  const { setLike } = useSetLikeMutation(
    likeObject?.likedId,
    likeObject?.likedType
  );

  useEffect(() => {
    if (currentProfileId && user.currentProfileUrl && likeObject) {
      setLike();
    }
  }, [user, currentProfileId, setLike, likeObject]);
}
