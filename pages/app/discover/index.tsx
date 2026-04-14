import { Button, ButtonSize, ButtonType } from 'components/elements/Button';
import Loader from 'components/elements/Loader/Loader';
import { SearchBar } from 'components/elements/SearchBar';
import TimePeriodToggle from 'components/elements/TimePeriodToggle';
import DefaultLayout from 'components/layouts/DefaultLayout';
import { CollectionCard } from 'components/modules/DiscoveryCards/CollectionCard';
import { CollectionLeaderBoardCard } from 'components/modules/DiscoveryCards/CollectionLeaderBoardCard';
import { ProfileCard } from 'components/modules/DiscoveryCards/ProfileCard';
import { DiscoveryTabNav } from 'components/modules/DiscoveryTabNavigation/DiscoveryTabsNavigation';
import { Profile } from 'graphql/generated/types';
import { useCollectionQueryLeaderBoard } from 'graphql/hooks/useCollectionLeaderBoardQuery';
import { useFetchNFTsForCollections } from 'graphql/hooks/useFetchNFTsForCollections';
import { useLeaderboardQuery } from 'graphql/hooks/useLeaderboardQuery';
import { usePreviousValue } from 'graphql/hooks/usePreviousValue';
import { useRecentProfilesQuery } from 'graphql/hooks/useRecentProfilesQuery';
import { useSearchModal } from 'hooks/state/useSearchModal';
import { usePaginator } from 'hooks/usePaginator';
import useWindowDimensions from 'hooks/useWindowDimensions';
import { DiscoverPageProps } from 'types';
import { Doppler, getEnvBool } from 'utils/env';
import { filterNulls, isNullOrEmpty } from 'utils/format';
import { collectionCardImages, getPerPage } from 'utils/helpers';
import { tw } from 'utils/tw';

import { getCollection } from 'lib/contentful/api';
import { useRouter } from 'next/router';
import LeaderBoardIcon from 'public/icons/leaderBoardIcon.svg?svgr';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import { PartialDeep } from 'type-fest';

