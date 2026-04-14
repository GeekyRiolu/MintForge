import { useOutsideClickAlerter } from 'hooks/useOutsideClickAlerter';
import { tw } from 'utils/tw';

import Image from 'next/image';
import KeyIcon from 'public/icons/mint-key.svg?svgr';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, ChevronUp } from 'react-feather';
import { useThemeColors } from 'styles/theme/useThemeColors';

export interface PickerOption {
  label: string;
  onSelect: () => void;
  color?: string;
  icon?: string;
  imageSize?: number;
  customIconClass?: string;
  disabled?: boolean
}

export interface DropdownPickerProps {
  options: Array<PickerOption>;
  selectedIndex?: number;
  constrain?: boolean;
  above?: boolean;
  placeholder?: string;
  onChange?: (label: string) => void;
  showKeyIcon?: boolean;
  v2?: boolean;
  centeredText?: boolean;
}

/**
 * Drop-down picker component. Provided the options and selected option,
 * this will render the selected option with a v or ^ symbol.
 *
 * When clicked, the rest of the options will appear above or below the component,
 * using absolute positioning (so expect them to overflow and cover the surrounding UI).
 *
 * Configuration:
 * - above:     add this if you want the options to appear above the component
 * - constrain: add this to use a self-constrained width and height, with no guarantees about
 *              the resulting size or layout. by default, this component fills the width and
 *              and height of its container.
 */
export function DropdownPicker(props: DropdownPickerProps) {
  const [optionHoverIndex, setOptionHoverIndex] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [selected, setSelected] = useState(props.options[props.selectedIndex]);
  const { primaryIcon, secondaryText } =
    useThemeColors();
  const [selectedIndex, setSelectedIndex] = useState(props.selectedIndex);
  const wrapperRef = useRef(null);
  const activeRowRef = useRef(null);
  useOutsideClickAlerter(wrapperRef, () => {
    setExpanded(false);
  });

  const onChangeHandler = useCallback(
    () => props.onChange ? props.onChange(selected?.label || props.options[selectedIndex]?.label) : null
    ,
    [selected, props, selectedIndex],
  );

  useEffect(() => {
    setSelectedIndex(props.options.findIndex((i) => i.label === selected?.label) >= 0 ? props.options.findIndex((i) => i.label === selected?.label) : selectedIndex);
    onChangeHandler();
  }, [selected, props, onChangeHandler, selectedIndex]);

  const getOptionRow = useCallback((item: PickerOption, index: number) => {
    return (
      item && <div
        key={item.label}
        style={{ height: activeRowRef.current.clientHeight }}
        className={`flex flex-row w-full pl-2.5 py-3 items-center
        ${props.centeredText && 'justify-center'}
        ${ index === optionHoverIndex ? 'text-primary-txt hover:bg-[#FFF4CA] font-medium' : 'text-secondary-txt'}`}
        onMouseLeave={() => setOptionHoverIndex(null)}
        onMouseEnter={() => setOptionHoverIndex(index)}
        onClick={() => {
          item.onSelect && item.onSelect();
          setSelected(item);
        }}
      >
        {item.icon && <Image
          width={20}
          height={20}
          className='object-contain relative mr-1'
          src={item.icon}
          alt={item.label} />}
        {item.label}
      </div>
    );
  }, [optionHoverIndex, props.centeredText]);

  const expandedIcon = useMemo(() => props.above ?
    <ChevronDown size={24} color={primaryIcon} /> :
    <ChevronUp size={24} color={primaryIcon} />, [primaryIcon, props.above]);

  const collapsedIcon = useMemo(() => props.above ?
    <ChevronUp size={24} color={primaryIcon} /> :
    <ChevronDown size={24} color={primaryIcon} />, [primaryIcon, props.above]);

  return (
    <div
      ref={wrapperRef}
      className={tw(
        props.v2 ? 'rounded-md' : 'rounded-xl',
        'cursor-pointer flex flex-col items-center',
        'text-sm',
        props.constrain ? '' : 'w-full h-full shrink-0',
        'text-primary-txt',
        'whitespace-nowrap justify-between'
      )}
      onClick={() => {
        setExpanded(!expanded);
      }}
    >
      <div
        ref={activeRowRef}
        className={tw('flex flex-row items-center px-2.5',
          'py-2 h-full',
          'bg-white',
          props.v2 ? 'rounded-md border-2 border-gray-300' : 'rounded-xl shadow-lg border-0 ',
          'justify-between w-full')}
        key={props?.options[selectedIndex]?.label}
      >
        {props.showKeyIcon &&
        <div className='w-6'>
          <KeyIcon className='inline mr-1' stroke="black" />
        </div>
        }
        <div className='flex items-center w-full'>
          {props?.options[selectedIndex]?.icon &&
            <div className={`mr-1 relative w-[${props?.options[selectedIndex]?.imageSize || 26}px] h-[${props?.options[selectedIndex]?.imageSize || 26}px] flex items-center justify-center ${props?.options[selectedIndex]?.customIconClass || ''}`}>
              <Image
                fill
                style={{ objectFit: 'contain' }}
                src={props?.options[selectedIndex]?.icon}
                alt={props?.options[selectedIndex]?.label} />
            </div>
          }
          <div className='mr-2'>
            {(props.placeholder && !selected) ?
              <span style={{ color: secondaryText }}>{props.placeholder}</span>
              : props.options[selectedIndex]?.label
            }
          </div>
        </div>
        {expanded
          ? (
            expandedIcon
          )
          : (
            collapsedIcon
          )}
      </div>

      {expanded &&
        <div
          style={{
            maxWidth: wrapperRef.current.clientWidth,
            marginTop: props.above ?
              (props.options?.length - 1) * -1 * activeRowRef.current.clientHeight - 12 :
              activeRowRef.current.clientHeight + 12
          }}
          className={tw(
            props.v2 ? 'rounded-md' : 'rounded-xl',
            'border border-select-brdr',
            'divide-y',
            'bg-white',
            'w-full absolute z-[51]',
            'shadow-lg',
            'max-h-[200px] overflow-auto'
          )}
        >

          {props.options?.map((item, index) => {
            return getOptionRow(item, index);
          })}
        </div>
      }
    </div>
  );
}
