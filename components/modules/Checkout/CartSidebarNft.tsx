import { NFTListingsContext } from 'components/modules/Checkout/NFTListingsContext';
import { useLooksrareStrategyContract } from 'hooks/contracts/useLooksrareStrategyContract';
import { useGetCreatorFee } from 'hooks/useGetCreatorFee';
import { useSupportedCurrencies } from 'hooks/useSupportedCurrencies';
import { getContractMetadata } from 'utils/alchemyNFT';
import { processIPFSURL } from 'utils/ipfs';
import { tw } from 'utils/tw';

import { StagedListing } from './NFTListingsContext';
import { StagedPurchase } from './NFTPurchaseContext';

import { ethers } from 'ethers';
import { useRouter } from 'next/router';
import { useCallback, useContext } from 'react';
import useSWR from 'swr';
import { PartialDeep } from 'type-fest';
import { useNetwork, useProvider } from 'wagmi';

export interface CartSidebarNftProps {
  item: PartialDeep<StagedListing | StagedPurchase>;
  selectedTab: string;
  onRemove: () => void;
}

export function CartSidebarNft(props: CartSidebarNftProps) {
  const { chain } = useNetwork();
  const provider = useProvider();
  const router = useRouter();
  const looksrareStrategy = useLooksrareStrategyContract(provider);
  const nft = props.item?.nft;
  const { data: collection } = useSWR('ContractMetadata' + nft?.contract, async () => {
    return await getContractMetadata(nft?.contract, chain?.id);
  });

  const { getByContractAddress } = useSupportedCurrencies();
  const { toggleCartSidebar } = useContext(NFTListingsContext);

  const { data: looksrareProtocolFeeBps } = useSWR(
    'LooksrareProtocolFeeBps' + String(looksrareStrategy == null),
    async () => {
      return await looksrareStrategy.viewProtocolFee();
    },
    {
      refreshInterval: 0,
      revalidateOnFocus: false,
    });

  const formatCurrency = useCallback((item: StagedPurchase) => {
    const currency = getByContractAddress((item as StagedPurchase).currency);
    if(currency.name === 'USDC'){
      return ethers.utils.formatUnits(item.price, 6);
    } else {
      return ethers.utils.formatEther((item as StagedPurchase)?.price ?? 0);
    }
  }, [getByContractAddress]);

  const { data: creatorFee, loading } = useGetCreatorFee(nft?.contract, nft?.tokenId, looksrareProtocolFeeBps, props.item, props.selectedTab === 'Buy');

  const getRoyalty = useCallback(() => {
    if (loading) {
      return 'loading...';
    }

    // show single royalty fee when buying since marketplace is chosen already
    if (props.selectedTab === 'Buy') {
      const stagedPurchase = props.item as StagedPurchase;
      switch (stagedPurchase?.protocol) {
      case 'Seaport':
        return `${creatorFee?.royalty?.seaport ? Number(creatorFee?.royalty?.seaport).toFixed(2) : 0}%`;
      case 'LooksRare':
        return `${creatorFee?.royalty?.looksrare ? Number(creatorFee?.royalty?.looksrare).toFixed(2) : 0}%`;
      case 'X2Y2':
        return `${creatorFee?.royalty?.x2y2 ? Number(creatorFee?.royalty?.x2y2).toFixed(2) : 0}%`;
      case 'NFTCOM':
        return `${creatorFee?.royalty?.nftcom ? Number(creatorFee?.royalty?.nftcom).toFixed(2) : 0}%`;
      default:
        return 'n/a%';
      }
    }

    // show range if it's a listing (bc multiple marketplaces)
    if (creatorFee?.min == 0 && creatorFee?.max == 0) {
      return '0%';
    } else {
      return `${creatorFee?.min?.toFixed(2)}% - ${creatorFee?.max?.toFixed(2)}%`;
    }
  }, [creatorFee?.max, creatorFee?.min, creatorFee?.royalty?.looksrare, creatorFee?.royalty?.nftcom, creatorFee?.royalty?.seaport, creatorFee?.royalty?.x2y2, loading, props.item, props.selectedTab]);

  return <div className='flex items-start w-full px-5 mb-4'>
    <div className='flex w-2/3'>
      <div onClick={() => {
        router.push(`/app/nft/${nft?.contract}/${nft?.tokenId}`);
        toggleCartSidebar();
      }} className='cursor-pointer relative aspect-square max-w-[5rem]'>
        <video
          autoPlay
          muted
          loop
          key={nft?.metadata?.imageURL}
          src={processIPFSURL(nft?.metadata?.imageURL)}
          poster={processIPFSURL(nft?.metadata?.imageURL)}
          className={tw(
            'flex object-fit w-full justify-center rounded-xl',
          )}
        />
      </div>
      <div className='whitespace-nowrap overflow-hidden text-ellipsis flex flex-col ml-4 font-noi-grotesk'>
        <span className="text-lg line-clamp-1 font-bold">{collection?.contractMetadata?.name}</span>
        <span className='text-sm mb-3 line-clamp-1 text-[#6F6F6F]'>{nft?.metadata?.name}</span>
        <span className='text-[0.6rem] text-[#6F6F6F]'>Creator fee: {getRoyalty()}</span>
      </div>
    </div>
    <div className='w-1/3 h-full flex flex-col items-end justify-between mt-1'>
      <div>
        {
        // this is a staged purchase
          props.item?.['price'] ?
            <div className='font-medium text-base line-clamp-1'>
              {Number(formatCurrency(props.item as StagedPurchase)).toLocaleString('en-US', { maximumSignificantDigits: 3 })}
              {' '}
              <span className='text-[#6F6F6F]'>
                {getByContractAddress((props.item as StagedPurchase).currency)?.name ?? ''}
              </span>
            </div>
            : null
        }
      </div>
      <span
        onClick={props.onRemove}
        className={tw(
          'text-sm line-clamp-1 text-[#6F6F6F] cursor-pointer hover:underline',
          props.item?.['price'] && 'mt-5')}>
        Remove
      </span>
    </div>
  </div>;
}
