import { Button, ButtonSize, ButtonType } from 'components/elements/Button';
import { useLooksrareStrategyContract } from 'hooks/contracts/useLooksrareStrategyContract';
import { useHasGk } from 'hooks/useHasGk';
import { useNftComRoyalties } from 'hooks/useNftComRoyalties';
import { useSupportedCurrencies } from 'hooks/useSupportedCurrencies';
import { getTotalFormattedPriceUSD, getTotalMarketplaceFeesUSD, getTotalRoyaltiesUSD } from 'utils/marketplaceUtils';

import { NFTPurchasesContext } from './NFTPurchaseContext';

import { useCallback, useContext } from 'react';
import useSWR from 'swr';
import { useProvider } from 'wagmi';

export function PurchaseSummary() {
  const {
    toBuy,
    togglePurchaseSummaryModal,
  } = useContext(NFTPurchasesContext);
  const provider = useProvider();
  const looksrareStrategy = useLooksrareStrategyContract(provider);
  const { data: nftComRoyalties } = useNftComRoyalties(toBuy, true);
  const { getByContractAddress } = useSupportedCurrencies();
  const hasGk = useHasGk();
  
  const { data: looksrareProtocolFeeBps } = useSWR(
    'LooksrareProtocolFeeBps' + String(looksrareStrategy == null),
    async () => {
      return await looksrareStrategy.viewProtocolFee();
    },
    {
      refreshInterval: 0,
      revalidateOnFocus: false,
    });

  const getTotalPriceUSD = useCallback(() => {
    return getTotalFormattedPriceUSD(toBuy, getByContractAddress);
  }, [toBuy, getByContractAddress]);

  const getTotalMarketplaceFees = useCallback(() => {
    return getTotalMarketplaceFeesUSD(toBuy, looksrareProtocolFeeBps, getByContractAddress, hasGk);
  }, [toBuy, looksrareProtocolFeeBps, getByContractAddress, hasGk]);

  const getTotalRoyalties = useCallback(() => {
    return getTotalRoyaltiesUSD(toBuy, looksrareProtocolFeeBps, getByContractAddress, nftComRoyalties);
  }, [getByContractAddress, looksrareProtocolFeeBps, toBuy, nftComRoyalties]);

  const getSummaryContent = useCallback(() => {
    // Cost Summary, Default view
    return (
      <div className="flex flex-col w-full mx-2">
        <div className="flex items-center justify-between text-sm mb-4">
          <div className="flex flex-col">
            <span className='font-normal'>Subtotal</span>
          </div>
          <div className="flex flex-col align-end">
            <span className='font-normal'>{'$' + (Number(getTotalPriceUSD()) - Number(getTotalRoyalties()) - Number(getTotalMarketplaceFees()))?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</span>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs">
          <div className="flex flex-col">
            <span className='font-normal text-[#6F6F6F] text-sm'>Marketplace Fees</span>
          </div>
          <div className="flex flex-col align-end">
            <span className='font-normal text-[#6F6F6F]'>+ {'$' + getTotalMarketplaceFees()?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</span>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs">
          <div className="flex flex-col">
            <span className='font-normal text-[#6F6F6F] text-sm'>Creator Royalties</span>
          </div>
          <div className="flex flex-col align-end">
            <span className='font-normal text-[#6F6F6F]'>+ {'$' + getTotalRoyalties()?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</span>
          </div>
        </div>
        <div className="flex items-center justify-between mt-6">
          <div className="flex flex-col">
            <span className='font-medium text-sm'>Total Price</span>
          </div>
          <div className="flex flex-col align-end text-lg">
            <span className='font-bold'>${(Number(getTotalPriceUSD()))?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</span>
          </div>
        </div>
      </div>
    );
  }, [getTotalMarketplaceFees, getTotalPriceUSD, getTotalRoyalties]);

  return (
    <div className='flex flex-col items-center mx-7 my-7'>
      {getSummaryContent()}
      <span className='font-medium font-noi-grotesk self-center text-sm my-7 mx-1'>
        Once the transaction is confirmed, the NFT will be sent to your wallet instantly.
      </span>
      <Button
        size={ButtonSize.LARGE}
        stretch
        label={'Buy now'}
        onClick={() => {
          togglePurchaseSummaryModal();
        }}
        type={ButtonType.PRIMARY}
      />
    </div>
  );
}