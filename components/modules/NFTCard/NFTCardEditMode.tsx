import { tw } from 'utils/tw';

import Hidden from 'public/icons/Hidden.svg?svgr';
import Reorder from 'public/icons/Reorder.svg?svgr';
import Visible from 'public/icons/Visible.svg?svgr';
import { MouseEvent } from 'react';

export interface NFTCardEditModeProps {
  visible?: boolean | null;
  onVisibleToggle?: (visible: boolean) => void;
  preventDefault?: boolean;
}

export function NFTCardEditMode(props: NFTCardEditModeProps) {
  return (
    <>
      {props.visible != null &&
      <div
        className='absolute left-3 top-4 z-30'
        onClick={(e: MouseEvent<HTMLDivElement>) => {
          props.onVisibleToggle(!props.visible);
          e.stopPropagation();
          props.preventDefault && e.preventDefault();
        }}
      >
        {props.visible
          ? <Visible className={tw(
            'w-7 h-6 fill-white'
          )} />
          : <Hidden className={tw(
            'w-7 h-6 fill-white'
          )} />
        }
      </div>
      }

      {props.visible === true &&
        <div
          className='absolute right-3 top-4 z-30'
        >
          <Reorder
            className={tw(
              'w-6 h-6'
            )}
          />
        </div>
      }
    </>
  );
}
