import useCopyClipboard from 'hooks/useCopyClipboard';
import { joinClasses } from 'utils/format';

import CopySvg from 'public/icons/copy.svg?svgr';
import React from 'react';
import { CheckCircle } from 'react-feather';
import { useThemeColors } from 'styles/theme/useThemeColors';

type TransactionStatusTextProps = {
  children?: React.ReactNode;
  color?: boolean;
};

const TransactionStatusText = ({
  children,
  color
}: TransactionStatusTextProps) => {
  return (
    <span
      className={`${ color ? 'text-always-white' : 'text-[#6A6A6A] dark:text-primary-txt-dk' }
        ml-1 flex font-[18px] flex-row flex-nowrap items-center`}>
      {children}
    </span>);
};

export default function CopyHelper(props: {
  after?: boolean;
  keepContent?: boolean;
  white?: boolean;
  toCopy: string;
  children?: React.ReactNode;
  lightModeForced?: boolean;
  size?: string;
}) {
  const [isCopied, setCopied] = useCopyClipboard();
  const { primaryIcon, alwaysWhite } = useThemeColors();
  const size = parseInt(props.size) ?? 16;
  return (
    <>
      <button
        onClick={() => setCopied(props.toCopy)}
        className={joinClasses(
          'bg-none cursor-pointer font-noi-grotesk',
          'border-0 shrink-0 flex items-center',
          'no-underline font-[18px]',
          props.lightModeForced ? ' text-[#6F6F6F]': 'dark:text-primary-txt-dk font-[18px]',
          'active:hover:no-underline',
          props.lightModeForced ? 'active:hover:text-primary-txt' : 'active:hover:text-primary-txt active:hover:dark:text-primary-txt-dk',
          'focus:no-underline focus:outline-0',
          props.lightModeForced ? 'focus:text-[#6A6A6A]': 'focus:text-[#6A6A6A] focus:dark:text-primary-txt-dk',
        )}>
        {props.after === true && (props.keepContent !== true && isCopied ? '' : props.children)}
        {isCopied
          ? (
            <TransactionStatusText>
              <CheckCircle size={props.size ?? '16'} color={props.white ? alwaysWhite : primaryIcon} />
              <TransactionStatusText color={props.white}>
              Copied
              </TransactionStatusText>
            </TransactionStatusText>
          )
          : (
            <TransactionStatusText>
              <CopySvg alt='copy' className={`ml-1 h-[${size}px] w-[${size}px]`} />
            </TransactionStatusText>
          )}
        {props.after !== true && (props.keepContent !== true && isCopied ? '' : props.children)}
      </button>
    </>
  );
}
