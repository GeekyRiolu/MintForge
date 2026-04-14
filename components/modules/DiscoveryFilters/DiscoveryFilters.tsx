
// export interface FiltersProps {}
// props: FiltersProps
import { useState } from 'react';

export function DiscoveryFilters() {
  const [isOpen, toggleView] = useState(false);

  return (
    <div className="w-[258px] flex flex-col">
      <div>
        <div onClick={() => toggleView(!isOpen)} className='bg-[#00ffe3] pb-8 text-[18px] leading-[22px] text-[#000000] font-[600] cursor-pointer'>
          Type
        </div>
        <div className={`${isOpen ? 'h-[auto] overflow-visible' : 'h-0 overflow-hidden'} transition-all `}>
          content content content content content content content content content content content content content content content content content content
        </div>
      </div>
    </div>
  );
}
