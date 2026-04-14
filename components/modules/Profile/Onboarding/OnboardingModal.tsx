import { ProfileActionType } from 'graphql/generated/types';
import { useGetSentReferralEmailsQuery } from 'graphql/hooks/useGetSentReferralEmailsQuery';
import { useProfileQuery } from 'graphql/hooks/useProfileQuery';
import { Doppler, getEnvBool } from 'utils/env';
import { tw } from 'utils/tw';

import OnboardingModalItem from './OnboardingModalItem';

import dynamic from 'next/dynamic';
import { X } from 'phosphor-react';
import { CaretDown, CaretUp } from 'phosphor-react';
import { useEffect, useMemo, useState } from 'react';

const BlurImage = dynamic(import('components/elements/BlurImage'));

export interface OnboardingModalProps {
  profileURI: string;
  onClose: () => void;
}

export default function OnboardingModal({ profileURI, onClose } : OnboardingModalProps) {
  const { profileData } = useProfileQuery(
    profileURI
  );

  const { data } = useGetSentReferralEmailsQuery(profileURI);

  const usersActions = profileData?.profile?.usersActionsWithPoints.find((user) => user?.userId === profileData?.profile?.ownerUserId);
  const sufficientReferrals = data?.filter((referral) => referral?.accepted === true).length >= 5;

  const onboardingItems = useMemo(() => [
    {
      name: 'Create NFT Profile',
      isCompleted: true,
      coins: 5,
    },
    {
      name: 'Customize Profile',
      isCompleted: usersActions?.action.includes(ProfileActionType.CustomizeProfile),
      description: 'Add a profile picture, bio and NFTs to make your NFT Profile yours',
      coins: 1,
      buttonText: 'Continue',
    },
    {
      name: 'Refer Network',
      isCompleted: usersActions?.action.includes(ProfileActionType.ReferNetwork) && sufficientReferrals,
      coins: 10,
      description: 'Refer friends to join you on NFT.com. Once your referral creates a profile, this step will be marked as completed.',
      buttonText: 'Continue'
    },
    {
      name: 'Buy NFTs',
      isCompleted: usersActions?.action.includes(ProfileActionType.BuyNfTs),
      coins: 5,
      description: 'Grow your collection by purchasing NFTs on NFT.com',
      href: '/app/discover/nfts'
    }
  ], [usersActions, sufficientReferrals]);

  useEffect(() => {
    const totalPoints = onboardingItems.reduce((acc, item) => {
      return acc + item.coins;
    }, 0);
    setTotalPoints(totalPoints);
  }, [onboardingItems]);

  const [totalPoints, setTotalPoints] = useState(0);
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <div
        onClick={() => setExpanded(false)}
        className={tw(
          'fixed',
          expanded && 'bg-black bg-opacity-25 minlg:bg-opacity-0 inset-0'
        )}
      />
      <div className={tw(
        'fixed min-h-max h-max minlg:absolute bottom-0 right-[50%] min-w-[375px] translate-x-1/2 minlg:translate-x-0 minlg:top-20 minlg:right-4 overflow-y-auto z-[105] minlg:z-[103]',
        expanded && 'top-[10%] minlg:top-20 minlg:right-4'
      )}>
        <div className="flex min-h-max items-start justify-end p-4 text-center">
          <div>
            <div className={tw(
              'w-[342px] minlg:w-[330px] rounded-lg',
              'transform overflow-hidden text-left align-middle shadow-xl transition-all',
              'bg-white py-7'
            )}>
              <div className='px-7'>
                <div className='flex justify-between font-medium items-center'>
                  <h3
                    className="text-[24px] leading-6 text-black"
                  >
                    Get Started
                  </h3>
                  {getEnvBool(Doppler.NEXT_PUBLIC_PROFILE_POINTS_ENABLED) && <div className='bg-[#FFF4CA] rounded-full flex items-center py-1 pl-1 pr-4'>
                    <div className='h-[24px] w-[24px] minmd:h-[34px] minmd:w-[34px] mr-[5px]'>
                      <BlurImage alt="default profile photo" src="/assets/nft_profile_default.webp" fill localImage />
                    </div>

                    {profileData?.profile?.usersActionsWithPoints[0]?.totalPoints || 5}/<span className='text-[#6A6A6A]'>{totalPoints || '-'}</span>
                  </div>}
                  <X
                    onClick={() => onClose()}
                    className='hover:cursor-pointer' size={32} color="black" weight="bold" />
                </div>
                <p className='mt-3 font-medium w-11/12'>Complete these steps to set up your <span className='bg-gradient-to-r bg-clip-text text-transparent from-[#FAC213] to-[#FF9B37]'>NFT Profile</span></p>

                <div className='mt-7'>
                  <div className={tw(
                    'flex items-center justify-between',
                    expanded && 'mb-7'
                  )}>
                    <div className='w-[85%] h-3 bg-[#E6E6E6] rounded-full'>
                      <div
                        style={{ width: `${totalPoints ? Math.floor(((profileData?.profile?.usersActionsWithPoints[0]?.action.length || 5) / onboardingItems.length) * 100) : 0}%` }}
                        className={tw(
                          'h-3 bg-[#26AA73] rounded-full',
                        )}></div>
                    </div>
                    <div className='hover:cursor-pointer'>
                      {expanded ?
                        <CaretUp size={32} color="black" weight='bold' onClick={() =>setExpanded(false)} />
                        :
                        <CaretDown size={32} color="black" weight='bold' onClick={() =>setExpanded(true)} />
                      }
                    </div>
                  </div>
                </div>
              </div>
              {expanded && (
                <>
                  <div className='border-t pt-3 px-4'>
                    <div className='flex flex-col space-y-2'>
                      <OnboardingModalItem
                        items={onboardingItems}
                      />
                    </div>
                  </div>

                  {getEnvBool(Doppler.NEXT_PUBLIC_PROFILE_POINTS_ENABLED) && (
                    <div className='px-[55px] mt-3'>
                      <button
                        type="button"
                        className={tw(
                          'inline-flex w-full justify-center items-center',
                          'rounded-xl border border-transparent bg-[#F9D54C] hover:bg-[#EFC71E]',
                          'font-medium text-black py-2',
                          'focus:outline-none focus-visible:bg-[#E4BA18]',
                          'disabled:bg-[#D5D5D5] disabled:text-[#7C7C7C]'
                        )}
                        disabled={true}
                      >
                        <svg className='mr-1' width="17" height="10" viewBox="0 0 22 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M6.6 13.2002C2.9546 13.2002 2.58299e-07 10.2456 5.7699e-07 6.60024C8.95681e-07 2.95484 2.9546 0.000240584 6.6 0.000240903C8.93529 0.000241107 11.0308 1.20693 12.3068 3.29913L15.8125 3.30024L16.6034 1.71844C16.7893 1.34664 17.1831 1.10024 17.6 1.10024L20.9 1.10024C21.5072 1.10024 22 1.59304 22 2.20024L22 8.80024C22 9.40744 21.5072 9.90024 20.9 9.90024L12.3035 9.90904C11.1122 11.9275 8.93529 13.2002 6.6 13.2002ZM6.6 11.0002C8.35229 11.0002 9.9198 9.94864 10.6216 8.35364C10.7976 7.95434 11.1826 7.70024 11.6182 7.70024L19.8 7.70024L19.8 3.30024L18.2875 3.30024L17.4966 4.88205C17.3107 5.25385 16.9169 5.50024 16.5 5.50024L11.6182 5.50024C11.1826 5.50024 10.7976 5.24615 10.6216 4.84685C9.9198 3.25185 8.35229 2.20024 6.6 2.20024C4.1701 2.20024 2.2 4.17034 2.2 6.60024C2.2 9.03014 4.1701 11.0002 6.6 11.0002ZM6.6 7.70024C6.3184 7.70024 6.0247 7.60564 5.8091 7.39114C5.3801 6.96103 5.3801 6.23945 5.8091 5.80935C6.2392 5.38035 6.96079 5.38035 7.39089 5.80935C7.81989 6.23945 7.81989 6.96103 7.39089 7.39114C7.17529 7.60564 6.8816 7.70024 6.6 7.70024Z" fill="#969696" />
                        </svg>
                          Redeem reward points
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
