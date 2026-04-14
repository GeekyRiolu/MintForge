import { RoundedCornerMedia, RoundedCornerVariant } from 'components/elements/RoundedCornerMedia';
import { Tabs } from 'components/elements/Tabs';
import { NFTAnalyticsContainer } from 'components/modules/NFTDetail/NFTAnalyticsContainer';
import { useNftQuery } from 'graphql/hooks/useNFTQuery';
import { useRefreshNftMutation } from 'graphql/hooks/useNftRefreshMutation';
import { useRefreshNftOrdersMutation } from 'graphql/hooks/useRefreshNftOrdersMutation';
import { useDefaultChainId } from 'hooks/useDefaultChainId';
import { getContractMetadata } from 'utils/alchemyNFT';
import { isNullOrEmpty } from 'utils/format';
import { filterValidListings } from 'utils/marketplaceUtils';
import { tw } from 'utils/tw';

import { DescriptionDetail } from './DescriptionDetail';
import { ExternalListings } from './ExternalListings';
import { NftChainInfo } from './NftChainInfo';
import { NFTDetail } from './NFTDetail';
import { NFTDetailFeaturedBy } from './NFTDetailFeaturedBy';
import { NFTDetailMoreFromCollection } from './NFTDetailMoreFromCollection';
import { Properties } from './Properties';

import { BigNumber } from 'ethers';
import { useEffect, useMemo } from 'react';
import useSWR from 'swr';
import { useAccount } from 'wagmi';

export interface NFTDetailPageProps {
  collection: string;
  tokenId: string;
}

export function NFTDetailPage({ collection, tokenId }: NFTDetailPageProps) {
  const { address: currentAddress } = useAccount();
  const defaultChainId = useDefaultChainId();
  const hexTokenId = BigNumber.from(tokenId).toHexString();
  const { data: nft, mutate: mutateNft } = useNftQuery(collection, hexTokenId);
  const { data: collectionData } = useSWR(
    () => collection ? ['ContractMetadata', collection] : null,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async ([url, contract]) => {
      return await getContractMetadata(contract, defaultChainId);
    });
  const { refreshNft } = useRefreshNftMutation();
  const { refreshNftOrders } = useRefreshNftOrdersMutation();

  useEffect(() => {
    refreshNftOrders(nft?.id);
  }, [nft?.id, refreshNftOrders]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      refreshNft(nft?.id);
    }, 1000);
    return () => clearTimeout(delayDebounceFn);
  }, [nft?.id, refreshNft]);

  const showListings = useMemo(() => {
    return !isNullOrEmpty(filterValidListings(nft?.listings?.items));
  }, [nft]);

  const tabs = [
    {
      label: 'Info',
      content: <>
        <div className='flex w-full p-4 font-noi-grotesk'>
          <DescriptionDetail nft={nft} />
        </div>
        <div className='flex w-full p-4 font-noi-grotesk'>
          <NftChainInfo nft={nft} />
        </div>
      </>
    },
    {
      label: 'Traits',
      content: <>
        <div className='flex w-full p-4'>
          <div className='py-4 font-noi-grotesk w-full'>
            <Properties nft={nft} />
          </div>
        </div>
      </>
    },
  ];

  const DetailTabsComponent = () => {
    return (
      <div>
        <div className='flex flex-col w-full'>
          <div className={tw(
            'flex flex-col w-full minxl:hidden',
          )}>
            {(defaultChainId === '1') &&
              <div className="w-full md:px-4 pt-4 pb-6">
                <ExternalListings nft={nft} collectionName={collectionData?.contractMetadata?.name} />
                <NFTAnalyticsContainer data={nft} />
              </div>
            }
          </div>
          <div className='flex w-full items-center p-4 pb-0 justify-start'>
            <div className='justify-start w-full'>
              <Tabs
                tabOptions={tabs}
                customTabWidth={'w-max'}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col md:pt-0 pt-20 items-center w-full min-h-screen">
      {nft?.metadata?.imageURL &&
        <div className='flex w-full bg-[#F2F2F2] justify-around minmd:py-3 minlg:py minxl:py-10 minmd:px-auto'>
          <div className="flex w-full max-h-[600px] h-full max-w-nftcom object-contain drop-shadow-lg rounded aspect-square">
            <RoundedCornerMedia
              key={nft?.id}
              src={nft?.metadata?.imageURL}
              videoOverride={true}
              variant={RoundedCornerVariant.None}
              objectFit='contain'
              extraClasses='rounded'
              containerClasses='h-full w-full' />
          </div>
        </div>
      }
      <div className="flex flex-col minxl:flex-row w-full minxl:max-w-nftcom minlg:max-w-[650px] md:pb-0 pb-16 minxl:-mb-8">
        <div className='flex minxl:w-1/2 w-full minxl:flex-col'>
          <NFTDetail nft={nft} onRefreshSuccess={() => {
            mutateNft();
          }} key={nft?.id} tokenId={tokenId}/>
          <div className="hidden minxl:block minxl:pt-5">
            <DetailTabsComponent />
          </div>
        </div>
        {(showListings || (nft?.wallet?.address ?? nft?.owner) === currentAddress || (!isNullOrEmpty(nft?.owner) && !isNullOrEmpty(nft?.wallet?.address))) ?
          <div className='flex minxl:w-1/2 w-full items-end minxl:items-start minxl:flex-col minxl:p-4 minxl:pt-12'>
            <div className="lg:hidden flex minxl:flex-row w-full items-start">
              <ExternalListings nft={nft} collectionName={collectionData?.contractMetadata?.name} />
            </div>
            <div className="w-full hidden minxl:flex minxl:items-end">
              <NFTAnalyticsContainer data={nft} />
            </div>
          </div>
          :
          (defaultChainId === '1') &&
          <div className='md:hidden flex minxl:w-1/2 w-full items-end minxl:items-start minxl:flex-col minxl:p-4 minxl:pt-12'>
            <div className="w-full hidden minxl:flex minxl:items-end">
              <NFTAnalyticsContainer data={nft} />
            </div>
          </div>
        }
      </div>
      <div className="minxl:hidden flex flex-col minxl:flex-row w-full md:mb-6 minxl:max-w-nftcom minlg:max-w-[650px]">
        <DetailTabsComponent />
      </div>
      <NFTDetailMoreFromCollection
        hideTokenId={nft?.tokenId}
        collectionName={nft?.contract?.toLowerCase() === '0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85'.toLowerCase() ? 'ENS: Ethereum Name Service' : collectionData?.contractMetadata?.name}
        contract={nft?.contract}
      />
      <div className="w-full my-10 flex items-center -px-4 minxl:max-w-nftcom minlg:max-w-[650px]">
        <NFTDetailFeaturedBy contract={nft?.contract} tokenId={nft?.tokenId} />
      </div>
    </div>
  );
}
