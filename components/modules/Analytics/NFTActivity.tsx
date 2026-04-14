import { Button, ButtonSize, ButtonType } from 'components/elements/Button';
import { Nft } from 'graphql/generated/types';
import { useGetTxByNFTQuery } from 'graphql/hooks/useGetTxByNFTQuery';
import { useDefaultChainId } from 'hooks/useDefaultChainId';
import { usePaginator } from 'hooks/usePaginator';
import { filterNulls, isNullOrEmpty } from 'utils/format';

import DetailPageTableRow from './DetailPageTableRow';

import { BigNumber } from 'ethers';
import { useCallback, useEffect, useState } from 'react';
import { PartialDeep } from 'type-fest';

export type TxHistoryProps = {
  data: PartialDeep<Nft>;
}
export const NFTActivity = ({ data }: TxHistoryProps) => {
  const defaultChainId = useDefaultChainId();
  const [nftData, setNftdata] = useState([]);
  const [lastAddedPage, setLastAddedPage] = useState('');
  const {
    nextPage,
    afterCursor,
    setTotalCount,
    cachedTotalCount
  } = usePaginator(25);

  const nftTransactionHistory = useGetTxByNFTQuery(
    data?.contract,
    data?.tokenId ? BigNumber.from(data?.tokenId).toString() : null,
    'all',
    {
      first: 25,
      afterCursor
    }
  );

  const loadMoreActivities = useCallback(() => {
    nextPage(nftTransactionHistory?.data?.pageInfo?.lastCursor);
  }, [nextPage, nftTransactionHistory?.data?.pageInfo?.lastCursor]);

  useEffect(() => {
    if (
      nftTransactionHistory?.data?.items?.length > 0 &&
      lastAddedPage !== nftTransactionHistory?.data?.pageInfo?.firstCursor
    ) {
      setNftdata([
        ...nftData,
        ...filterNulls(nftTransactionHistory?.data?.items)
      ]);
      setLastAddedPage(nftTransactionHistory?.data?.pageInfo?.firstCursor);
      setTotalCount(nftTransactionHistory?.data?.totalItems);
    } else {
      setTotalCount(nftTransactionHistory?.data?.totalItems || 0);
    }
  }, [lastAddedPage, setTotalCount, afterCursor, nftTransactionHistory?.data?.items, nftTransactionHistory?.data?.pageInfo?.firstCursor, nftTransactionHistory?.data?.totalItems, nftData]);

  useEffect(() => {
    if(defaultChainId !== '1' || !nftTransactionHistory) {
      return;
    } else {
      if(!nftData && nftTransactionHistory) {
        setNftdata(nftTransactionHistory?.data?.items);
      }
    }
  }, [defaultChainId, nftData, nftTransactionHistory]);

  return (
    <div className="font-noi-grotesk p-4 max-h-80 md:mb-0 overflow-x-auto sales-scrollbar whitespace-nowrap">
      {isNullOrEmpty(nftData) ?
        <span className='bg-white flex justify-center px-auto mx-auto w-full whitespace-nowrap font-normal text-base leading-6 text-[#1F2127] text-center items-center min-h-[280px]'>
          No Activity for this NFT yet
        </span>
        :
        <table className="border-collapse table-auto w-full h-max overflow-x-auto">
          <thead className='text-[#939393] text-[16px] leading-6'>
            <tr className='px-4 pb-3 text-left'>
              <th className='p-4 font-medium'>Event</th>
              <th className='p-4 font-medium'>From</th>
              <th className='p-4 font-medium'>To</th>
              <th className='p-4 font-medium'>Marketplace</th>
              <th className='p-4 font-medium'>Price</th>
              <th className='p-4 font-medium'>USD Value</th>
              <th className='p-4 font-medium'>Timestamp</th>
              <th className='p-4 font-medium'>Transaction Hash</th>
            </tr>
          </thead>
          <tbody className='p-4'>
            {nftData?.map((tx, index) => (
              <DetailPageTableRow tx={tx} index={index} key={tx?.id ?? index} isNftDetailPage={true} />
            ))}
          </tbody>
        </table>
      }
      {cachedTotalCount > nftData?.length && !isNullOrEmpty(nftData) &&
        <div className='w-full flex justify-center items-center'>
          <Button
            onClick={() => loadMoreActivities()}
            type={ButtonType.PRIMARY}
            size={ButtonSize.LARGE}
            label='Load More'
          />
        </div>
      }
    </div>
  );
};
