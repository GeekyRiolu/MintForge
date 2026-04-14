import { Button, ButtonSize, ButtonType } from 'components/elements/Button';
import { NFTListingsContext } from 'components/modules/Checkout/NFTListingsContext';
import { NFTPurchasesContext } from 'components/modules/Checkout/NFTPurchaseContext';
import { getAddressForChain, nftAggregator } from 'constants/contracts';
import { WETH } from 'constants/tokens';
import { ActivityStatus, AuctionType, LooksrareProtocolData, Nft, NftcomProtocolData, SeaportProtocolData, TxActivity, X2Y2ProtocolData } from 'graphql/generated/types';
import { useNftQuery } from 'graphql/hooks/useNFTQuery';
import { useUpdateActivityStatusMutation } from 'graphql/hooks/useUpdateActivityStatusMutation';
import { TransferProxyTarget, useNftCollectionAllowance } from 'hooks/balances/useNftCollectionAllowance';
import { useLooksrareExchangeContract } from 'hooks/contracts/useLooksrareExchangeContract';
import { useNftcomExchangeContract } from 'hooks/contracts/useNftcomExchangeContract';
import { useSeaportContract } from 'hooks/contracts/useSeaportContract';
import { useX2Y2ExchangeContract } from 'hooks/contracts/useX2Y2ExchangeContract';
import { useDefaultChainId } from 'hooks/useDefaultChainId';
import { useGetCurrentDate } from 'hooks/useGetCurrentDate';
import { useGetERC20ProtocolApprovalAddress } from 'hooks/useGetERC20ProtocolApprovalAddress';
import { useSupportedCurrencies } from 'hooks/useSupportedCurrencies';
import { ExternalExchange, ExternalProtocol } from 'types';
import { getListingCurrencyAddress, getListingPrice } from 'utils/listingUtils';
import { cancelLooksrareListing, getLooksrareAssetPageUrl } from 'utils/looksrareHelpers';
import { getAuctionTypeDisplayName, getProtocolDisplayName } from 'utils/marketplaceUtils';
import { cancelNftcomListing } from 'utils/nativeMarketplaceHelpers';
import { cancelSeaportListing } from 'utils/seaportHelpers';
import { tw } from 'utils/tw';
import { cancelX2Y2Listing } from 'utils/X2Y2Helpers';

import { BigNumber, ethers } from 'ethers';
import Image from 'next/image';
import { useRouter } from 'next/router';
import NFTLogo from 'public/icons/nft_logo_yellow.svg?svgr';
import X2Y2Icon from 'public/icons/x2y2-icon.svg?svgr';
import { MouseEvent , useCallback, useContext, useMemo, useState } from 'react';
import React from 'react';
import { PartialDeep } from 'type-fest';
import { useAccount, useSigner } from 'wagmi';

export interface ExternalListingTileProps {
  listing: PartialDeep<TxActivity>;
  nft: PartialDeep<Nft>;
  collectionName: string;
  buttons: ListingButtonType[];
  onClose?: () => void;
}

const Colors = {
  [ExternalExchange.LooksRare]: 'bg-looksrare-green',
  [ExternalExchange.Opensea]: 'bg-opensea-blue'
};

const Icons = {
  [ExternalExchange.LooksRare]: '/looksrare_black.svg',
  [ExternalExchange.Opensea]: '/opensea_blue.png'
};

export enum ListingButtonType {
  Cancel = 'Cancel',
  Adjust = 'Adjust',
  AddToCart = 'AddToCart',
}