export default function DiscoverPage({ data, dataDev }: DiscoverPageProps) {
  const router = useRouter();
  const { fetchNFTsForCollections } = useFetchNFTsForCollections();
  const { width: screenWidth } = useWindowDimensions();
  const { usePrevious } = usePreviousValue();
  const [page, setPage] = useState(1);
  const [isLoading, toggleLoadState] = useState(false);
  const [tabView, toggleTabView] = useState('collections');
  const [isLeaderBoard, toggleLeaderBoardState] = useState(true);
  const { sideNavOpen, activePeriod, changeTimePeriod, setCuratedCollections, selectedCuratedCollection, curatedCollections, setSelectedCuratedCollection } = useSearchModal();
  const [paginatedAddresses, setPaginatedAddresses] = useState([]);
  const prevSelectedCuratedCollection = usePrevious(selectedCuratedCollection);
  const { data: collectionData } = useCollectionQueryLeaderBoard(activePeriod);
  const { data: leaderboardData } = useLeaderboardQuery({ pageInput: { first: 10 } });
  const { data: nftsForCollections } = useSWR(selectedCuratedCollection, async () => {
    let nftsForCollections;
    prevSelectedCuratedCollection !== selectedCuratedCollection && setPaginatedAddresses([]);
    await fetchNFTsForCollections({
      collectionAddresses: contractAddresses,
      count: 5
    }).then((collectionsData => {
      const sortedNftsForCollections = collectionsData.nftsForCollections.sort((a, b) => (a.collectionAddress > b.collectionAddress) ? 1 : -1);
      nftsForCollections = sortedNftsForCollections.filter(i => i.nfts.length > 0);
    }));
    return nftsForCollections;
  });

  const contractAddresses = useMemo(() => {
    return selectedCuratedCollection?.contractAddresses.addresses ?? [];
  }, [selectedCuratedCollection?.contractAddresses.addresses]);

  useEffect(() => {
    if (isNullOrEmpty(curatedCollections)) {
      setCuratedCollections(getEnvBool(Doppler.NEXT_PUBLIC_DEV_CONTENT_MODEL_ENABLED) ? dataDev : data);
    }
  }, [curatedCollections, data, dataDev, setCuratedCollections]);

  useEffect(() => {
    const query = Object.keys(router.query);
    if (query && query[0]) {
      toggleTabView(query[0]);
    } else {
      toggleTabView('collections');
    }
  }, [router]);

  useEffect(() => {
    setPage(1);
  }, [selectedCuratedCollection?.tabTitle]);

  useEffect(() => {
    if (isNullOrEmpty(selectedCuratedCollection)) {
      curatedCollections && curatedCollections.length > 0 && setSelectedCuratedCollection(curatedCollections[0]);
    }
  }, [curatedCollections, selectedCuratedCollection, setSelectedCuratedCollection]);

  useEffect(() => {
    const paginatedContracts = nftsForCollections?.slice(0, getPerPage('discover', screenWidth, sideNavOpen) * page);
    const sortedPaginatedAddresses = paginatedContracts?.sort((a, b) => (a.collectionAddress > b.collectionAddress) ? 1 : -1);
    nftsForCollections && nftsForCollections.length > 0 && setPaginatedAddresses([...sortedPaginatedAddresses]);
  }, [nftsForCollections, page, screenWidth, sideNavOpen]);

  const PROFILE_LOAD_COUNT = getPerPage('discoverProfiles', screenWidth);

  const {
    nextPage,
    afterCursor,
    setTotalCount
  } = usePaginator(PROFILE_LOAD_COUNT);

  const [lastAddedPage, setLastAddedPage] = useState('');

  const [allLoadedProfiles, setAllLoadedProfiles] = useState<PartialDeep<Profile>[]>([]);
  const { data: loadedProfilesNextPage } = useRecentProfilesQuery({
    first: PROFILE_LOAD_COUNT,
    afterCursor
  });

  const loadMoreProfiles = useCallback(() => {
    nextPage(loadedProfilesNextPage?.latestProfiles?.pageInfo?.lastCursor);
  }, [loadedProfilesNextPage?.latestProfiles?.pageInfo?.lastCursor, nextPage]);

  useEffect(() => {
    if (
      loadedProfilesNextPage?.latestProfiles?.items?.length > 0 &&
      lastAddedPage !== loadedProfilesNextPage?.latestProfiles?.pageInfo?.firstCursor
    ) {
      setAllLoadedProfiles([
        ...allLoadedProfiles,
        ...filterNulls(loadedProfilesNextPage?.latestProfiles?.items)
      ]);
      toggleLoadState(false);
      setLastAddedPage(loadedProfilesNextPage?.latestProfiles?.pageInfo?.firstCursor);
      setTotalCount(loadedProfilesNextPage?.latestProfiles?.totalItems);
    }
  }, [allLoadedProfiles, lastAddedPage, loadedProfilesNextPage, setTotalCount]);
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
                    redirectTo={'collection/' + collectionLeader?.contract}
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
              : (<div className="flex items-center justify-center min-h-[16rem] w-full">
                <Loader />
              </div>)
          }
        </div>
      );
    } else {
      return (
        <div className={tw(
          'gap-2 minmd:grid minmd:space-x-2 minlg:space-x-0 minlg:gap-4',
          'minxl:grid-cols-3 minlg:grid-cols-2 minhd:grid-cols-4')}>
          {paginatedAddresses && paginatedAddresses.length > 0 && paginatedAddresses.map((collection, index) => {
            return (
              <CollectionCard
                key={index}
                redirectTo={`/app/collection/${collection?.collectionAddress}/`}
                contractAddr={collection?.collectionAddress}
                collectionId={collection?.id}
                images={collectionCardImages(collection)}
                contractName={collection.document.contractName}
                floorPrice={collection.document?.floor}
                likeInfo={{
                  likeCount: 0,
                  isLikedBy: false
                }}
              />
            );
          })}
        </div>
      );
    }
  };
  const loadMoreProfilesFunc = () => {
    toggleLoadState(true);
    loadMoreProfiles();
  };
  const filterUniq = (value, index, self) => {
    return self.indexOf(value) === index;
  };
  const returnProfileBlock = () => {
    if (allLoadedProfiles && allLoadedProfiles.length) {
      return (
        <div>
          <div className={tw(
            'grid grid-cols-1 minlg:space-x-0 gap-1 minmd:gap-4',
            isLeaderBoard ? 'minxl:grid-cols-1' : 'minxl:grid-cols-5 minhd:grid-cols-4 minlg:grid-cols-3 minmd:grid-cols-2')}>
            {
              !isLeaderBoard
                ? (
                  allLoadedProfiles.filter(filterUniq).map((profile, index) => {
                    return (
                      <ProfileCard
                        key={index}
                        profile={profile}
                      />
                    );
                  })
                )
                : (
                  leaderboardData && leaderboardData?.leaderboard?.items.map((item, i) => {
                    return (
                      <ProfileCard
                        key={i}
                        number={i}
                        isLeaderBoard
                        id={item.id}
                        itemsVisible={item.itemsVisible}
                        photoURL={item.photoURL}
                        url={item.url}
                      />
                    );
                  })
                )
            }
          </div>
          <div className="w-full flex justify-center pb-32 mt-12">
            {
              isLoading
                ? (
                  <Loader />
                )
                : (
                  !isLeaderBoard
                    ? <Button
                      size={ButtonSize.LARGE}
                      label={'Load More'}
                      onClick={() => loadMoreProfilesFunc()}
                      type={ButtonType.PRIMARY}
                    />
                    : null
                )
            }
          </div>
        </div>
      );
    } else {
      return (
        <div className="flex items-center justify-center min-h-[16rem] w-full">
          <Loader />
        </div>
      );
    }
  };
  const returnCollectionBlock = () => {
    return (
      <>
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
            {leaderBoardOrCollectionView()}
            {(paginatedAddresses && paginatedAddresses.length === 0) &&
              (<div className="flex items-center justify-center min-h-[16rem] w-full">
                <Loader />
              </div>)}
            {!isLeaderBoard && paginatedAddresses && paginatedAddresses.length > 0 && paginatedAddresses.length < nftsForCollections?.length &&
              <div className="mx-auto w-full minxl:w-1/4 flex justify-center mt-7 font-medium">
                <Button
                  size={ButtonSize.LARGE}
                  scaleOnHover
                  stretch={true}
                  label={'Load More'}
                  onClick={() => setPage(page + 1)}
                  type={ButtonType.PRIMARY}
                />
              </div>}
          </div>
        </div>
      </>
    );
  };
  const checkActiveTab = () => {
    switch (tabView) {
    case 'collections':
      return returnCollectionBlock();
    case 'profiles':
      return returnProfileBlock();
    default:
      return returnCollectionBlock();
    }
  };
  useEffect(() => {
    if (tabView === 'collections') {
      toggleLeaderBoardState(true);
    } else {
      toggleLeaderBoardState(false);
    }
  }, [tabView]);
  return (
    <>
      <div className="p-2 minmd:p-4 minlg:p-8 minhd:p-16 minmd:m-0 mb-10 minlg:mb-10 minlg:mt-20 minmd:max-w-full self-center minmd:self-stretch minxl:mx-auto min-h-screen ">
        <div className="flex">
          <div className=" w-full min-h-disc">
            {
              isLeaderBoard && tabView === 'collections' && (
                <div className='mb-10 mt-8'>
                  <div className="text-xl minmd:text-3xl minmd:mb-5 mb-3	minlg:text-[54px] font-semibold text-[#000000] text-center minlg:leading-[63px] minlg:mb-10">
                    Find your next collectible<br /> <span className="text-[#000000] textColorGradient">wherever it lives</span>
                  </div>
                  <div>
                    <SearchBar leaderBoardSearch />
                  </div>
                </div>
              )
            }
            <DiscoveryTabNav />
            <div>
              <div className='flex justify-between mt-6 mb-10'>
                <div className='flex justify-between items-center'>
                  <div className="flex flex-col minmd:flex-row minmd:items-center">
                    {isLeaderBoard && <span className="text-[1.75rem] font-[500] mr-10">Leaderboard</span>}
                    <button onClick={(e) => {
                      e.preventDefault(); toggleLeaderBoardState(!isLeaderBoard);
                    }}
                    className={`${isLeaderBoard ? 'text-[#6A6A6A]' : 'text-[#000]'} flex items-center underline`}>
                      {!isLeaderBoard ? <LeaderBoardIcon className="mr-2" /> : null}
                      {!isLeaderBoard ? 'Show leaderboard' : tabView === 'profiles' ? 'View Profiles' : 'View Collections'}
                    </button>
                  </div>
                </div>
                {
                  isLeaderBoard && tabView !== 'profiles' && (
                    <div className="flex items-center ">
                      <TimePeriodToggle
                        onChange={(val) => changeTimePeriod(val)}
                        activePeriod={activePeriod} />
                    </div>
                  )
                }
              </div>
              {checkActiveTab()}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

DiscoverPage.getLayout = function getLayout(page) {
  return (
    <DefaultLayout>
      {page}
    </DefaultLayout>
  );
};

export async function getServerSideProps({ preview = false }) {
  const curData = await getCollection(false, 10, 'curatedCollectionsCollection', 'tabTitle contractAddresses');
  const curDataDev = await getCollection(false, 10, 'discoverCuratedDevCollection', 'tabTitle contractAddresses');

  return {
    props: {
      preview,
      data: curData ?? null,
      dataDev: curDataDev ?? null,
    }
  };
}
