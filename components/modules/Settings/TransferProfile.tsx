import { Button, ButtonSize, ButtonType } from 'components/elements/Button';
import { Modal } from 'components/elements/Modal';
import { useAllContracts } from 'hooks/contracts/useAllContracts';
import { useSidebar } from 'hooks/state/useSidebar';
import { useUser } from 'hooks/state/useUser';
import { useMyNftProfileTokens } from 'hooks/useMyNftProfileTokens';

import SettingsForm from './SettingsForm';

import { BigNumber } from 'ethers';
import { ArrowsClockwise, GasPump, XCircle } from 'phosphor-react';
import { useState } from 'react';
import { useAccount } from 'wagmi';

type TransferProfileProps = {
  selectedProfile: string
}

export default function TransferProfile({ selectedProfile }: TransferProfileProps) {
  const { setCurrentProfileUrl, setHiddenProfileWithExpiry } = useUser();
  const { toggleSidebar } = useSidebar();
  const { nftProfile } = useAllContracts();
  const { address: currentAddress } = useAccount();
  const [visible, setVisible] = useState(false);
  const [success, setSuccess] = useState(false);
  const [transaction, setTransaction] = useState('');
  const { profileTokens: myOwnedProfileTokens } = useMyNftProfileTokens();
  const profileToken = myOwnedProfileTokens.find(a => a.title === selectedProfile)?.id?.tokenId;
  const [inputVal, setInputVal] = useState('');
  const [transactionPending, setTransactionPending] = useState(false);

  const submitHandler = async () => {
    const tx = await nftProfile.transferFrom(currentAddress, inputVal, BigNumber.from(profileToken));
    setVisible(true);
    setTransactionPending(true);
    if (tx) {
      tx.wait(1)
        .then(() => {
          gtag('event', 'Profile Transferred', {
            ethereumAddress: currentAddress,
            profile: selectedProfile,
            destinationAddress: inputVal
          });
          setTransaction(tx.hash);
          setTransactionPending(false);
          setSuccess(true);
          setInputVal('');
        })
        .catch(() => null);
    }
  };

  const closeModal = () => {
    if (success) {
      toggleSidebar();
      setCurrentProfileUrl('');
      setHiddenProfileWithExpiry(selectedProfile);
    }
    setVisible(false);
  };

  const setModalOpen = () => {
    setVisible(true);
  };

  return (
    <div id="transfer" className='mt-10 bg-[#FFF1F1] p-4 rounded-[10px]'>
      <h2 className='font-noi-grotesk tracking-wide font-bold text-black text-2xl mb-1'>
        Transfer Profile
      </h2>
      <p className='text-blog-text-reskin mb-4'>
        Send this profile to another wallet. You will lose access to this profile.
      </p>

      <SettingsForm buttonText='Transfer Profile' changeHandler={setInputVal} submitHandler={setModalOpen} {...{ inputVal }} />

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
            <div className='absolute top-4 right-4 minlg:right-1 hover:cursor-pointer w-6 h-6 bg-[#F9D963] rounded-full'></div>
            <XCircle onClick={() => closeModal()} className='absolute top-3 right-3 minlg:right-0 hover:cursor-pointer' size={32} color="black" weight="fill" />
            {
              transactionPending ?
                <>
                  <div className='flex mb-10 items-center'>
                    <ArrowsClockwise size={32} color="#6f6f6f" weight="fill" className='mr-2 animate-spin-slow' />
                    <h2 className='text-4xl tracking-wide font-bold'>One second...</h2>
                  </div>

                  <p className='text-[#6F6F6F]'>We’re waiting for the transaction to complete.</p>
                </>
                :
                success
                  ?
                  (
                    <>
                      <h2 className='text-4xl tracking-wide font-bold mb-10'>Transfer In Progress</h2>

                      <p className='text-[#6F6F6F] mb-6'>
                        You can confirm this transaction on{' '}
                        <a
                          target="_blank"
                          rel="noreferrer" href={`https://goerli.etherscan.io/tx/${transaction}`} className='font-bold underline tracking-wide text-black'>Etherscan.
                        </a>
                        You can safely navigate away from this screen and return to NFT.com
                      </p>
                      <Button
                        type={ButtonType.PRIMARY}
                        size={ButtonSize.LARGE}
                        label='Return to NFT.com'
                        onClick={() => { closeModal(); }}
                        stretch
                      />
                    </>
                  )
                  :
                  (
                    <>
                      <h2 className='text-4xl tracking-wide font-bold mb-10'>Confirm Transfer</h2>
                      <p className='text-[#6F6F6F]'>You’re about to transfer{' '}
                        <span className='font-bold text-black tracking-wide'>
                          {selectedProfile}
                        </span>
                        {' '}to{' '}
                        <span className='font-mono text-black text-xl break-words mt-2'>
                          {inputVal}
                        </span>
                      </p>

                      <p className='my-6 text-[#6F6F6F]'>
                        Please confirm this address is correct. Once the transfer process begins, you will lose access to this profile.
                      </p>
                      <Button
                        type={ButtonType.PRIMARY}
                        size={ButtonSize.LARGE}
                        label='Transfer Profile'
                        onClick={() => submitHandler()}
                        stretch
                      />
                      <div className='flex items-center font-noi-grotesk text-blog-text-reskin justify-center mt-2 text-sm'>
                        <GasPump size={20} weight="fill" />
                        <p className='ml-1'>This action will require a <span className='border-dashed	border-b border-[#6F6F6F]'>gas fee.</span></p>
                      </div>
                    </>
                  )
            }
          </div>
        </div>
      </Modal>
    </div>
  );
}
