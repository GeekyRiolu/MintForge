import CustomTooltip from 'components/elements/CustomTooltip';
import { DropdownPicker } from 'components/elements/DropdownPicker';
import { PriceInput } from 'components/elements/PriceInput';
import { LooksrareProtocolData, NftcomProtocolData, X2Y2ProtocolData } from 'graphql/generated/types';
import { useDefaultChainId } from 'hooks/useDefaultChainId';
import { useEthPriceUSD } from 'hooks/useEthPriceUSD';
import { SupportedCurrency, useSupportedCurrencies } from 'hooks/useSupportedCurrencies';
import { ExternalProtocol } from 'types';
import { getContractMetadata } from 'utils/alchemyNFT';
import { Doppler, getEnvBool } from 'utils/env';
import { getAddress } from 'utils/httpHooks';
import { processIPFSURL } from 'utils/ipfs';
import { getLowestPriceListing } from 'utils/listingUtils';
import { filterValidListings } from 'utils/marketplaceUtils';
import { tw } from 'utils/tw';

import { NFTListingsContext, StagedListing } from './NFTListingsContext';

import { BigNumber, ethers } from 'ethers';
import { useRouter } from 'next/router';
import RemoveIcon from 'public/icons/close-circle-icon-gray.svg?svgr';
import InfoIcon from 'public/icons/gray-info-icon.svg?svgr';
import DeleteRowIcon from 'public/icons/trash-icon.svg?svgr';
import { useContext, useMemo, useRef } from 'react';
import useSWR from 'swr';
import { PartialDeep } from 'type-fest';
import { useNetwork } from 'wagmi';
export interface ListingCheckoutNftTableRowProps {
  listing: PartialDeep<StagedListing>;
  onPriceChange: () => void;
}

