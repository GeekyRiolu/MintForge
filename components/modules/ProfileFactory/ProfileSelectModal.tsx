import { Button, ButtonSize, ButtonType } from 'components/elements/Button';
import { RoundedCornerAmount, RoundedCornerMedia, RoundedCornerVariant } from 'components/elements/RoundedCornerMedia';
import { useProfileSelectModal } from 'hooks/state/useProfileSelectModal';
import { useUser } from 'hooks/state/useUser';
import { useClaimableProfileCount } from 'hooks/useClaimableProfileCount';
import { useMyNftProfileTokens } from 'hooks/useMyNftProfileTokens';

import { Dialog, Transition } from '@headlessui/react';
import Link from 'next/link';
import { CheckCircle } from 'phosphor-react';
import { X } from 'phosphor-react';
import KeyIcon from 'public/icons/mint-key.svg?svgr';
import { Fragment } from 'react';
import { useAccount } from 'wagmi';

export default function ProfileSelectModal() {
  const { profileSelectModal, setProfileSelectModalOpen } = useProfileSelectModal();
  const { address: currentAddress } = useAccount();
  const { profileTokens: myOwnedProfileTokens } = useMyNftProfileTokens();
  const { user, setCurrentProfileUrl } = useUser();
  const { claimable } = useClaimableProfileCount(currentAddress);
  const claimableSum = claimable?.reduce((acc, curr) => acc + curr.claimable, 0);

  return (
    <Transition appear show={profileSelectModal} as={Fragment}>
      <Dialog as="div" className="relative z-[105]" onClose={() => setProfileSelectModalOpen(false)}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full relative max-w-[524px] transform overflow-hidden rounded-[20px] bg-white text-left align-middle shadow-xl transition-all">
                <X
                  onClick={() => setProfileSelectModalOpen(false)}
                  className='z-10 absolute top-5 right-5 hover:cursor-pointer'
                  size={20}
                  color="#8C939A"
                  weight="fill"
                />

                <div className='max-h-max mx-auto bg-white rounded-[20px] pt-[60px] minmd:pt-[64px] px-4 minmd:px-12 minlg:px-[65px] pb-10 font-medium'>
                  <h3 className='text-[32px] font-medium'>Select NFT Profile</h3>
                  <p className=' my-6 minmd:my-9 text-xl font-normal'>Please select your primary NFT Profile</p>

                  <div className='overflow-auto max-h-[300px] h-max'>
                    {myOwnedProfileTokens && myOwnedProfileTokens .map((profile) =>
                      <div className='h-14 flex justify-between items-center bg-[#F8F8F8] rounded-xl px-4 py-2 mb-4 hover:cursor-pointer'
                        key={profile?.metadata.name}
                        onClick={() => {
                          setCurrentProfileUrl(profile?.metadata.name);
                          setProfileSelectModalOpen(false);
                        }}
                      >
                        <div className='flex flex-row items-center gap-[14px]'>
                          <RoundedCornerMedia
                            extraClasses='mr-4'
                            containerClasses='h-10 w-10'
                            src={profile?.metadata.image}
                            variant={RoundedCornerVariant.All}
                            height={40}
                            width={40}
                            amount={RoundedCornerAmount.Medium}
                          />
                          <p>{profile?.metadata.name}</p>
                        </div>
                        {user.currentProfileUrl === profile?.metadata.name && <CheckCircle size={28} color="#2AAE47" weight="fill" />}
                      </div>
                    )}
                  </div>
                  <p className='text-[#5B5B5B] font-normal flex items-center mt-3 mb-3'>
                    {claimable &&
                        <>
                          <KeyIcon className='inline mr-3 h-9 w-9' stroke="black" />
                        Minted {claimable?.length * 4 - claimableSum} out of {claimable?.length * 4} free NFT Profiles
                        </>
                    }
                  </p>
                  <Link href='/app/mint-profiles'>
                    <Button
                      label='Add NFT Profile'
                      disabled={claimableSum === 0}
                      type={ButtonType.PRIMARY}
                      size={ButtonSize.LARGE}
                      onClick={() => null}
                      stretch
                    />
                  </Link>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
