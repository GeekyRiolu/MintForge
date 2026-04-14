/* eslint-disable @next/next/no-img-element */
import BlurImage from 'components/elements/BlurImage';
import CustomTooltip from 'components/elements/CustomTooltip';
import Loader from 'components/elements/Loader/Loader';
import { BannerWrapper } from 'components/modules/Profile/BannerWrapper';
import { AddressTupleStructOutput } from 'constants/typechain/Nft_resolver';
import { ProfileViewType } from 'graphql/generated/types';
import { useAssociatedCollectionForProfile } from 'graphql/hooks/useAssociatedCollectionForProfileQuery';
import { useIsProfileCustomized } from 'graphql/hooks/useIsProfileCustomized';
import { useProfileQuery } from 'graphql/hooks/useProfileQuery';
import { useUpdateProfileMutation } from 'graphql/hooks/useUpdateProfileMutation';
import { useAllContracts } from 'hooks/contracts/useAllContracts';
import { useUser } from 'hooks/state/useUser';
import { useDefaultChainId } from 'hooks/useDefaultChainId';
import { useIsOwnerAndSignedIn } from 'hooks/useIsOwnerAndSignedIn';
import { useOwnedGenesisKeyTokens } from 'hooks/useOwnedGenesisKeyTokens';
import { Doppler, getEnvBool } from 'utils/env';
import { isNullOrEmpty } from 'utils/format';
import { getEtherscanLink, sameAddress, shortenAddress } from 'utils/helpers';
import { cl } from 'utils/tw';

import { ClaimProfileCard } from './ClaimProfileCard';
import { LinksToSection } from './LinksToSection';
import { MintedProfileGallery } from './MintedProfileGallery';
import { MintedProfileInfo } from './MintedProfileInfo';
import OnboardingModal from './Onboarding/OnboardingModal';
import { ProfileContext } from './ProfileContext';
import { ProfileScrollContextProvider } from './ProfileScrollContext';

import { BigNumber } from 'ethers';
import dynamic from 'next/dynamic';
import cameraIcon from 'public/camera.webp';
import CameraIconEdit from 'public/icons/camera_icon.svg?svgr';
import { useCallback, useContext, useMemo, useState } from 'react';
import { isMobile } from 'react-device-detect';
import Dropzone from 'react-dropzone';
import useSWR from 'swr';
import { useAccount, useNetwork } from 'wagmi';

const Collection = dynamic(() => import('components/modules/Collection/Collection').then(mod => mod.Collection));
const CollectionBanner = dynamic(() => import('components/modules/Collection/Collection').then(mod => mod.CollectionBanner));
const CollectionBody = dynamic(() => import('components/modules/Collection/Collection').then(mod => mod.CollectionBody));
const CollectionDescription = dynamic(() => import('components/modules/Collection/Collection').then(mod => mod.CollectionDescription));
const CollectionDetails = dynamic(() => import('components/modules/Collection/Collection').then(mod => mod.CollectionDetails));
const CollectionHeader = dynamic(() => import('components/modules/Collection/Collection').then(mod => mod.CollectionHeader));

export interface MintedProfileProps {
  profileURI: string;
  addressOwner?: string;
}

