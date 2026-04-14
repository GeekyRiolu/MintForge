import { Modal } from 'components/elements/Modal';
import { RoundedCornerMedia, RoundedCornerVariant } from 'components/elements/RoundedCornerMedia';
import { Nft, TxActivity } from 'graphql/generated/types';
import { useOutsideClickAlerter } from 'hooks/useOutsideClickAlerter';
import { isNullOrEmpty } from 'utils/format';

import { ListingButtonType } from './ExternalListingTile';
import ExternalListingTile from './ExternalListingTile';

import { X } from 'phosphor-react';
import { useCallback, useRef } from 'react';
import { PartialDeep } from 'type-fest';

export interface SelectListingsModalProps {
  listings: PartialDeep<TxActivity>[];
  nft: PartialDeep<Nft>;
  collectionName: string;
  visible: boolean;
  onClose: () => void;
}

export function SelectListingModal(props: SelectListingsModalProps) {
  const { visible, onClose, nft, listings, collectionName } = props;

  const modalRef = useRef();
  useOutsideClickAlerter(modalRef, () => {
    onClose();
  });

  const getModalContent = useCallback(() => {
    return <div className='flex flex-col font-noi-grotesk'>
      <div className="flex items-center">
        <RoundedCornerMedia
          containerClasses='w-2/4 aspect-square'
          src={nft?.metadata?.imageURL}
          variant={RoundedCornerVariant.None}
        />
        <div className="flex flex-col px-8">
          <div className="whitespace-nowrap text-lg font-normal font-noi-grotesk leading-6 tracking-wide text-[#1F2127]">
            {isNullOrEmpty(nft?.metadata?.name) ? 'Unknown Name' : nft?.metadata?.name}
          </div>
          <div className="whitespace-nowrap text-lg font-normal font-noi-grotesk leading-6 tracking-wide text-[#1F2127]">
            {isNullOrEmpty(collectionName) ? 'Unknown Collection' : collectionName}
          </div>
        </div>
      </div>
      <div>
        {
          listings?.map((listing, index) => {
            return <ExternalListingTile
              key={listing?.id + index}
              listing={listing}
              nft={nft}
              collectionName={collectionName}
              buttons={[ListingButtonType.AddToCart]}
              onClose={onClose}
            />;
          })
        }
      </div>
    </div>;
  }, [nft, collectionName, listings, onClose]);

  return (
    <Modal
      visible={visible}
      loading={false}
      title={''}
      onClose={onClose}
      bgColor='white'
      hideX
      fullModal
      pure
    >
      <div ref={modalRef} className='max-w-full minlg:max-w-[458px] h-screen minlg:h-max maxlg:h-max bg-white text-left px-4 pb-5 rounded-none minlg:rounded-[20px] minlg:mt-24 minlg:m-auto'>
        <div className='font-noi-grotesk lg:max-w-md max-w-lg m-auto minlg:relative'>
          <X onClick={onClose} className='absolute top-3 right-3 minlg:right-0 hover:cursor-pointer' size={32} color="black" weight="fill" />
          {<h2 className='text-4xl tracking-wide font-medium mb-10'>Select Listing</h2>}
          {getModalContent()}
        </div>
      </div>
    </Modal>
  );
}
