import CustomTooltip from 'components/elements/CustomTooltip';
import { ContractSalesStatistics } from 'graphql/generated/types';
import { useEthPriceUSD } from 'hooks/useEthPriceUSD';
import { tw } from 'utils/tw';

import { CaretDown, CaretUp, Info } from 'phosphor-react';
import { useState } from 'react';
export type CollectionInfoProps = {
  data: ContractSalesStatistics['statistics']
  hasDescription?: boolean
  type?: string
}

export const CollectionInfo = ({ data, type }: CollectionInfoProps) => {
  const ethPriceUSD = useEthPriceUSD();
  const [isExpanded, setIsExpanded] = useState(false);
  const formatCurrency = (input: number) => {
    return input?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };
  return (
    <div
      data-cy="collectionInfoContainer"
      className="bg-[#F8F8F8] px-6 pt-6 pb-4 minmd:pb-6 rounded-[10px] font-noi-grotesk grid minmd:grid-cols-2 minmd:gap-16 minlg:gap-6 minxl:gap-12">
      <div className='flex flex-col'>
        <div className="flex justify-between h-10">
          <span className='self-start font-medium text-[#6F6F6F] flex items-center relative'>
            <CustomTooltip
              orientation='right'
              tooltipComponent={
                <span
                  className="p-1 text-white w-[200px]"
                >
                  <p className='mb-3'>Floor Price</p>
                  <p>Lowest active listing price for a NFT from the collection</p>
                </span>
              }>
              <Info className='mr-1 floorToolTip' />
            </CustomTooltip>
            Floor
          </span>
          <div className='text-right relative'>
            <>
              <p className='font-medium'>{data && data?.floor_price ? formatCurrency(data?.floor_price) + ' ETH' : 'N/A'}</p>
              <p className='text-[#B6B6B6] text-xs font-medium absolute right-0'>{data?.floor_price ? '$' + formatCurrency(ethPriceUSD * data?.floor_price) : 'N/A'}</p>
            </>
          </div>
        </div>
        <div className="flex justify-between mt-1">
          <span className='font-medium text-[#6F6F6F] flex items-center relative'>
            <CustomTooltip
              orientation='right'
              tooltipComponent={
                <div
                  className="p-1 text-white w-[200px]"
                >
                  <p className='mb-3'>Total Volume</p>
                  <p>Total value of transactions for NFTs from the collection</p>
                </div>
              }>
              <Info className='mr-1' />
            </CustomTooltip>
            Total Vol<span className='inline minmd:hidden'>ume</span>
          </span>
          <p className='self-start font-medium'>{data && data?.total_volume ? formatCurrency(data?.total_volume) + ' ETH' : 'N/A'}</p>
        </div>
        <div className="flex justify-between mt-5">
          <span className='font-medium text-[#6F6F6F] flex items-center relative'>
            <CustomTooltip
              orientation='right'
              tooltipComponent={
                <div
                  className="p-1 text-white w-[200px]"
                >
                  <p className='mb-3'>Supply</p>
                  <p>Amount of NFTs in the collection</p>
                </div>
              }>
              <Info className='mr-1' />
            </CustomTooltip>
            Supply
          </span>
          <p className='font-medium'>{data && data?.total_supply ? data?.total_supply.toLocaleString() : 'N/A'}</p>
        </div>
        <div className="flex justify-between mt-4">
          <span className='font-medium text-[#6F6F6F] flex items-center relative'>
            <CustomTooltip
              orientation='right'
              tooltipComponent={
                <div
                  className="p-1 text-white w-[200px]"
                >
                  <p className='mb-3'>Owners</p>
                  <p>Amount of unique addresses holding NFTs from the collection</p>
                </div>
              }>
              <Info className='mr-1' />
            </CustomTooltip>
            Owners
          </span>
          <p className='font-medium'>{data && data?.num_owners ? data?.num_owners.toLocaleString() : 'N/A'}</p>
        </div>
      </div>
      <div className={tw(
        isExpanded ? 'block' : 'hidden minmd:block'
      )}>
        <div className="flex justify-between mt-4 minmd:mt-0">
          <span className='font-medium text-[#6F6F6F] flex items-center relative'>
            <CustomTooltip
              orientation='right'
              tooltipComponent={
                <div
                  className="p-1 text-white w-[200px]"
                >
                  <p className='mb-3'>Supply/Owners Ratio</p>
                  <p>Ratio of supply compared to owners. Gives insight on NFTs owned per owner</p>
                </div>
              }>
              <Info className='mr-1' />
            </CustomTooltip>
            S/O Ratio
          </span>
          <p className='font-medium'>{data && data?.total_supply && data?.num_owners ? (data?.total_supply / data?.num_owners).toFixed(2) : 'N/A'}</p>
        </div>
        <div className="flex justify-between h-10 mt-4 minmd:mt-5">
          <span className='self-start font-medium text-[#6F6F6F] flex items-center minlg:hidden relative'>
            <CustomTooltip
              orientation='right'
              tooltipComponent={
                <div
                  className="p-1 text-white w-[200px]"
                >
                  <p className='mb-3'>Market Capitalization</p>
                  <p>Estimation of total value of all NFTs from the collection</p>
                </div>
              }>
              <Info className='mr-1' />
            </CustomTooltip>
            Market Cap
          </span>
          <span className='self-start font-medium text-[#6F6F6F] hidden items-center minlg:flex relative'>
            <CustomTooltip
              orientation='right'
              tooltipComponent={
                <div
                  className="p-1 text-white w-[200px]"
                >
                  <p className='mb-3'>Market Cap</p>
                  <p>Estimation of total value of all NFTs from the collection</p>
                </div>
              }>
              <Info className='mr-1' />
            </CustomTooltip>
            Mkt Cap
          </span>
          <div className='text-right relative'>
            <p className='font-medium'>{data && data?.market_cap ? formatCurrency(data?.market_cap) + ' ETH' : 'N/A'}</p>
            <p className='text-[#B6B6B6] text-xs font-medium absolute right-0'>{data?.market_cap ? '$' + formatCurrency(ethPriceUSD * data?.market_cap) : 'N/A'}</p>
          </div>
        </div>
        <div className="flex justify-between h-10 mt-2 minmd:mt-1">
          <p className='self-start font-medium text-[#6F6F6F] block minlg:hidden'>Average Price</p>
          <p className='self-start font-medium text-[#6F6F6F] hidden items-center minlg:flex'>Avg Price</p>
          <span className='text-right relative'>
            <p className='font-medium'>{data && data?.average_price ? data?.average_price.toFixed(2) + ' ETH' : 'N/A'}</p>
            <p className='text-[#B6B6B6] text-xs font-medium absolute right-0'>{data && data?.average_price ? '$' + formatCurrency(ethPriceUSD * data?.average_price) : 'N/A'}</p>
          </span>
        </div>
        <div className="flex justify-between mt-3 minmd:mt-0">
          <p className='font-medium text-[#6F6F6F] block minlg:hidden'>Contract Type</p>
          <p className='self-start font-medium text-[#6F6F6F] hidden items-center minlg:flex'>Type</p>
          <p className='font-medium'>{type ? type : 'N/A'}</p>
        </div>
      </div>

      <div className='block minmd:hidden'>
        {!isExpanded
          ? (
            <div data-cy="collectionInfoExpand" className='flex w-max justify-center items-center mt-4 mx-auto hover:cursor-pointer' onClick={() => setIsExpanded(true)}>
              <p className='text-[#B59007] font-medium'>Expand</p>
              <CaretDown className='ml-1' weight='fill' color='#B59007' />
            </div>
          )
          : (
            <div className='flex w-max justify-center items-center mt-4 mx-auto hover:cursor-pointer' onClick={() => setIsExpanded(false)}>
              <p className='text-[#B59007] font-medium'>Collapse</p>
              <CaretUp className='ml-1' weight='fill' color='#B59007' />
            </div>
          )}
      </div>
    </div>

  );
};
