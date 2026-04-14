import { Button, ButtonSize, ButtonType } from 'components/elements/Button';
import { useSearchModal } from 'hooks/state/useSearchModal';
import { tw } from 'utils/tw';

import ArrowDown from 'public/icons/arrow-down-black.svg?svgr';
import React, { useEffect, useRef,useState } from 'react';

interface FilterInputOptionProps {
  fieldName?: string,
  currency?: string,
  isOpen?: boolean,
  max?: string | number,
  min?: string | number,
  setMinMaxValues: (value: Array<number | string>) => void,
  toggleSelect?: (value: boolean) => void,
  changeCurrency?: (value: string) => void,
}
function useOutsideCLick(ref, props) {
  useEffect(() => {
    if(!props.isOpen) return;
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        props.toggleSelect(props.isOpen);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, props.isOpen, props]);
}

export const MinMaxFilter = (props: FilterInputOptionProps) => {
  const { isDiscoverCollections } = useSearchModal();
  const wrapperRef = useRef(null);
  const { min, max } = props;
  const [minVal, setValueMin] = useState(min);
  const [maxVal, setValueMax] = useState(max);
  const [isError, setError] = useState(false);
  useOutsideCLick(wrapperRef, props);
  useEffect(() => {
    if(!maxVal){
      setError(false);
    }
    if(Number(maxVal) && Number(maxVal) > 0){
      if(Number(minVal) > Number(maxVal)){
        setError(true);
      }else {
        setError(false);
      }
    }
  }, [minVal, maxVal]);

  return (
    <div ref={wrapperRef}>
      <div className="flex justify-between items-center mb-2.5 mt-4">
        <div className="w-[50%]">
          <input lang="en_EN"
            value={minVal}
            onChange={(val) => setValueMin(val.target.value)}
            placeholder='Min'
            className={tw(
              'h-[46px] focus:outline-none focus:ring-0 w-full border-none bg-[#F2F2F2] outline-none rounded-[8px]',
              isError ? 'bg-[#ff5d5d]' : ''
            )}
            type="number"/>
          {/*${isError ? 'bg-red' : ''*/}
        </div>
        <div className="px-2">to</div>
        <div className="w-[50%]">
          <input lang="en_EN" value={maxVal} onChange={(val) => setValueMax(val.target.value)} placeholder='Max' className="h-[46px] focus:outline-none focus:ring-0 w-full border-none bg-[#F2F2F2] outline-none rounded-[8px]" type="number"/>
        </div>
      </div>
      <div className='mb-2.5 relative'>
        <div onClick={() => props.toggleSelect(props.isOpen)} className={`${props.isOpen ? 'rounded-b-[0]' : ''} text-black w-full border-none bg-[#F2F2F2] h-[46px] flex items-center justify-between pl-2 pr-4 rounded-[8px]`}>
          {props.currency ? props.currency : 'ETH'}
          {!isDiscoverCollections ? <ArrowDown/> : null}
        </div>
        <ul className={`${props.isOpen ? 'h-[96px]' : 'h-0'} bg-[#F2F2F2] transition-all relative w-full p-0 h-0 overflow-hidden rounded-b-[8px]`}>
          <li onClick={() => {
            props.changeCurrency('ETH');
            props.toggleSelect(props.isOpen);
          }} className='cursor-pointer hover:bg-[#F9D54C] flex items-center text-black h-[46px] px-2 list-none m-0'>ETH</li>
          <li onClick={() => {
            props.changeCurrency('WETH');
            props.toggleSelect(props.isOpen);
          }} className='cursor-pointer hover:bg-[#F9D54C] flex items-center text-black h-[46px] px-2 list-none m-0'>WETH</li>
        </ul>
      </div>
      <Button
        disabled={isError}
        size={ButtonSize.LARGE}
        stretch
        label={'Apply'}
        type={ButtonType.PRIMARY}
        onClick={() => {
          props.setMinMaxValues([minVal,maxVal]);
        }}/>
    </div>
  );
};
