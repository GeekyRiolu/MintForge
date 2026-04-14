import { Button, ButtonSize, ButtonType } from 'components/elements/Button';
import { NFTListingsContext } from 'components/modules/Checkout/NFTListingsContext';
import { NFTPurchasesContext } from 'components/modules/Checkout/NFTPurchaseContext';
import { NULL_ADDRESS } from 'constants/addresses';
import { getAddressForChain, nftAggregator } from 'constants/contracts';
import { WETH } from 'constants/tokens';
import { AuctionType, LooksrareProtocolData, Nft, NftcomProtocolData, SeaportProtocolData, X2Y2ProtocolData } from 'graphql/generated/types';
import { TransferProxyTarget, useNftCollectionAllowance } from 'hooks/balances/useNftCollectionAllowance';
import { useDefaultChainId } from 'hooks/useDefaultChainId';
import { useEthPriceUSD } from 'hooks/useEthPriceUSD';
import { useGetCurrentDate } from 'hooks/useGetCurrentDate';
import { useGetERC20ProtocolApprovalAddress } from 'hooks/useGetERC20ProtocolApprovalAddress';
import { useSupportedCurrencies } from 'hooks/useSupportedCurrencies';
import { ExternalProtocol } from 'types';
import { isNullOrEmpty } from 'utils/format';
import { getListingCurrencyAddress, getListingEndDate, getListingPrice, getLowestPriceListing } from 'utils/listingUtils';
import { getLooksrareAssetPageUrl } from 'utils/looksrareHelpers';
import { filterValidListings, getAuctionTypeDisplayName, getProtocolDisplayName } from 'utils/marketplaceUtils';
import { tw } from 'utils/tw';

import Countdown from './Countdown';
import DecreasingPriceNftCom from './DecreasingPriceNftCom';
import { EditListingsModal } from './EditListingsModal';
import { SelectListingModal } from './SelectListingModal';

import { BigNumber, ethers } from 'ethers';
import ETH from 'public/icons/eth.svg?svgr';
import LooksrareIcon from 'public/icons/looksrare-icon.svg?svgr';
import OpenseaIcon from 'public/icons/opensea-icon.svg?svgr';
import USDC from 'public/icons/usdc.svg?svgr';
import X2Y2Icon from 'public/icons/x2y2-icon.svg?svgr';
import NFTLogo from 'public/nft_logo_yellow.webp';
import { MouseEvent, useCallback, useContext, useState } from 'react';
import { PartialDeep } from 'type-fest';
import { useAccount } from 'wagmi';

export interface ExternalListingsProps {
  nft: PartialDeep<Nft>;
  collectionName: string;
}

