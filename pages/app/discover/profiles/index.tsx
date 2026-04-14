import { Button, ButtonSize, ButtonType } from 'components/elements/Button';
import Loader from 'components/elements/Loader/Loader';
import DefaultLayout from 'components/layouts/DefaultLayout';
import { ProfileCard } from 'components/modules/DiscoveryCards/ProfileCard';
import { Profile } from 'graphql/generated/types';
import { useLeaderboardQuery } from 'graphql/hooks/useLeaderboardQuery';
import { useRecentProfilesQuery } from 'graphql/hooks/useRecentProfilesQuery';
import { usePaginator } from 'hooks/usePaginator';
import useWindowDimensions from 'hooks/useWindowDimensions';
import { filterNulls } from 'utils/format';
import { getPerPage } from 'utils/helpers';
import { tw } from 'utils/tw';

import uniqBy from 'lodash/uniqBy';
import LeaderBoardIcon from 'public/icons/leaderBoardIcon.svg?svgr';
import React, { useCallback, useEffect, useState } from 'react';
import { PartialDeep } from 'type-fest';

export default function ProfilePage() {
  const [isLoading, toggleLoadState] = useState(false);
  const [isLeaderBoard, toggleLeaderBoardState] = useState(false);
  const { data: leaderboardData } = useLeaderboardQuery({ pageInput: { first: 10 } });
  const { width: screenWidth } = useWindowDimensions();

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

  const loadMoreProfilesFunc = () => {
    toggleLoadState(true);
    loadMoreProfiles();
  };

  const filterUniqProfiles = () => {
    if (!allLoadedProfiles && !allLoadedProfiles.length) return;
    const uniqData = uniqBy(allLoadedProfiles, (e) => e.id);
    return uniqData.map((profile, index) => {
      return (
        <ProfileCard
          key={index}
          profile={profile}
        />
      );
    });
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
                ? filterUniqProfiles()
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
                        isGkMinted={item.isGKMinted}
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
  return (
    <>
      <div className="p-2 minmd:p-4 minlg:p-8 minhd:p-16 minmd:m-0 mb-10 minlg:mb-10 minlg:mt-20 minmd:max-w-full self-center minmd:self-stretch minxl:mx-auto min-h-screen ">
        <div className="flex">
          <div className=" w-full min-h-disc">
            <div>
              <div className='flex justify-between mt-6 mb-10'>
                <div className='flex justify-between items-center'>
                  <div className="flex flex-col minmd:flex-row minmd:items-center">
                    {isLeaderBoard && <span className="text-[1.75rem] font-[500] mr-10">Leaderboard</span>}
                    <button onClick={(e) => {
                      e.preventDefault();
                      toggleLeaderBoardState(!isLeaderBoard);
                    }}
                    className={`${isLeaderBoard ? 'text-[#6A6A6A]' : 'text-[#000]'} flex items-center underline`}>
                      {!isLeaderBoard ? <LeaderBoardIcon className="mr-2" /> : null}
                      {!isLeaderBoard ? 'Show leaderboard' : 'View Profiles'}
                    </button>
                  </div>
                </div>
              </div>
              {returnProfileBlock()}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

ProfilePage.getLayout = function getLayout(page) {
  return (
    <DefaultLayout showDNavigation={true}>
      {page}
    </DefaultLayout>
  );
};
