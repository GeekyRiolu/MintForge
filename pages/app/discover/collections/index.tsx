import { Button, ButtonSize, ButtonType } from 'components/elements/Button';
import Loader from 'components/elements/Loader/Loader';
import TimePeriodToggle from 'components/elements/TimePeriodToggle';
import DefaultLayout from 'components/layouts/DefaultLayout';
import { CollectionCard } from 'components/modules/DiscoveryCards/CollectionCard';
import { CollectionLeaderBoardCard } from 'components/modules/DiscoveryCards/CollectionLeaderBoardCard';
import { SideNav } from 'components/modules/Search/SideNav';
import { useCollectionQueryLeaderBoard } from 'graphql/hooks/useCollectionLeaderBoardQuery';
import { useCollectionLikeCountQuery } from 'graphql/hooks/useCollectionLikeQuery';
import { useFetchTypesenseSearch } from 'graphql/hooks/useFetchTypesenseSearch';
import { useSearchModal } from 'hooks/state/useSearchModal';
import useWindowDimensions from 'hooks/useWindowDimensions';
import { CollectionSearchResult } from 'types';
import { isNullOrEmpty } from 'utils/format';
import { getPerPage, isOfficialCollection } from 'utils/helpers';
import { tw } from 'utils/tw';

import { SlidersHorizontal, X } from 'phosphor-react';
import LeaderBoardIcon from 'public/icons/leaderBoardIcon.svg?svgr';
import NoActivityIcon from 'public/icons/no_activity.svg?svgr';
import React, { useEffect, useRef, useState } from 'react';
function usePrevious(value) {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

export default function CollectionsPage() {
  const [page, setPage] = useState(1);
  const { sideNavOpen, activePeriod, setSideNavOpen, collectionsResultsFilterBy, isLeaderBoard, toggleLeaderBoardState, changeTimePeriod, setSearchModalOpen, setIsDiscoverCollections, isDiscoverCollections } = useSearchModal();
  const { data: collectionData } = useCollectionQueryLeaderBoard(activePeriod);
  const { fetchTypesenseSearch } = useFetchTypesenseSearch();
  const [filters, setFilters] = useState([]);
  const [collections, setCollectionData] = useState<CollectionSearchResult[]>([]);
  const [found, setTotalFound] = useState(null);
  const [loading, setLoading] = useState(false);
  const prevFilters = usePrevious(collectionsResultsFilterBy);
  const { width: screenWidth } = useWindowDimensions();
  const COLLECTIONS_LOAD_COUNT = getPerPage('discoverCollections', screenWidth, sideNavOpen);
  const { data: collectionLikeData } = useCollectionLikeCountQuery(collections.map((c) => c?.document?.contractAddr));

  useEffect(() => {
    !isDiscoverCollections && setIsDiscoverCollections(true);
  }, [isDiscoverCollections, setIsDiscoverCollections]);

  useEffect(() => {
    if (page > 1 && collectionsResultsFilterBy !== prevFilters) {
      setPage(1);
      return;
    } else {
      setLoading(true);
      fetchTypesenseSearch({
        facet_by: ',floor,nftType,volume,issuance',
        index: 'collections',
        q: '*',
        query_by: 'contractAddr,contractName',
        filter_by: collectionsResultsFilterBy ? `isOfficial:true && ${collectionsResultsFilterBy}` : 'isOfficial:true',
        per_page: COLLECTIONS_LOAD_COUNT,
        page: page,
      }).then((results) => {
        setLoading(false);
        filters.length < 1 && !isNullOrEmpty(results?.facet_counts) && setFilters([...results.facet_counts]);
        setTotalFound(results.found);
        page > 1 ? setCollectionData([...collections, ...results.hits]) : setCollectionData(results.hits);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchTypesenseSearch, page, collectionsResultsFilterBy, filters]);

  const leaderBoardOrCollectionView = () => {
    if (isLeaderBoard) {
      return (
        <div className={tw(
          'gap-2 minmd:grid minmd:space-x-2 minlg:space-x-0 minlg:gap-4',
          'grid-cols-1')}>
          {
            collectionData && collectionData?.items?.length > 0
              ? collectionData?.items.map((collectionLeader, index) => {
                return (
                  <CollectionLeaderBoardCard
                    redirectTo={`/app/collection/${isOfficialCollection(collectionLeader)}`}
                    index={index}
                    title={collectionLeader.name}
                    timePeriod={activePeriod}
                    isLeaderBoard={true}
                    logoUrl={collectionLeader.logoUrl}
                    contract={collectionLeader.contract}
                    stats={collectionLeader.stats}
                    key={index} />
                );
              })
              : loading && (<div className="flex items-center justify-center min-h-[16rem] w-full">
                <Loader />
              </div>)
          }
        </div>
      );
    } else {
      return (
        <div className={tw(
          'gap-2 minmd:grid minmd:space-x-2 minlg:space-x-0 minlg:gap-4',
          'minxl:grid-cols-3 minlg:grid-cols-2 minhd:grid-cols-4 w-full')}>
          {collections && collections?.length > 0 && collections?.map((collection, index) => {
            return (
              <CollectionCard
                key={index}
                redirectTo={`/app/collection/${isOfficialCollection({ name: collection.document.contractName, isOfficial: collection.document.isOfficial })}/`}
                contractAddr={collection.document?.contractAddr}
                collectionId={collection?.document?.id}
                floorPrice={collection.document?.floor}
                totalVolume={collection.document?.volume}
                contractName={collection.document.contractName}
                isOfficial={collection.document.isOfficial}
                images={[collection.document.bannerUrl]}
                likeInfo={collectionLikeData && collectionLikeData[index]}
              />
            );
          })}
        </div>
      );
    }
  };
  return (
    <>
      <div className="p-2 minmd:p-4 minlg:p-8 minhd:p-16 minmd:m-0 mb-10 minlg:mb-10 minlg:mt-20 minmd:max-w-full self-center minmd:self-stretch minxl:mx-auto min-h-screen ">
        <div className="flex">
          <div className=" w-full min-h-disc">
            <div>
              <div className='flex justify-between mb-10'>
                <div className='flex justify-between items-center'>
                  {
                    !isLeaderBoard && (
                      <div className='flex items-center'>
                        <div
                          className={`hidden minlg:block max-w-[112px] overflow-hidden cursor-pointer ${sideNavOpen ? 'mr-[206px]' : 'mr-4'}`}
                          onClick={() => setSideNavOpen(!sideNavOpen)}>
                          {sideNavOpen ?
                            <div className="flex items-center justify-center bg-[#F2F2F2] text-[#6A6A6A] py-3 px-5 text-lg rounded-[48px]">
                              Filters
                              <X size={22} className="text-[#6A6A6A] ml-2" />
                            </div> :
                            <div className="flex items-center justify-center bg-black text-white py-3 px-5 text-lg rounded-[48px]">
                              <SlidersHorizontal size={22} className="mr-2" />
                              <p>Filter</p>
                            </div>
                          }
                        </div>
                        <div className="px-0 flex mt-0 mr-4 justify-between minlg:hidden">
                          <div onClick={() => setSearchModalOpen(true, 'filters', filters)} className={'flex items-center justify-center bg-black text-white w-10 h-10  text-lg rounded-full cursor-pointer'}>
                            <SlidersHorizontal size={22} />
                          </div>
                        </div>
                      </div>
                    )
                  }
                  <div className="flex flex-col minmd:flex-row minmd:items-center">
                    {isLeaderBoard && <span className="text-[1.75rem] font-[500] mr-10">Leaderboard</span>}
                    <button onClick={(e) => {
                      e.preventDefault();
                      toggleLeaderBoardState(!isLeaderBoard);
                    }}
                    className={`${isLeaderBoard ? 'text-[#6A6A6A]' : 'text-[#000]'} flex items-center underline`}
                    >
                      {!isLeaderBoard ? <LeaderBoardIcon className="mr-2" /> : null}
                      {!isLeaderBoard ? 'Show leaderboard' : 'View Collections'}
                    </button>
                  </div>
                </div>
                <div className='flex minmd:hidden'>
                  {
                    isLeaderBoard && (
                      <TimePeriodToggle
                        onChange={(val) => changeTimePeriod(val)}
                        activePeriod={activePeriod} />
                    )
                  }

                </div>
              </div>
              <div className="flex">
                <div className="flex-auto">
                  {
                    isLeaderBoard
                      ? (
                        <div className="hidden minlg:flex px-6 text-sm text-[#B2B2B2] leading-6 font-[600] font-noi-grotesk">
                          <div className="w-[35%] flex items-center  pl-[32px]">COLLECTION</div>
                          <div className="w-[15%] flex items-center justify-center">VOLUME</div>
                          <div className="w-[15%] flex items-center justify-center">% CHANGE</div>
                          <div className="w-[15%] flex items-center justify-center">FLOOR PRICE</div>
                          <div className="w-[10%] flex items-center justify-center">ITEMS</div>
                          <div className="w-[10%] flex items-center justify-center">SALES</div>
                        </div>
                      )
                      : null
                  }
                  <div className={!isLeaderBoard ? 'flex flex-row justify-between items-start' : ''}>
                    {
                      !isLeaderBoard && sideNavOpen && (
                        <div className='hidden minlg:block'>
                          <SideNav onSideNav={() => null} filtersData={filters} />
                        </div>
                      )
                    }
                    {
                      !loading && (collections?.length === 0)
                        ? (
                          <div className='grid-cols-1 w-full'>
                            <NoActivityIcon className='m-auto mt-10 h-[300px]' />
                            <div className="md:text-[20px] text-[24px] font-semibold font-noi-grotesk mb-2 flex items-center justify-center mt-5 text-[#4D4D4D]">No Results Found</div>
                          </div>
                        )
                        : null
                    }
                    {collections && collections?.length > 0 && leaderBoardOrCollectionView()}
                  </div>
                  {(loading) &&
                    (<div className="flex items-center justify-center min-h-[16rem] w-full">
                      <Loader />
                    </div>)}
                  {!isLeaderBoard && collections && collections.length < found && collections?.length > 0 &&
                    <div className="mx-auto w-full minxl:w-1/4 flex justify-center mt-7 font-medium">
                      <Button
                        size={ButtonSize.LARGE}
                        scaleOnHover
                        stretch={true}
                        label={'Load More'}
                        onClick={(e) => {
                          e.preventDefault();
                          setPage(page + 1);
                        }}
                        type={ButtonType.PRIMARY}
                      />
                    </div>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

CollectionsPage.getLayout = function getLayout(page) {
  return (
    <DefaultLayout showDNavigation={true}>
      {page}
    </DefaultLayout>
  );
};
