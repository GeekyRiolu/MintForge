import { Button, ButtonSize, ButtonType } from 'components/elements/Button';
import { useUser } from 'hooks/state/useUser';
import { tw } from 'utils/tw';

import { useIsomorphicLayoutEffect } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

const errorImagesLight = [
  'https://cdn.nft.com/404_1.svg',
  'https://cdn.nft.com/404-2Light.svg',
  'https://cdn.nft.com/404-3Light.svg',
  'https://cdn.nft.com/404-4Light.png',
  'https://cdn.nft.com/404-5Light.png',
];

const errorImagesDark = [
  'https://cdn.nft.com/404_1.svg',
  'https://cdn.nft.com/404_2.svg',
  'https://cdn.nft.com/404_3.svg',
  'https://cdn.nft.com/404_4.svg',
  'https://cdn.nft.com/404_5.svg'
];

export interface NullStateProps {
  showImage?: boolean;
  primaryMessage?: string;
  secondaryMessage?: string;
  buttonLabel?: string;
  secondaryBtnLabel?: string;
  secondaryOnClick?: () => void;
  href?: string
  secondaryHref?: string
}

export function NullState(props: NullStateProps) {
  const { user } = useUser();
  const darkMode = user?.isDarkMode;
  const [randomErrorImage, setRandomErrorImage] = useState(errorImagesLight[0]);
  useIsomorphicLayoutEffect(() => {
    return () => {
      setRandomErrorImage(darkMode ?
        errorImagesDark[Math.floor(Math.random() * errorImagesDark.length)]
        :
        errorImagesLight[Math.floor(Math.random() * errorImagesLight.length)]);
    };
  }, []);
  return (
    <div
      className={tw('flex flex-col',
        'text-center w-full my-10 items-center justify-center rounded-xl py-10',
        'bg-pagebg dark:bg-pagebg-dk',
        'text-secondary-txt')}>
      {props.showImage &&
        <Image src={randomErrorImage} width='500' height='500' alt='404' className='mb-10 drop-shadow-2xl' priority />}
      <div className='flex flex-col items-center justify-center space-y-6 mx-2 minlg:mx-0'>
        <div
          className={tw(
            'text-primary-txt dark:text-primary-txt-dk',
            'text-base minmd:text-3xl minxl:text-4xl')}>
          {props.primaryMessage}
        </div>
        <div
          className="text-secondary-txt dark:text-secondary-txt-dk ..."
          style={{ fontSize: '20px' }}>
          {props.secondaryMessage}
        </div>
        <div className={`${props.secondaryBtnLabel && props.secondaryOnClick ? 'flex justify-evenly w-full minmd:w-1/2 items-center' : ''} `}>
          {props.buttonLabel &&
            <Link href={props.href}>
              <div className='drop-shadow-md'>
                <Button size={ButtonSize.LARGE} type={ButtonType.PRIMARY} onClick={() => null} label={props.buttonLabel} />
              </div>
            </Link>
          }
          {props.secondaryBtnLabel &&
            <Link href={props.secondaryHref}>
              <div className='drop-shadow-md'>
                <Button size={ButtonSize.LARGE} type={ButtonType.PRIMARY} onClick={() => null} label={props.secondaryBtnLabel} />
              </div>
            </Link>
          }
        </div>
      </div>
    </div>
  );
}
