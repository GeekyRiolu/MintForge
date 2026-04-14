import { Tabs } from 'components/elements/Tabs';
import { LineVis } from 'components/modules/Analytics/LineVis';
import { NFTActivity as StaticNFTActivity } from 'components/modules/Analytics/NFTActivity';
import { Nft } from 'graphql/generated/types';
import { useGetSales } from 'graphql/hooks/useGetSales';
import { tw } from 'utils/tw';

import { Menu, Transition } from '@headlessui/react';
import { BigNumber } from 'ethers';
import dynamic from 'next/dynamic';
import ChevronUpDownIcon from 'public/icons/ChevronUpDown.svg?svgr';
import { Fragment, useState } from 'react';
import { isMobile } from 'react-device-detect';
import useSWR from 'swr';
import { PartialDeep } from 'type-fest';

export type NFTAnalyticsContainerProps = {
  data: PartialDeep<Nft>;
}

const timeFrames = {
  0: '1D',
  1: '7D',
  2: '1M',
  3: '3M',
  4: '6M',
  5: '1Y',
  6: 'ALL'
};

const getTimeFrameString = (input: string) => {
  switch (input) {
  case '1D':
    return isMobile ? '1D' : 'Past Day';
  case '7D':
    return isMobile ? '7D' : 'Past 7 Days';
  case '1M':
    return isMobile ? '1M' : 'Past Month';
  case '3M':
    return isMobile ? '3M' : 'Past 3 Months';
  case '6M':
    return isMobile ? '6M' : 'Past 6 Months';
  case '1Y':
    return isMobile ? '1Y' : 'Past Year';
  case 'ALL':
    return isMobile ? 'ALL' : 'All Time';
  default:
    return 'All Time';
  }
};

const DynamicNFTActivity = dynamic<React.ComponentProps<typeof StaticNFTActivity>>(() => import('components/modules/Analytics/NFTActivity').then(mod => mod.NFTActivity));

export const NFTAnalyticsContainer = ({ data }: NFTAnalyticsContainerProps) => {
  const [selectedTab, setSelectedTab] = useState('Activity');
  const [selectedTimeFrame, setSelectedTimeFrame] = useState(timeFrames[6]);
  //TODO: refactor useGetSales to include useSWR hook and data formatting logic below
  const { getSales } = useGetSales();

  const { data: nftData } = useSWR(
    () => data?.contract && data?.tokenId ?
      ['getSales', data?.contract, data?.tokenId, selectedTimeFrame]
      : null,
    async ([
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      url,
      contract,
      tokenId,
      timeFrame
    ]) => {
      const dayTimeFrames = {
        '1D': '24h',
        '7D': '7d',
        '1M': '30d',
        '3M': '90d',
        '6M': '6m',
        '1Y': '1y',
        'ALL': 'all'
      };

      const resp = await getSales({
        contractAddress: contract,
        tokenId: BigNumber.from(tokenId).toString(),
        dateRange: dayTimeFrames[timeFrame] });

      const sales = resp.getSales.map(i => {
        return { date: i.date, value: i.priceUSD };
      });
      return sales.sort((a,b) =>(a.date > b.date) ? 1 : -1);
    });

  const activityTabs = [
    {
      label: 'Activity',
      content: <DynamicNFTActivity data={data} />
    },
    {
      label: 'Sales',
      content: <Menu as="div" className="relative inline-block text-left">
        <div className='flex items-center justify-end z-9'>
          <Menu.Button className="flex items-center capitalize justify-between rounded-[12px] md:w-[110px] w-[190px] bg-[#F2F2F2] px-3 py-2 text-[16px] text-black font-noi-grotesk hover:bg-gray-50">
            {getTimeFrameString(selectedTimeFrame)?.toLowerCase()}
            <ChevronUpDownIcon className="-mr-1 ml-2 h-7 w-7 text-[#B2B2B2]" aria-hidden="true" />
          </Menu.Button>
        </div>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 z-10 mt-2 md:w-[110px] w-[190px] origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="py-1">
              {Object.keys(timeFrames).map((timeFrame, index) => (
                <Menu.Item key={timeFrame}>
                  <div
                    onClick={() => {
                      setSelectedTimeFrame(timeFrames[index]);
                    }}
                    className={tw(
                      'font-noi-grotesk hover:bg-gray-50 w-full p-2 text[15px] text-center cursor-pointer leading-5 text-[#6A6A6A] ',
                    )}
                  >
                    {timeFrames[timeFrame]}
                  </div>
                </Menu.Item>
              ))}
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    },
  ];

  return (
    <div className="overflow-x-auto shadow-2xl rounded-[24px] pb-4 md:pb-0 minxl:py-5 minxl:pb-0 w-full">
      <div className="w-full flex flex-col p-4">
        <Tabs
          tabOptions={activityTabs}
          onTabChange={setSelectedTab}
          defaultTab={0}
          customTabWidth={'w-max'}
        />
      </div>
      {nftData?.length > 0 && selectedTab === 'Sales' &&
        <LineVis
          label={'Sales'}
          showMarketplaceOptions={false}
          data={nftData}
          selectedTimeFrame={selectedTimeFrame}
        />}
      {selectedTab === 'Sales' && (nftData?.length === 0 || !nftData) && <div className="p-4 max-h-80 mb-10 bg-white font-noi-grotesk flex justify-center px-auto mx-auto w-full whitespace-nowrap font-normal text-base leading-6 text-[#1F2127] text-center items-center min-h-[320px]">No data yet</div>}
    </div>
  );
};
