import { tw } from 'utils/tw';

import { ProfileContext } from './ProfileContext';

import Hidden from 'public/icons/Hidden.svg?svgr';
import Visible from 'public/icons/Visible.svg?svgr';
import { useContext } from 'react';

export interface GalleryToggleAllButtonsProps {
  onShowAll: () => void;
  onHideAll: () => void;
  publicNFTCount: number;
}

export function GalleryToggleAllButtons(props: GalleryToggleAllButtonsProps) {
  const { hideAllNFTsValue, showAllNFTsValue, publiclyVisibleNftCount, allOwnerNftCount } = useContext(ProfileContext);
  return <div className='flex text-black dark:text-white'>
    <div
      className={tw(
        'flex mr-4 items-center cursor-pointer',
        (publiclyVisibleNftCount == allOwnerNftCount && !hideAllNFTsValue) || showAllNFTsValue ? 'text-[#F9D54C]' : ''
      )}
      onClick={props.onShowAll}
    >
      <Visible className={tw(
        'w-7 h-6 text-black fill-black'
      )} />
      Show All
    </div>
    <div
      className={tw(
        'flex items-center cursor-pointer',
        hideAllNFTsValue ? 'text-[#F9D54C]' : ''
      )}
      onClick={props.onHideAll}
    >
      <Hidden className={tw(
        'w-7 h-6 text-black fill-black'
      )} />
      Hide All
    </div>
  </div>;
}
