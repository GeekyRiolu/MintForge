import useCopyClipboard from 'hooks/useCopyClipboard';
import { isNullOrEmpty } from 'utils/format';
import { tw } from 'utils/tw';

export interface NftDetailCardProps {
  type: string;
  value: string;
  highlighted?: boolean;
  subtitle?: string;
  valueClasses?: string;
  center?: boolean;
  onClick?: () => void;
  copy?: boolean
}

export function NftDetailCard(props: NftDetailCardProps) {
  const [isCopied, staticCopy] = useCopyClipboard();

  return (
    <div
      className={tw(
        'NftDetailCard',
        'flex w-full',
        props?.highlighted ? 'bg-[#FFF4CA] border border-[#F9D54C]' : 'bg-white ',
        'px-3 py-4 shadow-xl rounded-[18px]',
        'overflow-hidden cursor-pointer',
        props.onClick &&
       'cursor-pointer transition hover:scale-[0.97] transition-spacing duration-100 ease-in-out'
      )}
      onClick={!props.onClick
        ? () => {
          staticCopy(props.value);
        }
        : () => props.onClick && props.onClick()}
    >

      <div className={tw(
        'flex flex-col p-2 w-full',
        props.center ? 'items-center' : null,
        'overflow-hidden'
      )}>
        <span className={tw(
          'font-noi-grotesk  text-[16px] capitalize font-medium mb-4 leading-5 tracking-[10%]',
          props?.highlighted ? 'text-[#E4BA18]' : 'text-[#6A6A6A]'
        )}>
          {props?.type?.toLowerCase()}
        </span>
        <span className={tw(
          'font-noi-grotesk text-black font-medium text-[16px] leading-5',
          'line-clamp-1 text-ellipsis capitalize',
          props.valueClasses
        )}>
          {isCopied ? 'Copied!' : props?.value?.toLowerCase()}
        </span>
        {!isNullOrEmpty(props.subtitle) && <span className='font-noi-grotesk font-normal text-xs leading-5 text-[#6F6F6F]'>{props.subtitle}</span>}
      </div>
    </div>
  );
}
