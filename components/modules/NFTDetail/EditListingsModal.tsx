import { Button, ButtonSize, ButtonType } from 'components/elements/Button';
import ClientOnly from 'components/elements/ClientOnly';
import { Modal } from 'components/elements/Modal';
import { RoundedCornerMedia, RoundedCornerVariant } from 'components/elements/RoundedCornerMedia';
import { NFTListingsContext } from 'components/modules/Checkout/NFTListingsContext';
import { NULL_ADDRESS } from 'constants/addresses';
import { Nft, TxActivity } from 'graphql/generated/types';
import { TransferProxyTarget, useNftCollectionAllowance } from 'hooks/balances/useNftCollectionAllowance';
import { useOutsideClickAlerter } from 'hooks/useOutsideClickAlerter';
import { ExternalProtocol } from 'types';
import { isNullOrEmpty } from 'utils/format';

import { ListingButtonType } from './ExternalListingTile';
import ExternalListingTile from './ExternalListingTile';

import { useRouter } from 'next/router';
import { X } from 'phosphor-react';
import { useCallback, useContext, useRef } from 'react';
import { PartialDeep } from 'type-fest';
import { useAccount } from 'wagmi';

export interface EditListingsModalProps {
  listings: PartialDeep<TxActivity>[];
  nft: PartialDeep<Nft>;
  collectionName: string;
  visible: boolean;
  onClose: () => void;
}

export function EditListingsModal(props: EditListingsModalProps) {
  const { visible, onClose, nft, listings, collectionName } = props;

  const modalRef = useRef();
  const router = useRouter();
  const { address: currentAddress } = useAccount();
  const { stageListing } = useContext(NFTListingsContext);

  useOutsideClickAlerter(modalRef, () => {
    onClose();
  });

  const {
    allowedAll: openseaAllowed,
  } = useNftCollectionAllowance(
    props.nft?.contract,
    currentAddress,
    TransferProxyTarget.Opensea
  );

  const {
    allowedAll: looksRareAllowed,
  } = useNftCollectionAllowance(
    props.nft?.contract,
    currentAddress,
    TransferProxyTarget.LooksRare
  );

  const {
    allowedAll: looksRareAllowed1155,
  } = useNftCollectionAllowance(
    props.nft?.contract,
    currentAddress,
    TransferProxyTarget.LooksRare1155
  );

  const {
    allowedAll: X2Y2Allowed,
  } = useNftCollectionAllowance(
    props.nft?.contract,
    currentAddress,
    TransferProxyTarget.X2Y2
  );

  const {
    allowedAll: X2Y2Allowed1155,
  } = useNftCollectionAllowance(
    props.nft?.contract,
    currentAddress,
    TransferProxyTarget.X2Y21155
  );

  const {
    allowedAll: NFTCOMAllowed,
  } = useNftCollectionAllowance(
    props.nft?.contract,
    currentAddress,
    TransferProxyTarget.NFTCOM
  );

  const getModalContent = useCallback(() => {
    return <div className='flex flex-col'>
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
          listings?.map((listing) => {
            return <ExternalListingTile
              key={listing?.id}
              listing={listing}
              nft={nft}
              collectionName={collectionName}
              buttons={[ListingButtonType.Adjust, ListingButtonType.Cancel]}
            />;
          })
        }
        <div className="flex flex-col items-center w-full p-4">
          <span className='font-noi-grotesk font-semibold text-base leading-6 items-center text-[#1F2127] mb-4'>List item on another marketplace</span>
          <Button
            stretch
            size={ButtonSize.LARGE}
            label={'List item'}
            onClick={() => {
              stageListing({
                nft: props.nft,
                collectionName: props.collectionName,
                isApprovedForSeaport: openseaAllowed,
                isApprovedForLooksrare: looksRareAllowed,
                isApprovedForLooksrare1155: looksRareAllowed1155,
                isApprovedForX2Y2: X2Y2Allowed,
                isApprovedForX2Y21155: X2Y2Allowed1155,
                isApprovedForNFTCOM: NFTCOMAllowed,
                targets: [
                  {
                    protocol: ExternalProtocol.NFTCOM,
                    currency: NULL_ADDRESS,
                    listingError: false
                  }
                ]
              });
              router.push('/app/list');
            }}
            type={ButtonType.PRIMARY}
          />
        </div>
      </div>
    </div>;
  }, [nft, collectionName, listings, stageListing, props.nft, props.collectionName, openseaAllowed, looksRareAllowed, looksRareAllowed1155, X2Y2Allowed, X2Y2Allowed1155, NFTCOMAllowed, router]);

  return (
    <ClientOnly>
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
        <div ref={modalRef} className='max-w-full minlg:max-w-[458px] minlg:h-[80vh] overflow-y-scroll hideScroll bg-white text-left px-4 pb-5 rounded-none minlg:rounded-[20px] minlg:mt-24 minlg:m-auto'>
          <div className='font-noi-grotesk lg:max-w-md max-w-lg m-auto minlg:relative'>
            <X onClick={onClose} className='absolute right-3 minlg:right-0 hover:cursor-pointer closeButton' size={32} color="black" weight="fill" />
            {<h2 className='text-4xl tracking-wide font-medium mb-10 mt-6'>Edit Listings</h2>}
            {getModalContent()}
          </div>
        </div>
      </Modal>
    </ClientOnly>
  );
}
