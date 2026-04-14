import { Button, ButtonSize, ButtonType } from 'components/elements/Button';
import ClientOnly from 'components/elements/ClientOnly';
import CustomTooltip from 'components/elements/CustomTooltip';
import { DropdownPickerModal } from 'components/elements/DropdownPickerModal';
import { ProfileLayoutType } from 'graphql/generated/types';
import { useMyNFTsQuery } from 'graphql/hooks/useMyNFTsQuery';
import { useProfileNFTsQuery } from 'graphql/hooks/useProfileNFTsQuery';
import { useProfileQuery } from 'graphql/hooks/useProfileQuery';
import useCopyClipboard from 'hooks/useCopyClipboard';
import { useOutsideClickAlerter } from 'hooks/useOutsideClickAlerter';
import { Doppler, getEnv, getEnvBool } from 'utils/env';
import { filterNulls } from 'utils/format';
import { getBaseUrl } from 'utils/isEnv';
import { tw } from 'utils/tw';

import { useProfileContext } from './ProfileContext';

import { SearchIcon } from '@heroicons/react/outline';
import delay from 'delay';
import { useRouter } from 'next/router';
import { ArrowClockwise, Check } from 'phosphor-react';
import { ShareNetwork, TwitterLogo, X } from 'phosphor-react';
import LinkIcon from 'public/icons/icon_link.svg?svgr';
import FeaturedIcon from 'public/icons/layout_icon_featured.svg?svgr';
import GridIcon from 'public/icons/layout_icon_grid.svg?svgr';
import MosaicIcon from 'public/icons/layout_icon_mosaic.svg?svgr';
import SpotlightIcon from 'public/icons/layout_icon_spotlight.svg?svgr';
import GearIcon from 'public/icons/settings_icon.svg?svgr';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAccount, useNetwork } from 'wagmi';

export interface ProfileMenuProps {
  profileURI: string;
}