function ExternalListingTile(props: ExternalListingTileProps) {
  const { listing } = props;

  const [cancelling, setCancelling] = useState(false);

  const router = useRouter();
  const currentDate = useGetCurrentDate();
  const { address: currentAddress } = useAccount();
  const { data: signer } = useSigner();
  const defaultChainId = useDefaultChainId();
  const { stagePurchase, toBuy } = useContext(NFTPurchasesContext);
  const { stageListing, toggleCartSidebar } = useContext(NFTListingsContext);
  const looksrareExchange = useLooksrareExchangeContract(signer);
  const seaportExchange = useSeaportContract(signer);
  const X2Y2Exchange = useX2Y2ExchangeContract(signer);
  const NftcomExchange = useNftcomExchangeContract(signer);
  const { getByContractAddress } = useSupportedCurrencies();
  const { updateActivityStatus } = useUpdateActivityStatusMutation();
  const getERC20ProtocolApprovalAddress = useGetERC20ProtocolApprovalAddress();

  const nftInPurchaseCart = useMemo(() => {
    return toBuy?.find((purchase) => purchase.nft?.id === props.nft?.id && purchase?.orderHash === props?.listing?.order?.orderHash) != null;
  }, [props?.listing?.order?.orderHash, props.nft?.id, toBuy]);

  const { mutate: mutateNft } = useNftQuery(
    props?.nft?.contract,
    props?.nft?.tokenId
  );

  const {
    allowedAll: openseaAllowed,
  } = useNftCollectionAllowance(
    props.nft?.contract,
    currentAddress,
    TransferProxyTarget.Opensea
  );

  const {
    allowedAll: looksRareAllowed1155,
  } = useNftCollectionAllowance(
    props.nft?.contract,
    currentAddress,
    TransferProxyTarget.LooksRare1155
  );

  const {
    allowedAll: looksRareAllowed,
  } = useNftCollectionAllowance(
    props.nft?.contract,
    currentAddress,
    TransferProxyTarget.LooksRare
  );

  const {
    allowedAll: X2Y2Allowed1155,
  } = useNftCollectionAllowance(
    props.nft?.contract,
    currentAddress,
    TransferProxyTarget.X2Y21155
  );

  const {
    allowedAll: X2Y2Allowed,
  } = useNftCollectionAllowance(
    props.nft?.contract,
    currentAddress,
    TransferProxyTarget.X2Y2
  );

  const {
    allowedAll: NFTCOMAllowed,
  } = useNftCollectionAllowance(
    props.nft?.contract,
    currentAddress,
    TransferProxyTarget.NFTCOM
  );

  const listingProtocol = props.listing?.order?.protocol;

  const getButton = useCallback((type: ListingButtonType) => {
    let listedCurrency;
    if ((listing?.order?.protocol as ExternalProtocol) === ExternalProtocol.X2Y2 || (listing?.order?.protocol as ExternalProtocol) === ExternalProtocol.LooksRare) {
      listedCurrency = (listing?.order?.protocolData as X2Y2ProtocolData).currencyAddress;
    } else if ((listing?.order?.protocol as ExternalProtocol) === ExternalProtocol.NFTCOM) {
      listedCurrency = (listing?.order?.protocolData as NftcomProtocolData).takeAsset[0]?.standard?.contractAddress;
    }else {
      listedCurrency = (listing?.order?.protocolData as SeaportProtocolData).parameters?.consideration[0]?.token;
    }

    switch (type) {
    case ListingButtonType.Adjust: {
      return <Button
        stretch
        size={ButtonSize.LARGE}
        label={'Adjust Price'}
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
            hasOpenOrder: true,
            nftcomOrderId: listing?.id,
            openOrderId: (listing?.order?.protocol as ExternalProtocol) === ExternalProtocol.X2Y2 ? (listing?.order?.protocolData as X2Y2ProtocolData).id : null,
            targets: [{
              protocol: listing?.order?.protocol as ExternalProtocol,
              startingPrice: 0,
              endingPrice: 0,
              currency: listedCurrency,
              duration: null,
              looksrareOrder: null,
              seaportParameters: null,
              X2Y2Order: null,
              listingError: false
            }]
          });
          router.push('/app/list');
        }}
        type={ButtonType.PRIMARY}
      />;
    }
    case ListingButtonType.Cancel: {
      return <Button
        stretch
        type={ButtonType.SECONDARY}
        size={ButtonSize.LARGE}
        label={'Cancel Listing'}
        disabled={cancelling}
        loading={cancelling}
        onClick={async () => {
          setCancelling(true);
          if (listingProtocol === ExternalProtocol.LooksRare) {
            const order = listing?.order?.protocolData as LooksrareProtocolData;
            if (order == null) {
              setCancelling(false);
              return;
            }
            const result = await cancelLooksrareListing(BigNumber.from(order.nonce), looksrareExchange);
            if (result) {
              updateActivityStatus([listing?.id], ActivityStatus.Cancelled);
            }
            setCancelling(false);
          } else if (listingProtocol === ExternalProtocol.X2Y2) {
            const order = listing?.order?.protocolData as X2Y2ProtocolData;
            if (order == null) {
              setCancelling(false);
              return;
            }
            const result = await cancelX2Y2Listing(
              listing?.order?.chainId === '1' ? 'mainnet' : 'goerli',
              signer,
              order?.id,
              X2Y2Exchange
            );
            if (result) {
              updateActivityStatus([listing?.id], ActivityStatus.Cancelled);
            }
            setCancelling(false);
          } else if (listingProtocol === ExternalProtocol.Seaport) {
            const order = listing?.order?.protocolData as SeaportProtocolData;
            if (order == null) {
              setCancelling(false);
              return;
            }
            const result = await cancelSeaportListing(order?.parameters, seaportExchange);
            if (result) {
              updateActivityStatus([listing?.id], ActivityStatus.Cancelled);
              mutateNft();
            }
            setCancelling(false);
          } else if (listingProtocol === ExternalProtocol.NFTCOM) {
            const order = listing?.order?.protocolData as NftcomProtocolData;
            if (order == null) {
              setCancelling(false);
              return;
            }
            const result = await cancelNftcomListing(
              listing,
              NftcomExchange
            );
            if (result) {
              updateActivityStatus([listing?.id], ActivityStatus.Cancelled);
              mutateNft();
            }
            setCancelling(false);
          }
        }}
      />;
    }
    case ListingButtonType.AddToCart: {
      return <Button
        stretch
        size={ButtonSize.LARGE}
        disabled={nftInPurchaseCart}
        label={nftInPurchaseCart ? 'In Cart' : 'Add to Cart'}
        onClick={async () => {
          const currencyData = getByContractAddress(getListingCurrencyAddress(listing) ?? WETH.address);
          const allowance = await currencyData.allowance(currentAddress, getAddressForChain(nftAggregator, defaultChainId));
          const protocolAllowance = await currencyData.allowance(currentAddress, getERC20ProtocolApprovalAddress(listing?.order?.protocol as ExternalProtocol));
          const price = getListingPrice(listing, (listing?.order?.protocolData as NftcomProtocolData).auctionType === AuctionType.Decreasing ? currentDate : null);
          const protocol = listingProtocol as ExternalProtocol;
          stagePurchase({
            nft: props.nft,
            activityId: listing?.id,
            currency: getListingCurrencyAddress(listing) ?? WETH.address,
            price: price,
            collectionName: props.collectionName,
            protocol: protocol,
            isERC20ApprovedForAggregator: BigNumber.from(allowance ?? 0).gt(price),
            isERC20ApprovedForProtocol: BigNumber.from(protocolAllowance ?? 0).gt(price),
            orderHash: listing?.order?.orderHash,
            makerAddress: listing?.order?.makerAddress,
            takerAddress: listing?.order?.takerAddress,
            nonce: listing?.order?.nonce,
            protocolData: listingProtocol === ExternalProtocol.Seaport ?
              listing?.order?.protocolData as SeaportProtocolData :
              listingProtocol === ExternalProtocol.X2Y2 ?
                listing?.order?.protocolData as X2Y2ProtocolData :
                listing?.order?.protocolData as LooksrareProtocolData
          });
          props.onClose();
          toggleCartSidebar('Buy');
        }}
        type={ButtonType.PRIMARY}
      />;
    }
    }
  }, [listing, stageListing, props, openseaAllowed, looksRareAllowed, looksRareAllowed1155, X2Y2Allowed, X2Y2Allowed1155, NFTCOMAllowed, router, cancelling, listingProtocol, looksrareExchange, updateActivityStatus, signer, X2Y2Exchange, seaportExchange, mutateNft, NftcomExchange, nftInPurchaseCart, getByContractAddress, currentAddress, defaultChainId, getERC20ProtocolApprovalAddress, currentDate, stagePurchase, toggleCartSidebar]);

  if (![ExternalProtocol.LooksRare, ExternalProtocol.Seaport, ExternalProtocol.X2Y2, ExternalProtocol.NFTCOM].includes(listingProtocol as ExternalProtocol)) {
    // Unsupported marketplace.
    return null;
  }

  const listingCurrencyData = getByContractAddress(getListingCurrencyAddress(listing));

  return <div className="flex flex-col rounded-[10px] my-6 bg-[#F8F8F8] relative pt-12 font-noi-grotesk">
    <div className="bg-[#FCF1CD] h-8 w-full absolute top-0 rounded-t-[10px] flex items-center pl-6">
      <span className='font-bold text-secondary-txt'>
        {listing?.order?.protocol === ExternalProtocol.NFTCOM ? `${getAuctionTypeDisplayName((listing?.order?.protocolData as NftcomProtocolData).auctionType)}` : 'Fixed Price'}
      </span>
    </div>
    <div className='flex items-center mb-4 px-4'>
      <div className={tw(
        'relative flex items-center justify-center',
        'aspect-square h-8 w-8 rounded-full',
        Colors[listing?.order?.exchange]
      )}>
        {listing?.order?.exchange === ExternalExchange.X2Y2 ?
          <X2Y2Icon className='mx-1.5 h-9 w-9 relative shrink-0' alt="X2Y2 logo" layout="fill"/>
          :
          listing?.order?.exchange === ExternalExchange.NFTCOM ?
            <NFTLogo className='mx-1.5 h-9 w-9 relative shrink-0' alt="NFT.com logo" layout="fill"/>
            :
            listing?.order?.exchange === ExternalExchange.LooksRare ?
              <div
                onClick={(e: MouseEvent<any>) => {
                  e.preventDefault();
                  window.open(
                    getLooksrareAssetPageUrl(props?.nft?.contract, BigNumber.from(props?.nft?.tokenId).toString()),
                    '_blank'
                  );
                  e.stopPropagation();
                }}
                className='relative h-6 w-6 shrink-0 flex hover:cursor-pointer'>
                <Image src={Icons[listing?.order?.exchange]} alt="exchange logo" layout="fill" objectFit='cover'/>
              </div>
              :
              <div className='relative h-6 w-6 shrink-0 flex'>
                <Image src={Icons[listing?.order?.exchange]} alt="exchange logo" layout="fill" objectFit='cover'/>
              </div>
        }

      </div>
      <div className="flex flex-col text-primary-txt dark:text-primary-txt-dk ml-3">
        <span className='text-sm text-secondary-txt'>
          Current price on <span className="font-bold">{getProtocolDisplayName(listing?.order?.exchange as ExternalProtocol)}</span>
        </span>
        <div className='flex items-center'>
          <span className='text-xl font-medium'>
            {Number(ethers.utils.formatUnits(getListingPrice(listing, (listing?.order?.protocolData as NftcomProtocolData).auctionType === AuctionType.Decreasing ? currentDate : null), listingCurrencyData?.decimals ?? 18)).toLocaleString('en',{ useGrouping: false, minimumFractionDigits: 1, maximumFractionDigits: 4 })}{' '}
            {listingCurrencyData?.name ?? 'ETH'}
            <span className="text-secondary-txt text-sm ml-4">
              ${listingCurrencyData?.usd(Number(ethers.utils.formatUnits(getListingPrice(listing, (listing?.order?.protocolData as NftcomProtocolData).auctionType === AuctionType.Decreasing ? currentDate : null), listingCurrencyData?.decimals ?? 18)))}
            </span>
          </span>
        </div>
      </div>
    </div>
    <div className='flex flex-col items-center'>
      {
        props.buttons?.map(buttonType => {
          return <div className='flex items-center basis-1 grow px-2 w-full mt-2 mb-4' key={buttonType}>
            {getButton(buttonType)}
          </div>;
        })
      }
    </div>
  </div>;
}

export default React.memo<ExternalListingTileProps>(ExternalListingTile, (prevProps, nextProps) => {
  return prevProps.listing?.id === nextProps.listing?.id;
});
