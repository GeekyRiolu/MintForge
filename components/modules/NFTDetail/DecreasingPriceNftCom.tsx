
import { AuctionType, NftcomProtocolData, TxActivity } from 'graphql/generated/types';
import { useGetCurrentDate } from 'hooks/useGetCurrentDate';
import { useSupportedCurrencies } from 'hooks/useSupportedCurrencies';
import { getListingCurrencyAddress, getListingPrice } from 'utils/listingUtils';

import { ethers } from 'ethers';
import { useCallback, useEffect, useState } from 'react';
import { PartialDeep } from 'type-fest';

export interface DecreasingPriceNftComProps {
  listing: PartialDeep<TxActivity>,
  usd?: boolean
}

function DecreasingPriceNftCom({ listing, usd }: DecreasingPriceNftComProps) {
  const { getByContractAddress } = useSupportedCurrencies();
  const currentDate = useGetCurrentDate();

  const getListingPriceHelper = useCallback((listing: PartialDeep<TxActivity>) => {
    const price = getListingPrice(
      listing,
      (listing?.order?.protocolData as NftcomProtocolData).auctionType === AuctionType.Decreasing
        ? currentDate :
        null
    );

    const parsedPrice = ethers.utils.formatUnits(
      price,
      getByContractAddress(getListingCurrencyAddress(listing))?.decimals ?? 18);

    return getByContractAddress(getListingCurrencyAddress(listing))?.decimals &&
      Number(parsedPrice)?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  }, [currentDate, getByContractAddress]);

  const [listingPrice, setListingPrice] = useState(getListingPriceHelper(listing));

  const timerCallback = useCallback(() => {
    setListingPrice(getListingPriceHelper(listing));
  }, [getListingPriceHelper, listing]);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setListingPrice(getListingPriceHelper(listing));
    }, 1000);
  
    return () => clearInterval(timer);
  }, [getListingPriceHelper, listing, timerCallback]);

  if (usd) {
    return <span className="md:ml-0 md:mt-2 ml-2 text-[15px] uppercase font-medium text-[#6A6A6A] flex flex-nowrap">
      ${getByContractAddress(getListingCurrencyAddress(listing))?.usd(
        Number(listingPrice)
      )?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}
    </span>;
  }
  
  return (
    <span className='sm:text-[28px] text-[34px] font-semibold'>
      {listingPrice}
    </span>
  );
}
  
export default DecreasingPriceNftCom;