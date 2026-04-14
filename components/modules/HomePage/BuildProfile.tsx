import { Button, ButtonType } from 'components/elements/Button';
import { HomePageV3BuildProfileSection } from 'types/HomePage';
import { tw } from 'utils/tw';

import Image from 'next/image';
import { useRouter } from 'next/router';
import React from 'react';

export interface HomePageData {
  data?: HomePageV3BuildProfileSection;
}

export default function BuildProfile({ data }: HomePageData) {
  const router = useRouter();

  return(
    <div className={tw(
      'bg-[#282828] minlg:bg-black minlg:relative overflow-hidden z-0 pb-16 minlg:pb-0',
      'minlg:before:absolute minlg:before:left-[-3%] minlg:before:right-[-3%] minlg:before:top-0 before:bottom-2/4 minlg:before:bg-[#282828] before:-z-10'
    )}>
      <div className={tw(
        'bg-gradient-to-r from-[#FAC213] to-[#FF9B37] rounded-[1.875rem]',
        'relative z-0 max-w-[94%] mx-auto overflow-hidden'
      )}>
        <div className={tw(
          'minmd:flex'
        )}>
          <div className={tw(
            'minmd:min-w-[26rem] minxl:w-[46%] px-8 minxl:pl-36 minxl:pr-0',
            'py-12 minlg:py-[9.5rem] minxxl:py-32'
          )}>
            <h2 data-aos="fade-up" data-aos-delay="100" className={tw(
              'text-[calc(48px+62*(100vw-375px)/1545)]',
              'text-black font-normal leading-[1.1] relative',
              'mb-4 minlg:mb-2 tracking-[-3px]'
            )}>
              <span className='text-[1em]'>
                {data?.title}
              </span>
            </h2>

            <p className={tw(
              'text-lg leading-[1.333] mb-9'
            )}>{data?.subTitle}</p>
            <Button
              data-aos='zoom-out'
              data-aos-delay='300'
              type={ButtonType.WEB_SECONDARY}
              label={data?.ctaButton}
              stretch
              onClick={() => router.push(`/${data?.ctaLink}`)}
            />
          </div>

          <div className='flex-grow text-right'>
            <Image className='-ml-9 minmd:ml-auto max-w-[calc(100%+2.25rem)] minmd:max-w-full h-full object-cover' width={721} height={621} src='/assets/build-profile-bg.webp' alt='Example profile image' />
          </div>
        </div>
      </div>
    </div>
  );
}
