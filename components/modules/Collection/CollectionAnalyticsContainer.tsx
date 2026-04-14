import { BarGraph } from 'components/modules/Analytics/BarGraph';
import { LineVis } from 'components/modules/Analytics/LineVis';
import { useGetContractSalesStatisticsQuery } from 'graphql/hooks/useGetContractSalesStatisticsQuery';
import { Doppler, getEnv } from 'utils/env';
import { tw } from 'utils/tw';

import { Tab } from '@headlessui/react';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useNetwork } from 'wagmi';

export type CollectionAnalyticsContainerProps = {
  contract: string;
}

const timeFrames = {
  0: '1D',
  1: '7D',
  2: '1M',
  3: '3M',
  4: '1Y',
  5: 'ALL',
};

const marketplaces = {
  0: 'OpenSea',
  1: 'LooksRare'
};

export const CollectionAnalyticsContainer = ({ contract }: CollectionAnalyticsContainerProps) => {
  const { chain } = useNetwork();
  const collectionSalesHistory = useGetContractSalesStatisticsQuery(contract);
  const [, setSelectedTimeFrame] = useState(timeFrames[0]);
  const [selectedMarketplace, setSelectedMarketplace] = useState(marketplaces[0]);

  const [, setSingleDayVolume] = useState(null);
  const [, setSevenDayVolume] = useState(null);
  const [, setThirtyDayVolume] = useState(null);
  const [collectionLineData, setCollectionLineData] = useState(null);

  const now = moment();

  const oneDayAgo = now.format('MM-DD-YYYY').toString();
  const sevenDaysAgo = now.subtract(7, 'days').format('MM-DD-YYYY').toString();
  const thirtyDaysAgo = now.subtract(30, 'days').format('MM-DD-YYYY').toString();
  const [collectionBarData, setCollectionBarData] = useState(null);

  useEffect(() => {
    if((chain?.id !== 1 && getEnv(Doppler.NEXT_PUBLIC_CHAIN_ID) !== '1') || !collectionSalesHistory) {
      return;
    } else {
      if(!collectionLineData) {
        setCollectionLineData([{ 'date': thirtyDaysAgo, 'value': collectionSalesHistory?.data?.statistics.floor_price_historic_thirty_day },
          { 'date': sevenDaysAgo, 'value': collectionSalesHistory?.data?.statistics.floor_price_historic_seven_day },
          { 'date': oneDayAgo, 'value': collectionSalesHistory?.data?.statistics.floor_price_historic_one_day }]);
      }
      setSingleDayVolume({ 'date': oneDayAgo, 'value': collectionSalesHistory?.data?.statistics.one_day_volume });
      setSevenDayVolume({ 'date': sevenDaysAgo, 'value': collectionSalesHistory?.data?.statistics.seven_day_volume });
      setThirtyDayVolume({ 'date': thirtyDaysAgo, 'value': collectionSalesHistory?.data?.statistics.thirty_day_volume });

      setCollectionBarData(collectionSalesHistory);
    }
  }, [chain?.id, collectionLineData, collectionSalesHistory, oneDayAgo, sevenDaysAgo, thirtyDaysAgo]);

  return (
    <>
      <div className="bg-transparent">
        {(collectionLineData && collectionBarData) &&
        <Tab.Group
          onChange={(index) => {
            setSelectedTimeFrame(timeFrames[index]);
          }}
        >
          <Tab.List className="flex w-3/4 ml-16 items-center order-last rounded-lg bg-[#F6F6F6] p-2 my-4">
            {Object.keys(timeFrames).map((timeFrame) => (
              <Tab
                key={timeFrame}
                className={({ selected }) =>
                  tw(
                    'font-noi-grotesk w-full rounded-lg p-1 text-xs font-semibold leading-5 text-[#6F6F6F] ',
                    'ring-white ring-opacity-60 ring-offset-2 focus:outline-none focus:ring-2',
                    selected
                      ? 'bg-white shadow text-[#1F2127] font-medium'
                      : 'hover:bg-white/[0.12] hover:text-white'
                  )
                }
              >
                {timeFrames[timeFrame]}
              </Tab>
            ))}
          </Tab.List>
        </Tab.Group>
        }
        <LineVis
          label={'Floor Price'}
          showMarketplaceOptions={false}
          data={collectionLineData}
          currentMarketplace={selectedMarketplace}
          setCurrentMarketplace={(selectedMarketplace: string) => {
            setSelectedMarketplace(selectedMarketplace);
          }}
        />
      </div>
      <div className='bg-transparent'>
        <BarGraph
          label={'Volume'}
          data={collectionBarData}
          currentMarketplace={selectedMarketplace}
        />
      </div>
    </>
  );
};