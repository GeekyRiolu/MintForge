import { Button, ButtonSize, ButtonType } from 'components/elements/Button';
import LikeCount from 'components/elements/LikeCount';
import { Tabs } from 'components/elements/Tabs';
import { CollectionActivity } from 'components/modules/Analytics/CollectionActivity';
import { NFTCard } from 'components/modules/NFTCard/NFTCard';
import { BannerWrapper } from 'components/modules/Profile/BannerWrapper';
import { SideNav } from 'components/modules/Search/SideNav';
import { LikeableType } from 'graphql/generated/types';
import {
  useCollectionQuery,
  useFetchTypesenseSearch,
  useGetContractSalesStatisticsQuery,
  useGetNFTDetailsQuery,
  usePreviousValue,
  useProfileQuery,
  useSetLikeMutation
} from 'graphql/hooks';
import { useSearchModal } from 'hooks/state/useSearchModal';
import { useDefaultChainId } from 'hooks/useDefaultChainId';
import { useNftProfileTokens } from 'hooks/useNftProfileTokens';
import useWindowDimensions from 'hooks/useWindowDimensions';
import { useTabs, useToggle } from 'hooks/utils';
import { CollectionContextType, CollectionHeaderProps, CollectionProps } from 'types/collection';
import { getContractMetadata } from 'utils/alchemyNFT';
import { Doppler, getEnvBool } from 'utils/env';
import { isNullOrEmpty } from 'utils/format';
import { shortenAddress } from 'utils/helpers';
import { cl, tw } from 'utils/tw';

import { CollectionInfo } from './CollectionInfo';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FunnelSimple } from 'phosphor-react';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { ExternalLink as LinkIcon } from 'react-feather';
import { ReactMarkdown } from 'react-markdown/lib/react-markdown';
import useSWR from 'swr';

const BlurImage = dynamic(import('components/elements/BlurImage'));

export const collectionPropTypeGuard = (props: CollectionProps): {
  value: string;
  type: string;
  restProps: Omit<CollectionProps, 'slug'>;
} => {
  if ('slug' in props) {
    const { slug, ...restProps } = props;
    return { value: slug?.toString(), type: 'slug', restProps };
  }

  const { contract } = props;
  return { value: contract?.toString(), type: 'contract', restProps: props };
};

const CollectionContext = createContext<CollectionContextType | undefined>(undefined);

const useCollectionContext = () => {
  const context = useContext(CollectionContext);
  if (!context) {
    throw new Error(
      'Collection components cannot be rendered outside the Collection component!'
    );
  }
  return context;
};

