import CustomTooltip from 'components/elements/CustomTooltip';
import LikeCount from 'components/elements/LikeCount';
import { LikeableType } from 'graphql/generated/types';
import { useNftLikeQuery } from 'graphql/hooks/useNFTLikeQuery';
import { useProfileQuery } from 'graphql/hooks/useProfileQuery';
import { useAllContracts } from 'hooks/contracts/useAllContracts';
import { useUser } from 'hooks/state/useUser';
import { tw } from 'utils/tw';

import { ProfileContext } from './ProfileContext';
import { ProfileMenu } from './ProfileMenu';

import GK from 'public/icons/Badge_Key.svg?svgr';
import { useContext } from 'react';

export interface MintedProfileInfoProps {
  profileURI: string;
  userIsAdmin: boolean;
}

export function MintedProfileInfo(props: MintedProfileInfoProps) {
  const { profileURI, userIsAdmin } = props;
  const { user } = useUser();
  const { profileData } = useProfileQuery(profileURI);
  const { nftProfile } = useAllContracts();
  const { data: profileLikeData, mutate: mutateProfileLikeData } = useNftLikeQuery(nftProfile.address, profileData?.profile?.tokenId);
  const {
    editMode,
    draftBio,
    setDraftBio,
    draftGkIconVisible,
  } = useContext(ProfileContext);

  const isOwnerAndSignedIn = userIsAdmin && user?.currentProfileUrl === props.profileURI;

  const handleBioChange = (event) => {
    let bioValue = event.target.value;
    if(bioValue.length === 0) {
      bioValue = '';
    }
    setDraftBio(bioValue);
  };
  return (
    <div className={tw(
      'flex flex-col w-full text-primary-txt dark:text-primary-txt-dk',
      'mt-[-25px] minlg:mt-[-50px] px-4 minlg:px-20 font-noi-grotesk minlg:mb-12'
    )}
    >
      <div className={tw('flex w-full items-center',
        `${editMode && (draftGkIconVisible ?? profileData?.profile?.gkIconVisible) ? '' : ''}`,
        'justify-start minlg:justify-between minlg:mt-3'
      )}>
        <div className='flex items-end'>
          <div
            id="MintedProfileNameContainer"
            className={tw(
              'text-primary-txt dark:text-primary-txt-dk text-center minlg:text-left minmd:mt-4 flex items-center space-x-2'
            )}>
            <div className='font-bold text-lg minlg:text-[44px] minlg:font-medium'>
              <span className='bg-gradient-to-r from-[#FF9B37] to-[#FAC213] text-transparent bg-clip-text text-2xl minlg:text-[40px] mr-1'>/</span>
              {profileURI}
            </div>
            {profileData?.profile?.isGKMinted &&
            <div className='h-5 w-5 minlg:h-7 minlg:w-7 ml-2'>
              <GK />
            </div>
            }
            <LikeCount
              count={profileLikeData?.likeCount}
              isLiked={profileLikeData?.isLikedBy}
              mutate={mutateProfileLikeData}
              likeData={{
                id: profileData?.profile?.id,
                type: LikeableType.Profile,
                profileName: profileData?.profile?.url
              }}
            />
          </div>
        </div>

        <div className='hidden minlg:block'>
          <ProfileMenu profileURI={profileURI} />
        </div>
      </div>

      {profileData?.profile?.description && !editMode && isOwnerAndSignedIn &&
        <div className="w-full minlg:w-1/2 flex items-end flex-col text-[#6A6A6A]">
          <div className={tw(
            'py-1 px-2 -ml-1 m-2 text-[#6A6A6A] break-words w-full'
          )}
          >
            {profileData?.profile?.description}
          </div>
        </div>
      }

      {profileData?.profile?.description && !isOwnerAndSignedIn && !editMode&&
        <div className="w-full minlg:w-1/2 flex items-start flex-col text-[#6A6A6A]">
          <div className={tw(
            'py-1 px-2 -ml-1 m-2 text-[#6A6A6A] break-words',
          )}
          >
            {profileData?.profile?.description}
          </div>
        </div>
      }

      {editMode && userIsAdmin &&
        <div className={tw(
          'w-full minlg:w-1/2 flex flex-col text-[#6A6A6A] group',
          'items-start'
        )}
        >
          <CustomTooltip
            orientation='top'
            useFullWidth
            tooltipComponent={
              <div
                className="w-max"
              >
                <p>Update your bio</p>
              </div>
            }
          >
            <textarea
              className={tw(
                'w-full resize-none',
                'text-left py-1 px-2 -ml-1 m-2 rounded-xl h-32',
                'mt-3 text-[#6A6A6A] border-2 border-[#ECECEC]',
                'hover:outline-3 focus:border-[#F9D54C] focus:ring-0 hover:cursor-pointer focus:cursor-auto'
              )}
              maxLength={300}
              placeholder="Enter bio (optional)"
              value={draftBio ?? profileData?.profile?.description ?? ''}
              onChange={e => {
                handleBioChange(e);
              }}
            />
          </CustomTooltip>
          <div className="text-sm font-medium text-gray-900 dark:text-white w-full flex space-x-2">
            <span className='hidden group-focus-within:block text-[#E4BA18]'>Brief description for your profile.</span><p>{draftBio ? 300 - draftBio.length : '0' } / 300</p>
          </div>
        </div>
      }

      <div className='block minlg:hidden'>
        <ProfileMenu profileURI={profileURI} />
      </div>
    </div>
  );
}
