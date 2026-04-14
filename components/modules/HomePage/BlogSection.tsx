import BlurImage from 'components/elements/BlurImage';
import { Button, ButtonType } from 'components/elements/Button';
import { HomePageV3BlogSection } from 'types/HomePage';
import { getBaseUrl } from 'utils/helpers';
import { tw } from 'utils/tw';

import AOS from 'aos';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { contentfulLoader } from 'lib/image/loader';
import Link from 'next/link';
import { useRouter } from 'next/router';
import ArrowNav from 'public/icons/arrow-nav.svg?svgr';
import React, { useEffect } from 'react';
import { Navigation, Scrollbar } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';

export interface HomePageData {
  data?: HomePageV3BlogSection;
  blogSectionTitle:{
    title: string,
    subTitle: string
  }
  goToBlogButton: {
    title: string,
    link: string,
  }
}

gsap.registerPlugin(ScrollTrigger);

export default function BlogSection({ data, goToBlogButton, blogSectionTitle }: HomePageData) {
  const router = useRouter();

  useEffect(() => {
    AOS.init({
      disable: function () {
        const maxWidth = 900;
        return window.innerWidth >= maxWidth;
      },
      duration: 700
    });

    const matchMedia = gsap.matchMedia();
    matchMedia.add('(min-width: 900px)', () => {
      gsap
        .timeline({
          scrollTrigger: {
            trigger: '#anim-blog-trigger',
            start: 'top 40%',
            end: '+=30px',
            toggleActions: 'play none reverse none'
          }
        })
        .to(
          '#anim-blog-content',
          {
            x: 0,
            duration: 2,
            ease: 'power2.out'
          },
          0
        );
    });
  });

  return(
    <div id='anim-blog-trigger' className='bg-[#282828]'>
      <div className={tw(
        'relative z-0 py-16 minlg:pt-[6.25rem] minlg:pb-[7.625rem]',
      )}>
        <div className='relative text-center text-white pt-4 minlg:pt-0 px-7'>
          <h2
            data-aos="fade-up"
            className={tw(
              'text-[3rem] minmd:text-[3.75rem] minxl:text-[5.125rem] minxxl:text-[7.5rem]',
              'leading-[1.0854] font-normal mb-8 minlg:mb-[.625rem]'
            )}>{blogSectionTitle?.title}</h2>
          <p data-aos="fade-up" data-aos-delay="100" className='text-lg mb-8 minxl:mb-[3.8125rem]'>{blogSectionTitle?.subTitle}</p>
        </div>

        <div id='anim-blog-content'
          data-aos="fade-left"
          className='minlg:translate-x-full minlg:transform-gpu mb-12'
        >
          <Swiper
            modules={[Navigation, Scrollbar]}
            spaceBetween={14}
            breakpoints={{
              0: {
                slidesPerView: 1.2
              },
              600: {
                slidesPerView: 2
              },
              1200: {
                slidesPerView: 3.3
              },
              1921: {
                slidesPerView: 4.3
              }
            }}
            navigation={{
              nextEl: '.js-insights-swiper__btn-next',
              prevEl: '.js-insights-swiper__btn-prev',
              disabledClass: 'swiper-button-disabled'
            }}
            autoplay={{
              delay: 3500,
              disableOnInteraction: false
            }}
            scrollbar={{ draggable: true }}
            className='insights-swiper flex !pl-[4vw] !pb-12 minlg:!pb-0'>
            {data?.items.map((preview ) =>
              <SwiperSlide key={preview.slug} className='!h-auto'>
                <Link key={preview.slug} href={`articles/${preview.slug}`} className={tw(
                  'bg-white flex flex-col flex-shrink-0 h-full rounded-lg md:mb-5 text-black',
                  'cursor-pointer',
                )}>
                  <div className='before:pb-[66.5%] before:block relative overflow-hidden'>
                    <BlurImage
                      fill
                      className='rounded-t-lg object-cover'
                      src={`${getBaseUrl('https://www.nft.com/')}api/imageFetcher?gcp=false&url=${encodeURIComponent(preview?.heroImage?.url)}`}
                      alt={preview.title}
                      loader={contentfulLoader}
                    />
                  </div>

                  <div className='py-5 px-4 minxxl:py-8 minxxl:px-7 flex-grow flex flex-col items-start'>
                    <h3 className={tw(
                      'text-[1.125rem] minlg:text-[2rem] minxxl:text-[2.75rem] leading-[1.09375] ',
                      'mb-11 minxxl:mb-16'
                    )}>{preview.title}</h3>
                    <div className='flex items-center mt-auto text-xs minlg:text-xl minxxl:text-3xl font-medium text-[#605A45]/60'>
                      <div className={tw(
                        'relative rounded-full mr-[6px] minlg:mr-3 block object-cover',
                        'h-5 minlg:h-9 minxxl:h-12 w-5 minlg:w-9 minxxl:w-12'
                      )}>
                        <BlurImage
                          fill
                          className='object-cover rounded-full'
                          src={`${getBaseUrl('https://www.nft.com/')}api/imageFetcher?gcp=false&url=${encodeURIComponent(preview.author?.image?.url)}`}
                          alt={`Image for author, ${preview.author?.name}`}
                          loader={contentfulLoader}
                        />
                      </div>
                      {preview.author?.name}
                    </div>
                  </div>
                </Link>
              </SwiperSlide>
            )}
          </Swiper>
        </div>

        <div
          data-aos="zoom-in"
          data-aos-delay="100"
          className='text-center relative flex items-center justify-center flex-col px-[4%] minmd:px-0'
        >
          <Button
            data-aos='zoom-out'
            data-aos-delay='300'
            type={ButtonType.WEB_PRIMARY}
            label={goToBlogButton?.title}
            stretch
            onClick={() => router.push(`/${goToBlogButton?.link}`)}
          />
          <div className="swiper__nav-buttons -order-1 pb-5 minmd:pb-0">
            <button type='button' className='js-insights-swiper__btn-prev swiper-nav-button --prev right-[6.75rem]'>
              <ArrowNav className="mr-0.5"/>
            </button>
            <button type='button' className='js-insights-swiper__btn-next swiper-nav-button --next right-[2.75rem]'>
              <ArrowNav className="ml-0.5"/>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
