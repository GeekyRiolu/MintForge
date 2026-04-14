import BlurImage from 'components/elements/BlurImage';
import { Button, ButtonType } from 'components/elements/Button';
import { HomePageV3SocialSection } from 'types/HomePage';
import { tw } from 'utils/tw';

import { contentfulLoader } from 'lib/image/loader';
import { useRouter } from 'next/router';
import React from 'react';
export interface HomePageData {
  data?: HomePageV3SocialSection;
}
export default function SocialSection({ data }: HomePageData) {
  const router = useRouter();

  return(
    <div className="pt-6 pb-16 minmd:pb-0 minmd:pt-12 minlg:pt-28">
      {
        data && data?.items.map((item, i) => {
          return (
            <div
              key={i}
              className={`
              grid minmd:grid-cols-2 minmd:-mt-10 minlg:-mt-28
              minxxl:max-w-[100rem] minxxl:mx-auto
              relative z-${i}`}
            >
              <div className={tw(
                'my-14 minlg:my-0 px-5 minmd:px-0 minmd:ml-14 minlg:ml-[13vw] minxxl:ml-[11.25%]',
                'minmd:max-w-[24vw] minlg:pb-[9.6rem] minmd:pt-6 minlg:pt-40',
                item.leftImage ? 'minlg:ml-[10vw]' : ''
              )}>
                <h2 data-aos="fade-up" data-aos-delay="100" className={tw(
                  'text-[2.9rem] minmd:text-[3.5rem] minxxl:text-[5rem] leading-[1.25] minmd:leading-none font-normal',
                  'tracking-tight mb-6 minxxl:mb-9 -mr-2'
                )}>
                  {
                    item?.titleArray.map((text,i) => {
                      return (
                        <span className={`${text.isOrange ? 'bg-clip-text text-transparent bg-gradient-to-r from-[#FCC315] to-[#FF9C38]' : ''} mr-2`} key={i}>{text?.text}</span>
                      );
                    })
                  }
                </h2>
                <p
                  data-aos='fade-up'
                  data-aos-delay='300'
                  className={tw(
                    'mb-9',
                    'text-[1rem] leading-[1.556] minlg:text-lg minxxl:text-2xl minlg:!leading-[1.3]'
                  )}
                >
                  {item.subTitle}
                </p>
                <Button
                  data-aos='zoom-out'
                  data-aos-delay='300'
                  type={ButtonType.WEB_PRIMARY}
                  label={item.buttonText}
                  stretch
                  onClick={() => router.push(`/${item?.buttonLink}`)}
                />
              </div>
              <div
                className={tw(
                  'relative',
                  item.leftImage ? 'minmd:-order-1' : 'minlg:-ml-14'
                )}
                data-aos="fade-up"
                data-aos-delay="400"
              >
                {i == 1 && <div
                  className={tw(
                    'bg-[rgba(24,26,34,.3)] blur-2xl h-[60%]',
                    'absolute left-[10%] right-[3%] top-1/2 -translate-y-1/2 mt-[10%]'
                  )}></div>}

                <BlurImage
                  width={700}
                  height={700}
                  className='drop-shadow-xl'
                  loader={contentfulLoader}
                  src={item.image.url}
                  alt='NFT image'
                />
              </div>
            </div>
          );
        })}
    </div>
  );
}