export function ExternalListings(props: ExternalListingsProps) {
  const { stageListing, toggleCartSidebar } = useContext(NFTListingsContext);
  const { stagePurchase, toBuy } = useContext(NFTPurchasesContext);
  const { getByContractAddress } = useSupportedCurrencies();
  const chainId = useDefaultChainId();
  const { address: currentAddress } = useAccount();
  const ethPriceUsd: number = useEthPriceUSD();
  const currentDate = useGetCurrentDate();
  const [editListingsModalOpen, setEditListingsModalOpen] = useState(false);
  const [selectListingModalOpen, setSelectListingModalOpen] = useState(false);
  const getERC20ProtocolApprovalAddress = useGetERC20ProtocolApprovalAddress();

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

  const nftInPurchaseCart = useCallback((orderHash: string) => {
    return toBuy?.find((purchase) => purchase.nft?.id === props.nft?.id && purchase?.orderHash === orderHash) != null;
  }, [props.nft?.id, toBuy]);

  const getListingSummaryTitle = useCallback((listing: any) => {
    const protocolName = listing?.order?.exchange;
    return <div className='flex flex-col minmd:flex-row items-start minlg:items-center font-normal font-noi-grotesk text-[16px] text-[#6A6A6A] mt-2'>
      <span className='sm:hidden'>Current price on</span>
      <div className='flex items-center'>
        {listing?.order?.protocol === ExternalProtocol.Seaport && <OpenseaIcon className='ml-1.5 mr-1 sm:ml-0 h-7 w-7 relative shrink-0' alt="Opensea logo redirect" layout="fill"/>}
        {listing?.order?.protocol === ExternalProtocol.LooksRare &&
          <LooksrareIcon
            onClick={(e: MouseEvent<any>) => {
              e.preventDefault();
              window.open(
                getLooksrareAssetPageUrl(props?.nft?.contract, BigNumber.from(props?.nft?.tokenId).toString()),
                '_blank'
              );
              e.stopPropagation();
            }}
            className='ml-1.5 mr-1 sm:ml-0 h-7 w-7 relative shrink-0 hover:cursor-pointer'
            alt="Looksrare logo redirect"
            layout="fill"/>
        }
        {listing?.order?.protocol === ExternalProtocol.X2Y2 && <X2Y2Icon className='ml-1.5 mr-1 sm:ml-0 h-7 w-7 relative shrink-0' alt="X2Y2 logo redirect" layout="fill"/>}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {listing?.order?.protocol === ExternalProtocol.NFTCOM && <img src={NFTLogo.src} className='ml-1.5 mr-1 sm:ml-0 h-6 w-6 relative shrink-0' alt="NFT.com logo redirect" />}
        <span className='text-black'>{getProtocolDisplayName(protocolName)}</span>
      </div>
    </div>;
  }, [props?.nft?.contract, props?.nft?.tokenId]);

  const getIcon = useCallback((contract: string, currency: string) => {
    switch (currency) {
    case 'ETH':
      return <ETH className='-ml-1 h-6 w-6 relative mr-2 shrink-0' alt="ETH logo redirect" layout="fill"/>;
    case 'USDC':
      return <USDC className='-ml-1 h-6 w-6 relative mr-2 shrink-0' alt="USDC logo redirect" layout="fill"/>;
    default:
      if (!contract) {
        return <div>{currency}</div>;
      }
      // eslint-disable-next-line @next/next/no-img-element
      return <div className='-ml-1 flex items-center'><img
        className='-ml-1 mr-1.5 h-7 w-7 relative shrink-0'
        src={`https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${ethers.utils.getAddress(contract)}/logo.png`}
        alt={currency}
      />
      </div>;
    }
  }, []);

  const getListingSummaryButtons = useCallback((orderHash: string) => {
    if (currentAddress === (props.nft?.owner ?? props.nft?.wallet?.address)) {
      return <Button
        size={ButtonSize.LARGE}
        stretch
        label={'Edit Listing'}
        onClick={() => {
          setEditListingsModalOpen(true);
        }}
        type={ButtonType.PRIMARY}
      />;
    } else if (filterValidListings(props.nft?.listings?.items).length > 1) {
      return <Button
        size={ButtonSize.LARGE}
        stretch
        disabled={nftInPurchaseCart(orderHash)}
        label={nftInPurchaseCart(orderHash) ? 'In Cart' : 'Select Listing'}
        onClick={() => {
          setSelectListingModalOpen(true);
        }}
        type={ButtonType.PRIMARY}
      />;
    } else {
      const listing = filterValidListings(props.nft?.listings?.items)[0];
      return <Button
        size={ButtonSize.LARGE}
        stretch
        disabled={nftInPurchaseCart(orderHash)}
        label={nftInPurchaseCart(orderHash) ? 'In Cart' : 'Add to Cart'}
        onClick={async () => {
          const currencyData = getByContractAddress(getListingCurrencyAddress(listing) ?? WETH.address);
          const allowance = await currencyData.allowance(currentAddress, getAddressForChain(nftAggregator, chainId));
          const protocolAllowance = await currencyData.allowance(currentAddress, getERC20ProtocolApprovalAddress(listing?.order?.protocol as ExternalProtocol));
          const price = getListingPrice(listing, (listing?.order?.protocolData as NftcomProtocolData).auctionType === AuctionType.Decreasing ? currentDate : null);
          const protocol = listing?.order?.protocol as ExternalProtocol;
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
            protocolData: listing?.order?.protocol === ExternalProtocol.Seaport ?
              listing?.order?.protocolData as SeaportProtocolData
              : listing?.order?.protocol === ExternalProtocol.LooksRare ?
                listing?.order?.protocolData as LooksrareProtocolData :
                listing?.order?.protocol === ExternalProtocol.NFTCOM ?
                  listing?.order?.protocolData as NftcomProtocolData :
                  listing?.order?.protocolData as X2Y2ProtocolData
          });
          toggleCartSidebar('Buy');
        }}
        type={ButtonType.PRIMARY}
      />;
    }
  }, [currentAddress, props.nft, props.collectionName, nftInPurchaseCart, getByContractAddress, chainId, getERC20ProtocolApprovalAddress, currentDate, stagePurchase, toggleCartSidebar]);

  if (isNullOrEmpty(filterValidListings(props.nft?.listings?.items))) {
    return (
      currentAddress === (props.nft?.owner ?? props.nft?.wallet?.address) &&
        <div className={tw(
          'w-full flex mb-5',
        )}>
          <div className="flex flex-col items-center bg-[#F8F8F8] rounded-[10px] w-full px-4 pb-4 pt-12 relative">
            <div className="bg-[#FCF1CD] h-8 w-full absolute top-0 rounded-t-[10px] flex items-center pl-6">
              <span className='capital font-noi-grotesk font-bold text-[#6F6F6F]'>
                Unlisted NFT
              </span>
            </div>
            <span className='font-noi-grotesk text-base items-center text-[#1F2127] mb-4'>You own this NFT</span>
            <Button
              size={ButtonSize.LARGE}
              stretch
              label={'List NFT'}
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
                      listingError: false,
                      protocol: ExternalProtocol.NFTCOM,
                      currency: NULL_ADDRESS
                    }
                  ]
                });
                toggleCartSidebar('Sell');
              }}
              type={ButtonType.PRIMARY}
            />
          </div>
        </div>
    );
  }

  return <div className='w-full flex justify-center'>
    {editListingsModalOpen &&
      <EditListingsModal
        nft={props.nft}
        collectionName={props.collectionName}
        listings={filterValidListings(props.nft?.listings?.items)}
        visible={editListingsModalOpen}
        onClose={() => {
          setEditListingsModalOpen(false);
        }} />
    }
    {selectListingModalOpen &&
      <SelectListingModal
        listings={[
          getLowestPriceListing(filterValidListings(props.nft?.listings?.items), ethPriceUsd, chainId, ExternalProtocol.Seaport),
          getLowestPriceListing(filterValidListings(props.nft?.listings?.items), ethPriceUsd, chainId, ExternalProtocol.LooksRare),
          getLowestPriceListing(filterValidListings(props.nft?.listings?.items), ethPriceUsd, chainId, ExternalProtocol.X2Y2),
          getLowestPriceListing(filterValidListings(props.nft?.listings?.items), ethPriceUsd, chainId, ExternalProtocol.NFTCOM)
        ]?.filter( Boolean )}
        nft={props.nft}
        collectionName={props.collectionName}
        visible={selectListingModalOpen}
        onClose={() => {
          setSelectListingModalOpen(false);
        }}
      />
    }

    <div className='flex flex-col max-w-nftcom w-full'>
      {[
        getLowestPriceListing(filterValidListings(props.nft?.listings?.items), ethPriceUsd, chainId, ExternalProtocol.Seaport),
        getLowestPriceListing(filterValidListings(props.nft?.listings?.items), ethPriceUsd, chainId, ExternalProtocol.LooksRare),
        getLowestPriceListing(filterValidListings(props.nft?.listings?.items), ethPriceUsd, chainId, ExternalProtocol.X2Y2),
        getLowestPriceListing(filterValidListings(props.nft?.listings?.items), ethPriceUsd, chainId, ExternalProtocol.NFTCOM)
      ]?.filter( Boolean )?.map((listing, index) => {
        return listing && <div key={index} className={tw(
          'grid grid-cols-2 gap-5 justify-between flex-col bg-white rounded-[18px] shadow-xl border border-gray-200 mb-5 w-full max-w-nftcom h-fit  relative font-noi-grotesk',
        )}>
          <div className="pl-6 pb-2 mt-6 w-full flex flex-col items-top border-r border-r-[#F2F2F2]">
            <span className='sm:text-[20px] text-[28px] font-semibold text-black'>
              {listing?.order?.protocol === ExternalProtocol.NFTCOM ? `${getAuctionTypeDisplayName((listing?.order?.protocolData as NftcomProtocolData).auctionType)}` : 'Fixed Price'}
            </span>
            <div className='flex font-noi-grotesk text-black leading-6 items-center justify-between mt-6 sm:mt-2'>
              <div className='flex md:flex-col md:items-start items-end leading-6 flex-wrap'>
                <div className='flex items-end'>
                  <div className='flex items-end'>
                    {getIcon(
                      getByContractAddress(getListingCurrencyAddress(listing))?.contract,
                      getByContractAddress(getListingCurrencyAddress(listing))?.name ?? '-'
                    )}
                    <DecreasingPriceNftCom
                      listing={listing}
                      usd={false}
                    />
                  </div>
                  <span className='mx-1.5 text-[15px] uppercase font-semibold'>{getByContractAddress(getListingCurrencyAddress(listing))?.name ?? '-'}</span>
                </div>
                <DecreasingPriceNftCom
                  listing={listing}
                  usd={true}
                />
              </div>
            </div>
          </div>
          <div className='flex flex-col pt-7'>
            <Countdown eventTime={getListingEndDate(listing, listing?.order?.protocol as ExternalProtocol)} />
            {getListingSummaryTitle(listing)}
          </div>

          <div className='col-span-2 flex w-full h-full px-6 py-4 rounded-br-[18px] rounded-bl-[18px] bg-[#F2F2F2]'>
            {getListingSummaryButtons(listing.order.orderHash)}
          </div>
        </div>;
      })}
    </div>
  </div>;
}
