import LoaderPageFallback from 'components/elements/Loader/LoaderPageFallback';
import { NullState } from 'components/elements/NullState';
import { MintedProfile } from 'components/modules/Profile/MintedProfile';
import { ProfileContextProvider } from 'components/modules/Profile/ProfileContext';
import { UnmintedOrUnavailableProfile } from 'components/modules/Profile/UnmintedOrUnavailableProfile';
import { PROFILE_URI_LENGTH_LIMIT } from 'constants/misc';
import { useProfileTokenQuery } from 'graphql/hooks/useProfileTokenQuery';
import { useProfileBlocked } from 'hooks/useProfileBlocked';
import { useProfileTokenOwner } from 'hooks/userProfileTokenOwner';

import dynamic from 'next/dynamic';
import { useCallback } from 'react';

export interface ProfilePageProps {
  uri: string | string[];
}

const DynamicMintSuccessModal = dynamic(import('components/modules/ProfileFactory/MintSuccessModal'));

/**
 * Shows a public profile e.g. nft.com/satoshi
 */
export default function ProfilePage(props: ProfilePageProps) {
  const processedProfileURI = props?.uri?.toString().toLowerCase();

  const { profileTokenId, loading: loadingId } = useProfileTokenQuery(
    processedProfileURI,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 0,
    }
  );
  const { profileOwner, loading: loadingOwner } = useProfileTokenOwner(
    profileTokenId,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 0,
    }
  );
  const { blocked: currentURIBlocked } = useProfileBlocked(processedProfileURI, false);

  const getPageContent = useCallback(() => {
    const validReg = /^[a-z0-9_]*$/;
    if (
      processedProfileURI === null ||
      processedProfileURI === undefined ||
      !validReg.test(processedProfileURI as string ?? '-') ||
      processedProfileURI.length > PROFILE_URI_LENGTH_LIMIT
    ) {
      return <div className="flex flex-col h-full w-full items-center justify-center bg-pagebg">
        <NullState
          showImage={true}
          primaryMessage='Looking for a NFT.com profile?'
          secondaryMessage={'Return to NFT.com'}
          buttonLabel={'Go to NFT.com'}
          href='/'
        />
      </div>;
    } else if (loadingId || loadingOwner) {
      return <LoaderPageFallback />;
    } else if (currentURIBlocked || profileTokenId == null) {
      return <UnmintedOrUnavailableProfile
        notAvailable={currentURIBlocked}
        profileURI={processedProfileURI}
      />;
    } else {
      return (
        <ProfileContextProvider
          key={processedProfileURI}
          profileURI={processedProfileURI}
        >
          <MintedProfile
            key={processedProfileURI}
            profileURI={processedProfileURI}
            addressOwner={profileOwner}
          />
          <DynamicMintSuccessModal />
        </ProfileContextProvider>
      );
    }
  }, [
    currentURIBlocked,
    loadingId,
    loadingOwner,
    processedProfileURI,
    profileOwner,
    profileTokenId
  ]);

  return getPageContent();
}
