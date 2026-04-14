import { TickerStat } from 'types';

import React, { useState } from 'react';
import Marquee from 'react-fast-marquee';
import PageVisibility from 'react-page-visibility';

type HomePageTickerProps = {
  tickerStats: TickerStat[];
}

export default function HomePageTicker(props: HomePageTickerProps) {
  const [pageIsVisible, setPageIsVisible] = useState(true);

  const handleVisibilityChange = (isVisible) => {
    setPageIsVisible(isVisible);
  };

  return (
    <PageVisibility onChange={handleVisibilityChange}>
      <Marquee gradient={false} play={pageIsVisible} speed={7} loop={0}>
        {props.tickerStats.map(({ stat }) => (
          <>
            <div className='flex items-center justify-start py-5 flex-col homeTicker'>
              <div className='text-always-white text-section leading-2 tracking-wider font-header px-9 min-w-[235px] max-w-[235px] ...'>
                {stat.value}
              </div>
              <div className='text-[#B6B6B6] text-body leading-2 tracking-wider whitespace-normal font-header px-9 min-w-[235px] max-w-[235px] ...'>
                {stat.sub}
              </div>
            </div>
          </>
        ))}
      </Marquee>
    </PageVisibility>
  );
}
