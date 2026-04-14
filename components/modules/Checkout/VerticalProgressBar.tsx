import { tw } from 'utils/tw';

import { Check } from 'phosphor-react';

export type ProgressBarItem = {
  label: string;
  startIcon?: React.ReactElement;
  endIcon?: React.ReactElement;
}

export type ProgressBarNode = {
  label: string;
  error?: boolean;
  items?: ProgressBarItem[]
}

export interface VerticalProgressBarProps {
  nodes: ProgressBarNode[];
  activeNodeIndex: number;
}

export function VerticalProgressBar(props: VerticalProgressBarProps) {
  return <div className="flex flex-col font-noi-grotesk w-full border-l-2 dark:border-white m-4">
    {props.nodes.map((node, index) => {
      return (
        <div
          key={'node' + index}
          className={tw(
            'flex w-full',
            index < props.nodes.length - 1 && 'mb-12'
          )}>
          <Check className={tw(
            'h-7 w-7 p-1 text-white aspect-square shrink-0 rounded-full -ml-4',
            index < props.activeNodeIndex && 'bg-[#26AA73]',
            index === props.activeNodeIndex && 'bg-white border-2',
            index > props.activeNodeIndex && 'bg-white border-2 border-[#DDE2E4]',
            node.error && 'bg-red-400 animate-none motion-safe:animate-none',
          )} />
          <div className='flex flex-col w-full'>
            <div className={tw(
              'font-semibold text-[18px] ml-4',
              index > props.activeNodeIndex && 'text-[#6A6A6A]',
            )}>{node.label}</div>
            <div className="ml-4 flex-col">
              {node.items?.map((item, index) => {
                return <div key={index} className={tw(
                  'flex items-center text-[#818181] text-[14px] mt-4',
                )}>
                  {item.startIcon}
                  <div className='ml-2 line-clamp-1'>{item.label}</div>
                  {item.endIcon}
                </div>;
              })}
            </div>
          </div>
        </div>
      );
    })}
  </div>;
}