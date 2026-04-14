/* eslint-disable @next/next/no-img-element */
import { useCheckFileType } from 'hooks/useCheckFileType';
import { tw } from 'utils/tw';

import BlurImage from './BlurImage';

import React from 'react';

export interface GalleryCardProps {
  label: string;
  imageURL: string;
  size? : 'small' | 'default'
  onClick: () => void;
  animate?: boolean;
}

function GalleryCard(props: GalleryCardProps) {
  const imageSrc = useCheckFileType(props?.imageURL);
  return (
    <div
      className={tw(
        'relative',
        'py-4',
        'drop-shadow-md rounded-xl flex flex-col',
        'w-full aspect-square',
        'justify-between cursor-pointer transform hover:scale-105',
        'overflow-hidden',
      )}
      onClick={props.onClick}
    >
      {props.animate !== false && <div className={tw(
        'absolute z-10 animate-pulse',
        'w-full h-full rounded-xl bg-gradient-to-tr from-primary-yellow to-[#FF9D39]',
      )} />}
      <BlurImage
        alt={props.label}
        src={imageSrc}
        fill
        className={tw(
          'h-full w-full aspect-square rounded-xl absolute z-20 object-contain',
        )}
      />
      <div
        className={tw(
          'absolute font-black bottom-0 w-full text-center mb-4 z-30',
          props.size === 'small' ? 'text-base' : 'text-2xl',
        )}
        style={{
          textShadow: '0px 2px 2px rgba(0,0,0,0.5)',
        }}
      >
        {props.label}
      </div>
    </div>
  );
}
export default React.memo(GalleryCard);
