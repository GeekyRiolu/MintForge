import CustomTooltip from 'components/elements/CustomTooltip';
import { DetailedNft } from 'components/modules/DiscoveryCards/CollectionCard';
import { getAddressForChain, nftProfile } from 'constants/contracts';
import { TxActivity } from 'graphql/generated/types';
import { useProfileQuery } from 'graphql/hooks/useProfileQuery';
import { useDefaultChainId } from 'hooks/useDefaultChainId';
import { NFTSupportedCurrency } from 'hooks/useSupportedCurrencies';
import { ExternalProtocol } from 'types';
import { getListingEndDate, getListingPrice } from 'utils/listingUtils';
import { tw } from 'utils/tw';

import { ethers } from 'ethers';
import moment from 'moment';
import GK from 'public/icons/Badge_Key.svg?svgr';
import ETH from 'public/icons/eth.svg?svgr';
import ETHBlack from 'public/icons/eth-black.svg?svgr';
import USDC from 'public/icons/usdc.svg?svgr';
import { useCallback } from 'react';
import { PartialDeep } from 'type-fest';
import { PartialObjectDeep } from 'type-fest/source/partial-deep';

export interface NFTCardDescriptionProps {
  contractAddr: string;
  tokenId: string;
  name: string;
  collectionName: string;
  bestListing: PartialObjectDeep<TxActivity, unknown>;
  currencyData: NFTSupportedCurrency;
  nft?: PartialDeep<DetailedNft>;
  listings?: PartialDeep<TxActivity>[];
}

export function NFTCardDescription(props: NFTCardDescriptionProps) {
  const checkEndDate = () => {
    if(props?.bestListing){
      const endDate = moment.unix(getListingEndDate(props?.bestListing, props?.bestListing.order.protocol as ExternalProtocol));
      const date = moment(endDate).fromNow();

      if(date.includes('minute') || date.includes('second')){
        return 'less than 1 hour';
      } else return date.replace('in ', '');
    }
  };

  const getIcon = useCallback((contract: string, currency: string) => {
    switch (currency) {
    case 'ETH':
      return <ETHBlack className='-ml-1 mr-1 h-4 w-4 relative shrink-0 grayscale' alt="ETH logo redirect" layout="fill"/>;
    case 'USDC':
      return <USDC className='-ml-1 mr-1 h-4 w-4 relative shrink-0' alt="USDC logo redirect" layout="fill"/>;
    case 'WETH':
      return <ETH className='-ml-1 mr-1 h-4 w-4 relative shrink-0' alt="ETH logo redirect" layout="fill"/>;
    default:
      if (!contract) {
        return <div>{currency}</div>;
      }
      // eslint-disable-next-line @next/next/no-img-element
      return <div className='-ml-1 mr-1 flex items-center'><img
        className='h-5 w-5 relative shrink-0'
        src={`https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${ethers.utils.getAddress(contract)}/logo.png`}
        alt={currency}
      />
      </div>;
    }
  }, []);

  return (
    <div className={tw(
      'sm:h-[auto] p-[18px] bg-white font-noi-grotesk',
      'h-max',
      'flex flex-row w-full max-w-full rounded-b-2xl'
    )}
    >
      <div
        className={tw(
          'sm:leading-[18px]  flex flex-col text-xl leading-[28px] font-[600] list-none font-noi-grotesk',
          'max-w-full w-full h-max'
        )}
      >
        <div className='flex w-full justify-between'>
          <div className="p-0 m-[0] whitespace-nowrap text-ellipsis overflow-hidden flex mr-5">
            <p className='whitespace-nowrap text-ellipsis overflow-hidden'>{props.name}</p>
            {props.nft?.isGKMinted &&
              <div className='h-4 w-4 minlg:h-6 minlg:w-6 ml-2 min-w-[24px] flex items-center'>
                <GK />
              </div>
            }
          </div>
          {
            (props?.listings?.length || props?.nft?.listings?.items?.length) && props?.bestListing ?
              <CustomTooltip
                orientation='top'
                tooltipComponent={
                  <div
                    className="w-max"
                  >
                    <p>
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', currencyDisplay: 'narrowSymbol' }).format(props?.currencyData?.usd(Number(ethers.utils.formatUnits(getListingPrice(props?.bestListing), props?.currencyData?.decimals ?? 18))) ?? 0)}
                    </p>
                  </div>
                }
              >
                <div className='hidden minmd:flex items-center text-base font-medium hover:bg-footer-bg hover:rounded-full py-1 px-2 -mr-2 -mt-1 '>
                  {getIcon(
                    props?.currencyData?.contract,
                    props?.currencyData?.name ?? 'WETH',
                  )}
                  {props?.currencyData?.decimals ? Number(ethers.utils.formatUnits(getListingPrice(props?.bestListing), props?.currencyData?.decimals ?? 18)).toLocaleString(undefined, { maximumSignificantDigits: 3 }) : '-'}
                      &nbsp;
                  {props?.currencyData?.name ?? 'WETH'}
                </div>
              </CustomTooltip>
              : null
          }
        </div>
        <div className='flex w-full flex-row justify-between items-center'>
          <p
            className={tw(
              'sm:text-sm text-base leading-[25.5px] text-[#6A6A6A] mt-1 font-[400] list-none p-0 m-[0] whitespace-nowrap text-ellipsis overflow-hidden'
            )}
          >
            {props.collectionName}
          </p>
          {(props?.listings?.length || props?.nft?.listings?.items?.length) && props?.bestListing ?
            <p className="text-[#B2B2B2] font-normal text-sm mt-1 whitespace-nowrap ml-5 hidden minmd:block">
                      Ends in
              <span className='text-[#6A6A6A] font-medium'> {checkEndDate()}</span>
            </p>
            : null
          }
        </div>
        <div className='flex minmd:hidden justify-between mt-4 flex-wrap-reverse'>
          {(props?.listings?.length || props?.nft?.listings?.items?.length) && props?.bestListing ?
            <>
              <p className="text-[#B2B2B2] font-normal text-sm mt-1 whitespace-nowrap">
                      Ends in
                <span className='text-[#6A6A6A] font-medium'> {checkEndDate()}</span>
              </p>
              <CustomTooltip
                orientation='top'
                tooltipComponent={
                  <div
                    className="w-max"
                  >
                    <p>
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', currencyDisplay: 'narrowSymbol' }).format(props?.currencyData?.usd(Number(ethers.utils.formatUnits(getListingPrice(props?.bestListing), props?.currencyData?.decimals ?? 18))) ?? 0)}
                    </p>
                  </div>
                }
              >
                <div className='items-center text-base font-medium hover:bg-footer-bg hover:rounded-full py-1 px-2 -mr-2 -mt-1 flex'>
                  {getIcon(
                    props?.currencyData?.contract,
                    props?.currencyData?.name ?? 'WETH',
                  )}
                  {props?.currencyData?.decimals ? Number(ethers.utils.formatUnits(getListingPrice(props?.bestListing), props?.currencyData?.decimals ?? 18)).toLocaleString(undefined, { maximumSignificantDigits: 3 }) : '-'}
                   &nbsp;
                  {props?.currencyData?.name ?? 'WETH'}
                </div>
              </CustomTooltip>
            </>
            : null
          }
        </div>
      </div>
    </div>

  );
}
