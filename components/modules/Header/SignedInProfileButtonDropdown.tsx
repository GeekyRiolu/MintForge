import { useProfileSelectModal } from 'hooks/state/useProfileSelectModal';
import { useUser } from 'hooks/state/useUser';
import { useMyNftProfileTokens } from 'hooks/useMyNftProfileTokens';
import { useOutsideClickAlerter } from 'hooks/useOutsideClickAlerter';
import { isNullOrEmpty } from 'utils/format';
import { shortenAddress } from 'utils/helpers';
import { tw } from 'utils/tw';

import Link from 'next/link';
import { useRouter } from 'next/router';
import { CaretDown, CaretUp, Check } from 'phosphor-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAccount } from 'wagmi';

export function SignedInProfileButtonDropdown() {
  const router = useRouter();
  const { setProfileSelectModalOpen } = useProfileSelectModal();
  const { profileTokens: myOwnedProfileTokens } = useMyNftProfileTokens();
  const { user, getHiddenProfileWithExpiry, setCurrentProfileUrl } = useUser();
  const { address: currentAddress } = useAccount();

  const [profiles, setProfiles] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  useOutsideClickAlerter(wrapperRef, () => {
    setExpanded(false);
  });

  useEffect(() => {
    myOwnedProfileTokens.length && setProfiles(myOwnedProfileTokens);
  }, [myOwnedProfileTokens]);

  const sortProfiles = useCallback(() => {
    const hiddenProfile = getHiddenProfileWithExpiry();
    const hiddenIndex = profiles?.findIndex((e) => e.title === hiddenProfile);
    if(hiddenIndex !== -1){
      profiles?.splice(hiddenIndex, 1);
    }

    const index = profiles?.findIndex((e) => e.title === user.currentProfileUrl);
    profiles?.unshift(...profiles.splice(index, 1));
  }, [getHiddenProfileWithExpiry, profiles, user.currentProfileUrl]);

  useEffect(() => {
    if(currentAddress && profiles?.length && myOwnedProfileTokens?.length && (user.currentProfileUrl === '' || isNullOrEmpty(user.currentProfileUrl) || !profiles?.some((profile) => profile.title === user.currentProfileUrl) )){
      setProfileSelectModalOpen(true);
    } else {
      setProfileSelectModalOpen(false);
    }
  }, [currentAddress, profiles, user.currentProfileUrl, setProfileSelectModalOpen, router, myOwnedProfileTokens]);

  return (
    <div
      ref={wrapperRef}
      className={tw(
        'relative',
        'cursor-pointer flex flex-col items-end rounded-xl',
        'text-base -mr-5 -ml-3',
        'dark:text-always-white text-primary-txt',
        'whitespace-nowrap justify-between',
      )}
    >
      <div
        ref={anchorRef}
        className={tw(
          'flex flex-row items-end px-2.5',
          'bg-transparent dark:bg-secondary-dk',
          'py-2 h-full',
          'justify-between rounded-xl w-full',
        )}
      >
        <>
          <button
            onClick={() => {
              setExpanded(!expanded);
              sortProfiles();
            }}
            className='flex items-center justify-center minlg:hidden cursor-pointer rounded-full bg-yellow-300 h-10 w-10 font-bold'
          >
            /
          </button>
          <div
            className="gap-3 hidden minlg:block cursor-pointer"
          >
            <button
              className={tw(
                'block font-bold rounded-full',
                'bg-[#F9D54C] font-medium',
                'flex flex-row items-center cursor-pointer hover:opacity-80 font-noi-grotesk',
                'py-2 pr-5 pl-[18px]',
              )}
              type="button"
            >
              {myOwnedProfileTokens?.some((token) => token.title === user.currentProfileUrl) ?
                <div className='flex justify-between items-center'>
                  <p className='mr-2 text-xl font-bold'>/</p>
                  <Link href={`/${user.currentProfileUrl}`}>
                    <p className='font-medium'>
                      {user.currentProfileUrl}
                    </p>
                  </Link>

                  <CaretDown
                    onClick={() => {
                      setExpanded(!expanded);
                      sortProfiles();
                    }}
                    size={18}
                    color="black"
                    weight="bold"
                    className='ml-2'
                  />
                </div>
                :
                <>
                  <div className='flex justify-between items-center'>

                    {myOwnedProfileTokens?.length > 0 ?
                      <p onClick={() => setProfileSelectModalOpen(true)} className='font-medium'>{shortenAddress(currentAddress, 3)}</p>
                      :
                      <Link href='/app/mint-profiles'>
                        <p className='font-medium'>{shortenAddress(currentAddress, 3)}</p>
                      </Link>
                    }
                    <CaretDown
                      onClick={() => {
                        setExpanded(!expanded);
                        sortProfiles();
                      }}
                      size={18}
                      color="black"
                      weight="bold"
                      className='ml-2'
                    />
                  </div>
                </>
              }
            </button>
          </div>
        </>

      </div>

      {expanded &&
        <div
          style={{
            marginTop: anchorRef.current.clientHeight + 8,
          }}
          className={tw(
            'rounded-xl',
            'bg-white dark:bg-secondary-dk',
            'absolute z-50',
            'min-w-[14rem] drop-shadow-md right-1 minlg:right-auto minlg:left-1/2 minlg:-translate-x-1/2',
          )}
        >
          <CaretUp size={32} color="white" weight="fill" className='absolute right-3 -top-[18px] minlg:right-auto minlg:left-[43%]'/>

          <div className='max-h-[128px] overflow-y-auto pt-2 mt-2'>

            {myOwnedProfileTokens?.length === 0 &&
            <>
              <p className='text-black px-4 hover:cursor-default'>No Profiles Found</p>
              <div
                onClick={() => {
                  router.push('/app/mint-profiles');
                  setExpanded(false);
                }}
                style={{ height: '10%' }}
                className={'flex flex-row w-full px-4 items-center font-medium text-black hover:cursor-pointer'}
              >
              Create One Here
              </div>
            </>
            }

            {myOwnedProfileTokens?.length > 0 && myOwnedProfileTokens.map((profile) => (
              user.currentProfileUrl === profile.title ?
                <Link key={profile.title} href={`/${profile.title}`}>
                  <div
                    className={'flex flex-row w-full px-4 py-2 items-center justify-between bg-[#FFF4CA] text-primary-txt font-medium h-10'}
                  >
                    <div className='flex'>
                      <div className='h-6 w-6 mr-4 rounded-full bg-[#F9D54C] border border-[#E4BA18]  flex justify-center items-center'>
                        {profile.title.charAt(0).toUpperCase()}
                      </div>
                      <p>{profile.title}</p>
                    </div>
                    <Check size={18} color="black" weight="bold" />
                  </div>
                </Link>
                :
                <Link key={profile.title} href={`/${profile.title}`}>
                  <div
                    className={'flex flex-row w-full px-4 py-2 items-center text-primary-txt font-medium h-10'}
                    onClick={() => setCurrentProfileUrl(profile.title)}
                  >
                    <div className='h-6 w-6 mr-4 rounded-full bg-[#F9D54C] border border-[#E4BA18]  flex justify-center items-center'>
                      {profile.title.charAt(0).toUpperCase()}
                    </div>
                    <p>{profile.title}</p>
                  </div>
                </Link>
            ))}
          </div>

          <div className='flex justify-between mt-4'>
            <div
              onClick={() => {
                router.push('/app/settings');
                setExpanded(false);
              }}
              style={{ height: '10%' }}
              className={'flex flex-row w-full px-4 mb-3 py-2 pt-4 items-center font-medium text-black border-t border-[#ECECEC]'}
            >
              Settings
            </div>
          </div>
        </div>
      }
    </div>
  );
}
