import { tw } from 'utils/tw';

export interface PropertyCardProps {
  type: string,
  value: string,
  variant?: 'gallery' | 'default';
  icon?: React.ReactElement;
  valueClasses?: string;
}

export function PropertyCard(props: PropertyCardProps) {
  return (
    <div className={tw(
      'flex w-full h-full',
      'bg-white dark:bg-modal-overlay-dk rounded-lg border',
      props.variant === 'gallery' ? 'border-accent-border-dk' : 'border-toggle-bg',
      'overflow-hidden'
    )}>
      {props.icon && <div className='flex items-center ml-3 mr-2 w-1/4'>
        {props.icon}
      </div>}
      <div className={tw(
        'flex flex-col p-2 justify-center font-rubik',
        props.variant === 'gallery' ? 'text-left w-full' : 'items-center'
      )}>
        <span className="text-xs text-gray-500">{props.type}</span>
        <span className={tw('text-sm dark:text-white', props.valueClasses)}>{props.value}</span>
      </div>
    </div>
  );
}