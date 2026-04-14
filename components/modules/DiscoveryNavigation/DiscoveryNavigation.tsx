import { SearchBar } from 'components/elements/SearchBar';
import { DiscoveryTabNav } from 'components/modules/DiscoveryTabNavigation/DiscoveryTabsNavigation';

import React from 'react';

export function DiscoveryNavigation() {
  return (
    <div className='p-2 minmd:px-4 minlg:px-8 minlg:mb-[-98px] mt-[100px]'>
      <div className='mb-10 mt-8'>
        <div className="text-xl mb-3 minmd:text-3xl minmd:mb-5	minlg:text-[54px] font-semibold text-[#000000] text-center minlg:leading-[63px] minlg:mb-10">
          Find your next collectible<br/> <span className="text-[#000000] textColorGradient">wherever it lives</span>
        </div>
        <div>
          <SearchBar leaderBoardSearch/>
        </div>
      </div>
      <div className='flex flex-row justify-between'>
        <DiscoveryTabNav/>
      </div>
    </div>
  );
}
