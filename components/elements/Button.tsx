import { isNullOrEmpty } from 'utils/format';
import { tw } from 'utils/tw';

import { useCallback } from 'react';
import { MouseEvent } from 'react';
import ReactLoading from 'react-loading';
import { useThemeColors } from 'styles/theme/useThemeColors';

export enum ButtonType {
  PRIMARY = 'PRIMARY',
  SECONDARY = 'SECONDARY',
  TERTIARY = 'TERTIARY',
  WEB_PRIMARY = 'WEB_PRIMARY',
  WEB_SECONDARY = 'WEB_SECONDARY'
}

export enum ButtonSize {
  SMALL = 'SMALL',
  MEDIUM = 'MEDIUM',
  LARGE = 'LARGE',
  XLARGE = 'XLARGE',
}

export interface ButtonProps {
  /** Button type */
  type: ButtonType ;
  size?: ButtonSize;
  /** Button label (optional only if icon is passed) */
  label?: string;
  /** Button action */
  onClick: (e?: MouseEvent<HTMLButtonElement>) => void;
  stretch?: boolean;
  icon?: React.ReactElement;
  /** Scale the button on hover for larger screen sizes */
  scaleOnHover?: boolean;
  loading?: boolean;
  loadingText?: string;
  disabled?: boolean;
  extraClasses?: string;
}

