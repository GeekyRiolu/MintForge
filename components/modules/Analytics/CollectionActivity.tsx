
import { Button, ButtonSize, ButtonType } from 'components/elements/Button';
import { useGetTxByContractQuery } from 'graphql/hooks/useGetTxByContractQuery';
import { useDefaultChainId } from 'hooks/useDefaultChainId';
import { usePaginator } from 'hooks/usePaginator';
import { filterNulls, isNullOrEmpty } from 'utils/format';

import DetailPageTableRow from './DetailPageTableRow';

import { useCallback, useEffect, useState } from 'react';

export type CollectionActivityProps = {
  contract: string;
}
export const CollectionActivity = ({ contract }: CollectionActivityProps) => {
  const defaultChainId = useDefaultChainId();
  const [collectionData, setCollectionData] = useState([]);
  const [lastAddedPage, setLastAddedPage] = useState('');
  const {
    nextPage,
    afterCursor,
    setTotalCount,
    cachedTotalCount
  } = usePaginator(25);

  const txs = useGetTxByContractQuery(
    contract,
    {
      first: 25,
      afterCursor
    }
  );

  const loadMoreActivities = useCallback(() => {
    nextPage(txs?.data?.pageInfo?.lastCursor);
  }, [nextPage, txs?.data?.pageInfo?.lastCursor]);

  useEffect(() => {
    if (
      txs?.data?.items?.length > 0 &&
      lastAddedPage !== txs?.data?.pageInfo?.firstCursor
    ) {
      setCollectionData([
        ...collectionData,
        ...filterNulls(txs?.data?.items)
      ]);
      setLastAddedPage(txs?.data?.pageInfo?.firstCursor);
      setTotalCount(txs?.data?.totalItems);
    } else {
      setTotalCount(txs?.data?.totalItems || 0);
    }
  }, [lastAddedPage, setTotalCount, afterCursor, txs?.data?.items, txs?.data?.pageInfo?.firstCursor, txs?.data?.totalItems, collectionData]);

  useEffect(() => {
    if(defaultChainId !== '1' || !txs) {
      return;
    } else {
      if(!collectionData && txs) {
        setCollectionData(txs?.data?.items);
      }
    }}, [defaultChainId, collectionData, txs, setTotalCount]);

  return (
    <div className="overflow-x-auto my-8 font-noi-grotesk rounded-md p-4">
      {isNullOrEmpty(collectionData) ?
        <p className='text-[#6F6F6F] flex items-center justify-center border h-[200px] rounded-[10px]'>No activity available</p> :
        <table className="border-collapse table-auto w-full">
          <thead className='text-[#6F6F6F] text-sm font-medium leading-6 p-4'>
            <tr className='p-4 pt-0 pb-3 text-left ...'>
              <th className='text-[#6F6F6F] text-sm font-medium leading-6 p-4'>Type</th>
              <th className='text-[#6F6F6F] text-sm font-medium leading-6 p-4 whitespace-nowrap'>Token ID</th>
              <th className='text-[#6F6F6F] text-sm font-medium leading-6 p-4'>From</th>
              <th className='text-[#6F6F6F] text-sm font-medium leading-6 p-4'>To</th>
              <th className='text-[#6F6F6F] text-sm font-medium leading-6 p-4'>Marketplace</th>
              <th className='text-[#6F6F6F] text-sm font-medium leading-6 p-4'>Price</th>
              <th className='text-[#6F6F6F] text-sm font-medium leading-6 p-4 whitespace-nowrap'>USD Value</th>
              <th className='text-[#6F6F6F] text-sm font-medium leading-6 p-4 whitespace-nowrap'>Timestamp</th>
              <th className='text-[#6F6F6F] text-sm font-medium leading-6 p-4 whitespace-nowrap'>Transaction Hash</th>
            </tr>
          </thead>
          <tbody className='p-4'>
            {collectionData?.map((tx , index) => (
              <DetailPageTableRow key={tx?.id} tx={tx} index={index} />
            ))}
          </tbody>
        </table>
      }
      {cachedTotalCount > collectionData?.length && !isNullOrEmpty(collectionData) &&
        <div className='w-full flex justify-center items-center'>
          <Button
            type={ButtonType.PRIMARY}
            size={ButtonSize.LARGE}
            onClick={() => loadMoreActivities()}
            label='Load More'
          />
        </div>
      }
    </div>
  );
};
