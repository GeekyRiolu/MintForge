import 'rc-slider/assets/index.css';

import { convertValue } from 'utils/format';

import Slider from 'rc-slider';
import React, { useEffect, useState } from 'react';

interface SliderFilterProps {
  click: (value: number | number[]) => void,
  min: number,
  max: number
  step: number
  defaultValues: Array<number>
}
export const SliderFilter = (props: SliderFilterProps) => {
  const [sliderValue, setValue] = useState([]);
  const checkSalesValue = (value) => {
    if(!value) {
      return 'Ξ0';
    }
    if(value == 0 || value == '0'){
      return 'Ξ0';
    }
    const stringValue = value.toString().split('');
    const valueLength = stringValue.length;
    if(value >= 1e9){
      return 'Ξ> 1B';
    }
    if(valueLength == 1 && value === 0) {
      return `Ξ${value}`;
    }
    if(valueLength >= 5 && valueLength < 6) {
      const string = convertValue(value,2,5);
      return `Ξ${string.start}`;
    }
    if(valueLength >= 6) {
      if(valueLength >= 6 && valueLength < 7){
        const string = convertValue(value,3,5);
        return `Ξ${string.start}k`;
      }
      if(valueLength >= 7 && valueLength < 8){
        const string = convertValue(value,1,3);
        return `Ξ${string.start}M`;
      }

      if(valueLength >= 8 && valueLength < 9){
        const string = convertValue(value,2,4);
        return `Ξ${string.start}M`;
      }
      if(valueLength >= 9 && valueLength <= 10){
        const string = convertValue(value,3,5);
        return `Ξ${string.start}M`;
      }
    }
    return `Ξ${value}`;
  };
  const rightHandle = document.getElementsByClassName('rc-slider-handle-2')[0];
  const leftHandle = document.getElementsByClassName('rc-slider-handle-1')[0];

  const rightTooltip = document.createElement('div');
  const leftTooltip = document.createElement('div');
  const checkWidth = () => {
    if(props?.defaultValues && props?.defaultValues[0] === 0 || props.min === 0 || sliderValue[0] === 0){
      return 'min-w-[12px]';
    }else {
      return 'min-w-[30px]';
    }
  };
  leftTooltip.innerHTML = checkSalesValue(props.defaultValues ? props.defaultValues[0].toString() : props.min.toString());
  rightTooltip.innerHTML = checkSalesValue(props.defaultValues ? props.defaultValues[1].toString() : props.max.toString());
  leftTooltip.classList.add('z-2','text-sm', 'px-[10px]','rounded-[16px]', 'shadow-md', 'overflow-hidden', 'bg-white', 'opacity-100', 'tooltip-left', 'whitespace-nowrap', 'flex', 'fixed', 'bottom-[-25px]', 'left-[50%]', 'translate-x-[-50%]', 'text-black', `${checkWidth()}`,'text-center');
  rightTooltip.classList.add('z-2','text-sm', 'px-[10px]','rounded-[16px]', 'shadow-md', 'overflow-hidden', 'bg-white', 'opacity-100', 'tooltip-right', 'whitespace-nowrap', 'flex', 'fixed', 'bottom-[-25px]', 'left-[50%]', 'translate-x-[-50%]', 'text-black', `${checkWidth()}`,'text-center');

  const setZIndex = () => {
    const dragHandle = document.getElementsByClassName('rc-slider-handle-dragging')[0];
    if(dragHandle){
      dragHandle.classList.add('!z-10');
    }
  };
  useEffect(() => {
    rightHandle?.appendChild(rightTooltip);
    leftHandle?.appendChild(leftTooltip);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rightHandle, leftHandle]);
  useEffect(() => {
    setZIndex();
    const left = document.getElementsByClassName('tooltip-left')[0];
    const right = document.getElementsByClassName('tooltip-right')[0];
    if(!right && !left) return;
    right.innerHTML = checkSalesValue(sliderValue[1]);
    left.innerHTML = checkSalesValue(sliderValue[0]);
  }, [sliderValue]);
  return (
    <div className='flex flex-col'>
      <Slider
        range
        step={props.step}
        min={props.min}
        max={props.max}
        onFocus={() => setZIndex()}
        defaultValue={props.defaultValues ? props.defaultValues : [props.min, props.max]}
        trackStyle={[{ backgroundColor: '#F9D54C' }]}
        handleStyle={[{ backgroundColor: 'black', border: 'none', width: '18px', height: '18px' }, { backgroundColor: 'black', border: 'none', width: '18px', height: '18px' }]}
        onChange={(value) => setValue([value[0], value[1]])}
        onAfterChange={(value) => props.click(value)} />
      <div className='flex flex-row justify-between items-center relative mt-4 color-[#6A6A6A] text-xs noi-grotesk z-[-1]'>
        <div className='myTest absolute left-[-3px] top-[-12px]'>0</div>
        <div className='absolute right-[-10px] top-[-12px]'>{'>1B'}</div>
        {/*top-[-31px]*/}
      </div>
    </div>
  );
};
