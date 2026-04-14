import { Button, ButtonType } from 'components/elements/Button';
import { CollectionCard } from 'components/modules/DiscoveryCards/CollectionCard';
import { useCollectionLikeCountQuery } from 'graphql/hooks/useCollectionLikeQuery';
import { useFetchTypesenseSearch } from 'graphql/hooks/useFetchTypesenseSearch';
import { HomePageV3CollectionsSection } from 'types/HomePage';
import { isOfficialCollection } from 'utils/helpers';
import { tw } from 'utils/tw';

import AOS from 'aos';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { useRouter } from 'next/router';
import DecorTop from 'public/decor-discover.svg?svgr';
import ArrowNav from 'public/icons/arrow-nav.svg?svgr';
import React, { useEffect, useState } from 'react';
import { Navigation, Scrollbar } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';

export interface HomePageData {
  data?: HomePageV3CollectionsSection;
}

gsap.registerPlugin(ScrollTrigger);

export default function DiscoverCollections({ data }: HomePageData) {
  const router = useRouter();
  const { fetchTypesenseSearch } = useFetchTypesenseSearch();
  const [collections, setCollectionData] = useState(null);
  const { data: collectionLikeData } = useCollectionLikeCountQuery(
    collections?.map(c => c?.document?.contractAddr)
  );
  const addressIds = data?.collectionsAddressIds;
  useEffect(() => {
    fetchTypesenseSearch({
      facet_by: ',floor,nftType,volume,issuance',
      index: 'collections',
      q: '*',
      query_by: 'contractAddr,contractName',
      filter_by:
        addressIds && addressIds?.length > 0
          ? `isOfficial:true && contractAddr:=[${addressIds.toString()}]`
          : 'isOfficial:true',
      per_page: 10,
      page: 1
    }).then(results => {
      setCollectionData(results?.hits);
    });

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
            trigger: '#anim-discover-trigger',
            start: 'top 40%',
            end: '+=30px',
            toggleActions: 'play none reverse none'
          }
        })
        .to(
          '#anim-discover-content',
          {
            x: 0,
            duration: 2,
            ease: 'power2.out'
          },
          0
        );
    });
  }, [addressIds, fetchTypesenseSearch]);

  return(
    <div id='anim-discover-trigger' className={tw(
      'bg-black relative',
      'minlg:before:w-40 minlg:before:absolute minlg:before:left-[2.5rem] minlg:before:top-0 minlg:before:h-[1.875rem] before:bg-white before:skew-x-[-20deg]',
      'minlg:after:w-[8.9rem] minlg:after:absolute minlg:after:left-[11.5rem] minlg:after:top-0 minlg:after:h-[5.5rem] after:bg-white after:skew-x-[-20deg]'
    )}>
      <DecorTop alt='copy' fill="white" className='absolute left-7 top-0 minlg:hidden' />

      <div className={tw(
        'pl-5 minlg:pl-0',
        'relative z-0 pt-36 pb-16 minlg:pt-[6.25rem] minlg:pb-12',
      )}>
        <div className='relative minlg:text-center'>
          <h2
            data-aos='fade-up'
            className={tw(
              'text-[3rem] font-normal leading-[1.0854] text-white minmd:text-[3.75rem] minxl:text-[5.125rem] minxxl:text-[7.5rem]',
              'mb-10 minmd:mb-[6.625rem]'
            )}
          >
            {data?.sectionTitle}
          </h2>
        </div>

        <div className='mb-12 overflow-hidden'>
          <div
            id='anim-discover-content'
            data-aos="fade-left"
            className='md:!translate-x-0 minlg:translate-x-full minlg:transform-gpu'
          >
            <Swiper
              modules={[Navigation, Scrollbar]}
              spaceBetween={16}
              breakpoints={{
                0: {
                  slidesPerView: 'auto'
                },
                1200: {
                  slidesPerView: 2.55
                },
                1600: {
                  slidesPerView: 3.5
                },
                1800: {
                  slidesPerView: 4.2
                }
              }}
              navigation={{
                nextEl: '.js-discover-swiper__btn-next',
                prevEl: '.js-discover-swiper__btn-prev',
                disabledClass: 'swiper-button-disabled'
              }}
              autoplay={{
                delay: 3500,
                disableOnInteraction: false
              }}
              scrollbar={{ draggable: true }}
              className='flex !pb-12 minxl:!pb-[4.875rem] !pl-[4%]'
            >
              {collections &&
                collections?.length > 0 &&
                collections?.map((collection, index) => {
                  return (
                    <SwiperSlide key={index} className='!h-auto lg:!max-w-xs lg:!w-auto'>
                      <CollectionCard
                        key={index}
                        redirectTo={`/app/collection/${isOfficialCollection({
                          name: collection.document.contractName,
                          isOfficial: collection.document.isOfficial
                        })}/`}
                        contractAddr={collection.document?.contractAddr}
                        collectionId={collection?.document?.id}
                        floorPrice={collection.document?.floor}
                        totalVolume={collection.document?.volume}
                        contractName={collection.document.contractName}
                        isOfficial={collection.document.isOfficial}
                        images={[collection.document.bannerUrl]}
                        likeInfo={
                          collectionLikeData && collectionLikeData[index]
                        }
                      />
                    </SwiperSlide>
                  );
                })}
            </Swiper>
          </div>
        </div>

        <div data-aos='zoom-in' data-aos-delay='100' className='text-center relative flex items-center justify-center flex-col'>
          <div>
            <Button
              data-aos='zoom-out'
              data-aos-delay='300'
              type={ButtonType.WEB_PRIMARY}
              label={data?.ctaButtonText}
              stretch
              onClick={() => router.push(`/${data?.ctaButtonLink}`)}
            />
          </div>

          <div className="swiper__nav-buttons -order-1 pb-5 minmd:pb-0">
            <button type='button' className='js-discover-swiper__btn-prev swiper-nav-button --prev right-[calc(4%+3.875rem)]'>
              <ArrowNav className="mr-0.5"/>
            </button>
            <button type='button' className='js-discover-swiper__btn-next swiper-nav-button --next right-[4%]'>
              <ArrowNav className="ml-0.5"/>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
