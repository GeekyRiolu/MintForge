import { Button, ButtonSize, ButtonType } from 'components/elements/Button';
import { Modal } from 'components/elements/Modal';

import { ArrowsClockwise, GasPump, XCircle } from 'phosphor-react';
import { useCallback } from 'react';

type RemoveModalProps = {
  visible: boolean;
  setVisible: (input:boolean) => void;
  address: string;
  rejected?: boolean;
  remove: () => void;
  isProfile?: boolean
  profileUrl?: string
  isRemoved?: boolean
  isTxPending?: boolean
};

export default function RemoveModal({ visible, setVisible, address, rejected, remove, isProfile, profileUrl, isRemoved,isTxPending }: RemoveModalProps) {
  const getModalContent = useCallback(() => {
    if(isTxPending){
      return (
        <>
          <div className='flex mb-10 items-center'>
            <ArrowsClockwise size={32} color="#6f6f6f" weight="fill" className='mr-2 animate-spin-slow' />
            <h2 className='text-4xl tracking-wide font-bold'>One second...</h2>
          </div>
          <p className='text-[#6F6F6F]'>We’re waiting for the transaction to complete.</p>
        </>
      );
    }
    if(isProfile && rejected || isProfile && isRemoved) {
      return (
        <>
          <p className='text-[#6F6F6F]'>You are about to reject the profile <span className='text-black font-bold'>{profileUrl}</span> with the following address from your account.</p>
          <p className='font-mono text-black text-xl break-words mt-2'>{address}</p>
              
          <p className='mt-6 text-[#6F6F6F]'>If you reject this NFT Profile, they will not be able to display your NFTs on their NFT Profile.</p>
          <p className='mt-3 mb-6 text-[#6F6F6F]'>To associate this profile in the future, you must pay the gas fee again.</p>
          <Button
            type={ButtonType.PRIMARY}
            size={ButtonSize.LARGE}
            label='Remove'
            onClick={() => remove()}
            stretch
          />
          <p
            className='underline text-center font-bold tracking-wide hover:cursor-pointer mt-6'
            onClick={() => setVisible(false)}>
          Cancel
          </p>
        </>
      );}

    if(isProfile) {
      return (
        <>
          <p className='text-[#6F6F6F]'>You are about to remove the NFT Profile <span className='text-black font-bold'>{profileUrl}</span> with the following address from your account.</p>
          <p className='font-mono text-black text-xl break-words mt-2 mb-6'>{address}</p>
              
          <Button
            type={ButtonType.PRIMARY}
            size={ButtonSize.LARGE}
            label='Remove'
            onClick={() => remove()}
            stretch
          />
          <div className='flex items-center font-noi-grotesk text-blog-text-reskin justify-center mt-2 mb-6 text-sm'>
            <GasPump size={20} weight="fill" />
            <p className='ml-1'>This action will require a <span className='border-dashed	border-b border-[#6F6F6F]'>{' '}gas fee.</span></p>
          </div>
          <p
            className='underline text-center font-bold tracking-wide hover:cursor-pointer mt-6'
            onClick={() => setVisible(false)}>
          Cancel
          </p>
        </>
      );}

    if(rejected) {
      return (
        <>
          <p className='text-[#6F6F6F]'>
            You are about to remove the following <span className='text-black font-bold'> rejected </span> address from your NFT Profile.
          </p>
          <p className='font-mono text-black text-xl break-words mt-2'>{address}</p>
                
          <p className='my-6 text-[#6F6F6F]'>If you send another association request, you <span className='text-black font-bold'>will not pay</span> the gas fee again.</p>
          <Button
            type={ButtonType.PRIMARY}
            size={ButtonSize.LARGE}
            label='Remove'
            onClick={() => remove()}
            stretch
          />
          <p
            className='underline text-center font-bold tracking-wide hover:cursor-pointer mt-6'
            onClick={() => setVisible(false)}>
            Cancel
          </p>
        </>
      );}
   
    return (
      <>
        <p className='text-[#6F6F6F]'>
          You are about to remove the following
          {' '}
          <span className='text-black font-semibold'>
            accepted
          </span>
          {' '}or{' '}
          <span className='text-black font-semibold'>
            pending
          </span>
          {' '}
          address from your NFT Profile.
        </p>
        <p className='font-mono text-black text-xl break-words mt-2'>{address}</p>
                
        <p className='mt-6 text-[#6F6F6F]'>
          If you remove this address, you will not be able to display their NFTs on your NFT Profile, and must pay gas to complete this action.
        </p>
        <p className='my-6 text-[#6F6F6F]'>
          To associate this address in the future, you must pay the gas fee again.
        </p>
        <Button
          type={ButtonType.PRIMARY}
          size={ButtonSize.LARGE}
          label='Remove'
          onClick={() => remove()}
          stretch
        />
        <div className='flex items-center font-noi-grotesk text-blog-text-reskin justify-center mt-2 mb-6 text-sm'>
          <GasPump size={20} weight="fill" />
          <p className='ml-1'>This action will require a<span className='border-dashed	border-b border-[#6F6F6F]'> gas fee.</span></p>
        </div>
        <p
          className='underline text-center font-bold tracking-wide hover:cursor-pointer mt-6'
          onClick={() => setVisible(false)}>
          Cancel
        </p>
      </>
    );
  }, [address, isProfile, rejected, remove, setVisible, profileUrl, isRemoved, isTxPending]);

  return (
    <Modal
      visible={visible}
      loading={false}
      title={''}
      onClose={() => {
        setVisible(false);
      }}
      bgColor='white'
      hideX
      fullModal
      pure
    >
      <div className='max-w-full minlg:max-w-[458px] h-screen minlg:h-max maxlg:h-max bg-white text-left px-4 pb-10 rounded-none minlg:rounded-[10px] minlg:mt-24 minlg:m-auto'>
        <div className='pt-28 font-noi-grotesk lg:max-w-md max-w-lg m-auto minlg:relative'>
          <div className='absolute top-4 right-4 minlg:right-1 hover:cursor-pointer w-6 h-6 bg-[#f9d963] rounded-full'></div>
          <XCircle onClick={() => setVisible(false)} className='absolute top-3 right-3 minlg:right-0 hover:cursor-pointer' size={32} color="black" weight="fill" />
          {!isTxPending && <h2 className='text-4xl tracking-wide font-bold mb-10'>Are you sure?</h2>}
          {getModalContent()}
        </div>
      </div>
    </Modal>
  );
}
    