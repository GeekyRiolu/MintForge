import { tw } from 'utils/tw';

import Image from 'next/image';
import { CheckCircle, X } from 'phosphor-react';
import Error from 'public/icons/error.svg?svgr';
import Warning from 'public/icons/warning.svg?svgr';
import { useEffect } from 'react';

export enum AlertType {
  SUCCESS = 'SUCCESS',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  INFO = 'INFO'
}
export enum AlertPosition {
  FIXED = 'FIXED',
  RELATIVE = 'RELATIVE',
}
type AlertProps = {
  type: AlertType;
  heading: string;
  position?: AlertPosition;
  description: string;
  onClick?: () => void;
  onClose?: () => void
  hideX?: boolean;
  autoClose?: boolean;
  autoCloseTime?: number;
}

const getAlertStyles = (type: AlertType) => {
  switch (type) {
  case AlertType.ERROR: {
    return 'border-alert-red bg-alert-red-bg-light';
  }
  case AlertType.SUCCESS: {
    return 'border-alert-green bg-alert-green-bg-light';
  }
  case AlertType.WARNING: {
    return 'border-alert-yellow bg-alert-yellow-bg-light';
  }
  case AlertType.INFO: {
    return 'border-alert-grey bg-alert-grey-bg';
  }
  default: {
    return '';
  }
  }
};
const getAlertPosition = (type: AlertPosition) => {
  switch (type) {
  case AlertPosition.FIXED: {
    return 'fixed left-[32px] bottom-[32px] w-auto z-50';
  }
  case AlertPosition.RELATIVE: {
    return 'relative';
  }
  default: {
    return 'w-full';
  }
  }
};
const getAlertIcon = (type: AlertType) => {
  switch (type) {
  case AlertType.ERROR: {
    return <Image src={Error} color="#6A6A6A" className='relative shrink-0 w-7 ' alt={'Error'} />;
  }
  case AlertType.SUCCESS: {
    return <CheckCircle size={32} color="#36aa73" weight="fill" className='relative shrink-0 h-7 w-7' />;
  }
  case AlertType.WARNING: {
    return <Image src={Warning} color="#e4b200" className='relative shrink-0 w-7 ' alt={'Warning'} />;
  }
  case AlertType.INFO: {
    return <CheckCircle size={32} color="#6A6A6A" weight="fill" className='relative shrink-0 h-7 w-7' />;
  }
  default: {
    return '';
  }
  }
};

export default function Alert({ type, heading, description, onClick, onClose, hideX, position, autoClose, autoCloseTime }: AlertProps) {
  useEffect(() => {
    if(!autoClose) return;
    setTimeout(() => {
      onClose();
    }, autoCloseTime ? autoCloseTime : 3000);
  }, [autoClose, autoCloseTime, onClose]);
  return (
    <div
      onClick={(e) => {
        e.preventDefault();
        onClick && onClick();
      }}
      className={tw(
        'flex p-4 border-2 rounded font-noi-grotesk hover:cursor-pointer',
        getAlertStyles(type),
        getAlertPosition(position)
      )}
    >
      <div className='flex w-full items-start'>
        {getAlertIcon(type)}
        <div className='flex flex-col ml-3'>
          <p
            className={tw(
              'font-medium mb-1',
              type === AlertType.ERROR && 'text-alert-red',
              type === AlertType.SUCCESS && 'text-alert-green',
              type === AlertType.WARNING && 'text-alert-yellow',
              type === AlertType.INFO && 'text-alert-grey'
            )}
          >
            {heading}
          </p>
          <p className='text-[#6A6A6A]'>
            {description}
          </p>
        </div>
      </div>
      {!hideX &&
        <X
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onClose && onClose();
          }}
          className='relative shrink-0 h-5 w-5 hover:cursor-pointer ml-4'
          weight='bold'
          color="#6A6A6A" />
      }
    </div>
  );
}
