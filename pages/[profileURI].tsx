import LoaderPageFallback from 'components/elements/Loader/LoaderPageFallback';
import DefaultLayout from 'components/layouts/DefaultLayout';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const ProfilePage = dynamic(import('components/modules/Profile/ProfilePage'), { loading: () => <LoaderPageFallback /> });
/**
 * Shows a public profile e.g. nft.com/satoshi
 */
export default function ProfileURI() {
  const router = useRouter();
  const { profileURI } = router.query;

  useEffect(() => {
    const URI = profileURI?.toString();
    if (profileURI !== URI?.toLowerCase()) {
      router.push(URI?.toLowerCase());
    }
  }, [router, profileURI]);

  if (profileURI?.toString()?.toLowerCase() == 'you') router.push('/app/mint-profiles');

  if (profileURI === null || profileURI === undefined || profileURI?.toString()?.toLowerCase() == 'you') {
    return <LoaderPageFallback />;
  } else {
    return (
      <ProfilePage uri={profileURI} />
    );
  }
}

ProfileURI.getLayout = function getLayout(page) {
  return (
    <DefaultLayout>
      {page}
    </DefaultLayout>
  );
};
