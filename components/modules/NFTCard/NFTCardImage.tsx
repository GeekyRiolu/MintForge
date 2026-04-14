import { RoundedCornerMedia, RoundedCornerVariant } from 'components/elements/RoundedCornerMedia';
import { NFTPurchasesContext } from 'components/modules//Checkout/NFTPurchaseContext';
import { NFTListingsContext } from 'components/modules/Checkout/NFTListingsContext';
import { DetailedNft } from 'components/modules/DiscoveryCards/CollectionCard';
import { getAddressForChain, nftAggregator, } from 'constants/contracts';
import { WETH } from 'constants/tokens';
import { LooksrareProtocolData, SeaportProtocolData, TxActivity, X2Y2ProtocolData } from 'graphql/generated/types';
import { useDefaultChainId } from 'hooks/useDefaultChainId';
import { useGetERC20ProtocolApprovalAddress } from 'hooks/useGetERC20ProtocolApprovalAddress';
import { NFTSupportedCurrency } from 'hooks/useSupportedCurrencies';
import { ExternalProtocol } from 'types';
import { isNullOrEmpty } from 'utils/format';
import { getGenesisKeyThumbnail, sameAddress } from 'utils/helpers';
import { getAddress } from 'utils/httpHooks';
import { getListingCurrencyAddress, getListingPrice } from 'utils/listingUtils';
import { getLooksrareAssetPageUrl } from 'utils/looksrareHelpers';
import { filterValidListings } from 'utils/marketplaceUtils';
import { tw } from 'utils/tw';

import { BigNumber } from 'ethers';
import LooksrareIcon from 'public/icons/LR_gray_card.svg?svgr';
import NFTLogo from 'public/icons/nft_logo_yellow.svg?svgr';
import OpenseaIcon from 'public/icons/OS_gray_card.svg?svgr';
import ShopIcon from 'public/icons/shop-icon.svg?svgr';
import X2Y2Gray from 'public/icons/x2y2_gray.svg?svgr';
import { MouseEvent, useCallback, useContext } from 'react';
import { PartialDeep } from 'type-fest';
import { PartialObjectDeep } from 'type-fest/source/partial-deep';
import { useAccount } from 'wagmi';

export interface NFTCardImageProps {
  contractAddr: string;
  collectionName: string;
  tokenId: string;
  images: Array<string | null>;
  bestListing: PartialObjectDeep<TxActivity, unknown>;
  currencyData: NFTSupportedCurrency;
  listings?: PartialDeep<TxActivity>[];
  nft?: PartialDeep<DetailedNft>;
  isOwnedByMe?: boolean;
  descriptionVisible?: boolean;
}

