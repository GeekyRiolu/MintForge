import { tw } from 'utils/tw';

import Heart from 'public/icons/heart.svg?svgr';

export function NFTCardSkeleton() {
  return (
    <div className='relative w-full h-full animate-pulse'>
      <div className={tw(
        'group/ntfCardSkeleton transition-all cursor-pointer rounded-2xl shadow-xl relative w-full h-full minmd:mb-0 overflow-visible',
      )}>
        <div className={tw(
          'relative object-cover w-full h-max flex flex-col mb-10'
        )}>
          <div className='w-full rounded-t-2xl aspect-square bg-[#E6E6E6] relative'>
            <div className={tw(
              'absolute top-4 right-4',
              'bg-footer-bg',
              ' w-max h-10 rounded-[10px]  px-3'
            )}
            >
              <div className='h-full flex flex-row items-center justify-center space-x-2'>

                <div className='w-[18px] h-5 flex'>
                  <Heart
                    fill={'#B2B2B2'}
                  />
                </div>
                <div className='h-2 bg-[#B2B2B266] w-4 rounded-full'></div>

              </div>
            </div>
          </div>
          <div className='w-full px-5'>
            <div className='bg-[#F2F3F5] h-3 w-full rounded-full mt-6'></div>
            <div className='bg-[#F2F3F5] h-3 w-1/3 rounded-full mt-5'></div>
          </div>
        </div>
      </div>
    </div>
  );
}