export function ListingCheckoutNftTableRow(props: ListingCheckoutNftTableRowProps) {
  const defaultChainId = useDefaultChainId();
  const ethPriceUSD = useEthPriceUSD();
  const { data: supportedCurrencyData } = useSupportedCurrencies();
  const lowestX2Y2Listing = getLowestPriceListing(filterValidListings(props?.listing?.nft?.listings?.items), ethPriceUSD, defaultChainId, ExternalProtocol.X2Y2);
  const lowestLooksrareListing = getLowestPriceListing(filterValidListings(props?.listing?.nft?.listings?.items), ethPriceUSD, defaultChainId, ExternalProtocol.LooksRare);
  const lowestNftcomListing = getLowestPriceListing(filterValidListings(props?.listing?.nft?.listings?.items), ethPriceUSD, defaultChainId, ExternalProtocol.NFTCOM);
  const { chain } = useNetwork();
  const { data: collection } = useSWR('ContractMetadata' + props.listing?.nft?.contract, async () => {
    return await getContractMetadata(props.listing?.nft?.contract, chain?.id);
  });
  const {
    setPrice,
    setEndingPrice,
    setCurrency,
    setTypeOfAuction,
    toggleTargetMarketplace,
    // clearGeneralConfig,
    getTarget,
    removeListing,
    decreasingPriceError,
    englishAuctionError
  } = useContext(NFTListingsContext);
  const router = useRouter();

  const rowSelectedMarketplaces = useRef(null);

  const selectedOptionDropdown0 = useRef(null);
  const selectedOptionDropdown1 = useRef(null);
  const selectedOptionDropdown2 = useRef(null);
  const selectedOptionDropdown3 = useRef(null);
  const auctionTypeForPrice = useRef(null);

  // const rowHeightClass = expanded ? 'h-48' : 'h-24';
  const seaportEnabled = useMemo(() => getTarget(props.listing, ExternalProtocol.Seaport) != null, [getTarget, props.listing]);
  const looksrareEnabled = useMemo(() => getTarget(props.listing, ExternalProtocol.LooksRare) != null, [getTarget, props.listing]);
  const X2Y2Enabled = useMemo(() => getTarget(props.listing, ExternalProtocol.X2Y2) != null, [getTarget, props.listing]);
  const NFTCOMEnabled = useMemo(() => getTarget(props.listing, ExternalProtocol.NFTCOM) != null, [getTarget, props.listing]);

  const LooksRareIcon = '/looksrare-icon.svg';
  const NFTCOMIcon = '/nft_logo_yellow.svg';
  const OpenseaIcon = '/opensea-icon.svg';
  const X2Y2Icon = '/x2y2-icon.svg';

  const generateMarketPlaceOptions = (dropDownNumber: number, hasPredefinedSelectedOption?: boolean) => {
    let selectedOptionForDropdown = dropDownNumber === 0 ? selectedOptionDropdown0 : dropDownNumber === 1 ? selectedOptionDropdown1 : selectedOptionDropdown2;
    if (hasPredefinedSelectedOption) {
      if (dropDownNumber === 0) {
        selectedOptionDropdown0.current = ExternalProtocol.Seaport;
        selectedOptionForDropdown = selectedOptionDropdown0;
      }
      if (dropDownNumber === 1) {
        selectedOptionDropdown1.current = ExternalProtocol.LooksRare;
        selectedOptionForDropdown = selectedOptionDropdown1;
      }
      if (dropDownNumber === 2) {
        selectedOptionDropdown2.current = ExternalProtocol.X2Y2;
        selectedOptionForDropdown = selectedOptionDropdown2;
      }
      if (dropDownNumber === 3) {
        selectedOptionDropdown3.current = ExternalProtocol.NFTCOM;
        selectedOptionForDropdown = selectedOptionDropdown3;
      }
    }

    const base = [
      {
        label: 'Opensea', // ExternalProtocol.Seaport,
        icon: OpenseaIcon,
        imageSize: 24,
        customIconClass: '-ml-[2px]',
        onSelect: () => {
          rowSelectedMarketplaces.current = ExternalProtocol.Seaport;
          toggleTargetMarketplace(ExternalProtocol.Seaport, props.listing, selectedOptionForDropdown.current);
          if (dropDownNumber === 0) selectedOptionDropdown0.current = ExternalProtocol.Seaport;
          if (dropDownNumber === 1) selectedOptionDropdown1.current = ExternalProtocol.Seaport;
          if (dropDownNumber === 2) selectedOptionDropdown2.current = ExternalProtocol.Seaport;
          if (dropDownNumber === 3) selectedOptionDropdown3.current = ExternalProtocol.Seaport;
        },
        disabled: seaportEnabled
      },
      {
        label: ExternalProtocol.LooksRare,
        icon: LooksRareIcon,
        imageSize: 24,
        customIconClass: '-ml-[2px]',
        onSelect: () => {
          rowSelectedMarketplaces.current = ExternalProtocol.LooksRare;
          toggleTargetMarketplace(ExternalProtocol.LooksRare, props.listing, selectedOptionForDropdown.current);
          if (dropDownNumber === 0) selectedOptionDropdown0.current = ExternalProtocol.LooksRare;
          if (dropDownNumber === 1) selectedOptionDropdown1.current = ExternalProtocol.LooksRare;
          if (dropDownNumber === 2) selectedOptionDropdown2.current = ExternalProtocol.LooksRare;
          if (dropDownNumber === 3) selectedOptionDropdown3.current = ExternalProtocol.LooksRare;
        },
        disabled: looksrareEnabled
      },
      {
        label: ExternalProtocol.X2Y2,
        icon: X2Y2Icon,
        imageSize: 18,
        onSelect: () => {
          rowSelectedMarketplaces.current = ExternalProtocol.X2Y2;
          toggleTargetMarketplace(ExternalProtocol.X2Y2, props.listing, selectedOptionForDropdown.current);
          if (dropDownNumber === 0) selectedOptionDropdown0.current = ExternalProtocol.X2Y2;
          if (dropDownNumber === 1) selectedOptionDropdown1.current = ExternalProtocol.X2Y2;
          if (dropDownNumber === 2) selectedOptionDropdown2.current = ExternalProtocol.X2Y2;
          if (dropDownNumber === 3) selectedOptionDropdown3.current = ExternalProtocol.X2Y2;
        },
        disabled: X2Y2Enabled
      },
      {
        label: 'NFT.com',
        icon: NFTCOMIcon,
        imageSize: 18,
        onSelect: () => {
          rowSelectedMarketplaces.current = ExternalProtocol.NFTCOM;
          toggleTargetMarketplace(ExternalProtocol.NFTCOM, props.listing, selectedOptionForDropdown.current);
          if (dropDownNumber === 0) selectedOptionDropdown0.current = ExternalProtocol.NFTCOM;
          if (dropDownNumber === 1) selectedOptionDropdown1.current = ExternalProtocol.NFTCOM;
          if (dropDownNumber === 2) selectedOptionDropdown2.current = ExternalProtocol.NFTCOM;
          if (dropDownNumber === 3) selectedOptionDropdown3.current = ExternalProtocol.NFTCOM;
        },
        disabled: NFTCOMEnabled
      }
    ];

    return base;
  };

  const generateTypeOfAuctionOptions = () => {
    return [
      {
        label: 'Fixed Price',
        onSelect: () => {
          setTypeOfAuction(props.listing, 0, ExternalProtocol.NFTCOM);
          auctionTypeForPrice.current = 0;
        },
        disabled: seaportEnabled
      },
      getEnvBool(Doppler.NEXT_PUBLIC_ENGLISH_AUCTION_ENABLED) && {
        label: 'English Auction',
        onSelect: () => {
          setTypeOfAuction(props.listing, 1, ExternalProtocol.NFTCOM);
          auctionTypeForPrice.current = 1;
        },
        disabled: seaportEnabled
      },
      {
        label: 'Decreasing Price',
        onSelect: () => {
          setTypeOfAuction(props.listing, 2, ExternalProtocol.NFTCOM);
          auctionTypeForPrice.current = 2;
        },
        disabled: seaportEnabled
      },
    ];
  };

  const OpenseaPriceInput = () => {
    return <PriceInput
      key={'OpenseaPriceInput'}
      initial={
        getTarget(props.listing, ExternalProtocol.Seaport)?.startingPrice == null ?
          '' :
          ethers.utils.formatEther(BigNumber.from(getTarget(props.listing, ExternalProtocol.Seaport)?.startingPrice ?? 0))
      }
      currencyAddress={getTarget(props.listing, ExternalProtocol.Seaport)?.currency ?? getAddress('weth', defaultChainId)}
      currencyOptions={['WETH', 'ETH']}
      onPriceChange={(val: BigNumber) => {
        setPrice(props.listing, val, ExternalProtocol.Seaport);
        props.onPriceChange();
      }}
      onCurrencyChange={(currency: SupportedCurrency) => {
        setCurrency(props.listing, currency, ExternalProtocol.Seaport);
        props.onPriceChange();
      }}
      error={
        (props.listing?.targets?.find(target => target.protocol === ExternalProtocol.Seaport && target.startingPrice == null) != null ||
    props.listing?.targets?.find(target => target.protocol === ExternalProtocol.Seaport && BigNumber.from(target.startingPrice).eq(0)) != null)
      }
    />;
  };

  const LooksRarePriceInput = () => {
    return <PriceInput
      key={'LooksrarePriceInput'}
      initial={
        getTarget(props.listing, ExternalProtocol.LooksRare)?.startingPrice == null ?
          '' :
          ethers.utils.formatEther(BigNumber.from(getTarget(props.listing, ExternalProtocol.LooksRare)?.startingPrice ?? 0))
      }
      currencyAddress={getAddress('weth', defaultChainId)}
      currencyOptions={['WETH']}
      onCurrencyChange={null}
      onPriceChange={(val: BigNumber) => {
        setPrice(props.listing, val, ExternalProtocol.LooksRare);
        props.onPriceChange();
      }}
      error={
        props.listing?.targets?.find(target => target.protocol === ExternalProtocol.LooksRare && target.startingPrice == null) != null ||
    props.listing?.targets?.find(target => target.protocol === ExternalProtocol.LooksRare && BigNumber.from(target.startingPrice).eq(0)) != null ||
    (parseInt((lowestLooksrareListing?.order?.protocolData as LooksrareProtocolData)?.price) < Number(props.listing?.targets?.find(target => target.protocol === ExternalProtocol.LooksRare)?.startingPrice))
      }
    />;
  };

  const X2Y2PriceInput = () => {
    return <PriceInput
      key={'X2Y2PriceInput'}
      initial={
        getTarget(props.listing, ExternalProtocol.X2Y2)?.startingPrice == null ?
          '' :
          ethers.utils.formatEther(BigNumber.from(getTarget(props.listing, ExternalProtocol.X2Y2)?.startingPrice ?? 0))
      }
      currencyAddress={getTarget(props.listing, ExternalProtocol.X2Y2)?.currency ?? getAddress('weth', defaultChainId)}
      currencyOptions={['ETH']}
      onCurrencyChange={null}
      onPriceChange={(val: BigNumber) => {
        setPrice(props.listing, val, ExternalProtocol.X2Y2);
        props.onPriceChange();
      }}
      error={
        props.listing?.targets?.find(target => target.protocol === ExternalProtocol.X2Y2 && target.startingPrice == null) != null ||
      props.listing?.targets?.find(target => target.protocol === ExternalProtocol.X2Y2 && BigNumber.from(target.startingPrice).eq(0)) != null ||
      (parseInt((lowestX2Y2Listing?.order?.protocolData as X2Y2ProtocolData)?.price) < Number(props.listing?.targets?.find(target => target.protocol === ExternalProtocol.X2Y2)?.startingPrice))
      }
    />;
  };

  const NFTCOMPriceInputInitialValue = () => {
    if (auctionTypeForPrice.current == 0 || auctionTypeForPrice.current == 2 ) {
      return getTarget(props.listing, ExternalProtocol.NFTCOM)?.startingPrice == null ?
        '' :
        ethers.utils.formatEther(BigNumber.from(getTarget(props.listing, ExternalProtocol.NFTCOM)?.startingPrice ?? 0));
    } else {
      return getTarget(props.listing, ExternalProtocol.NFTCOM)?.reservePrice == null ?
        '' :
        ethers.utils.formatEther(BigNumber.from(getTarget(props.listing, ExternalProtocol.NFTCOM)?.reservePrice ?? 0));
    }
  };

  const NFTCOMPriceInputEndingValue = () => {
    if (auctionTypeForPrice.current == 1) {
      return getTarget(props.listing, ExternalProtocol.NFTCOM)?.buyNowPrice == null ?
        '' :
        ethers.utils.formatEther(BigNumber.from(getTarget(props.listing, ExternalProtocol.NFTCOM)?.buyNowPrice ?? 0));
    } else if (auctionTypeForPrice.current == 2) {
      return getTarget(props.listing, ExternalProtocol.NFTCOM)?.endingPrice == null ?
        '' :
        ethers.utils.formatEther(BigNumber.from(getTarget(props.listing, ExternalProtocol.NFTCOM)?.endingPrice ?? 0));
    } else
      return null;
  };

  const NFTCOMPriceInput = () => {
    return <PriceInput
      key={'NFTCOMPriceInput'}
      initial={
        NFTCOMPriceInputInitialValue()
      }
      ending={
        NFTCOMPriceInputEndingValue()
      }
      currencyAddress={getTarget(props.listing, ExternalProtocol.NFTCOM)?.currency ?? supportedCurrencyData['ETH'].contract}
      currencyOptions={['ETH', 'WETH']}
      onPriceChange={(val: BigNumber, auctionType?: number) => {
        setPrice(props.listing, val, ExternalProtocol.NFTCOM, auctionType);
        props.onPriceChange();
      }}
      onEndingPriceChange={(val: BigNumber, auctionType?: number) => {
        setEndingPrice(props.listing, val, ExternalProtocol.NFTCOM, auctionType);
        props.onPriceChange();
      }}
      onCurrencyChange={(currency: SupportedCurrency) => {
        setCurrency(props.listing, currency, ExternalProtocol.NFTCOM);
        props.onPriceChange();
      }}
      error={
        (decreasingPriceError|| englishAuctionError ||
        props.listing?.targets?.find(target => target.protocol === ExternalProtocol.NFTCOM && target.startingPrice == null) != null ||
      props.listing?.targets?.find(target => target.protocol === ExternalProtocol.NFTCOM && BigNumber.from(target.startingPrice).eq(0)) != null) ||
      (parseInt((lowestNftcomListing?.order?.protocolData as NftcomProtocolData)?.takeAsset[0].value) < Number(props.listing?.targets?.find(target => target.protocol === ExternalProtocol.NFTCOM)?.startingPrice))
      }
      auctionTypeForPrice={auctionTypeForPrice.current}
    />;
  };

  return (
    <div className='minlg:min-h-[11rem] flex flex-col minlg:flex-row mb-8'>
      <div className='w-2/5 minlg:basis-2/12 minxxl:max-w-[10rem] flex flex-col justify-start items-start px-2 minxl:pl-0 minxl:pr-8'>
        <span className='w-full text-base font-normal flex text-[#A6A6A6] mb-4'>NFT</span>
        <div className='relative w-full'>
          <div className='relative aspect-square overflow-y-hidden rounded-md w-full'>
            <video
              autoPlay
              muted
              loop
              key={props.listing.nft?.metadata?.imageURL}
              src={processIPFSURL(props.listing.nft?.metadata?.imageURL)}
              poster={processIPFSURL(props.listing.nft?.metadata?.imageURL)}
              className={tw(
                'flex object-fit w-full justify-center rounded-md',
              )}
            />
          </div>
          <RemoveIcon
            className="h-20 minhd:h-28 absolute right-0 top-[-1.5rem] mr-[-2.5rem] minhd:mr-[-3.5rem] minhd:top-[-2rem] cursor-pointer z-[100]"
            onClick={() => removeListing(props.listing?.nft)} />
        </div>
        <div className='flex flex-col font-noi-grotesk'>
          <span className='font-bold text-base line-clamp-1 capitalize'>{props.listing?.nft?.metadata?.name?.toLowerCase()}</span>
          <span className='text-sm line-clamp-1 capitalize'>{collection?.contractMetadata?.name?.toLowerCase()}</span>
        </ div>
      </ div>
      {!seaportEnabled && !looksrareEnabled && !X2Y2Enabled && !NFTCOMEnabled && <span className='basis-7/12 minlg:basis-9/1 font-normal flex text-[#A6A6A6] px-4 minlg:pl-[20%] minxl:pl-[26%] minhd:pl-[30%] self-center items-center whitespace-nowrap'>Select a Marketplace</span>}
      {(seaportEnabled || looksrareEnabled || X2Y2Enabled || NFTCOMEnabled) && <div className='basis-8/12 minlg:basis-10/12 pl-2 minlg:pl-0'>
        {(seaportEnabled || looksrareEnabled || X2Y2Enabled || NFTCOMEnabled) && <div className='hidden minlg:flex text-base minlg:text-[0.85rem] minxl:text-base font-normal text-[#A6A6A6] mb-4'>
          <div className='w-[26%]'>Marketplace</div>
          <div className='w-[27%] flex flex-row justify-start'>
            <span className='shrink-0'>Type of Auction</span>
            <CustomTooltip
              tooltipClick={() => router.push('https://docs.nft.com/nft-trading/listing-types')}
              orientation='custom'
              customFullLeftPosition='left-4'
              hidden={false}
              tooltipComponent={
                <div
                  className="rounded-xl max-w-[200px] w-max cursor-pointer"
                >
                  <p>Learn more</p>
                </div>
              }
            >
              <InfoIcon className='ml-2' />
            </CustomTooltip>
          </div>
          <div className='w-[42%]'>Set Price</div>
          <div className='w-[5%]'>&nbsp;</div>
        </div>}
        {seaportEnabled && /*(selectedOptionDropdown0.current !== ExternalProtocol.Seaport && selectedOptionDropdown0.current !== 'Opensea') && */
          <div className='w-full flex flex-col minlg:flex-row border-b border-[#A6A6A6] minlg:border-0 pb-3 minlg:pb-0 mb-3 minlg:mb-0'>
            <div className='minlg:hidden w-full text-base font-normal flex text-[#A6A6A6] mb-3'>Marketplace</div>
            <div className='mb-2 rounded-md h-12 md:w-full minlg:min-w-[136px] minlg:w-[26%]'>
              <DropdownPicker
                options={generateMarketPlaceOptions(0, true)}
                selectedIndex={0}
                v2
              />
            </div>
            <div className='minlg:hidden w-full text-base font-normal flex text-[#A6A6A6] mb-3'>Type of Auction</div>
            <input
              disabled
              type="text"
              value='Fixed price'
              className={tw(
                'text-sm border border-gray-200 h-12 w-full minlg:w-[27%]',
                'text-left p-1 rounded-md mb-2 bg-gray-200 pl-2 minlg:ml-1',
              )}
            />
            <div className='minlg:hidden w-full text-base font-normal flex text-[#A6A6A6] mb-3'>Set Price</div>
            <div className='mb-2 minlg:mx-1 h-12 w-full minlg:w-[42%] flex flex-row'>
              {OpenseaPriceInput()}
              <div className='w-full flex minlg:hidden -ml-[16rem] z-10 minlg:z-auto'>
                <div className='w-full flex items-center justify-end '>
                  <DeleteRowIcon
                    className='cursor-pointer'
                    alt="Delete market place"
                    layout="fill"
                    onClick={() => {
                      toggleTargetMarketplace(ExternalProtocol.Seaport, props.listing);
                    }}
                  />
                </div>
              </div>
            </div>
            <div className='minlg:h-[3rem] w-full minlg:w-[5%] hidden minlg:flex'>
              <div className='w-full flex items-center justify-end '>
                <DeleteRowIcon
                  className='cursor-pointer'
                  alt="Delete market place"
                  layout="fill"
                  onClick={() => {
                    toggleTargetMarketplace(ExternalProtocol.Seaport, props.listing);
                  }}
                />
              </div>
            </div>
          </div>}
        {looksrareEnabled && /* && selectedOptionDropdown0.current !== ExternalProtocol.LooksRare &&*/
            <div className='w-full flex flex-col minlg:flex-row border-b border-[#A6A6A6] minlg:border-0 pb-3 minlg:pb-0 mb-3 minlg:mb-0'>
              <div className='minlg:hidden w-full text-base font-normal flex text-[#A6A6A6] mb-3'>Marketplace</div>
              <div className='mb-2 rounded-md h-12 md:w-full minlg:min-w-[136px] minlg:w-[26%]'>
                <DropdownPicker
                  options={generateMarketPlaceOptions(1, true)}
                  selectedIndex={1}
                  v2
                />
              </div>
              <div className='minlg:hidden w-full text-base font-normal flex text-[#A6A6A6] mb-3'>Type of Auction</div>
              <input
                disabled
                type="text"
                value='Fixed price'
                className={tw(
                  'text-sm border border-gray-200 h-12 w-full minlg:w-[27%]',
                  'text-left p-1 rounded-md mb-2 bg-gray-200 pl-2 minlg:ml-1',
                )}
              />
              <div className='minlg:hidden w-full text-base font-normal flex text-[#A6A6A6] mb-3'>Set Price</div>
              <div className='mb-2 minlg:mx-1 h-12 w-full minlg:w-[42%] flex flex-row'>
                <CustomTooltip
                  orientation='custom'
                  customLeftPosition='19'
                  hidden={
                    !(parseInt((lowestLooksrareListing?.order?.protocolData as LooksrareProtocolData)?.price) < Number(props.listing?.targets?.find(target => target.protocol === ExternalProtocol.LooksRare)?.startingPrice))
                  }
                  tooltipComponent={
                    <div
                      className="rounded-xl max-w-[200px] w-max"
                    >
                      <p>LooksRare only allows adjusting the price to a lower value. Please lower the value, or cancel the previous listing in order to create a new listing at a higher price.</p>
                    </div>
                  }
                >
                  {LooksRarePriceInput()}
                </CustomTooltip>
                <div className='w-full flex minlg:hidden -ml-[16rem] z-10 minlg:z-auto'>
                  <div className='w-full flex items-center justify-end '>
                    <DeleteRowIcon
                      className='cursor-pointer'
                      alt="Delete market place"
                      layout="fill"
                      onClick={() => {
                        toggleTargetMarketplace(ExternalProtocol.LooksRare, props.listing);
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className='minlg:h-[3rem] w-full minlg:w-[5%] hidden minlg:flex'>
                <div className='w-full flex items-center justify-end '>
                  <DeleteRowIcon
                    className='cursor-pointer'
                    alt="Delete market place"
                    layout="fill"
                    onClick={() => {
                      toggleTargetMarketplace(ExternalProtocol.LooksRare, props.listing);
                    }}
                  />
                </div>
              </div>
            </div>}
        {X2Y2Enabled && /* selectedOptionDropdown0.current !== ExternalProtocol.X2Y2 && */
          <div className='w-full flex flex-col minlg:flex-row border-b border-[#A6A6A6] minlg:border-0 pb-3 minlg:pb-0 mb-3 minlg:mb-0'>
            <div className='minlg:hidden w-full text-base font-normal flex text-[#A6A6A6] mb-3'>Marketplace</div>
            <div className='mb-2 rounded-md h-12 md:w-full minlg:min-w-[136px] minlg:w-[26%]'>
              <DropdownPicker
                options={generateMarketPlaceOptions(2, true)}
                selectedIndex={2}
                v2
              />
            </div>
            <div className='minlg:hidden w-full text-base font-normal flex text-[#A6A6A6] mb-3'>Type of Auction</div>
            <input
              disabled
              type="text"
              value='Fixed price'
              className={tw(
                'text-sm border border-gray-200 h-12 w-full minlg:w-[27%]',
                'text-left p-1 rounded-md mb-2 bg-gray-200 pl-2 minlg:ml-1',
              )}
            />
            <div className='minlg:hidden w-full text-base font-normal flex text-[#A6A6A6] mb-3'>Set Price</div>
            <div className='mb-2 minlg:mx-1 h-12 w-full minlg:w-[42%] flex flex-row relative'>
              <CustomTooltip
                orientation='custom'
                customLeftPosition='19'
                hidden={
                  !(parseInt((lowestX2Y2Listing?.order?.protocolData as X2Y2ProtocolData)?.price) < Number(props.listing?.targets?.find(target => target.protocol === ExternalProtocol.X2Y2)?.startingPrice))
                }
                tooltipComponent={
                  <div
                    className="rounded-xl max-w-[200px] w-max"
                  >
                    <p>X2Y2 only allows adjusting the price to a lower value. Please lower the value, or cancel the previous listing in order to create a new listing at a higher price.</p>
                  </div>
                }
              >
                {X2Y2PriceInput()}
              </CustomTooltip>
              <div className='w-full flex minlg:hidden -ml-[16rem] z-10 minlg:z-auto'>
                <div className='w-full flex items-center justify-end '>
                  <DeleteRowIcon
                    className='cursor-pointer'
                    alt="Delete market place"
                    layout="fill"
                    onClick={() => {
                      toggleTargetMarketplace(ExternalProtocol.X2Y2, props.listing);
                    }}
                  />
                </div>
              </div>
            </div>
            <div className='minlg:h-[3rem] w-full minlg:w-[5%] hidden minlg:flex'>
              <div className='w-full flex items-center justify-end '>
                <DeleteRowIcon
                  className='cursor-pointer'
                  alt="Delete market place"
                  layout="fill"
                  onClick={() => {
                    toggleTargetMarketplace(ExternalProtocol.X2Y2, props.listing);
                  }}
                />
              </div>
            </div>
          </div>}
        {NFTCOMEnabled && /*(selectedOptionDropdown0.current !== ExternalProtocol.Seaport && selectedOptionDropdown0.current !== 'Opensea') && */
          <div className='w-full flex flex-col minlg:flex-row border-b border-[#A6A6A6] minlg:border-0 pb-3 minlg:pb-0 mb-3 minlg:mb-0'>
            <div className='minlg:hidden w-full text-base font-normal flex text-[#A6A6A6] mb-3'>Marketplace</div>
            <div className='mb-2 rounded-md h-12 md:w-full minlg:min-w-[136px] minlg:w-[26%]'>
              <DropdownPicker
                options={generateMarketPlaceOptions(3, true)}
                selectedIndex={3}
                v2
              />
            </div>
            <div className='minlg:hidden w-full text-base font-normal flex text-[#A6A6A6] mb-3'>Type of Auction</div>
            <div className='mb-2 rounded-md h-12 w-[89%] minlg:w-[27%] minlg:ml-1'>
              <DropdownPicker
                options={generateTypeOfAuctionOptions()}
                placeholder={'Select'}
                v2
              />
            </div>
            <div className='minlg:hidden w-full text-base font-normal flex text-[#A6A6A6] mb-3'>
              Set Price
            </div>
            <div className='mb-2 minlg:mx-1 h-12 w-full minlg:w-[42%] flex flex-row'>
              <CustomTooltip
                orientation='custom'
                customLeftPosition='19'
                hidden={
                  !(parseInt((lowestNftcomListing?.order?.protocolData as NftcomProtocolData)?.takeAsset[0].value) < Number(props.listing?.targets?.find(target => target.protocol === ExternalProtocol.NFTCOM)?.startingPrice))
                }
                tooltipComponent={
                  <div
                    className="rounded-xl max-w-[200px] w-max"
                  >
                    <p>Nft.com only allows adjusting the price to a lower value. Please lower the value, or cancel the previous listing in order to create a new listing at a higher price.</p>
                  </div>
                }
              >
                {NFTCOMPriceInput()}
              </CustomTooltip>
              <div className='w-full flex minlg:hidden -ml-[16rem] z-10 minlg:z-auto'>
                <div className='w-full flex items-center justify-end '>
                  <DeleteRowIcon
                    className='cursor-pointer'
                    alt="Delete market place"
                    layout="fill"
                    onClick={() => {
                      toggleTargetMarketplace(ExternalProtocol.NFTCOM, props.listing);
                    }}
                  />
                </div>
              </div>
            </div>

            <div className='minlg:h-[3rem] minlg:w-[5%] hidden minlg:flex'>
              <div className='w-full text-base font-normal flex text-[#A6A6A6] mb-3'>&nbsp;</div>
              <div className='minlg:h-[3rem] w-full minlg:flex'>
                <div className='w-full flex items-center justify-end '>
                  <DeleteRowIcon
                    className='cursor-pointer'
                    alt="Delete market place"
                    layout="fill"
                    onClick={() => {
                      toggleTargetMarketplace(ExternalProtocol.NFTCOM, props.listing);
                    }}
                  />
                </div>
              </div>
            </div>

          </div>}
      </div>}
    </div>
  );
}