export function NFTCardImage(props: NFTCardImageProps) {
  const { stagePurchase } = useContext(NFTPurchasesContext);
  const { toggleCartSidebar } = useContext(NFTListingsContext);
  const { address: currentAddress } = useAccount();
  const defaultChainId = useDefaultChainId();

  const isAddressValid = sameAddress(props.contractAddr, getAddress('genesisKey', defaultChainId)) && !isNullOrEmpty(props.tokenId);
  const processedImageURLs = isAddressValid ?
    [getGenesisKeyThumbnail(props.tokenId)]
    : props.images.length > 0 ? props.images : [props?.nft?.metadata?.imageURL];

  const getERC20ProtocolApprovalAddress = useGetERC20ProtocolApprovalAddress();

  const getMarketplaceIcon = useCallback((protocol: ExternalProtocol) => {
    switch (protocol) {
    case ExternalProtocol.NFTCOM:
      return (
        <NFTLogo
          className='h-[25px] w-[25px] relative shrink-0'
          alt="NFT.com logo redirect"
          layout="fill"
          key='nft-com-logo'
        />
      );
    case ExternalProtocol.LooksRare:
      return (
        <LooksrareIcon
          onClick={(e: MouseEvent<any>) => {
            e.preventDefault();
            window.open(
              getLooksrareAssetPageUrl(props.contractAddr, BigNumber.from(props.tokenId).toString()),
              '_blank'
            );
            e.stopPropagation();
          }}
          className='h-[25px] w-[25px] relative shrink-0 grayscale'
          alt="Looksrare logo redirect"
          layout="fill"
          key='looksrare-icon'
        />
      );
    case ExternalProtocol.Seaport:
      return (
        <OpenseaIcon
          className='h-[25px] w-[25px] relative shrink-0 grayscale'
          alt="Opensea logo redirect"
          layout="fill"
          key='opensea-icon'
        />
      );
    case ExternalProtocol.X2Y2:
      return (
        <X2Y2Gray
          className='h-[25px] w-[25px] relative shrink-0 grayscale'
          alt="Opensea logo redirect"
          layout="fill"
          key='x2y2-gray-icon'
        />
      );
    default:
      break;
    }
  }, [props]);

  const validListings = filterValidListings(props?.listings || props?.nft?.listings?.items);

  return (
    <div className={tw(
      'object-cover overflow-hidden rounded-t-2xl',
      props?.descriptionVisible === false && 'rounded-b-2xl'
    )}>
      <div className='group-hover/ntfCard:scale-110 hover:scale-105 transition'>
        <RoundedCornerMedia
          sizes="380px"
          variant={RoundedCornerVariant.None}
          width={600}
          height={600}
          containerClasses='w-full h-full overflow-hidden'
          src={processedImageURLs[0]}
          extraClasses='hover:scale-105 transition'
        />
        <div className="group-hover/ntfCard:opacity-100 opacity-0 w-full h-full bg-[rgba(0,0,0,0.40)] absolute top-0">
          {(props?.listings?.length || props?.nft?.listings?.items?.length) && props?.bestListing && !props?.isOwnedByMe ?
            <div className='w-full h-full relative'>
              <div className='absolute top-7 left-7'>
                <button
                  onClick={async (e) => {
                    e.preventDefault();
                    const allowance = await props?.currencyData.allowance(currentAddress, getAddressForChain(nftAggregator, defaultChainId));
                    const protocolAllowance = await props?.currencyData.allowance(currentAddress, getERC20ProtocolApprovalAddress(props?.bestListing?.order?.protocol as ExternalProtocol));
                    const price = getListingPrice(props?.bestListing);
                    stagePurchase({
                      nft: props?.nft,
                      activityId: props?.bestListing?.id,
                      currency: getListingCurrencyAddress(props?.bestListing) ?? WETH.address,
                      price: price,
                      collectionName: props.collectionName,
                      protocol: props?.bestListing?.order?.protocol as ExternalProtocol,
                      isERC20ApprovedForAggregator: BigNumber.from(allowance ?? 0).gt(price),
                      isERC20ApprovedForProtocol: BigNumber.from(protocolAllowance ?? 0).gt(price),
                      orderHash: props?.bestListing?.order?.orderHash,
                      makerAddress: props?.bestListing?.order?.makerAddress,
                      takerAddress: props?.bestListing?.order?.takerAddress,
                      nonce: props?.bestListing?.order?.nonce,
                      protocolData: props?.bestListing?.order?.protocol === ExternalProtocol.Seaport ?
                        props?.bestListing?.order?.protocolData as SeaportProtocolData :
                        props?.bestListing?.order?.protocol === ExternalProtocol.X2Y2 ?
                          props?.bestListing?.order?.protocolData as X2Y2ProtocolData :
                          props?.bestListing?.order?.protocolData as LooksrareProtocolData
                    });
                    toggleCartSidebar('Buy');
                  }}
                  className="p-[11px] bg-footer-bg hover:bg-[#ECECEC] text-button-tertiary-hover rounded-[10px] h-10 w-10">
                  <ShopIcon />
                </button>
              </div>
              <div className='absolute bottom-7 left-7 flex flex-row w-full justify-between items-center pr-14 flex-wrap'>
                <p className='text-white text-sm font-noi-grotesk font-medium'>Available on</p>
                {validListings && (
                  <div className='flex flex-row space-x-1.5 flex-nowrap'>
                    {validListings
                      .map(item => item?.order?.protocol as ExternalProtocol)
                      //remove duplicate protocols
                      .filter((value, index, self) => self.indexOf(value) === index).map(protocol => {
                        return getMarketplaceIcon(protocol);
                      })}
                  </div>
                )}
              </div>
            </div>
            : null}
        </div>
      </div>
    </div>
  );
}
