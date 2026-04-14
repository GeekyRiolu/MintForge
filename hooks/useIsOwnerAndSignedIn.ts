import { ProfileContext } from 'components/modules/Profile/ProfileContext';

import { useUser } from './state/useUser';

import { useContext } from 'react';

export function useIsOwnerAndSignedIn(profileURI: string) {
  const { user } = useUser();
  const { userIsAdmin } = useContext(ProfileContext);
  return userIsAdmin && user?.currentProfileUrl === profileURI;
}