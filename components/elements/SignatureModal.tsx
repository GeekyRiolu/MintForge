import { Button, ButtonSize, ButtonType } from 'components/elements/Button';
import { Modal } from 'components/elements/Modal';
import { tw } from 'utils/tw';

import { useDisconnect } from 'wagmi';

export interface SignatureModalProps {
  visible: boolean;
  showRetry: boolean;
  onRetry: () => void;
}

export function SignatureModal(props: SignatureModalProps) {
  const { disconnect } = useDisconnect();

  return (
    <Modal
      visible={props.visible}
      loading={false}
      title={{ topLine:'SIGN THE MESSAGE', bottomLine:'IN YOUR WALLET' }}
      onClose={() => null}
      noCancelBtn
    >
      <div className='w-full flex flex-col items-center pb-4'>
        <div className={tw(
          'text-center max-w-md text-primary-txt w-full text-base',
          'my-6'
        )}>
          NFT.com uses this signature to verify that you{'\''}re the owner of this Ethereum address.
        </div>
        <div className="font-noi-grotesk minmd:mx-[20%] minmd:mb-5 flex w-full">
          {props.showRetry &&
            <div className='mx-2 flex grow'>
              <Button
                size={ButtonSize.XLARGE}
                stretch
                label={'TRY AGAIN'}
                onClick={() => props.onRetry()}
                type={ButtonType.PRIMARY}
              />
            </div>
          }
          <div className='mx-2 flex grow'>
            <Button
              type={ButtonType.PRIMARY}
              size={ButtonSize.XLARGE}
              label={'CANCEL'}
              stretch
              onClick={() => {
                disconnect();
              }}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}