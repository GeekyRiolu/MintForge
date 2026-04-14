import 'react-toastify/dist/ReactToastify.css';

import { Button, ButtonSize, ButtonType } from 'components/elements/Button';
import { Modal } from 'components/elements/Modal';
import Toast from 'components/elements/Toast';
import { SidebarProfileCard } from 'components/modules/Sidebar/SidebarProfileCard';
import { useMyProfilesQuery } from 'graphql/hooks/useMyProfilesQuery';
import { useProfileQuery } from 'graphql/hooks/useProfileQuery';
import { useUpdateWalletProfileIdMutation } from 'graphql/hooks/useUpdateWalletProfileIdMutation';
import { useUser } from 'hooks/state/useUser';
import { useMyNftProfileTokens } from 'hooks/useMyNftProfileTokens';
import { tw } from 'utils/tw';

import Link from 'next/link';
import { XCircle } from 'phosphor-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

type NftOwnerProps = {
  selectedProfile: string;
  isSidebar: boolean;
  showToastOnSuccess: boolean;
}

export default function NftOwner({ selectedProfile, isSidebar, showToastOnSuccess }: NftOwnerProps) {
  const { profileData } = useProfileQuery(selectedProfile);
  const { data: myProfiles } = useMyProfilesQuery();
  const { updateWalletProfileId } = useUpdateWalletProfileIdMutation();
  const { profileTokens: myOwnedProfileTokens } = useMyNftProfileTokens();
  const { getHiddenProfileWithExpiry, setCurrentProfileUrl } = useUser();
  const [visible, setVisible] = useState(false);
  const [allProfiles, setAllProfiles] = useState([]);
  const [profilesToShow, setProfilesToShow] = useState([]);
  const [selected, setSelected] = useState('');

  useEffect(() => {
    if(!profileData?.profile?.owner?.preferredProfile?.url){
      updateWalletProfileId({ profileId: myOwnedProfileTokens[0]?.title }).catch(() => toast.error('Error'));
    }
    if(!isSidebar){
      setSelected(profileData?.profile?.owner?.preferredProfile?.url || myOwnedProfileTokens[0]?.title);
    } else {
      setSelected(selectedProfile);
    }
  }, [profileData, myOwnedProfileTokens, updateWalletProfileId, selectedProfile, isSidebar]);

  useEffect(() => {
    setAllProfiles(myOwnedProfileTokens);
  }, [myOwnedProfileTokens]);

  const sortProfiles = () => {
    const hiddenProfile = getHiddenProfileWithExpiry();
    const hiddenIndex = allProfiles.findIndex((e) => e.title === hiddenProfile);
    if(hiddenIndex !== -1){
      allProfiles.splice(hiddenIndex, 1);
    }

    allProfiles.sort((a, b) => a.title.localeCompare(b.title));
    const index = allProfiles.findIndex((e) => e.title === selected);
    allProfiles.unshift(...allProfiles.splice(index, 1));
    setProfilesToShow(allProfiles.slice(0, 3));
  };

  const searchHandler = (query) => {
    setAllProfiles(allProfiles.filter((item) => item?.title?.toLowerCase().includes(query)));
    setProfilesToShow(allProfiles.slice(0, 3));
    if(!allProfiles.length ){
      setAllProfiles(myOwnedProfileTokens.filter((item) => item?.title?.toLowerCase().includes(query)));
    }
    if(query === ''){
      setAllProfiles(myOwnedProfileTokens);
    }
  };

  useEffect(() => {
    setProfilesToShow(allProfiles.slice(0, 3));
  }, [allProfiles]);

  const LoadMoreHandler = () => {
    const currentLength = profilesToShow.length;
    const nextProfiles = allProfiles.slice(currentLength, currentLength + 3);
    setProfilesToShow([...profilesToShow, ...nextProfiles]);
  };

  const updateOwnerProfile = (profileTitle) => {
    setSelected(profileTitle);
    if(isSidebar) {
      setCurrentProfileUrl(profileTitle);
      setVisible(false);
    } else {
      const profileId = myProfiles?.myProfiles?.items?.find((profile) => profile.url === profileTitle)?.id;
      updateWalletProfileId({ profileId: profileId }).then(() => {
        toast.success('Saved!');
      }).catch(() => toast.error('Error'));
    }
  };

  return (
    <div id="owner" className='font-noi-grotesk'>
      {showToastOnSuccess && <Toast />}
      {!isSidebar &&
      <>
        <h2 className='text-black mb-2 font-bold text-2xl tracking-wide'>Select Primary NFT Profile</h2>
        <p className='mb-4 text-[#6F6F6F]'>
          Select the primary NFT Profile you want associated with your Ethereum address. This profile will display as the “owner” for NFTs and collections owned by the address which owns NFT Profile.
        </p>
      </>
      }
      {selected !== '' &&
      <div className={tw(!isSidebar && 'mb-4')}>
        <SidebarProfileCard
          onClick={() => {
            setVisible(true);
            sortProfiles();
          }}
          isSidebar={isSidebar}
          opensModal
          showSwitch={myOwnedProfileTokens && myOwnedProfileTokens.length > 1}
          profile={myOwnedProfileTokens?.find(t => t.title === selected)}
        />
      </div>
      }

      {isSidebar ?
        <Modal
          visible={visible}
          loading={false}
          title={''}
          onClose={() => {
            setVisible(false);
          }}
          hideX
          bgColor='white'
          fullModal
          pure
        >
          <div className='max-w-full minlg:max-w-[458px] h-screen minlg:h-max maxlg:h-max bg-white text-left px-4 pb-10 rounded-none minlg:rounded-[10px] minlg:mt-24 minlg:m-auto'>
            <div className='pt-16 font-noi-grotesk lg:max-w-md max-w-lg m-auto minlg:relative'>
              <div className='absolute top-4 right-4 minlg:right-1 hover:cursor-pointer w-6 h-6 bg-[#F9D963] rounded-full'></div>
              <XCircle onClick={() => setVisible(false)} className='absolute top-3 right-3 minlg:right-0 hover:cursor-pointer' size={32} color="black" weight="fill" />
              <div>
                <h2 className='text-4xl tracking-wide font-bold mb-10'>Switch To Profile</h2>
                <input onChange={event => searchHandler(event.target.value.toLowerCase())} className="shadow appearance-none border rounded-[10px] w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4 border-[#D5D5D5] placeholder:text-sm" id="currentAddress" type="text" placeholder="Profile Name" />
              </div>
              <div className='max-h-[350px] maxlg:max-h-[320px] overflow-auto'>
                <div>
                  {profilesToShow && profilesToShow?.map((profile) => {
                    return (
                      <div className='mb-4' key={profile?.title} >
                        <SidebarProfileCard isSelected={selected === profile.title} message={selected === profile.title && 'Current Profile'} onClick={selected !== profile.title && updateOwnerProfile} profile={profile} />
                      </div>
                    );
                  })}
                </div>

                {!allProfiles.length && <p className='text-[#6F6F6F] mb-4'>No profiles found. Please try again.</p>}

                <Link href='/app/mint-profiles'>
                  <Button
                    type={ButtonType.PRIMARY}
                    size={ButtonSize.LARGE}
                    label='Get a New Profile'
                    onClick={() => null}
                    stretch
                  />
                </Link>

                {allProfiles.length > profilesToShow.length
                  ?
                  (
                    <Button
                      type={ButtonType.PRIMARY}
                      size={ButtonSize.LARGE}
                      label='Load More'
                      onClick={() => LoadMoreHandler()}
                      stretch
                    />
                  )
                  : null
                }
              </div>
            </div>
          </div>
        </Modal>
        :
        <Modal
          visible={visible}
          loading={false}
          title={''}
          onClose={() => {
            setVisible(false);
          }}
          hideX
          bgColor='white'
          fullModal
          pure
        >
          <div className='max-w-full minlg:max-w-[458px] h-screen minlg:h-max maxlg:h-max bg-white text-left px-4 pb-10 rounded-none minlg:rounded-[10px] minlg:mt-24 minlg:m-auto'>
            <div className='pt-16 font-noi-grotesk lg:max-w-md max-w-lg m-auto minlg:relative'>
              <div className='absolute top-4 right-4 minlg:right-1 hover:cursor-pointer w-6 h-6 bg-[#F9D963] rounded-full'></div>
              <XCircle onClick={() => setVisible(false)} className='absolute top-3 right-3 minlg:right-0 hover:cursor-pointer' size={32} color="black" weight="fill" />
              <div>
                <h2 className='text-4xl tracking-wide font-bold mb-10'>
                  Select NFT Profile
                </h2>
                <p className='text-[#6F6F6F] mb-4'>
                  Select the primary NFT Profile you want associated with your Ethereum address. This profile will display as the “owner” for NFTs and collections owned by the address which owns NFT Profile.
                </p>
                <input onChange={event => searchHandler(event.target.value.toLowerCase())} className="shadow appearance-none border rounded-[10px] w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4 border-[#D5D5D5] placeholder:text-sm" id="currentAddress" type="text" placeholder="Profile name" />
              </div>
              <div className='max-h-[350px] maxlg:max-h-[320px] overflow-auto hideScroll'>
                <div>
                  {profilesToShow && profilesToShow?.map((profile) => {
                    return (
                      <div className='mb-4' key={profile?.title} >
                        <SidebarProfileCard isSelected={selected === profile.title} message={selected === profile.title && 'Current Owner'} onClick={selected !== profile.title && updateOwnerProfile} profile={profile} />
                      </div>
                    );
                  })}
                </div>

                {!allProfiles.length && <p className='text-[#6F6F6F] mb-4'>No profiles found. Please try again.</p>}

                <Link href='/app/mint-profiles'>
                  <Button
                    type={ButtonType.PRIMARY}
                    size={ButtonSize.LARGE}
                    label='Get a New Profile'
                    onClick={() => null}
                    stretch
                  />
                </Link>

                {allProfiles.length > profilesToShow.length
                  ?
                  (
                    <Button
                      type={ButtonType.PRIMARY}
                      size={ButtonSize.LARGE}
                      label='Load More'
                      onClick={() => LoadMoreHandler()}
                      stretch
                    />
                  )
                  : null
                }
              </div>
            </div>
          </div>
        </Modal>
      }
    </div>
  );
}