/** Renders a yellow button with the input label as black text. */
export function Button(props: ButtonProps) {
  const {
    primaryButtonBackground,
    primaryButtonBackgroundHover,
    primaryButtonBackgroundFocus,
    primaryButtonText,
    secondaryButtonBackground,
    secondaryButtonBackgroundFocus,
    tertiaryButtonBackground,
  } = useThemeColors();

  const sizeClasses = useCallback(() => {
    if(ButtonType.WEB_SECONDARY === props.type || ButtonType.WEB_PRIMARY === props.type){
      return 'min-w-[201px] min-h-[64px] w-full minmd:w-auto p-5 rounded-full text-xl uppercase text-xl font-medium uppercase text-black drop-shadow-lg';
    }
    switch (props.size) {
    case ButtonSize.SMALL:
      switch (props.type) {
      case(ButtonType.PRIMARY):
      case(ButtonType.SECONDARY):
        return 'text-xs px-2 py-1 rounded';
      case(ButtonType.TERTIARY):
        return 'text-xs px-2 py-1 rounded-full border';
      default:
        return '';
      }

    case ButtonSize.MEDIUM:
      switch (props.type) {
      case(ButtonType.PRIMARY):
      case(ButtonType.SECONDARY):
        return 'text-sm px-4 py-1 rounded-lg';
      case(ButtonType.TERTIARY):
        return 'text-sm px-4 py-1 rounded-full border-[1.3px]';
      default:
        return '';
      }

    case ButtonSize.LARGE:
      switch (props.type) {
      case(ButtonType.PRIMARY):
      case(ButtonType.SECONDARY):
        return 'text-base	px-4 py-2 rounded-[10px]';
      case(ButtonType.TERTIARY):
        return 'text-base	px-4 py-2 rounded-full border-[1.5px]';
      default:
        return '';
      }

    case ButtonSize.XLARGE:
      switch (props.type) {
      case(ButtonType.PRIMARY):
      case(ButtonType.SECONDARY):
        return 'text-xl	px-6 py-3 rounded-xl';
      case(ButtonType.TERTIARY):
        return 'text-xl px-6 py-3 rounded-full border-[1.5px]';
      default:
        return '';
      }
    default:
      switch (props.type) {
      case(ButtonType.PRIMARY):
      case(ButtonType.SECONDARY):
        return 'text-xl	px-6 py-3 rounded-xl';
      case(ButtonType.TERTIARY):
        return 'text-xl px-6 py-3 rounded-full border-[1.5px]';
      default:
        return '';
      }
    }
  }, [props.size, props.type]);

  const sizeClassesIconOnly = useCallback(() => {
    if(ButtonType.WEB_SECONDARY === props.type || ButtonType.WEB_PRIMARY === props.type){
      return 'min-w-[201px] min-h-[64px] w-full minmd:w-auto p-5 rounded-full text-xl uppercase text-xl font-medium uppercase text-black drop-shadow-lg';
    }
    switch (props.size) {
    case ButtonSize.SMALL:
      return 'h-6 w-6 rounded-full';
    case ButtonSize.MEDIUM:
      return 'h-8 w-8 rounded-full';
    case ButtonSize.LARGE:
      return 'h-10 w-10 rounded-full';
    case ButtonSize.XLARGE:
      return 'h-14 w-14 rounded-full';
    default:
      return 'h-10 w-10 rounded-full';
    }
  }, [props.size, props.type]);

  const colorClasses = useCallback(() => {
    switch (props.type) {
    case ButtonType.PRIMARY:
    case ButtonType.WEB_PRIMARY:
      return `bg-[${primaryButtonBackground}] hover:bg-[${primaryButtonBackgroundHover}] focus:bg-[${primaryButtonBackgroundFocus}] text-[${primaryButtonText}]`;
    case ButtonType.SECONDARY:
    case ButtonType.WEB_SECONDARY:
      return `bg-[${secondaryButtonBackground}] hover:bg-button-secondary-hover focus:bg-[${secondaryButtonBackgroundFocus}] text-white`;
    case ButtonType.TERTIARY:
      return !isNullOrEmpty(props.label) ?
        `rounded-full bg-[${tertiaryButtonBackground}] border-black hover:border-button-tertiary-hover focus:border-button-tertiary-hover text-black hover:text-button-tertiary-hover focus:text-button-tertiary-hover`:
        `rounded-full bg-[${tertiaryButtonBackground}] border-black hover:border-button-tertiary-hover focus:border-button-tertiary-hover text-black hover:text-button-tertiary-hover focus:text-button-tertiary-hover border-[1.5px]`;
    }
  }, [primaryButtonBackground, primaryButtonBackgroundFocus, primaryButtonBackgroundHover, primaryButtonText, props.label, props.type, secondaryButtonBackground, secondaryButtonBackgroundFocus, tertiaryButtonBackground]);

  const getLoader = useCallback(() => {
    switch (props.size) {
    case ButtonSize.SMALL:
      switch(props.type) {
      case(ButtonType.PRIMARY):
      case(ButtonType.TERTIARY):
        return <ReactLoading type='spin' color='#707070' height={14} width={14} /> ;
      case(ButtonType.SECONDARY):
        return <ReactLoading type='spin' color={primaryButtonBackground} height={14} width={14} /> ;
      default:
        return '';
      }

    case ButtonSize.MEDIUM:
      switch(props.type) {
      case(ButtonType.PRIMARY):
      case(ButtonType.TERTIARY):
        return <ReactLoading type='spin' color='#707070' height={16} width={16} /> ;
      case(ButtonType.SECONDARY):
        return <ReactLoading type='spin' color={primaryButtonBackground} height={16} width={16} /> ;
      default:
        return '';
      }

    case ButtonSize.LARGE:
      switch(props.type) {
      case(ButtonType.PRIMARY):
      case(ButtonType.TERTIARY):
        return <ReactLoading type='spin' color='#707070' height={20} width={20} /> ;
      case(ButtonType.SECONDARY):
        return <ReactLoading type='spin' color={primaryButtonBackground} height={20} width={20} /> ;
      default:
        return '';
      }

    case ButtonSize.XLARGE:
      switch(props.type) {
      case(ButtonType.PRIMARY):
      case(ButtonType.TERTIARY):
        return <ReactLoading type='spin' color='#707070' height={24} width={24} /> ;
      case(ButtonType.SECONDARY):
        return <ReactLoading type='spin' color={primaryButtonBackground} height={24} width={24} /> ;
      default:
        return '';
      }
    }
  }, [primaryButtonBackground, props.size, props.type]);

  const disabledColorClasses = 'bg-button-bg-disabled text-button-text-disabled';

  return (
    <button
      className={tw(
        'buttonContainer',
        'flex items-center font-noi-grotesk font-medium',
        'justify-center',
        'no-underline select-none',
        !props?.loading && !props?.disabled && 'cursor-pointer',
        !props.disabled ? colorClasses() : disabledColorClasses,
        !isNullOrEmpty(props.label) ? sizeClasses() : sizeClassesIconOnly(),
        props?.stretch ? 'w-full grow' : !isNullOrEmpty(props.label) ? 'w-fit' : '',
        props?.disabled
          ? ''
          : props.scaleOnHover && 'minlg:transform minlg:hover:scale-105',
        props?.extraClasses && props.extraClasses
      )}
      onClick={(e) => {
        if (props?.disabled ?? false) {
          return;
        }
        props?.onClick(e);
      }}
    >
      {props?.loading ?
        <div className='flex w-full items-center justify-center'>
          {getLoader()}
          {props?.loadingText && <span className="flex ml-2 whitespace-normal">{props?.loadingText}</span>}
        </div> :
        <div className='flex justify-center items-center text-inherit'>
          {props?.icon &&
            <div className={tw('relative flex items-center',
              !isNullOrEmpty(props.label) ?
                props?.size === ButtonSize.SMALL ? 'h-[14px] w-[14px]' : 'h-[18px] w-[18px] mr-1' :
                props?.size === ButtonSize.SMALL
                  ? 'h-[14px] w-[14px] justify-center' :
                  props?.size === ButtonSize.MEDIUM
                    ? 'h-4 w-4 justify-center' :
                    props?.size === ButtonSize.LARGE
                      ? 'h-5 w-5 justify-center' :
                      props?.size === ButtonSize.XLARGE && 'h-7 w-7 justify-center',
            )}>
              {props.icon}
            </div>
          }
          {props?.label}
        </div>
      }
    </button>
  );
}
