import { useOutsideClickAlerter } from 'hooks/useOutsideClickAlerter';
import { isNullOrEmpty } from 'utils/format';
import { tw } from 'utils/tw';

import { Modal } from './Modal';

import { XIcon } from '@heroicons/react/solid';
import { CaretUp } from 'phosphor-react';
import { PropsWithChildren, useCallback, useRef, useState } from 'react';
import { isMobile } from 'react-device-detect';

export interface PickerOption {
  label?: string;
  onSelect: () => void;
  color?: string;
  icon?: string | any;
  closeModalOnClick?: boolean
}

export interface DropdownPickerModalProps {
  options: Array<PickerOption>;
  selectedIndex: number;
  constrain?: boolean;
  placeholder?: string;
  pointer?: boolean;
  stopMobileModal?: boolean; //stops modal popup on mobile
  disableMinWidth?: boolean;
  disablePadding?: boolean;
  blackBorder?: boolean;
  align?: 'right' | 'left' | 'center'
  closeModalOnClick?: boolean
}

/**
 * Drop-down picker component. Provided the options and selected option,
 * this will render the selected option with a v or ^ symbol.
 *
 * When clicked, the rest of the options will appear above or below the component,
 * using absolute positioning (so expect them to overflow and cover the surrounding UI).
 *
 * Configuration:
 * - constrain: add this to use a self-constrained width and height, with no guarantees about
 *              the resulting size or layout. by default, this component fills the width and
 *              and height of its container.
 */
export function DropdownPickerModal(props: PropsWithChildren<DropdownPickerModalProps>) {
  const [optionHoverIndex, setOptionHoverIndex] = useState(null);
  const [expanded, setExpanded] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);

  const mobile = props.stopMobileModal ? false : isMobile;

  useOutsideClickAlerter(wrapperRef, () => {
    !mobile && setExpanded(false);
  });

  const getOptionRow = useCallback((item: PickerOption, index: number) => {
    return (item &&
      <div
        key={item.label || index}
        style={{ height: '10%' }}
        className={`flex flex-row w-full px-3 py-3 items-center
          ${index === optionHoverIndex ? ' text-primary-txt font-medium hover:bg-[#FFF4CA]' : 'text-secondary-txt' }
          ${isNullOrEmpty(item.label) && 'justify-evenly'}
          ${index == 0 && 'rounded-t-xl'}
          ${index == props.options.length-1 && 'rounded-b-xl'}
        `}
        onMouseLeave={() => setOptionHoverIndex(null)}
        onMouseEnter={() => setOptionHoverIndex(index)}
        onClick={() => {
          item.onSelect();
          (props.closeModalOnClick || item?.closeModalOnClick) && setExpanded(false);
        }}
      >
        {item.icon}&nbsp;
        {item.label}
      </div>
    );
  }, [optionHoverIndex, props.closeModalOnClick, props.options.length]);

  return (
    <>
      <div
        ref={wrapperRef}
        className={tw(
          'relative font-noi-grotesk',
          'cursor-pointer flex flex-col items-end rounded-xl',
          'text-base',
          props.constrain ? '' : 'w-full h-full shrink-0',
          'dark:text-always-white text-primary-txt',
          'whitespace-nowrap justify-between',
        )}
      >
        <div
          ref={anchorRef}
          className={tw(
            'flex flex-row items-end',
            !props.disablePadding && 'px-2.5 py-2',
            'bg-transparent dark:bg-secondary-dk',
            'h-full',
            'justify-between rounded-xl w-full',
          )}
          key={`${props.options[props.selectedIndex].label}-${props.selectedIndex}`}
          onClick={() => {
            setExpanded(!expanded);
          }}
        >
          {props.children}
        </div>

        {expanded && !mobile &&
        <div
          style={{
            marginTop: anchorRef.current.clientHeight + 8,
          }}
          className={tw(
            'rounded-xl',
            'bg-white dark:bg-secondary-dk',
            'absolute z-50 drop-shadow-md',
            props.disableMinWidth || !props.options[0]?.label ? 'min-w-max' :'min-w-[14rem]',
            props.align === 'center' && 'left-1/2 -translate-x-1/2',
            props.align === 'right' && 'right-0',
            props.align === 'left' && 'left-0'
          )}
        >
          {props.pointer &&
            <CaretUp
              size={32}
              color="white"
              weight="fill"
              className={tw(
                'absolute -top-[18px] h-7',
                props.align === 'center' && ' left-1/2 -translate-x-1/2',
                props.align === 'right' && (props.options[0]?.label ? 'right-8' : 'right-2.5'),
                props.align === 'left' && (props.options[0]?.label ? 'left-8' : 'left-2.5'),
              )}
            />
          }
          {props.options?.map((item, index) => {
            return getOptionRow(item, index);
          })}
        </div>
        }
      </div>
      <Modal
        fullModal
        visible={expanded && mobile}
        loading={false}
        title={'Display Settings'}
        onClose={() => {
          setExpanded(false);
        }}
        bgColor={'bg-pagebg dark:bg-secondary-bg-dk'}
        hideX
      >
        <XIcon
          onClick={() => {
            setExpanded(false);
          }}
          className='absolute top-14 right-3 hover:cursor-pointer w-7 h-7'
          color="black"
        />
        {props.options?.map((item, index) => {
          return getOptionRow(item, index);
        })}
      </Modal>
    </>
  );
}
