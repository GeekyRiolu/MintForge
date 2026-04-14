import { Button, ButtonSize, ButtonType } from 'components/elements/Button';
import { Modal } from 'components/elements/Modal';

import { ArrowsClockwise, GasPump, XCircle } from 'phosphor-react';

type RequestModalProps = {
  visible: boolean;
  setVisible: (input:boolean) => void;
  address: string;
  transaction: string;
  setAddressVal: (input: string) => void;
  success?: boolean;
  submitHandler: () => void;
  isPending?: boolean
};

export default function RequestModal({ visible, setVisible, address, transaction, setAddressVal, success, submitHandler, isPending }: RequestModalProps) {
  return (
    <Modal
      visible={visible}
      loading={false}
      title={''}
      onClose={() => {
        setVisible(false);
        setAddressVal('');
      }}
      bgColor='white'
      hideX
      fullModal
      pure
    >
      <div className='max-w-full minlg:max-w-[458px] h-screen minlg:h-max maxlg:h-max bg-white text-left px-4 pb-10 rounded-none minlg:rounded-[10px] minlg:mt-24 minlg:m-auto'>
        <div className='pt-28 font-noi-grotesk lg:max-w-md max-w-lg m-auto minlg:relative'>
          <div className='absolute top-4 right-4 minlg:right-1 hover:cursor-pointer w-6 h-6 bg-[#F9D963] rounded-full'></div>
          <XCircle onClick={() => {setVisible(false); setAddressVal('');}} className='absolute top-3 right-3 minlg:right-0 hover:cursor-pointer' size={32} color="black" weight="fill" />
          {!success
            ?
            (
              isPending ?
                <>
                  <div className='flex mb-10 items-center'>
                    <ArrowsClockwise size={32} color="#6f6f6f" weight="fill" className='mr-2 animate-spin-slow' />
                    <h2 className='text-4xl tracking-wide font-bold'>One second...</h2>
                  </div>
                  <p className='text-[#6F6F6F]'>We{'\''}re waiting for the transaction to complete.</p>
                </>
                :
                <>
                  <h2 className='text-4xl tracking-wide font-bold mb-10'>Confirm Request</h2>
                  <p className='text-[#6F6F6F]'>
                    You are about to send an address association request to
                  </p>
                  <p className='font-mono text-black text-xl break-words mt-2'>
                    {address}
                  </p>
                  <p className='mt-6'>View the address on {' '}
                    <a
                      target="_blank"
                      rel="noreferrer" href={`https://etherscan.io/address/${address}`} className='font-bold underline tracking-wide'>Etherscan
                    </a>
                  </p>
                  <p className='my-6'>
                    Please sign the transaction in your wallet. If you have changed your mind and do not wish to send this request, simply cancel.
                  </p>
                  <Button
                    type={ButtonType.PRIMARY}
                    size={ButtonSize.LARGE}
                    label='Request Association'
                    onClick={() => submitHandler()}
                    stretch
                  />
                  <div className='flex items-center font-noi-grotesk text-blog-text-reskin justify-center mt-2 mb-6 text-sm'>
                    <GasPump size={20} weight="fill" />
                    <p className='ml-1'>This action will require a <span className='border-dashed	border-b border-[#6F6F6F]'> gas fee.</span></p>
                  </div>
                  <p
                    className='underline text-center font-bold tracking-wide hover:cursor-pointer mt-6'
                    onClick={() => {
                      setVisible(false);
                      setAddressVal('');
                    }}
                  >
                    Cancel
                  </p>
                </>
            )
            :
            (
              <>
                <h2 className='text-4xl tracking-wide font-bold mb-10'>Request Sent</h2>
                <p className='text-[#6F6F6F]'>You have sent an address association request to <span className='font-mono text-black text-xl break-words mt-2'>{address}</span></p>
                <p className='mt-6'>View the transaction on {' '}
                  <a
                    target="_blank"
                    rel="noreferrer" href={`https://goerli.etherscan.io/tx/${transaction}`} className='font-bold underline tracking-wide'>Etherscan
                  </a>
                </p>
                <p className='my-6'>
                  Please inform the owner of this address to connect to NFT.com to approve your request. You will receive a notification once approved.
                </p>
                <Button
                  type={ButtonType.PRIMARY}
                  size={ButtonSize.LARGE}
                  label='Return to Settings'
                  onClick={() => {setVisible(false); setAddressVal(''); }}
                  stretch
                />
              </>
            )
          }
        </div>
      </div>
    </Modal>
  );
}
    