import { Button, ButtonSize, ButtonType } from 'components/elements/Button';
import { useActivitiesForAddressQuery } from 'graphql/hooks/useActivitiesForAddressQuery';
import { useUpdateReadByIdsMutation } from 'graphql/hooks/useUpdateReadByIdsMutation';
import { useDefaultChainId } from 'hooks/useDefaultChainId';
import { usePaginator } from 'hooks/usePaginator';
import { filterNulls, isNullOrEmpty } from 'utils/format';

import ActivityTableRow from './ActivityTableRow';

import { useCallback, useEffect, useState } from 'react';
import { useAccount } from 'wagmi';

const ACTIVITY_LOAD_COUNT = 50;

export default function ActivityPages() {
  const {
    nextPage,
    afterCursor,
    setTotalCount,
    cachedTotalCount
  } = usePaginator(ACTIVITY_LOAD_COUNT);
  const [lastAddedPage, setLastAddedPage] = useState('');
  const [activityData, setActivityData] = useState([]);
  const { address: currentAddress } = useAccount();
  const defaultChainId = useDefaultChainId();
  const { updateReadbyIds } = useUpdateReadByIdsMutation();

  const { data: loadedActivitiesNextPage } = useActivitiesForAddressQuery(
    currentAddress,
    defaultChainId,
    {
      first: ACTIVITY_LOAD_COUNT,
      afterCursor
    }
  );

  const loadMoreActivities = useCallback(() => {
    nextPage(loadedActivitiesNextPage?.getActivities?.pageInfo?.lastCursor);
  }, [loadedActivitiesNextPage?.getActivities?.pageInfo?.lastCursor, nextPage]);

  useEffect(() => {
    if(activityData.length) {
      updateReadbyIds({ ids: [] });
    }
  }, [updateReadbyIds, currentAddress, activityData]);

  useEffect(() => {
    setActivityData([]);
  }, [currentAddress]);

  useEffect(() => {
    if (
      loadedActivitiesNextPage?.getActivities?.items?.length > 0 &&
      lastAddedPage !== loadedActivitiesNextPage?.getActivities?.pageInfo?.firstCursor
    ) {
      setActivityData([
        ...activityData,
        ...filterNulls(loadedActivitiesNextPage?.getActivities?.items)
      ]);
      setLastAddedPage(loadedActivitiesNextPage?.getActivities?.pageInfo?.firstCursor);
      setTotalCount(loadedActivitiesNextPage?.getActivities?.totalItems);
    } else {
      if(loadedActivitiesNextPage?.getActivities?.items?.length > 0 && isNullOrEmpty(activityData)){
        setActivityData(filterNulls(loadedActivitiesNextPage?.getActivities?.items));
        setLastAddedPage(loadedActivitiesNextPage?.getActivities?.pageInfo?.firstCursor);
        setTotalCount(loadedActivitiesNextPage?.getActivities?.totalItems);
      } else {
        setTotalCount(loadedActivitiesNextPage?.getActivities?.totalItems || 0);
      }
    }
  }, [lastAddedPage, setTotalCount, activityData, loadedActivitiesNextPage, afterCursor, loadedActivitiesNextPage?.getActivities?.items]);

  return (
    <div className='flex flex-col justify-between minlg:pt-28 px-4 font-noi-grotesk'>
      <div className='w-full max-w-nftcom mx-auto relative'>
        <h2 className='font-bold text-black text-[40px] mb-6'>
          <span className='text-[#F9D963]'>/</span>
          My Activity
        </h2>
        <div className="my-8 font-noi-grotesk rounded-md pt-4 pb-8 overflow-x-auto min-h-[380px]">
          <table className="border-collapse table-auto w-full">
            <thead className='text-[#6F6F6F] text-sm font-medium leading-6 p-4'>
              <tr className='pt-0 pb-3 text-left ...'>
                <th className='text-[#6F6F6F] text-sm font-medium leading-6 pl-8 pt-0 pb-3 pr-8 minmd:pr-4'>Name</th>
                <th className='text-[#6F6F6F] text-sm font-medium leading-6 pb-4 pr-8 minmd:pr-4'>Status</th>
                <th className='text-[#6F6F6F] text-sm font-medium leading-6 pb-4 pr-8 minmd:pr-4'>Marketplace</th>
                <th className='text-[#6F6F6F] text-sm font-medium leading-6 pb-4 pr-8 minmd:pr-4'>Price</th>
                <th className='text-[#6F6F6F] text-sm font-medium leading-6 pb-4 pr-8 minmd:pr-4'>USD Value</th>
                <th className='text-[#6F6F6F] text-sm font-medium leading-6 pb-4 pr-8 minmd:pr-4'>Time</th>
                <th className='text-[#6F6F6F] text-sm font-medium leading-6 pb-4 pr-8 minmd:pr-4'>From</th>
                <th className='text-[#6F6F6F] text-sm font-medium leading-6 pb-4 pr-8 minmd:pr-4'>To</th>
              </tr>
            </thead>
            <tbody className='p-4'>
              {activityData?.map((item, i) => (
                <ActivityTableRow key={item.id} item={item} index={i} />
              ))}
            </tbody>
          </table>
          {!activityData || !activityData?.length && <p className='text-[#6F6F6F] flex items-center justify-center border h-[400px] rounded-[10px]'>No activity available</p>}

          {cachedTotalCount > activityData?.length &&
            <div className='w-full flex justify-center'>
              <Button
                onClick={() => loadMoreActivities()}
                type={ButtonType.PRIMARY}
                size={ButtonSize.LARGE}
                label='Load More'
              />
            </div>
          }
        </div>
      </div>
    </div>
  );
}
