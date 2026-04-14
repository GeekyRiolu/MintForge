import DefaultLayout from 'components/layouts/DefaultLayout';
import ActivityPage from 'components/modules/Activity/ActivityPage';
import { ProfileContextProvider } from 'components/modules/Profile/ProfileContext';
import { useUser } from 'hooks/state/useUser';
import NotFoundPage from 'pages/404';
import { Doppler, getEnvBool } from 'utils/env';

import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useAccount } from 'wagmi';

export default function Activity() {
  const router = useRouter();
  const { address: currentAddress } = useAccount();
  const { getCurrentProfileUrl }= useUser();
  const selectedProfile = getCurrentProfileUrl();

  useEffect(() => {
    if(!currentAddress) {
      router.push('/');
    }
  }, [currentAddress, router]);

  if(!getEnvBool(Doppler.NEXT_PUBLIC_ACTIVITY_PAGE_ENABLED)){
    return <NotFoundPage />;
  }

  return (
    <ProfileContextProvider
      key={selectedProfile}
      profileURI={selectedProfile}
    >
      <ActivityPage />
    </ProfileContextProvider>
  );
}

Activity.getLayout = function getLayout(page) {
  return (
    <DefaultLayout>
      { page }
    </DefaultLayout>
  );
};