export function MintedProfile(props: MintedProfileProps) {
  const { profileURI, addressOwner } = props;
  const defaultChainId = useDefaultChainId();
  const {
    editMode,
    saving,
    draftProfileImg,
    draftHeaderImg,
    setDraftHeaderImg,
    setDraftProfileImg,
    userIsAdmin,
    publiclyVisibleNftsNoEdit,
    loading,
    debouncedSearchQuery,
  } = useContext(ProfileContext);
  const { address: currentAddress } = useAccount();
  const { chain } = useNetwork();
  const { profileData, mutate: mutateProfile } = useProfileQuery(profileURI);
  const { updateProfile } = useUpdateProfileMutation();
  const { user } = useUser();
  const { data: profileCustomizationStatus } = useIsProfileCustomized(user?.currentProfileUrl, defaultChainId.toString());
  const { nftResolver } = useAllContracts();
  const isOwnerAndSignedIn = useIsOwnerAndSignedIn(profileURI);
  const showNftGrid = useMemo(() => (userIsAdmin && editMode && !loading) || (!loading && publiclyVisibleNftsNoEdit && publiclyVisibleNftsNoEdit?.length > 0), [userIsAdmin, editMode, loading, publiclyVisibleNftsNoEdit]);

  const [hideModal, setHideModal] = useState(false);

  const fetchAssociatedContract = useCallback(async () => {
    if (profileData?.profile?.profileView !== ProfileViewType.Collection) {
      return null;
    }
    if (Doppler.NEXT_PUBLIC_OFFCHAIN_ASSOCIATION_ENABLED && profileData?.profile?.associatedContract) {
      return { cid: parseInt(defaultChainId), chainAddr: profileData.profile.associatedContract };
    }
    return await nftResolver.associatedContract(profileURI).catch(() => null);
  }, [defaultChainId, nftResolver, profileData?.profile, profileURI]);

  const fetchAssociatedAddress = useCallback(async () => {
    if (profileData?.profile?.profileView !== ProfileViewType.Collection) {
      return null;
    }
    return await nftResolver.associatedAddresses(profileURI).catch(() => null);
  }, [nftResolver, profileData?.profile?.profileView, profileURI]);

  const { data: associatedContract } = useSWR<AddressTupleStructOutput>(
    'AssociatedCollection' + profileURI + profileData?.profile?.profileView,
    fetchAssociatedContract
  );
  const { data: associatedAddresses } = useSWR<AddressTupleStructOutput[]>(
    'AssociatedAddresses' + profileURI + profileData?.profile?.profileView,
    fetchAssociatedAddress
  );
  const { data: associatedCollectionWithDeployer } = useAssociatedCollectionForProfile(profileURI);

  const { data: ownedGKTokens } = useOwnedGenesisKeyTokens(currentAddress);

  const onDropProfile = (files: Array<any>) => {
    if (files.length > 1) {
      alert('only 1 picture is allowed at a time');
    } else {
      setDraftProfileImg({
        preview: URL.createObjectURL(files[0]),
        raw: files[0],
      });
    }
  };

  const onDropHeader = (files: Array<any>) => {
    if (files.length > 1) {
      alert('only 1 picture is allowed at a time');
    } else {
      setDraftHeaderImg({
        preview: URL.createObjectURL(files[0]),
        raw: files[0],
      });
    }
  };
  if (
    associatedContract?.chainAddr?.length &&
    (Doppler.NEXT_PUBLIC_OFFCHAIN_ASSOCIATION_ENABLED ||
    (associatedAddresses?.find(addr => sameAddress(addr?.chainAddr, associatedCollectionWithDeployer?.deployer)) || sameAddress(profileData?.profile?.owner?.address, associatedCollectionWithDeployer?.deployer)))
  ) {
    return <div className='w-full h-max'>
      <Collection contract={associatedContract?.chainAddr}>
        <CollectionBanner />
        <CollectionHeader>
          <CollectionDescription />
          <CollectionDetails />
        </CollectionHeader>
        <CollectionBody />
      </Collection>
    </div>;
  }

  const onHideCustomization = () => {
    updateProfile({
      id: profileData?.profile?.id,
      hideCustomization: true
    });
    mutateProfile();
    setHideModal(true);
  };

  return (
    <>
      <div className={cl(
        'w-full group',
        'min-h-screen')}>
        <ProfileScrollContextProvider>
          <div className='w-full group'>          <BannerWrapper
            alt={`${profileData?.profile?.url} profile banner image`}
            draft={!isNullOrEmpty(draftHeaderImg?.preview)}
            imageOverride={
              editMode ?
                (isNullOrEmpty(draftHeaderImg?.preview) ?
                  profileData?.profile?.bannerURL :
                  draftHeaderImg?.preview) :
                profileData?.profile?.bannerURL
            }
            loading={saving}
          >
            <div className='w-full h-full'>
              <Dropzone
                disabled={!userIsAdmin}
                accept={'image/*'['.*']}
                onDrop={files => {
                  if (userIsAdmin) {
                    onDropHeader(files);
                  }
                }}
              >
                {({ getRootProps, getInputProps, open }) => (
                  <section>
                    <div {...getRootProps()} style={{ outline: 'none' }}>
                      <input {...getInputProps()} />
                    </div>
                    {editMode && isOwnerAndSignedIn && !saving && <div
                      onClick={open}
                      className='group-hover:cursor-pointer'
                    >
                      <div className='absolute inset-0 bg-black opacity-50'></div>
                      <div className='w-10 h-10 absolute left-0 right-0 mx-auto top-0 bottom-0 my-auto'>
                        <CustomTooltip
                          orientation='top'
                          tooltipComponent={
                            <div
                              className="w-max"
                            >
                              <p>Upload a new banner image</p>
                            </div>
                          }
                        >
                          <CameraIconEdit />
                        </CustomTooltip>
                      </div>
                    </div>}
                  </section>
                )}
              </Dropzone>
            </div>
          </BannerWrapper>
          </div>
          <div className={cl(
            'flex-col',
            'max-w-[1400px] min-w-[60%] minxl:w-full',
            isMobile ? 'mx-2' : 'mx-2 minmd:mx-8 minxl:mx-auto',
          )}>
            <div
              className={cl(
                'flex justify-start items-start',
                'flex-col'
              )}
              style={{
                zIndex: 103,
              }}
            >
              <div className="block minmd:flex items-end">
                <Dropzone
                  accept={'image/*'['.*']}
                  disabled={!userIsAdmin && !editMode || !editMode}
                  onDrop={files => {
                    if (userIsAdmin) onDropProfile(files);
                  }}
                >
                  {({ getRootProps, getInputProps }) => (
                    <div {...getRootProps()} className={cl(
                      'relative outline-none',
                      userIsAdmin ? '' : 'cursor-default',
                      'w-[88px] h-[88px] minlg:w-[120px] minlg:h-[120px] minlg:ml-20',
                    )}>
                      <input {...getInputProps()} />
                      {saving && <div
                        style={{ zIndex: 102 }}
                        className={cl(
                          'bg-white/10 mt-[-45px] minlg:mt-[-60px] ml-6 minlg:ml-0 absolute shadow-md',
                          'rounded-full absolute flex ',
                          'items-center justify-center h-full w-full',
                        )}
                      >
                        <Loader />
                      </div>}

                      <div
                        className={cl(
                          'object-center',
                          'h-full w-full group',
                          'shrink-0 aspect-square',
                          editMode && 'hover:cursor-pointer',
                          isOwnerAndSignedIn && editMode ? 'hover:cursor-pointer' : '',
                          'box-border border-[5px] border-white rounded-full',
                          'mt-[-45px] minlg:mt-[-60px] ml-6 minlg:ml-0 absolute shadow-md'
                        )}
                      >
                        {editMode && !saving && isOwnerAndSignedIn && <div
                          style={{ zIndex: 102, }}
                          className={cl(
                            'absolute -top-[5px] -bottom-[5px] -right-[5px] -left-[5px] rounded-full'
                          )}
                        >
                          <div className='bg-black opacity-50 absolute top-0 bottom-0 right-0 left-0 rounded-full'></div>
                          <div className='w-[28px] h-[28px] absolute left-0 right-0 mx-auto top-0 bottom-0 my-auto'>
                            <CustomTooltip
                              orientation='top'
                              tooltipComponent={
                                <div
                                  className="rounded-xl w-max"
                                >
                                  <p>Update your profile image</p>
                                </div>
                              }
                            >
                              <CameraIconEdit />
                            </CustomTooltip>
                          </div>
                        </div>}

                        <BlurImage
                          src={
                            !isNullOrEmpty(draftProfileImg?.preview)
                              ? draftProfileImg?.preview
                              : profileData?.profile?.photoURL ??
                            (!getEnvBool(Doppler.NEXT_PUBLIC_ANALYTICS_ENABLED)
                              ? 'https://cdn.nft.com/profile-image-default.svg' :
                              cameraIcon.src)
                          }
                          priority
                          fill
                          alt="profilePicture"
                          draggable={false}
                          className={cl(
                            'rounded-full object-cover',
                          )}
                          style={{ zIndex: 101, overflow: 'hidden' }}
                        />
                      </div>
                    </div>
                  )}
                </Dropzone>
              </div>
              <MintedProfileInfo
                userIsAdmin={userIsAdmin}
                profileURI={profileURI}
              />
            </div>
            <div
              className={cl(
                'h-full',
                'mt-5 minmd:mt-0',
                'mt-6',
                'w-full justify-start space-y-4 flex flex-col',
                'flex'
              )}
            >
              {user?.currentProfileUrl === props.profileURI && profileCustomizationStatus && !profileCustomizationStatus?.isProfileCustomized &&
              <div className='block minlg:hidden mt-2 px-2'>
                <ClaimProfileCard />
              </div>
              }

              {
                showNftGrid ?
                  <MintedProfileGallery
                    profileURI={profileURI}
                    ownedGKTokens={ownedGKTokens?.map(token => BigNumber.from(token?.id?.tokenId ?? 0).toNumber())}
                  /> :
                  loading
                    ?
                    <div className='min-h-[25rem] text-primary-txt flex flex-col items-center justify-center'>
                      <div className="mb-2">Loading...</div>
                      <Loader />
                    </div>
                    :
                    <>
                      <div className={cl(
                        'text-primary-txt dark:text-primary-txt-dk w-full flex justify-center flex-col mt-4',
                        addressOwner !== currentAddress ? 'cursor-pointer ' : ''
                      )}
                      >
                        <div className="mx-auto text-base minlg:text-lg minxl:text-xl w-3/5 text-center minlg:text-left font-bold">
                          {isNullOrEmpty(debouncedSearchQuery) && <div
                            onClick={() => {
                              if (addressOwner !== currentAddress) {
                                window.open(
                                  getEtherscanLink(chain?.id, addressOwner, 'address'),
                                  '_blank'
                                );
                              }
                            }}
                            className="text-sm minxl:text-lg text-center font-bold"
                          >
                            {addressOwner === currentAddress ? 'You own this profile.' : 'This profile is owned by ' + shortenAddress(addressOwner)}
                          </div>
                          }
                        </div>

                        <div className="mx-auto text-primary-txt dark:text-primary-txt-dk w-full flex justify-center flex-col">
                          {isNullOrEmpty(debouncedSearchQuery) ?
                            <div className="text-sm minxl:text-lg mb-8 minlg:mb-0 mt-8 w-full text-center">
                              {addressOwner === currentAddress ?
                                <p className='mx-8'>
                                As we roll out new features, you can return here for the latest NFT.com news, discover{' '}
                                other minted Genesis Keys and profiles in our community, and more.{' '}
                                We have so much in store!
                                </p>
                                :
                                <p className='mx-8'>
                                Do you want your own NFT.com Profile?<br />
                                Learn how to claim a profile for your own by visiting either NFT.com or our Support knowledge base.
                                </p>
                              }
                            </div> :
                            <div className="text-sm minxl:text-lg mb-8 minlg:mb-0 mt-8 w-full text-center">
                              <p className='mx-8'>No NFTs found, please try again.</p>
                            </div>
                          }
                          <div className="mt-10 minxl:mt-24 w-full flex justify-center mb-24 px-4 minmd:px-0">
                            <LinksToSection isAddressOwner={addressOwner === currentAddress} />
                          </div>
                        </div>
                      </div>
                    </>
              }
            </div>
          </div>
        </ProfileScrollContextProvider>
        {addressOwner === currentAddress && user.currentProfileUrl === profileURI && !editMode && !profileData?.profile?.hideCustomization && !hideModal &&
        <OnboardingModal profileURI={profileURI} onClose={onHideCustomization} />
        }
      </div>
    </>
  );
}