export function ProfileMenu({ profileURI }: ProfileMenuProps) {
  const { address: currentAddress } = useAccount();
  const router = useRouter();
  const [, staticCopy] = useCopyClipboard();
  const { profileData, mutate: mutateProfileData } = useProfileQuery(profileURI);
  const [selectedLayout, setSelectedLayout] = useState(null);
  const [showDescriptions, setShowDescriptions] = useState(null);
  const [searchVisible, setSearchVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const inputRef = useRef();
  const { chain } = useNetwork();

  useOutsideClickAlerter(inputRef, () => {
    searchQuery === '' && setSearchVisible(false);
  });

  const {
    setEditMode,
    setLayoutType,
    setDescriptionsVisible,
    searchQuery,
    setSearchQuery,
    editMode,
    saveProfile,
    draftProfileImg,
    draftHeaderImg,
    draftBio,
    clearDrafts,
    draftNftsDescriptionsVisible,
    setDraftNftsDescriptionsVisible,
    userIsAdmin,
    publicProfileLoadCount
  } = useProfileContext();

  const {
    mutate: mutatePublicProfileNfts,
  } = useProfileNFTsQuery({
    profileId: profileData?.profile?.id,
    chainId: String(chain?.id || getEnv(Doppler.NEXT_PUBLIC_CHAIN_ID)),
    first: publicProfileLoadCount
  });

  const {
    mutate: mutateAllOwnerNfts,
  } = useMyNFTsQuery({ first: 8, profileId: profileData?.profile?.id, query: '', invalidateCache: true });

  const setLayout = useCallback((type: ProfileLayoutType) => {
    setSelectedLayout(type);
    setLayoutType(type);
  }, [setLayoutType]);

  const setDescriptions = useCallback((isVisible: boolean) => {
    setShowDescriptions(isVisible);
    setDescriptionsVisible(isVisible);
    setDraftNftsDescriptionsVisible(isVisible);
  }, [setDescriptionsVisible, setDraftNftsDescriptionsVisible]);

  useEffect(() => {
    setSelectedLayout(profileData?.profile?.layoutType);
    setShowDescriptions(profileData?.profile?.nftsDescriptionsVisible || profileData?.profile?.nftsDescriptionsVisible === null ? true : false);
  }, [profileData]);

  const layoutOptions = [
    {
      name: 'Default',
      label: '',
      onSelect: () => setLayout(ProfileLayoutType.Default),
      icon: <GridIcon className={tw(
        'w-[18px] h-[18px] minlg:w-5 minlg:h-5'
      )} />
    },
    {
      name: 'Featured',
      label: '',
      onSelect: () => setLayout(ProfileLayoutType.Featured),
      icon: <FeaturedIcon className={tw(
        'w-[15px] h-[15px]'
      )} />
    },
    {
      name: 'Mosaic',
      label: '',
      onSelect: () => setLayout(ProfileLayoutType.Mosaic),
      icon: <MosaicIcon className={tw(
        'w-[18px] h-[18px] minlg:w-5 minlg:h-5'
      )} />
    },
    {
      name: 'Spotlight',
      label: '',
      onSelect: () => setLayout(ProfileLayoutType.Spotlight),
      icon: <SpotlightIcon className={tw(
        'w-[18px] h-[18px] minlg:w-5 minlg:h-5'
      )} />
    }
  ];

  return (
    <div className='w-full flex justify-end items-center mt-5 minlg:mt-0 font-noi-grotesk'>
      <div ref={inputRef} className={tw(
        'flex flex-row border-[#ECECEC] rounded-full justify-center items-center',
        'focus-within:border focus-within:border-[#F9D54C] focus-within:ring-1 focus-within:ring-[#F9D54C] ',
        searchVisible && !editMode ? 'w-full minlg:w-[320px] minlg:max-w-[320px] p-[10px] border-[1.3px] transition-[width] h-10 minlg:h-12' : 'w-0 p-0 border-0'
      )}>
        <input
          type="text"
          placeholder={userIsAdmin ? 'Search your NFTs..' : 'Search NFTs...'}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          maxLength={512}
          className={tw(
            'w-full text-black placeholder:text-black bg-inherit border-0 rounded-full py-0 pr-0 pl-2',
            'focus:border-0 focus:ring-0 focus:placeholder:text-[#B2B2B2]',
            'h-10 minlg:h-12'
          )}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        <X color='black'
          className='hover:cursor-pointer'
          onClick={() => {
            setSearchVisible(false);
            setSearchQuery('');
          }} />
      </div>

      <div className={tw(
        'flex flex-row items-center space-x-1 minlg:space-x-3',
        searchVisible && 'hidden minlg:flex',
      )}>
        {!editMode &&
          <div onClick={() => setSearchVisible(true)} className={tw(
            'w-10 h-10 minlg:w-12 minlg:h-12 rounded-full px-2.5 minlg:px-3.5',
            'flex justify-center items-center border border-[#ECECEC] hover:cursor-pointer',
            searchVisible && 'minlg:hidden'
          )}>
            <SearchIcon className='font-medium h-[18px] minlg:h-5' color='#0F0F0F' />
          </div>
        }
        {userIsAdmin && <CustomTooltip
          orientation='custom'
          customFullLeftPosition='left-6'
          hidden={false}
          tooltipComponent={
            <div
              className="rounded-xl max-w-[200px] w-max cursor-pointer"
            >
              <p>Refresh Profile NFTs</p>
            </div>
          }
        >
          <div
            onClick={() => {
              setLoading(true);
              mutateProfileData();
              mutatePublicProfileNfts();
              mutateAllOwnerNfts();

              (async () => {
                await delay(2000);
                setLoading(false);
                setSuccess(true);
                await delay(1500);
                setSuccess(false);
              })();
            }}
            className={tw(
              'w-10 h-10 minlg:w-12 minlg:h-12 rounded-full px-2.5 minlg:px-3.5',
              'flex justify-center items-center border border-[#ECECEC] hover:cursor-pointer',
              loading ? 'animate-spin' : null,
              success ? 'bg-[#26AA73]' : null
            )}
            id="profileRefreshNftButton">
            {success ?
              <Check className='font-medium text-white bg-[#26AA73] h-[18px] minlg:h-5' /> :
              <ArrowClockwise className='font-medium h-[18px] minlg:h-5' color='#0F0F0F' />
            }
          </div>
        </CustomTooltip>}
        {userIsAdmin &&
          <>
            {getEnvBool(Doppler.NEXT_PUBLIC_MOSAIC_LAYOUT_ENABLED) &&
              <DropdownPickerModal
                pointer
                align='center'
                constrain
                stopMobileModal
                disableMinWidth
                disablePadding
                selectedIndex={selectedLayout ? layoutOptions.findIndex(item => item.name === selectedLayout) : 0}
                options={layoutOptions}
              >
                <div className='w-10 h-10 minlg:w-12 minlg:h-12 rounded-full flex justify-center items-center border border-[#ECECEC] hover:cursor-pointer'>
                  {selectedLayout ? layoutOptions.filter(item => item?.name === selectedLayout)[0]?.icon : layoutOptions[0]?.icon}
                </div>
              </DropdownPickerModal>
            }

            <DropdownPickerModal
              pointer
              constrain
              stopMobileModal
              disableMinWidth
              disablePadding
              align='center'
              selectedIndex={0}
              options={filterNulls([
                {
                  label: 'Settings',
                  onSelect: () => router.push('/app/settings'),
                  icon: null
                },
                !editMode &&
                {
                  label: 'Edit Profile',
                  onSelect: () => setEditMode(true),
                  icon: null,
                  closeModalOnClick: true
                },
                {
                  label: `${showDescriptions ? 'Hide' : 'Show'} Descriptions`,
                  onSelect: editMode ? () => setDraftNftsDescriptionsVisible(!draftNftsDescriptionsVisible) : () => setDescriptions(!showDescriptions),
                  icon: null,
                }
              ])
              }>
              <div className='w-10 h-10 minlg:w-12 minlg:h-12 rounded-full flex justify-center items-center border border-[#ECECEC] hover:cursor-pointer'>
                <GearIcon className={tw(
                  'w-[18px] h-[18px] minlg:h-5 minlg:w-5'
                )} />
              </div>
            </DropdownPickerModal>

            {editMode && userIsAdmin &&
              <div className='fixed minlg:relative bottom-0 left-0 bg-white minlg:bg-transparent flex w-full py-5 px-3 space-x-4 shadow-[0_-16px_32px_rgba(0,0,0,0.08)] minlg:shadow-none z-50'
              >
                <ClientOnly>
                  <Button
                    label='Save changes'
                    type={ButtonType.PRIMARY}
                    size={ButtonSize.LARGE}
                    extraClasses="whitespace-nowrap"
                    onClick={() => {
                      gtag('event', 'Update Profile', {
                        ethereumAddress: currentAddress,
                        profile: profileURI,
                        newProfile: draftProfileImg?.preview ? true : false,
                        newHeader: draftHeaderImg?.preview ? true : false,
                        newDescription: draftBio,
                      });

                      saveProfile();
                      setTimeout(() => {
                        setEditMode(false);
                      }, 3000);
                    }}
                  />
                </ClientOnly>
                <Button
                  label='Cancel'
                  type={ButtonType.SECONDARY}
                  size={ButtonSize.LARGE}
                  onClick={clearDrafts}
                />
              </div>
            }
          </>
        }
        {(!editMode || editMode && !userIsAdmin) &&
          <DropdownPickerModal
            pointer
            constrain
            stopMobileModal
            disableMinWidth
            disablePadding
            align='right'
            selectedIndex={0}
            options={[
              {
                label: 'Copy link to clipboard',
                onSelect: () => staticCopy(`${getBaseUrl()}${router.query?.profileURI}`),
                icon: <LinkIcon className={tw(
                  'w-[18px] h-[18px] mr-3'
                )} />
              },
              {
                label: 'Share via Twitter',
                onSelect: () => window.open('https://twitter.com/share?url=' + `https://www.nft.com/${profileURI}` + `&text=NFT.com Profile for ${profileURI}`, '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=300,width=600'),
                icon: <TwitterLogo size={18} className='mr-3' color='#1DA1F2' weight="fill" />
              },
            ]
            }>
            <div className='w-[102px] h-10 minlg:h-12 rounded-full flex items-center px-4 text-sm font-medium border border-[#ECECEC] hover:cursor-pointer'>
              <ShareNetwork size={15} className='mr-1' weight='bold' /> SHARE
            </div>
          </DropdownPickerModal>
        }
      </div>
    </div>
  );
}
