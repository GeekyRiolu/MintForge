import { tw } from 'utils/tw';

import { PropsWithChildren, useState } from 'react';

export type ToolTipProps = {
  orientation: 'top'| 'left'| 'right' | 'bottom' | 'custom';
  tooltipComponent: React.ReactNode;
  hidden?: boolean;
  /** Click event enabled in tooltip component */
  tooltipClick?: () => void;
  /** When w-full needs top be applied to the tooltipComponent */
  useFullWidth?: boolean;
  /** Use a number as percentage for left position, orientation prop must have 'custom' value */
  customLeftPosition?: string;
  /** Use a entire tailwind class of your preference for left position, orientation prop must have 'custom' value */
  customFullLeftPosition?: string;
};

function Tooltip(props : PropsWithChildren<ToolTipProps>) {
  const [opacity, setOpacity] = useState(0);

  function handleMouseEnter() {
    if(!props.hidden){
      setOpacity(1);
    }
  }

  function handleMouseLeave() {
    if (props.tooltipClick) {
      setTimeout(() => setOpacity(0), 3000);
    } else {
      setOpacity(0);
    }
  }

  const orientations = {
    right: 'right',
    top: 'top',
    left: 'left',
    bottom: 'bottom',
    custom: 'custom',
  };

  const setContainerPosition = (orientation, customLeftPosition, customFullLeftPosition) => {
    let classnames;

    switch (orientation) {
    case orientations.right:
      classnames = 'top-[50%] translate-y-[-50%] left-full ml-4';
      break;
    case orientations.left:
      classnames = 'top-[50%] translate-y-[-50%] right-full mr-4';
      break;
    case orientations.top:
      classnames = 'bottom-full left-[50%] translate-x-[-50%] -translate-y-2';
      break;
    case orientations.bottom:
      classnames = 'top-full left-[50%] translate-x-[-50%] translate-y-2';
      break;
    case orientations.custom:
      classnames = `bottom-full ${customFullLeftPosition ?? `left-[${customLeftPosition}%]`} translate-x-[-50%] -translate-y-2`;
      break;

    default:
      break;
    }

    return classnames;
  };

  const setPointerPosition = (orientation) => {
    let classnames;

    switch (orientation) {
    case orientations.right:
      classnames = 'left-[-6px]';
      break;
    case orientations.left:
      classnames = 'right-[-6px]';
      break;
    case orientations.top:
      classnames = 'top-full left-[50%] translate-x-[-50%] -translate-y-2';
      break;
    case orientations.bottom:
      classnames = 'bottom-full left-[50%] translate-x-[-50%] translate-y-2';
      break;
    case orientations.custom:
      classnames = 'top-full left-[50%] translate-x-[-50%] -translate-y-2';
      break;

    default:
      break;
    }

    return classnames;
  };

  const classContainer = `w-max absolute z-10 ${setContainerPosition(
    props.orientation,
    props.customLeftPosition,
    props.customFullLeftPosition,
  )} bg-black text-white text-sm p-2 rounded-xl flex items-center transition-all duration-150 ${props.tooltipClick ? 'cursor-pointer' : 'pointer-events-none'}`;

  const pointerClasses = `bg-black h-3 w-3 absolute z-10 ${setPointerPosition(
    props.orientation,
  )} rotate-45 ${props.tooltipClick ? 'cursor-pointer' : 'pointer-events-none'}`;

  return (
    <div
      className={tw(
        `relative flex items-center z-50 h-full ${props.tooltipClick ? 'cursor-pointer' : ''}`,
        props.useFullWidth ? 'w-full' : 'w-max'
      )}
      onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}
    >
      {props.tooltipComponent
        ? <div
          onClick={() => props.tooltipClick()}
          className={classContainer} style={{ opacity: opacity }}>
          <div className={pointerClasses} />
          {props.tooltipComponent}
        </div>
        : null}
      {props.children}
    </div>
  );
}

export default Tooltip;
