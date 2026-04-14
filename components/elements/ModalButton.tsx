import Loader from 'components/elements/Loader/Loader';
import { joinClasses } from 'utils/format';

export interface ModalButtonProps {
  text: string;
  onClick: () => void;
  loading: boolean;
  bgColor?: string;
  textColor?: string;
  outline?: string;
}

export function ModalButton(props: ModalButtonProps) {
  return (
    <div className="flex items-center justify-center">
      <div
        style={{
          backgroundColor: props.loading ? '#6B7280' : props?.bgColor ?? '#05C0FC',
          color: props?.textColor ?? '#FFFFFF',
          outline: props?.outline ?? 'none',
        }}
        onClick={props.onClick}
        className={joinClasses(
          'cursor-pointer font-bold flex items-center',
          'justify-center w-full rounded-xl h-10 text-lg px-4'
        )}
      >
        {props.loading ? <Loader /> : props.text}
      </div>
    </div>
  );
}