export function Collection(props: CollectionProps) {
  const router = useRouter();
  const { contractAddr, slug: slugQuery } = router.query;
  const contract = contractAddr as string;
  const slug = slugQuery as string;

  const defaultChainId = useDefaultChainId();
  const { setSearchModalOpen, id_nftName, sideNavOpen, setSideNavOpen, setModalType, setCollectionPageAppliedFilters, setClearedFilters } = useSearchModal();
  const [selectedTab,
    setSelectedTab,
    tabs] = useTabs(0, {
    0: 'NFTs',
    1: 'Activity'
  });

  const [found, setFound] = useState(0);
  const [collectionNfts, setCollectionNfts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const { usePrevious } = usePreviousValue();
  const prevContractAddr = usePrevious(contract || slug);
  const prevPage = usePrevious(currentPage);
  const prevId_nftName = usePrevious(id_nftName);

  const propsGuard = collectionPropTypeGuard(props);
  const collectionContract = propsGuard.type === 'contract' ? propsGuard.value : propsGuard.restProps.contract.toString();

  // Data Fetching
  const { fetchTypesenseMultiSearch } = useFetchTypesenseSearch();
  const collectionSalesHistory = useGetContractSalesStatisticsQuery(collectionContract);
  const collectionNFTInfo = useGetNFTDetailsQuery(collectionContract, '1'); // set fallback to 1st token in collection
  const { data: collectionData, mutate: mutateCollectionData } = useCollectionQuery(
    propsGuard.type === 'contract' && !slug ?
      {
        chainId: defaultChainId,
        contract,
      } :
      {
        chainId: defaultChainId,
        slug
      });
  const { data: collectionMetadata } = useSWR(`ContractMetadata ${propsGuard.value}`,
    async () => await getContractMetadata(
      propsGuard.type === 'contract' ?
        propsGuard.value :
        collectionData.collection.contract,
      defaultChainId)
  );
  const { profileTokens: creatorTokens } = useNftProfileTokens(collectionData?.collection?.deployer);
  const { profileData: collectionOwnerData } = useProfileQuery(
    creatorTokens?.at(0)?.tokenUri?.raw?.split('/').pop()
  );
  const { profileData: collectionPreferredOwnerData } = useProfileQuery(
    collectionOwnerData?.profile?.owner?.preferredProfile?.url
  );
  const { setLike, unsetLike } = useSetLikeMutation(
    collectionData?.collection?.id,
    LikeableType.Collection
  );
  const collectionName = collectionMetadata?.contractMetadata?.name;

  const value = useMemo(() => ({
    collectionContract,
    collectionData,
    mutateCollectionData,
    collectionName,
    collectionNfts,
    collectionNFTInfo,
    collectionPreferredOwnerData,
    collectionSalesHistory,
    contractAddr,
    currentPage,
    setCurrentPage,
    slug,
    found,
    selectedTab,
    setSelectedTab,
    tabs,
    setFound,
    setLike,
    unsetLike,
    setSearchModalOpen,
    sideNavOpen,
    setSideNavOpen,
    setModalType
  }), [
    collectionContract,
    collectionData,
    mutateCollectionData,
    collectionName,
    collectionNfts,
    collectionNFTInfo,
    collectionPreferredOwnerData,
    collectionSalesHistory,
    contractAddr,
    currentPage,
    setCurrentPage,
    slug,
    found,
    setFound,
    setLike,
    unsetLike,
    selectedTab,
    setSelectedTab,
    tabs,
    setSearchModalOpen,
    sideNavOpen,
    setSideNavOpen,
    setModalType
  ]);

  useEffect(() => {
    if (![contractAddr, slug].includes(prevContractAddr)) {
      setCollectionNfts([]);
      setCurrentPage(1);
      setFound(0);
      setCollectionPageAppliedFilters('', '', false);
    }

    if (prevId_nftName !== id_nftName) {
      setCollectionNfts([]);
      setCurrentPage(1);
      setFound(0);
    }
  }, [contractAddr, slug, id_nftName, prevContractAddr, prevId_nftName, setClearedFilters, setCollectionPageAppliedFilters]);

  useEffect(() => {
    currentPage === 1 && collectionContract && fetchTypesenseMultiSearch({
      searches: [{
        'collection': 'nfts',
        'q': id_nftName,
        'query_by': 'tokenId,nftName',
        'per_page': 8,
        'page': currentPage,
        'facet_by': 'contractAddr,traits.value,traits.type',
        'filter_by': 'contractAddr:=' + (contractAddr?.toString() || collectionContract),
        'exhaustive_search': true
      }]
    })
      .then((resp) => {
        setCollectionNfts([...resp.results[0].hits]);
        setFound(resp.results[0].found);
      });
  }, [contractAddr, currentPage, fetchTypesenseMultiSearch, id_nftName, collectionContract]);

  useEffect(() => {
    if (currentPage > 1 && (currentPage !== prevPage)) {
      collectionContract && fetchTypesenseMultiSearch({
        searches: [{
          'collection': 'nfts',
          'q': id_nftName,
          'query_by': 'tokenId,nftName',
          'per_page': 8,
          'page': currentPage,
          'facet_by': 'contractAddr,traits.value,traits.type',
          'filter_by': 'contractAddr:=' + (contractAddr?.toString() || collectionContract),
          'exhaustive_search': true
        }]
      })
        .then((resp) => {
          setCollectionNfts([...collectionNfts, ...resp.results[0].hits]);
          setFound(resp.results[0].found);
        });
    }
  }, [
    collectionNfts,
    contractAddr,
    currentPage,
    fetchTypesenseMultiSearch,
    id_nftName,
    prevPage,
    collectionContract
  ]);

  return (
    <CollectionContext.Provider value={value}>
      {props.children}
    </CollectionContext.Provider>
  );
}

export const CollectionBanner: React.FC = () => {
  const { collectionNFTInfo, collectionData } = useCollectionContext();

  // ! NOTE: Added fallback banner from collectionData, but image might be low res/quality.
  const imageOverride = useMemo(() =>
    collectionNFTInfo?.data?.contract?.metadata?.banner_url?.replace(
      '?w=500',
      '?w=3000'
    )
    || collectionData?.collection?.bannerUrl
  , [
    collectionNFTInfo?.data?.contract?.metadata?.banner_url,
    collectionData?.collection?.bannerUrl
  ]);

  return (
    <div className="mt-20">
      <BannerWrapper
        alt={`${collectionData?.collection?.name} Banner Image`}
        loading={Boolean(collectionNFTInfo?.loading)}
        imageOverride={imageOverride}
        isCollection
      />
    </div>
  );
};

export const CollectionHeader: React.FC<CollectionHeaderProps> = ({ children }) => {
  const { collectionContract, collectionData, mutateCollectionData, collectionName, collectionPreferredOwnerData } = useCollectionContext();
  return (
    <>
      <div className='font-noi-grotesk px-4 mt-9 max-w-nftcom mx-auto'>
        <div className='flex'>
          <h2 className="text-3xl font-bold">
            {isNullOrEmpty(collectionName) && isNullOrEmpty(collectionData?.collection?.name) ?
              (<div role="status" className="space-y-8 animate-pulse md:space-y-0 md:space-x-8 md:flex md:items-center">
                <div className="w-full">
                  <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-36 mb-4"></div>
                </div>
                <span className="sr-only">Loading...</span>
              </div>)
              : (collectionData?.collection?.name || collectionName)}
          </h2>
          <div className='ml-3'>
            <LikeCount
              count={collectionData?.collection?.likeCount}
              isLiked={collectionData?.collection?.isLikedBy}
              mutate={mutateCollectionData}
              likeData={{
                id: collectionData?.collection?.id,
                type: LikeableType.Collection
              }}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-6 minlg:w-1/2">
          <div className='flex'>
            {collectionPreferredOwnerData &&
              <div className='relative h-10 w-10 overflow-hidden'>
                <BlurImage src={collectionPreferredOwnerData?.profile?.photoURL || 'https://cdn.nft.com/profile-image-default.svg'} alt='test' className='rounded-[10px] mr-2 object-cover' fill sizes='40px' />
              </div>
            }
            <div className={tw(
              'flex flex-col justify-between',
              collectionPreferredOwnerData?.profile && 'ml-2'
            )}>
              <p className='text-[10px] uppercase text-[#6F6F6F] font-bold'>Creator</p>
              {collectionPreferredOwnerData?.profile ?
                <Link href={`/${collectionPreferredOwnerData?.profile?.url}`}>
                  <p className='font-bold underline decoration-[#F9D963] underline-offset-4 cursor-pointer'>{collectionPreferredOwnerData?.profile?.url}</p>
                </Link>
                :
                <div className='mt-1 text-[#B59007] font-medium font-mono'>
                  <a
                    target="_blank"
                    rel="noreferrer"
                    href={`https://etherscan.io/address/${collectionContract}`}
                    className=' tracking-wide flex'
                  >
                    <span>{shortenAddress(collectionData?.collection?.deployer, 4)}</span>
                    <LinkIcon size={20} className='ml-1' />
                  </a>
                </div>
              }
            </div>
          </div>
          <div className='flex flex-col'>
            <p className='text-[10px] uppercase text-[#6F6F6F] font-bold'>Contract Address</p>
            <div className='mt-1 text-[#B59007] font-medium font-mono'>
              <a
                target="_blank"
                rel="noreferrer"
                href={`https://etherscan.io/address/${collectionContract}`}
                className='tracking-wide flex'
              >
                <span className='contractAddress'>{shortenAddress(collectionContract, 4)}</span>
                <LinkIcon size={20} className='ml-1' />
              </a>
            </div>
          </div>
        </div>
        <div className='font-noi-grotesk mt-6 text-black flex flex-col minlg:flex-row mb-10'>
          {children}
        </div>
      </div>
    </>
  );
};

export const CollectionDescription: React.FC = () => {
  const { collectionData } = useCollectionContext();
  const [descriptionExpanded, toggleDescription] = useToggle();
  const isExpanded = useMemo(() => descriptionExpanded, [descriptionExpanded]);

  const theme = {
    p: (props: any) => {
      const { children } = props;
      return (
        <p className="inline">
          {children}
        </p>
      );
    },
    a: (props: any) => {
      const { children } = props;
      return (

        <a
          className="underline inline"
          href={props.href}
          target="_blank"
          rel="noreferrer"
        >
          {children}
        </a>
      );
    }
  };

  return (
    <>
      {collectionData?.collection?.description && collectionData?.collection?.description !== 'placeholder collection description text' &&
        <div className='minlg:w-1/2'>
          <h3 className='text-[#6F6F6F] font-semibold'>
            Description
          </h3>
          <div className='mt-1 mb-10 minlg:mb-0 minlg:pr-4'>
            {isExpanded ?
              <>
                <ReactMarkdown components={theme} skipHtml linkTarget="_blank">
                  {collectionData?.collection?.description}
                </ReactMarkdown>
                <p className='text-[#B59007] font-bold inline ml-1 hover:cursor-pointer' onClick={() => toggleDescription()}>Show less</p>
              </>
              :
              <>
                {collectionData?.collection?.description.length > 87
                  ?
                  <div className='inline minlg:hidden'>
                    <ReactMarkdown components={theme} skipHtml linkTarget="_blank">
                      {collectionData?.collection?.description.substring(0, 87) + '...'}
                    </ReactMarkdown>
                  </div>
                  :
                  <div className='inline minlg:hidden'>
                    <ReactMarkdown components={theme} skipHtml linkTarget="_blank">
                      {collectionData?.collection?.description}
                    </ReactMarkdown>
                  </div>
                }
                {collectionData?.collection?.description.length > 200
                  ?
                  <div className='hidden minlg:inline'>
                    <ReactMarkdown components={theme} skipHtml linkTarget="_blank">
                      {collectionData?.collection?.description.substring(0, 200) + '...'}
                    </ReactMarkdown>
                  </div>
                  :
                  <div className='hidden minlg:inline'>
                    <ReactMarkdown components={theme} skipHtml linkTarget="_blank">
                      {collectionData?.collection?.description}
                    </ReactMarkdown>
                  </div>
                }
                {
                  collectionData?.collection?.description.length > 87 &&
                  <>
                    <p className='text-[#B59007] font-bold ml-1 hover:cursor-pointer inline minlg:hidden' onClick={() => toggleDescription()}>
                      Show more
                    </p>
                  </>
                }
                {
                  collectionData?.collection?.description.length > 200 &&
                  <>
                    <p className='text-[#B59007] font-bold ml-1 hover:cursor-pointer hidden minlg:inline' onClick={() => toggleDescription()}>
                      Show more
                    </p>
                  </>
                }
              </>
            }
          </div>
        </div>
      }
    </>
  );
};

export const CollectionDetails: React.FC = () => {
  const { collectionNfts, collectionSalesHistory } = useCollectionContext();
  return (
    <div className='w-full minlg:w-1/2'>
      <CollectionInfo data={collectionSalesHistory?.data?.statistics} type={collectionNfts[0]?.document?.nftType} hasDescription={true} />
    </div>
  );
};

export const CollectionNfts: React.FC = () => {
  const { collectionNfts, currentPage, setCurrentPage, found } = useCollectionContext();
  const onNextPage = () => setCurrentPage(currentPage + 1);
  return (
    <div className="flex overflow-hidden pb-3.5">
      <div className="hidden minlg:block">
        <SideNav onSideNav={() => null} isCollectionView />
      </div>
      {collectionNfts.length > 0
        ? <div className="flex-auto">
          {found &&
            <p className='font-medium uppercase mb-4 text-[#6F6F6F] text-[10px] '>{found > 1 ? `${found} NFTS` : `${found} NFT`}</p>
          }
          <div className="grid grid-cols-2 minmd:grid-cols-3 minlg:grid-cols-4 gap-5 max-w-nftcom minxl:mx-auto ">
            {collectionNfts.map((nft, i) => {
              return (
                <div
                  className="NftCollectionItem"
                  key={`${nft.contractAddr}-${nft.tokenId}-${i}`}
                >
                  <NFTCard
                    contractAddr={nft.document.contractAddr}
                    tokenId={nft.document.tokenId}
                    name={nft.document.nftName}
                    collectionName={nft.document.contractName}
                    images={[]}
                    redirectTo={nft.document.nftName && `/app/nft/${nft.document.contractAddr}/${nft.document.tokenId}`}
                  />
                </div>
              );
            }
            )}
          </div>
          {found > collectionNfts.length && <div className="mx-auto w-full minxl:w-3/5 flex justify-center mt-7 font-medium">
            <Button
              size={ButtonSize.LARGE}
              scaleOnHover
              stretch
              label={'Load More'}
              onClick={onNextPage}
              type={ButtonType.PRIMARY}
            />
          </div>}
        </div>
        : <div className="font-noi-grotesk font-black text-xl text-[#7F7F7F]">No results found</div>}
    </div >
  );
};

export const CollectionBody: React.FC = () => {
  const { width: screenWidth } = useWindowDimensions();
  const { setModalType, setSearchModalOpen, sideNavOpen, setSideNavOpen, collectionContract } = useCollectionContext();
  const [selectedTab, setSelectedTab] = useState('NFTs');

  const tabs = [
    {
      label: 'NFTs',
    },
    {
      label: 'Activity',
    }
  ];

  return (
    <>
      <div className={cl(
        'px-4 pb-16 w-full',
        'max-w-nftcom mx-auto',
        'min-h-screen'
      )}
      >
        {getEnvBool(Doppler.NEXT_PUBLIC_ANALYTICS_ENABLED) &&
        <div className='block minlg:flex minlg:flex-row-reverse w-full minlg:w-max mb-6 justify-between items-center'>
          <div className='block minlg:flex items-center mb-6 minlg:mb-0'>
            <Tabs
              tabOptions={tabs}
              onTabChange={setSelectedTab}
              customTabWidth={'minlg:max-w-md minlg:w-[448px]'}
            />
          </div>
          <div
            className={tw(
              sideNavOpen ? 'mr-5' : '',
              'w-full mb-6 minlg:mb-0 minlg:mr-3 items-center flex minlg:flex-auto')}
            onClick={() => {
              if (screenWidth < 900) {
                setModalType('collectionFilters');
                setSearchModalOpen(true, 'collectionFilters');
              } else {
                setSideNavOpen(!sideNavOpen);
              }
            }}>
            <div
              className={tw(
                'cursor-pointer w-full minlg:h-10',
                'bg-white text-[#1F2127] font-noi-grotesk font-bold p-1 rounded-[20px]',
                'flex items-center justify-center border border-[#D5D5D5]')}
            >
              <div className='minlg:hidden flex items-center justify-center'>
                <FunnelSimple color='#1F2127' className='h-5 w-4 mr-2 minlg:mr-0 minlg:h-7 minlg:w-7' />
                <p>Filter</p>
              </div>
              <div className='hidden minlg:block'>
                {(!sideNavOpen || (sideNavOpen && tabs[selectedTab] !== 'NFTs')) && <FunnelSimple color='#1F2127' className='h-5 w-4 mr-2 minlg:mr-0 minlg:h-7 minlg:w-7' />}
                {sideNavOpen && tabs[selectedTab] === 'NFTs' && <p className="px-[6.5rem]">Close Filters</p>}
              </div>
            </div>
          </div>
        </div>
        }
        {selectedTab === 'NFTs' &&
          <CollectionNfts />
        }
        {selectedTab === 'Activity' &&
          <CollectionActivity contract={collectionContract} />
        }
      </div>
    </>
  );
};
