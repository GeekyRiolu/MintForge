/* eslint-disable @next/next/no-img-element */
import 'aos/dist/aos.css';
import 'swiper/css';
import 'swiper/css/scrollbar';

import DefaultSEO from 'config/next-seo.config';
import { useLeaderboardQuery } from 'graphql/hooks/useLeaderboardQuery';
import { HomePageV2 } from 'types/HomePage';
import { getBaseUrl, getStaticAsset } from 'utils/helpers';
import { tw } from 'utils/tw';

import AOS from 'aos';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { contentfulLoader } from 'lib/image/loader';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { NextSeo } from 'next-seo';
import React, { useEffect } from 'react';
import Marquee from 'react-fast-marquee';
import LazyLoad from 'react-lazy-load';
import { usePageVisibility } from 'react-page-visibility';

const BlurImage = dynamic(import('components/elements/BlurImage'));
const HomeLayout = dynamic(import('components/layouts/HomeLayout'));
const Player = dynamic(() => import('@lottiefiles/react-lottie-player').then(mod => mod.Player));
const DynamicLeaderBoard = dynamic(import('components/modules/Profile/LeaderBoard'));
const DynamicPreviewBanner = dynamic(import('components/elements/PreviewBanner'));

gsap.registerPlugin(ScrollTrigger);

type HomePageData = {
  preview: boolean;
  data_v2?: HomePageV2;
};

const HomePageV2Layout = ({ data_v2, preview }: HomePageData) => {
  const { data: leaderboardData } = useLeaderboardQuery({ pageInput: { first: 10 } });
  const isVisible = usePageVisibility();
  useEffect(() => {
    AOS.init({
      disable: function () {
        const maxWidth = 900;
        return window.innerWidth >= maxWidth;
      },
      duration: 700
    });

    ScrollTrigger.saveStyles('#anim-hero-player, #anim-hero-caption');
    const matchMedia = gsap.matchMedia();

    matchMedia.add('(min-width: 900px)', () => {
      // Hero
      gsap.timeline({
        scrollTrigger: {
          trigger: '#anim-hero-trigger',
          pin: '#anim-hero-trigger',
          start: '5px top',
          end: '+=100px',
          //invalidateOnRefresh: true,
          toggleActions: 'play none reverse none',
        }
      })
        .to('#anim-hero', {
          maxWidth: '100vw',
          backgroundColor: '#000',
          duration: 1.25,
          ease: 'power2.out'
        }, 0)
        .to('#anim-hero-player', {
          y: '-3%',
          rotate: '0deg',
          scale: 1,
          skewX: '0deg',
          skewY: '0deg',
          duration: 1,
          ease: 'power2.out',
        }, 0)
        .to('#anim-hero-text', {
          y: '-50%',
          duration: 1.25,
          ease: 'power2.out'
        }, 0)
        .to('#anim-hero-shadow-dark', {
          opacity: 1,
          duration: 1,
          ease: 'power2.out'
        }, 0)
        .to('#anim-hero-shadow-light', {
          opacity: 0,
          duration: 1.5,
          ease: 'power2.out'
        }, 0)
        .to('#anim-hero-caption', {
          scale: 1,
          duration: 1,
          ease: 'power2.out'
        }, 0);

      // Profile
      gsap.timeline({
        scrollTrigger: {
          trigger: '#anim-profile-trigger',
          start: 'top 90%',
          end: '+=10px',
          toggleActions: 'play none reverse none',
        }
      })
        .to('#anim-profile', {
          y: -200,
          duration: 0.8,
          ease: 'power1.out',
        }, 0)
        .to('#anim-profile-head', {
          y: 0,
          duration: 1,
          ease: 'power2.out',
        }, 0)
        .to('#anim-profile-content', {
          y: 0,
          duration: 1.2,
          ease: 'power2.out',
        }, 0)
        .to('#anim-profile-shadow-dark', {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: 'power1.out',
        }, 0)
        .to('#anim-profile-bg', {
          scaleY: 1,
          duration: 0.8,
          ease: 'power1.out',
        }, 0)
        .to('#anim-profile-first-item', {
          y: 0,
          duration: 0.8,
          ease: 'power1.out',
        }, 0)
        .to('#anim-profile-second-item', {
          y: 0,
          duration: 1,
          ease: 'power1.out',
        }, 0)
        .to('#anim-profile-ttl-icon', {
          y: 0,
          duration: 2.2,
          ease: 'power2.out',
        }, 0);

      // Discover
      gsap.timeline({
        scrollTrigger: {
          trigger: '#anim-discover-trigger',
          //start: 'top 90%',
          start: '10% bottom',
          end: '+=50px',
          toggleActions: 'play none reverse none',
        }
      })
        .to('#anim-discover-img', {
          y: 0,
          duration: 1.2,
          ease: 'power2.out',
        }, 0)
        .to('#anim-discover-ttl-line-1', {
          y: 0,
          duration: 1.3,
          ease: 'power2.out',
        }, 0)
        .to('#anim-discover-ttl-line-2', {
          y: 0,
          duration: 1.5,
          ease: 'power2.out',
        }, 0)
        .to('#anim-discover-txt', {
          y: 0,
          duration: 1.5,
          ease: 'power2.out',
        }, 0)
        .to('#anim-discover-ttl-icon', {
          y: 0,
          duration: 2.2,
          ease: 'power2.out',
        }, 0);

      /* Hiw it works */
      gsap.timeline({
        scrollTrigger: {
          trigger: '#anim-hiw-trigger',
          //start: 'top 80%',
          start: 'top bottom',
          end: '+=50px',
          toggleActions: 'play none reverse none',
        }
      })
        .to('#anim-hiw-content', {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: 'power2.out',
        })
        .to('.anim-hiw-item:nth-child(1)', {
          y: 0,
          opacity: 1,
          duration: 1.2,
          ease: 'power2.out',
        }, '>-0.7')
        .to('.anim-hiw-item:nth-child(2)', {
          y: 0,
          opacity: 1,
          duration: 1.2,
          ease: 'power2.out',
        }, '>-0.75')
        .to('.anim-hiw-item:nth-child(3)', {
          y: 0,
          opacity: 1,
          duration: 1.2,
          ease: 'power2.out',
        }, '>-0.8');

      // Leaderboard
      gsap.timeline({
        scrollTrigger: {
          trigger: '#anim-leaderboard',
          start: 'top 50%',
          end: '+=30px',
          toggleActions: 'play none reverse none',
        }
      })
        .to('.anim-leaderboard-row', {
          y: 0,
          duration: 1.2,
          ease: 'circ.out',
        }, 0);

      gsap.to('#anim-leaderboard-decor', {
        scrollTrigger: {
          trigger: '#anim-leaderboard-trigger',
          start: 'top top',
          end: '+=400',
          pin: '#anim-leaderboard-trigger'
        }
      });

      // News
      gsap.timeline({
        scrollTrigger: {
          trigger: '#anim-news-trigger',
          start: 'top 80%',
          end: '+=30px',
          toggleActions: 'play none reverse none',
        }
      })
        .to('#anim-news-content', {
          x: 0,
          duration: 2,
          ease: 'power2.out'
        }, 0);

      // Discover
      gsap.timeline({
        scrollTrigger: {
          trigger: '#anim-discover-trigger',
          start: 'top 80%',
          end: '+=30px',
          toggleActions: 'play none reverse none',
        }
      })
        .to('#anim-discover-content', {
          x: 0,
          duration: 2,
          ease: 'power2.out'
        }, 0);

      // Marquees
      gsap.timeline({
        scrollTrigger: {
          trigger: '#anim-ticker-trigger',
          start: '20% bottom',
          end: '+=30px',
          toggleActions: 'play none reverse none',
        }
      })
        .to('#anim-ticker-first', {
          y: 0,
          duration: 0.8,
          ease: 'circ.out',
        }, 0)
        .to('#anim-ticker-second', {
          y: 0,
          duration: 1,
          ease: 'circ.out',
        }, '>-0.8');

      // Build Profile
      gsap.timeline({
        scrollTrigger: {
          trigger: '#anim-build-profile-trigger',
          start: '100px bottom',
          end: '+=30px',
          toggleActions: 'play none reverse none',
        }
      })
        .to('#anim-build-profile-trigger', {
          y: 0,
          duration: 1.5,
          ease: 'circ.out',
        }, 0)
        .to('#anim-build-profile-ttl-1', {
          y: 0,
          duration: 1.8,
          ease: 'circ.out',
        }, 0)
        .to('#anim-build-profile-ttl-2', {
          y: 0,
          duration: 2.1,
          ease: 'circ.out',
        }, 0)
        .to('.anim-build-profile-ttl-icon', {
          y: 0,
          duration: 2.2,
          ease: 'circ.out',
        }, 0)
        .to('.anim-build-profile-ttl-icon-2', {
          y: 0,
          duration: 2.2,
          ease: 'circ.out',
        }, '<0.5');
    });

    window.requestAnimationFrame(function() {
      const HeroTtlIcons = document.querySelectorAll<HTMLElement>('.anim-profile-icon');
      [...HeroTtlIcons].forEach(item => {
        item.style.transform = 'translateY(0)';
      });
    });
  }, []);
  return (
    <>
      <NextSeo
        {...DefaultSEO}
        title='NFT.com | The Social NFT Marketplace'
        description='Join NFT.com to display, trade, and engage with your NFTs.'
        openGraph={{
          url: 'https://www.nft.com',
          title: 'NFT.com | The Social NFT Marketplace',
          description: 'Join NFT.com to display, trade, and engage with your NFTs.',
          site_name: 'NFT.com',
        }}
      />
      <main id='anim-main-trigger' className='font-noi-grotesk not-italic HomePageContainer'>
        {/* Block: Intro */}
        <div id='anim-hero-trigger' className='minlg:h-screen'>
          <div className='bg-white relative'>
            {/* Intro Text */}
            <div id='anim-hero-text' className={tw(
              'pt-[10rem] pb-[3.75rem] minlg:py-[4vh] pl-[5vw] flex flex-col justify-center items-start',
              'minlg:w-[55%] minxl:w-[58.5%] minlg:h-screen'
            )}>
              <h2 data-aos="fade-up" data-aos-delay="100" className={tw(
                'text-[2.5rem] minmd:text-[5.2rem] minlg:text-[3.3rem] minxl:text-[5.2rem] minxxl:text-[6.8rem] leading-[1.5] minmd:leading-[1.15]',
                'text-black font-normal tracking-tight mb-14'
              )}>
                Join Your NFT
                <span className='inline-block rotate-[40deg]'>
                  <BlurImage
                    className={tw(
                      'anim-profile-icon -translate-y-[120vw] transition transform duration-[2s]',
                      'drop-shadow-md inline-block w-[2.5rem] minmd:w-[3.125rem] minxxl:w-[4.5rem]',
                      'mx-[1.8rem] minxxl:mx-[2.2rem] -my-[.5rem] rounded-xl'
                    )}
                    width={120}
                    height={120}
                    loader={contentfulLoader}
                    src={data_v2?.heroNfTsCollection?.items[0]?.url}
                    alt="NFT image"
                  />
                </span>
                <br />
                Community
                <span className='inline-block rotate-[40deg]'>
                  <BlurImage
                    className={tw(
                      'anim-profile-icon -translate-y-[120vw] transition transform duration-[2s] delay-200',
                      'drop-shadow-md inline-block w-[2.5rem] minmd:w-[3.125rem] minxxl:w-[4.5rem]',
                      'mx-[1.8rem] minxxl:mx-[2.2rem] -my-[.5rem] rounded-xl',
                    )}
                    width={120}
                    height={120}
                    loader={contentfulLoader}
                    src={data_v2?.heroNfTsCollection?.items[1]?.url}
                    alt="NFT image" />
                </span>
                on{' '}
                <span data-aos="fade-left" data-aos-delay="200"
                  className='bg-clip-text text-transparent bg-gradient-to-r from-[#FBC214] to-[#FF9C38]'>
                    NFT.com
                </span>
              </h2>

              <a data-aos="zoom-out" data-aos-delay="300" href={data_v2?.heroCta?.link} className={tw(
                'bg-[#121212] hover:bg-[#414141] transition-colors drop-shadow-lg rounded-full',
                'inline-flex items-center justify-center text-center h-[4.1875rem] minxxl:h-[6rem] px-6 minxxl:px-9',
                'text-xl minxxl:text-3xl text-white font-medium uppercase'
              )}>{data_v2?.heroCta?.title}</a>
            </div>

            {/* Hero */}
            <div id='anim-hero' data-aos="fade-up" data-aos-delay="200" className={tw(
              'minlg:max-w-[45%] minxl:max-w-[41.5%] w-full minlg:h-[calc(100vh+5px)] bg-[#F9D54C]',
              'relative minlg:absolute z-[10] minlg:right-0 minlg:top-0 overflow-hidden',
              'before:block before:pb-[127%] minmd:before:pb-[80%] minlg:before:pb-[60%] minlg:before:hidden'
            )}>
              <div className='absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2'>
                <div id="anim-hero-player" className={tw(
                  'pointer-events-none',
                  'scale-x-[2.6] scale-y-[1.6]',
                  'minmd:scale-x-[2] minmd:scale-y-[1.3] minlg:scale-x-[1.2] minlg:scale-y-[0.8]',
                  'minxxl:scale-x-100 minxxl:scale-y-[.65] minhd:scale-[1.25]',
                  '-skew-x-[41deg] skew-y-[19deg]'
                )}>
                  <Player
                    autoplay
                    loop
                    src="/anim/cycle.json"
                    style={{ height: '85vw', width: '85vw' }}
                  >
                  </Player>
                </div>
              </div>

              <div className={tw(
                'absolute inset-0 px-4',
                'flex justify-center items-center'
              )}>
                <div id='anim-hero-caption' className={tw(
                  'minlg:scale-[.57] minxxl:scale-[.58] transform-gpu',
                  'bg-[#121212] drop-shadow-lg h-[1.667em] px-[.375em]',
                  'minlg:px-7 minxxl:px-10 relative z-20',
                  'text-[calc(42px+112*(100vw-375px)/1545)]',
                  'leading-none tracking-tight rounded-full'
                )}>
                  {/* Placeholder the broadest word */}
                  <div className='text-transparent flex'>NFT.COM
                    <div role='presentation' className={tw(
                      'mx-2 minlg:mx-4 minxxl:mx-8',
                      'h-[.68em] w-[.1081em] basis-[.1081em]'
                    )}></div>
                    PLANTS
                  </div>

                  <div className={tw(
                    'absolute inset-x-4 minlg:inset-x-7 minxxl:inset-x-10 top-0 bottom-0',
                    'text-white flex'
                  )}>
                    {data_v2?.dynamicUrl['url'].map(word =>
                      <a key={word} href={'/app/mint-profiles'} className='anim-profile-link flex items-center justify-center text-center'>
                        <span className='text-white/40'>NFT.COM</span>
                        <span role='presentation' className={tw(
                          '-mb-[.1em] mx-2 minlg:mx-4 minxxl:mx-8 skew-x-[-20deg]',
                          'bg-gradient-to-b from-[#FECB02] to-[#FF9E39]',
                          'h-[.68em] w-[.1081em] basis-[.1081em] rounded-[3px]'
                        )}>
                        </span>{word.toUpperCase()}
                      </a>
                    )}
                  </div>
                </div>

                <span role='presentation' id='anim-hero-shadow-light' className={tw(
                  'opacity-1',
                  'absolute bottom-0 left-0 z-10 bg-img-shadow-light',
                  'w-full h-[41.25rem] pointer-events-none'
                )}></span>
                <span role='presentation' id='anim-hero-shadow-dark' className={tw(
                  'opacity-0',
                  'absolute bottom-0 left-0 z-10 bg-img-shadow-dark',
                  'w-full h-[28.75rem] pointer-events-none'
                )}></span>
              </div>
            </div>
          </div>
        </div>

        {/* Block: NFT profile */}
        <div id='anim-profile-trigger'>
          <div id='anim-profile' className={tw(
            'will-change-transform minlg:px-14 minxxl:px-20 mb-[3.3125rem] minlg:mb-[6.5rem] relative z-[10]',
          )}>
            <span role='presentation' id='anim-profile-bg' className='bg-black origin-top-left h-[61.4%] absolute left-0 right-0 top-[-1px]'></span>
            <span role='presentation' id='anim-profile-shadow-dark' className={tw(
              'opacity-0 translate-y-1/2 minlg:transform-gpu',
              'absolute bottom-full left-0 -z-10 bg-img-shadow-dark',
              'w-full h-[28.75rem] pointer-events-none'
            )}></span>
            <div className={tw(
              'w-full mx-auto pt-10 px-5 minlg:px-9 bg-black', /* pb-[8.5rem] minlg:pb-40 */
              'minlg:rounded-3xl flow-root relative z-10',
            )}>
              <h2 data-aos="fade-up" data-aos-delay="200" id='anim-profile-head' className={tw(
                'minlg:translate-y-[400px] minlg:transform-gpu',
                'text-[3rem] minmd:text-[3.75rem] minxl:text-[5.125rem] minxxl:text-[7.5rem]',
                'leading-[1.0854] -tracking-[0.03em] font-normal text-white mb-14 minxxl:mb-20'
              )}>
                The Social
                <span className='inline-block rotate-[40deg]'>
                  <BlurImage
                    id='anim-profile-ttl-icon'
                    width={120}
                    height={120}
                    loader={contentfulLoader}
                    className={tw(
                      'drop-shadow-md inline-block w-[2.5rem] minxxl:w-[5.5rem]',
                      'mx-[0.4em] -my-[0.7rem] rounded-xl',
                      '-translate-y-[120vw]'
                    )}
                    src={data_v2?.wycdTitleNfTs?.url} alt="NFT image" />
                </span>
                <span className='block transform-gpu bg-clip-text text-transparent bg-gradient-to-r from-[#FDCC00] to-[#FF9D39]'>NFT Marketplace</span></h2>

              <div id='anim-profile-content' className={tw(
                'minlg:translate-y-[400px] transform-gpu',
                'minmd:grid grid-cols-2 gap-2 minmd:gap-4 minxxl:gap-6 -mb-12 minmd:-mb-[6.5rem]'
              )}>
                <div id='anim-profile-first-item' data-aos="fade-up" data-aos-delay="100" className={tw(
                  'minlg:translate-y-1/4 transform-gpu',
                  'mb-5 minlg:mb-0',
                  'px-8 pt-12 pb-4 minmd:px-5 minlg:px-8 minxxl:pt-16 minxxl:pb-6 relative z-0 overflow-hidden',
                  'bg-white border-black border-2 border-t-0 rounded-3xl rounded-tr-none'
                )}>
                  <svg role='presentation' className={tw(
                    'absolute -z-10 -top-[14.5rem] -right-10 w-[9rem]',
                    'minxl:-top-[17.5rem] minxl:-right-28 minxl:w-[18rem]'
                  )} width="287" height="386" viewBox="0 0 287 386" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path className='anim-corner' d="M167.421 0H119.359C118.63 0 117.975 0.449617 117.713 1.13093L4.921 294.604C4.47705 295.759 5.32974 297 6.56724 297H53.2259C53.9532 297 54.6058 296.554 54.8695 295.876L169.065 2.40319C169.515 1.24701 168.662 0 167.421 0Z" fill="black" />
                    <path className='anim-corner' d="M188.421 66H140.359C139.63 66 138.975 66.4496 138.713 67.1309L25.921 360.604C25.477 361.759 26.3297 363 27.5672 363H74.2259C74.9532 363 75.6058 362.554 75.8695 361.876L190.065 68.4032C190.515 67.247 189.662 66 188.421 66Z" fill="black" />
                    <path className='anim-corner anim-corner-2' d="M246.421 43H198.359C197.63 43 196.975 43.4496 196.713 44.1309L83.921 337.604C83.477 338.759 84.3297 340 85.5672 340H132.226C132.953 340 133.606 339.554 133.87 338.876L248.065 45.4032C248.515 44.247 247.662 43 246.421 43Z" fill="black" />
                    <path className='anim-corner anim-corner-3' d="M280.421 81H232.359C231.63 81 230.975 81.4496 230.713 82.1309L117.921 375.604C117.477 376.759 118.33 378 119.567 378H166.226C166.953 378 167.606 377.554 167.87 376.876L282.065 83.4032C282.515 82.247 281.662 81 280.421 81Z" fill="black" />
                  </svg>

                  <h3 data-aos="fade-up" data-aos-delay="100" className={tw(
                    'text-black font-medium mb-6 minxxl:mb-9 minlg:pr-44 minxxl:pr-48',
                    'text-3xl minxl:text-6xl minxxl:text-[5.5rem]',
                    'leading-[1.125] minxl:leading-[1.125]'
                  )}>{data_v2?.wycdBlock1Title}</h3>
                  <p data-aos="fade-up" data-aos-delay="150" className='text-base minlg:text-[22px] minxxl:text-[2rem] leading-normal pr-[9%]'>{data_v2?.wycdBlock1Description}</p>
                  <div data-aos="fade-up" data-aos-delay="200" className={tw(
                    'w-full h-[1.7em] mx-auto mt-10 mb-6 minxxl:mb-9 relative',
                    'bg-[#121212] drop-shadow-lg rounded-full',
                    'flex items-center justify-center text-center',
                    'text-[1.875rem] minmd:text-[1.625rem] minlg:text-[2rem] leading-none tracking-tight',
                    'minxl:text-[calc(34px+29*(100vw-375px)/1545)]',
                  )}>
                    <div className='text-transparent flex'>NFT.COM
                      <div role='presentation' className={tw(
                        'mx-1 minlg:mx-2 minxxl:mx-4',
                        'h-[.68em] w-[.1081em] basis-[.1081em]'
                      )}></div>
                      PLANTS
                    </div>

                    <div className={tw(
                      'absolute inset-x-3 minxxl:inset-x-8 top-0 bottom-0',
                      'text-white flex'
                    )}>
                      {data_v2?.dynamicUrl['url'].map(word =>
                        <a key={word} href={'/app/mint-profiles'} className='anim-profile-link flex items-center justify-center text-center'>
                          <span className='text-white/40'>NFT.COM</span>
                          <span className={tw(
                            'mt-[.075em] -mb-[.0625] mx-1 minlg:mx-2 minxxl:mx-4 skew-x-[-20deg]',
                            'bg-gradient-to-b from-[#FECB02] to-[#FF9E39]',
                            'h-[.68em] w-[.1081em] basis-[.1081em] rounded-[3px]'
                          )}></span>{word.toUpperCase()}
                        </a>
                      )}
                    </div>
                  </div>
                  <div className='text-center mb-10'>
                    <a href={data_v2?.wycdBlock1Cta?.link} className={tw(
                      'text-base font-medium minlg:text-xl minxxl:text-3xl',
                      'link-underline flex items-center'
                    )}>{data_v2?.wycdBlock1Cta?.title}
                      <svg role='presentation' className='w-[.7em] ml-2' viewBox="0 0 13.932 14.472" xmlns="http://www.w3.org/2000/svg">
                        <path d="M 13.932,7.236 6.723,14.472 5.346,13.095 10.287,8.262 H 0 V 6.21 H 10.287 L 5.346,1.377 6.723,0 Z" fill="currentColor" />
                      </svg>
                    </a>
                  </div>
                </div>

                <div id='anim-profile-second-item' data-aos="fade-up" data-aos-delay="100" className={tw(
                  'minlg:translate-y-1/2 transform-gpu',
                  'mb-5 minlg:mb-0',
                  'px-8 pt-12 pb-4 minmd:px-5 minlg:px-8 minxxl:pt-16 minxxl:pb-6 relative z-0 overflow-hidden',
                  'bg-white border-black border-2 border-t-0 rounded-3xl rounded-tr-none'
                )}>
                  <svg role='presentation' className={tw(
                    'absolute -z-10 -top-[14.5rem] -right-10 w-[9rem]',
                    'minxl:-top-[229px] minxl:-right-20 minxl:w-[18rem]'
                  )} width="287" height="386" viewBox="0 0 287 386" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path className='anim-corner reverse' d="M167.421 0H119.359C118.63 0 117.975 0.449617 117.713 1.13093L4.921 294.604C4.47705 295.759 5.32974 297 6.56724 297H53.2259C53.9532 297 54.6058 296.554 54.8695 295.876L169.065 2.40319C169.515 1.24701 168.662 0 167.421 0Z" fill="black" />
                    <path className='anim-corner reverse' d="M188.421 66H140.359C139.63 66 138.975 66.4496 138.713 67.1309L25.921 360.604C25.477 361.759 26.3297 363 27.5672 363H74.2259C74.9532 363 75.6058 362.554 75.8695 361.876L190.065 68.4032C190.515 67.247 189.662 66 188.421 66Z" fill="black" />
                    <path className='anim-corner reverse anim-corner-2' d="M246.421 43H198.359C197.63 43 196.975 43.4496 196.713 44.1309L83.921 337.604C83.477 338.759 84.3297 340 85.5672 340H132.226C132.953 340 133.606 339.554 133.87 338.876L248.065 45.4032C248.515 44.247 247.662 43 246.421 43Z" fill="black" />
                    <path className='anim-corner reverse anim-corner-3' d="M280.421 81H232.359C231.63 81 230.975 81.4496 230.713 82.1309L117.921 375.604C117.477 376.759 118.33 378 119.567 378H166.226C166.953 378 167.606 377.554 167.87 376.876L282.065 83.4032C282.515 82.247 281.662 81 280.421 81Z" fill="black" />
                  </svg>

                  <h3 data-aos="fade-up" data-aos-delay="100" className={tw(
                    'text-black font-medium mb-6 minxxl:mb-9 minlg:pr-44 minxxl:pr-48',
                    'text-3xl minxl:text-6xl minxxl:text-[5.5rem] leading-[1.125] minxl:leading-[1.125]'
                  )}>{data_v2?.wycdBlock2Title}</h3>
                  <p data-aos="fade-up" data-aos-delay="150" className='text-base minlg:text-[22px] minxxl:text-[2rem] leading-normal pr-[9%]'>{data_v2?.wycdBlock2Description}</p>

                  <div className='overflow-hidden -mx-9 mt-4 minxxl:mt-6'>
                    <div data-aos="fade-left" data-aos-delay="200" className="image-ticker mb-4 minxxl:mb-6 h-16 minxl:h-28 minxxl:h-36">
                      <Marquee gradient={false} speed={60} loop={0} direction="right" play={isVisible} className="flex">
                        {/* TODO: Add proper types to data_v2 */}
                        {/*{(data_v2?.wycdBlock2Row1NftsCollection?.items as {url: string}[]).map((image, index) =>*/}
                        {/*  <div key={index} className={tw('block relative h-16 w-16 minxl:w-28 minxl:h-28 minxxl:w-36 minxxl:h-36 mx-[10px]', index === 0 ? 'pl-16' : '')}>*/}
                        {/*    <BlurImage fill src={`${getBaseUrl('https://www.nft.com/')}api/imageFetcher?gcp=false&url=${encodeURIComponent(image.url)}&height=${1084}&width=${1084}`} className='rounded-full w-full o' alt="NFT image" />*/}
                        {/*  </div>*/}
                        {/*)}*/}
                      </Marquee>
                    </div>

                    <div data-aos="fade-left" data-aos-delay="250" className="image-ticker h-16 minxl:h-28 minxxl:h-36">
                      {/*<Marquee gradient={false} speed={60} loop={0} play={isVisible} className="flex">*/}
                      {/*  {(data_v2?.wycdBlock2Row2NftsCollection?.items as {url: string}[]).map((image, index) =>*/}
                      {/*    <div key={index} className='block relative h-16 w-16 minxl:w-28 minxl:h-28 minxxl:w-36 minxxl:h-36 mx-[10px]'>*/}
                      {/*      <BlurImage fill src={image.url} className='rounded-full w-full' alt="NFT image" />*/}
                      {/*    </div>*/}
                      {/*  )}*/}
                      {/*</Marquee>*/}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Block: Discover */}
        <div id='anim-discover-trigger' className="px-5 pt-8 minlg:mt-[-200px] minlg:pt-16 minxxl:pt-24 minmd:px-14 minxxl:px-20">
          <div className='grid minmd:grid-cols-2 items-center mb-12 minmd:mb-[5.5rem]'>
            <div className='minmd:ml-7 minxl:pr-[24%]'>
              <h2 data-aos="fade-up" data-aos-delay="100" className={tw(
                'text-[3rem] minmd:text-[3.75rem] minxl:text-[5.125rem] minxxl:text-[7.5rem] leading-[1.0854] font-normal',
                'mb-6 minxxl:mb-9'
              )}>
                <span id='anim-discover-ttl-line-1' data-aos="fade-up" data-aos-delay="200"
                  className={tw(
                    'minlg:translate-y-40 transform-gpu relative z-50',
                    'block bg-clip-text text-transparent bg-gradient-to-r from-[#FCC315] to-[#FF9C38]'
                  )}>
                  Discover <br />
                  <span className='inline-block rotate-[40deg]'>
                    <BlurImage
                      width={180}
                      height={180}
                      loader={contentfulLoader}
                      id='anim-discover-ttl-icon'
                      className={tw(
                        'inline-block w-[0.833em] minxxl:w-[5.5rem]',
                        'mx-[0.45em] -mt-[.75rem] -mb-[.4rem] rounded-xl',
                        '-translate-y-[120vw]'
                      )}
                      src={data_v2?.discoverTitleNfTs.url}
                      alt="NFT image"
                    />
                  </span>
                  a
                </span>
                <span id='anim-discover-ttl-line-2' className='block minlg:translate-y-40 transform-gpu'>New World</span>
              </h2>
              <p id='anim-discover-txt' data-aos="fade-up" data-aos-delay="300" className={tw(
                'minlg:translate-y-40 transform-gpu',
                'text-[1rem] minlg:text-[1.375rem] minxxl:text-[2rem] leading-[1.455]'
              )}>{data_v2?.discoverDescription}</p>
            </div>

            <div id='anim-discover-img' data-aos="fade-up" data-aos-delay="400" className={tw(
              'minlg:translate-y-1/2 transform-gpu',
              'minmd:-order-1 -mx-5'
            )}>
              <LazyLoad offset={200}>
                <video className='w-full' autoPlay loop muted playsInline src={getStaticAsset('public/video-discover.mp4')}></video>
              </LazyLoad>
            </div>
          </div>
        </div>

        {/* Block: How it works */}
        <div id='anim-hiw-trigger' className={tw(
          'px-3 minlg:px-14 minxxl:px-20 minxxl:mb-8',
          'overflow-hidden minlg:overflow-visible',
        )}>
          <div id='anim-hiw-content' className={tw(
            'minlg:translate-y-1/2 transform-gpu',
            'flow-root relative z-0 bg-primary-yellow rounded-3xl',
            'mt-5 mb-[7.5rem] px-3 minlg:p-6 pt-[3.15rem]'
          )}>
            <svg role='presentation' className='minxl:hidden absolute -z-10 top-0 right-0 -translate-y-[65px]' width="218" height="103" viewBox="0 0 218 103" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path className='anim-corner anim-corner-4' d="M112.373 19H30.3571C29.6239 19 28.9671 19.4537 28.7076 20.1394L0.903622 93.6122C0.467002 94.7659 1.31947 96 2.5531 96H82.3258C83.042 96 83.6871 95.5669 83.9582 94.904L114.006 21.4312C114.48 20.271 113.627 19 112.373 19Z" fill="white" />
              <path className='anim-corner anim-corner-5' d="M193.373 0H111.357C110.624 0 109.967 0.453661 109.708 1.13943L81.9036 74.6122C81.467 75.7659 82.3195 77 83.5531 77H163.326C164.042 77 164.687 76.5669 164.958 75.904L195.006 2.43123C195.48 1.27098 194.627 0 193.373 0Z" fill="white" />
              <path className='anim-corner anim-corner-6' d="M251.373 26H169.357C168.624 26 167.967 26.4537 167.708 27.1394L139.904 100.612C139.467 101.766 140.319 103 141.553 103H221.326C222.042 103 222.687 102.567 222.958 101.904L253.006 28.4312C253.48 27.271 252.627 26 251.373 26Z" fill="white" />
            </svg>

            <svg role='presentation' className='hidden minxl:block absolute -z-10 top-0 right-0 translate-x-[2rem] -translate-y-[40%] max-w-full' aria-hidden="true" width="507" height="234" viewBox="0 0 506.52539 233.98633" xmlns="http://www.w3.org/2000/svg">
              <path className='anim-corner anim-corner-4' fill='white' d="M 154.64664,1.03125 H 66.916171 L 0.11929558,174.58985 c -0.44460856,1.15499 0.4086356,2.39648 1.64648442,2.39648 h 83.115235 c 0.726899,0 1.378678,-0.44605 1.642578,-1.12305 z" />
              <path className='anim-corner anim-corner-5' fill='white' d="m 240.83804,0 h -87.46093 l -45.25586,117.58985 c -0.445,1.15499 0.40753,2.39648 1.64453,2.39648 h 83.11523 c 0.727,0 1.37858,-0.44605 1.64258,-1.12305 z" />
              <path className='anim-corner anim-corner-4' fill='white' d="m 326.97672,0.38867 -87.91797,0.0957 -78.9375,205.10547 c -0.445,1.15499 0.40753,2.39648 1.64453,2.39648 h 83.11523 c 0.727,0 1.37858,-0.44605 1.64258,-1.12305 z" />
              <path className='anim-corner anim-corner-5' fill='white' d="m 411.80094,0.33594 -87.64649,-0.12305 -64.0332,166.37696 c -0.445,1.15499 0.40753,2.39648 1.64453,2.39648 h 83.11523 c 0.727,0 1.37858,-0.44605 1.64258,-1.12305 z" />
              <path className='anim-corner anim-corner-6' fill='white' d="m 495.19351,0.16797 -87.94336,-0.16406 -89.1289,231.58594 c -0.445,1.15499 0.40753,2.39648 1.64453,2.39648 h 83.11523 c 0.727,0 1.37858,-0.44605 1.64258,-1.12305 z" />
              <path className='anim-corner anim-corner-4' fill='white' d="M 506.52539,1.0859375 492.07422,1.0332031 419.12109,190.58984 c -0.445,1.15499 0.40754,2.39649 1.64453,2.39649 h 83.11524 c 0.727,0 1.37858,-0.44605 1.64258,-1.12305 l 0.0781,-0.20117 z" />
            </svg>

            <div className='relative pl-2 minlg:px-0'>
              <h2 data-aos="fade-up" data-aos-delay="100" className={tw(
                'text-[3rem] minmd:text-[3.75rem] minxl:text-[5.125rem] minxxl:text-[7.5rem]',
                'leading-[1.0854] font-normal mb-[1rem]'
              )}>{data_v2?.hiwTitle}</h2>
              <p data-aos="fade-up" data-aos-delay="200" className='text-base minlg:text-[1.625rem] minxxl:text-4xl mb-8'>{data_v2?.hiwSubtitle}</p>
            </div>

            <div className='grid minlg:grid-cols-3 minmd:grid-cols-3 minmd:gap-4 minxxl:gap-7 mb-[-7.5rem]'>
              <div className={tw(
                'minlg:translate-y-full minlg:opacity-0 transform-gpu',
                'anim-hiw-item bg-black rounded-2xl p-4 minxxl:p-7 pb-12 minxxl:pb-20 md:mb-5 text-white'
              )}>
                <BlurImage
                  width={500}
                  height={400}
                  loader={contentfulLoader}
                  data-aos="zoom-in"
                  data-aos-delay="100"
                  className='w-full bg-white rounded-2xl mb-6'
                  src={`${getBaseUrl('https://www.nft.com/')}api/imageFetcher?gcp=false&url=${encodeURIComponent(data_v2?.hiwBlock1Image?.url)}`}
                  alt="Claim your profile"
                />
                <h3 data-aos="fade-up" data-aos-delay="200" className='text-2xl minlg:text-[2.5rem] minxxl:text-6xl font-medium leading-tight mb-4'>{data_v2?.hiwBlock1Title}</h3>
                <p data-aos="fade-up" data-aos-delay="300" className='text-base minlg:text-xl minxxl:text-3xl'>{data_v2?.hiwBlock1Description}</p>
              </div>

              <div className={tw(
                'minlg:translate-y-full minlg:opacity-0 transform-gpu',
                'anim-hiw-item bg-black rounded-2xl p-4 minxxl:p-7 pb-12 minxxl:pb-20 md:mb-5 text-white'
              )}>
                <BlurImage
                  width={500}
                  height={400}
                  loader={contentfulLoader}
                  data-aos="zoom-in"
                  data-aos-delay="100"
                  className='w-full bg-white rounded-2xl mb-6'
                  src={`${getBaseUrl('https://www.nft.com/')}api/imageFetcher?gcp=false&url=${encodeURIComponent(data_v2?.hiwBlock2Image?.url)}`}
                  alt="Display your collection"
                />
                <h3 data-aos="fade-up" data-aos-delay="200" className='text-2xl minlg:text-[2.5rem] minxxl:text-6xl font-medium leading-tight mb-4'>{data_v2?.hiwBlock2Title}</h3>
                <p data-aos="fade-up" data-aos-delay="300" className='text-base minlg:text-xl minxxl:text-3xl'>{data_v2?.hiwBlock2Description}</p>
              </div>

              <div className={tw(
                'minlg:translate-y-full minlg:opacity-0 transform-gpu',
                'anim-hiw-item bg-black rounded-2xl p-4 minxxl:p-7 pb-12 minxxl:pb-20 md:mb-5 text-white'
              )}>
                <BlurImage
                  width={500}
                  height={400}
                  loader={contentfulLoader}
                  data-aos="zoom-in"
                  data-aos-delay="100"
                  className='w-full bg-white rounded-2xl mb-6'
                  src={`${getBaseUrl('https://www.nft.com/')}api/imageFetcher?gcp=false&url=${encodeURIComponent(data_v2?.hiwBlock3Image?.url)}`}
                  alt="Discover your community"
                />
                <h3 data-aos="fade-up" data-aos-delay="200" className='text-2xl minlg:text-[2.5rem] minxxl:text-6xl font-medium leading-tight mb-4'>{data_v2?.hiwBlock3Title}</h3>
                <p data-aos="fade-up" data-aos-delay="300" className='text-base minlg:text-xl minxxl:text-3xl'>{data_v2?.hiwBlock3Description}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Block: Leaderboard */}
        <div id='anim-leaderboard' className={tw(
          'px-5 minlg:px-14 minxxl:px-20 mb-8',
          'minhd:mb-28 overflow-hidden relative',
          'pt-[10rem] minlg:pt-[11.725rem] minxxl:pt-64'
        )}>
          <div id='anim-leaderboard-content' className={tw(
            'anim-leaderboard-row',
            'bg-white shadow-2xl rounded-3xl mb-[3rem] minlg:mb-[4.75rem] px-4 minlg:px-10 pt-12',
            'minlg:translate-y-1/2 transform-gpu',
          )}>
            <div className="minlg:flex minlg:justify-between minlg:items-center mb-4 minlg:mb-16">
              <h2 data-aos="fade-up" data-aos-delay="100" className={tw(
                'text-[3rem] minmd:text-[3.75rem] minxl:text-[5.125rem] minxxl:text-[7.5rem]',
                'leading-none minxl:leading-[.842] font-normal max-w-2xl justify-center mb-6 minlg:mb-0 ...'
              )}>
                {data_v2?.leaderboardTitle}
              </h2>
              <span data-aos="fade-up" data-aos-delay="150" className='leading-none text-[1.25rem] minmd:text-[1.625rem] minxxl:text-[2.25rem] minlg:ml-4 text-[#B2B2B2]'>
                <span className='bg-clip-text text-transparent bg-gradient-to-r from-[#FBC214] to-[#FF9C38]'>Top 10</span> collectors
              </span>
            </div>

            <div data-aos="fade-up" data-aos-delay="300" className='minlg:min-h-[52.625rem] -mx-4 minlg:mx-0'>
              <DynamicLeaderBoard data={leaderboardData} />
            </div>
          </div>

          <div id='anim-leaderboard-trigger' className={tw(
            'absolute left-0 top-0 w-full -z-10',
          )}>
            <div className={tw(
              'absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[2.2rem]',
              'min-w-[1600px] minlg:w-[160%]',
              'ml-[20%] minlg:ml-[-12%]'
            )}>
              <svg id="anim-leaderboard-decor" role='presentation' className={tw(
                'block w-full',
                'anim-leaderboard-row minlg:translate-y-1/4 transform-gpu',
              )} viewBox="0 0 2102 940" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M2101.5 109H1411.75L1092.92 937.603C1092.48 938.758 1093.33 940 1094.57 940H1776.57C1777.29 940 1777.94 939.554 1778.21 938.876L2101.5 109Z" fill="#F9D54C" /> <path d="M1813.92 0H1672.51C1671.78 0 1671.12 0.454143 1670.86 1.14044L1622.9 128.113C1622.47 129.267 1623.32 130.5 1624.55 130.5H1762.09C1762.8 130.5 1763.45 130.066 1763.72 129.403L1815.55 2.43016C1816.02 1.27007 1815.17 0 1813.92 0Z" fill="white" /> <path d="M992.298 109H320.963C320.233 109 319.579 109.449 319.317 110.13L0.922309 937.603C0.477803 938.758 1.33052 940 2.56831 940H684.565C685.292 940 685.944 939.554 686.208 938.876L1003.26 125.029C1006.26 117.319 1000.57 109 992.298 109Z" fill="#F9D54C" />
                <path className='anim-leaderboard-path' d="M668.42 110H582.875C582.146 110 581.492 110.449 581.23 111.13L385.923 618.603C385.478 619.758 386.331 621 387.568 621H470.683C471.41 621 472.063 620.554 472.327 619.877L670.063 112.404C670.514 111.248 669.661 110 668.42 110Z" fill="url(#paint0_linear_217_4)" /> <path d="M1655.5 109H965.752L646.922 937.603C646.478 938.758 647.331 940 648.568 940H1330.57C1331.29 940 1331.94 939.554 1332.21 938.876L1655.5 109Z" fill="url(#paint1_linear_217_4)" /> <path d="M1861.42 113H1775.88C1775.15 113 1774.49 113.449 1774.23 114.13L1578.92 621.603C1578.48 622.758 1579.33 624 1580.57 624H1663.68C1664.41 624 1665.06 623.554 1665.33 622.877L1863.06 115.404C1863.51 114.248 1862.66 113 1861.42 113Z" fill="url(#paint2_linear_217_4)" /> <path d="M1938.92 44H1797.51C1796.78 44 1796.12 44.4541 1795.86 45.1404L1747.9 172.113C1747.47 173.267 1748.32 174.5 1749.55 174.5H1887.09C1887.8 174.5 1888.45 174.066 1888.72 173.403L1940.55 46.4302C1941.02 45.2701 1940.17 44 1938.92 44Z" fill="white" /> <path d="M1285.92 34H1144.51C1143.78 34 1143.12 34.4541 1142.86 35.1404L1094.9 162.113C1094.47 163.267 1095.32 164.5 1096.55 164.5H1234.09C1234.8 164.5 1235.45 164.066 1235.72 163.403L1287.55 36.4302C1288.02 35.2701 1287.17 34 1285.92 34Z" fill="white" /> <path d="M698.916 56H557.512C556.779 56 556.122 56.4541 555.862 57.1404L507.902 184.113C507.466 185.267 508.318 186.5 509.551 186.5H647.086C647.802 186.5 648.448 186.066 648.719 185.403L700.549 58.4302C701.023 57.2701 700.169 56 698.916 56Z" fill="white" /> <path d="M845.916 25H704.512C703.779 25 703.122 25.4541 702.862 26.1404L654.902 153.113C654.466 154.267 655.318 155.5 656.551 155.5H794.086C794.802 155.5 795.448 155.066 795.719 154.403L847.549 27.4302C848.023 26.2701 847.169 25 845.916 25Z" fill="white" /> <defs> <linearGradient id="paint0_linear_217_4" x1="605.131" y1="110" x2="435.468" y2="210.923" gradientUnits="userSpaceOnUse"> <stop stopColor="#FDC416" /> <stop offset="0.583333" stopColor="#FFA233" /> </linearGradient> <linearGradient id="paint1_linear_217_4" x1="1423" y1="109" x2="1119" y2="501.5" gradientUnits="userSpaceOnUse"> <stop stopColor="#FDC416" /> <stop offset="0.583333" stopColor="#FFA233" /> </linearGradient> <linearGradient id="paint2_linear_217_4" x1="1798.13" y1="113" x2="1690.25" y2="188.205" gradientUnits="userSpaceOnUse"> <stop stopColor="#FDC416" /> <stop offset="0.583333" stopColor="#FFA233" /> </linearGradient> </defs> </svg>
            </div>
          </div>
        </div>

        {/* Block: News */}
        <div id='anim-news-trigger' className="px-3 minlg:px-14 minxxl:px-20">
          <div className='minmd:px-0 overflow-hidden'>
            <div className={tw(
              'relative z-0 px-9 py-[2.5rem] minlg:py-[3.2rem] mb-20 minlg:mb-32',
              'bg-black rounded-3xl'
            )}>
              <svg className={tw(
                'absolute -z-10 top-0 right-0',
                '-translate-y-[68px]',
                'minlg:hidden'
              )} aria-hidden="true" width="196" height="134" viewBox="0 0 196 134" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path className='anim-corner anim-corner-news' d="M112.373 19H30.3571C29.6239 19 28.9671 19.4537 28.7076 20.1394L0.903622 93.6122C0.467002 94.7659 1.31947 96 2.5531 96H82.3258C83.042 96 83.6871 95.5669 83.9582 94.904L114.006 21.4312C114.48 20.271 113.627 19 112.373 19Z" fill="white" />
                <path className='anim-corner anim-corner-news-2' d="M193.373 0H111.357C110.624 0 109.967 0.453661 109.708 1.13943L81.9036 74.6122C81.467 75.7659 82.3195 77 83.5531 77H163.326C164.042 77 164.687 76.5669 164.958 75.904L195.006 2.43123C195.48 1.27098 194.627 0 193.373 0Z" fill="white" />
                <path className='anim-corner anim-corner-news' d="M251.373 57H169.357C168.624 57 167.967 57.4537 167.708 58.1394L139.904 131.612C139.467 132.766 140.319 134 141.553 134H221.326C222.042 134 222.687 133.567 222.958 132.904L253.006 59.4312C253.48 58.271 252.627 57 251.373 57Z" fill="white" />
              </svg>
              67
              <svg className={tw(
                'absolute -z-10 top-0 right-0 max-w-[250px] minxl:max-w-none',
                'translate-x-[20px] -translate-y-[67px]',
                'hidden minlg:block'
              )} aria-hidden="true" width='402' height='225' viewBox="0 0 402 225" xmlns="http://www.w3.org/2000/svg">
                <path className='anim-corner anim-corner-news' fill='white' d="m 196.51769,0.23242 c -2.09052,0.0166 -1.6e-4,0.0288 -11.04687,0.043 -9.77623,0.0125 -24.441,0.0191 -46.4375,0.01 C 118.4882,0.27642 89.900015,0.24902 54.570425,0.20532 L 0.1192529,141.7168 c -0.44450556,1.15499 0.4086956,2.39648 1.6464844,2.39648 H 139.26183 c 0.727,0 1.37858,-0.44505 1.64258,-1.12305 z" />
                <path className='anim-corner anim-corner-news-2' fill='white' d="M 337.16418,0 H 194.81652 l -85.69726,222.7168 c -0.444,1.15499 0.40948,2.39648 1.64648,2.39648 h 137.49609 c 0.727,0 1.37858,-0.44505 1.64258,-1.12305 z" />
                <path className='anim-corner anim-corner-news' fill='white' d="M 402.02941,0.16797 335.80676,0.00781 265.11926,183.7168 c -0.444,1.15498 0.40948,2.39648 1.64648,2.39648 h 134.2793 c 0.0353,-3.56905 0.0578,-4.54761 0.10351,-10.49023 0.10001,-13.00163 0.22498,-32.40575 0.375,-61.35938 0.14425,-27.83896 0.31539,-65.79648 0.50586,-114.0957 z" />
              </svg>

              <div className='relative'>
                <h2 data-aos="fade-up" className='text-[3rem] minmd:text-[3.75rem] minxl:text-[5.125rem] minxxl:text-[7.5rem] leading-[1.0854] font-normal mb-5 text-white'>{data_v2?.newsTitle}</h2>
                <p data-aos="fade-up" data-aos-delay="100" className='text-base minlg:text-2xl minxxl:text-4xl text-[#8B8B8B] mb-[2.6rem]'>{data_v2?.newsSubtitle}</p>
              </div>

              <div className='-mx-9 overflow-hidden mb-12'>
                <div id='anim-news-content' data-aos="fade-left" className='minlg:translate-x-full minlg:transform-gpu'>
                  <Marquee gradient={false} speed={60} loop={0} play={isVisible} className="flex" style={{ flex: 'flex' }}>
                    {data_v2?.newsSlidesCollection?.items.map((preview) =>
                      <Link key={preview.slug} href={`articles/${preview.slug}`} className={tw(
                        'bg-white flex flex-col h-full rounded-lg md:mb-5 text-black',
                        'mx-[10px] minlg:mx-4 minxxl:mx-5 cursor-pointer',
                        'w-48 minlg:w-80 minxxl:w-[28rem] basis-48 minlg:basis-80 minxxl:basis-[28rem] '
                      )}>
                        <div className='before:pb-[54.129%] before:block relative overflow-hidden aspect-4/3'>
                          <BlurImage
                            fill
                            className='rounded-t-lg object-cover'
                            src={preview?.heroImage?.url}
                            alt={preview.title}
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
                              <Image fill className='object-cover rounded-full' src={preview.author?.image?.url} alt={`Image for author, ${preview.author?.name}`} />
                            </div>
                            {preview.author?.name}
                          </div>
                        </div>
                      </Link>
                    )}
                  </Marquee>
                </div>
              </div>

              <div data-aos="zoom-in" data-aos-delay="100" className='text-center'>
                <a href={data_v2?.newsCta?.link} className={tw(
                  'bg-[#F9D54C] hover:bg-[#dcaf07] drop-shadow-lg rounded-full transition-colors',
                  'inline-flex items-center justify-center h-[4rem] minxxl:h-[6rem] px-6 minxxl:px-9',
                  'text-xl minxxl:text-3xl text-black font-medium uppercase'
                )}>{data_v2?.newsCta?.title.toUpperCase()}</a>
              </div>
            </div>
          </div>
        </div>

        {/* Block: Marquee */}
        <div id='anim-ticker-trigger' className='overflow-x-hidden mb-[4.625rem] minlg:pb-[40rem] minlg:mb-[-34.3rem]'>
          <div id='anim-ticker-first' className={tw(
            'text-4xl minlg:text-7xl minxxl:text-9xl mb-2 -ml-7',
            'minlg:translate-y-96 transform-gpu'
          )}>
            <Marquee gradient={false} speed={60} loop={0} direction='right' play={isVisible} className="flex flex-row">
              {data_v2?.tags?.tags1.map((tag, index) =>
                <div key={tag} className={tw(
                  'px-2 minlg:px-10 minxxl:px-14 flex items-baseline group', index === 0 ? 'mr-2 minlg:mr-10 minxxl:mr-14': ''
                )}
                ><div role='presentation' className={tw(
                    'mr-2 minxxl:mr-3 skew-x-[-20deg]',
                    'group-hover:bg-gradient-to-b from-[#FECB02] to-[#FF9E39]',
                    'h-[2.5rem] w-[.3125rem] basis-[.3125rem] minxl:h-[.556em] minxl:w-[.0833em] minxl:basis-[.0833em]',
                    'bg-[#B2B2B2] rounded-[3px]'
                  )}></div>

                  <i className={tw(
                    'animate-text-gradient bg-[length:200%_200%]',
                    'pb-4 pr-1 bg-clip-text text-[#B2B2B2] bg-gradient-to-r from-[#FF9E39] to-[#FECB02]',
                    'transition-colors group-hover:text-transparent'
                  )}>{tag}</i>
                </div>)}
            </Marquee>
          </div>

          <div id='anim-ticker-second' className={tw(
            'text-4xl minlg:text-7xl minxxl:text-9xl mb-2',
            'minlg:translate-y-96 transform-gpu'
          )}>
            <Marquee gradient={false} speed={60} loop={0} play={isVisible} className="flex flex-row">
              {data_v2?.tags?.tags2.map((tag, index) =>
                <div key={tag} className={tw(
                  'px-3 minlg:px-10 minxxl:px-14 flex items-baseline group', index === 0 ? 'mr-2 minlg:mr-10 minxxl:mr-14': ''
                )}
                ><div role='presentation' className={tw(
                    'mr-2 minxxl:mr-3 skew-x-[-20deg]',
                    'group-hover:bg-gradient-to-b from-[#FECB02] to-[#FF9E39]',
                    'h-[2.5rem] w-[.3125rem] basis-[.3125rem] minxl:h-[.556em] minxl:w-[.0833em] minxl:basis-[.0833em]',
                    'bg-[#B2B2B2] rounded-[3px]'
                  )}></div>

                  <i className={tw(
                    'animate-text-gradient bg-[length:200%_200%] whitespace-nowrap',
                    'pb-4 pr-1 bg-clip-text text-[#B2B2B2] bg-gradient-to-r from-[#FF9E39] to-[#FECB02]',
                    'transition-colors group-hover:text-transparent'
                  )}>{tag}</i>
                </div>)}

            </Marquee>
          </div>
        </div>

        {/* Block: Profile */}
        <div id='anim-build-profile-trigger' className={tw(
          'bg-[#F9D54C] overflow-hidden minlg:translate-y-[20rem]',
          'minlg:-mb-60 minlg:pb-60'
        )}>
          <div className='px-3 minmd:px-14 minxxl:px-20 relative z-0'>
            <div className={tw(
              'pt-[5.625rem] minlg:pt-28 minxxl:pt-32 pb-[5.25rem] minxxl:pb-24 minlg:mb-24'
            )}>
              <svg role='presentation' className={tw(
                'absolute -z-10 minlg:hidden',
                'top-0 left-0 -translate-y-14',
              )} width="344" height="124" viewBox="0 0 344 124" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path className='anim-corner anim-corner-profile-1' d="M181.373 29H99.3571C98.6239 29 97.9671 29.4537 97.7076 30.1394L69.9036 103.612C69.467 104.766 70.3195 106 71.5531 106H151.326C152.042 106 152.687 105.567 152.958 104.904L183.006 31.4312C183.48 30.271 182.627 29 181.373 29Z" fill="white" />
                <path className='anim-corner anim-corner-profile-2' d="M28.3733 47H-53.6429C-54.3761 47 -55.0329 47.4537 -55.2924 48.1394L-83.0964 121.612C-83.533 122.766 -82.6805 124 -81.4469 124H-1.67419C-0.957985 124 -0.312897 123.567 -0.0417862 122.904L30.0057 49.4312C30.4802 48.271 29.6268 47 28.3733 47Z" fill="white" />
                <path className='anim-corner anim-corner-profile-5' d="M274.373 0H192.357C191.624 0 190.967 0.453661 190.708 1.13943L162.904 74.6122C162.467 75.7659 163.319 77 164.553 77H244.326C245.042 77 245.687 76.5669 245.958 75.904L276.006 2.43123C276.48 1.27098 275.627 0 274.373 0Z" fill="white" />
                <path className='anim-corner anim-corner-profile-4' d="M341.373 39H259.357C258.624 39 257.967 39.4537 257.708 40.1394L229.904 113.612C229.467 114.766 230.319 116 231.553 116H311.326C312.042 116 312.687 115.567 312.958 114.904L343.006 41.4312C343.48 40.271 342.627 39 341.373 39Z" fill="white" />
              </svg>

              <svg role='presentation' className={tw(
                'absolute -z-10 hidden minlg:block',
                '-top-10rem -right-6 w-[18.5625rem] h-[10.625rem]',
                'minlg:-top-1 minlg:-right-12 minlg:w-[37.125rem] minlg:h-[21.25rem]',
                'minxxl:-top-4 minxxl:w-[52rem] minxxl:h-[29.75rem]'
              )} viewBox="0 0 594 340" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path className='anim-corner anim-corner-profile-1' fill='white' d="M 155.03896,0.46679 34.318265,0.23242 0.11904389,89.21679 c -0.444,1.156 0.408985,2.39844 1.64648401,2.39844 H 118.36513 c 0.728,0 1.38053,-0.448 1.64453,-1.125 z" />
                <path className='anim-corner anim-corner-profile-2' fill='white' d="M 235.35927,0.2832 C 199.44407,0.2047 174.93655,0.16139 114.51552,0.00195 L 68.966705,118.51757 c -0.444,1.156 0.40753,2.39649 1.64453,2.39649 H 187.21279 c 0.728,0 1.38053,-0.448 1.64453,-1.125 z" />
                <path className='anim-corner anim-corner-profile-3' fill='white' d="M 351.91591,0 H 230.5292 l -80.41016,209.21679 c -0.444,1.155 0.40848,2.39844 1.64648,2.39844 h 116.60157 c 0.72699,0 1.37857,-0.447 1.64257,-1.125 z" />
                <path className='anim-corner anim-corner-profile-4' fill='white' d="M 594.4413,0.625 472.60537,0.21093 342.9667,337.51562 c -0.444,1.16 0.40753,2.4004 1.64453,2.4004 h 116.60156 c 0.728,0 1.38053,-0.4509 1.64453,-1.1309 z" />
              </svg>

              <div className={tw(
                'minlg:flex justify-between items-end pr-[3%]',
                'text-[calc(52px+112*(100vw-375px)/1545)] minlg:text-[4.5rem] minxl:text-[calc(52px+112*(100vw-375px)/1545)]'
              )}>
                <h2 data-aos="fade-up" data-aos-delay="100" className={tw(
                  'text-[1em] text-center minlg:text-left',
                  'text-black font-normal leading-[1.1] relative',
                  'mb-14 minlg:mb-0 minlg:pl-8 minxxl:pl-16 tracking-[-3px]'
                )}>
                  <span id='anim-build-profile-ttl-1' className='minlg:translate-y-[18rem] transform-gpu'>
                    Build
                    <span
                      className='inline-block rotate-[40deg]'
                    >
                      <BlurImage
                        width={160}
                        height={200}
                        loader={contentfulLoader}
                        className={tw(
                          'anim-build-profile-ttl-icon -translate-y-[120vw]',
                          'drop-shadow-md inline-block w-[0.8em] minxxl:w-[5.5rem]',
                          '-mt-9 minlg:-mt-7 mx-[.4em] rounded-xl',
                        )}
                        src={data_v2?.bynpTitleNfTsCollection.items[0].url}
                        alt="NFT image" />
                    </span>
                    Your
                  </span>
                  <span
                    id='anim-build-profile-ttl-2'
                    data-aos="fade-up"
                    data-aos-delay="200"
                    className={tw(
                      'block minlg:pl-12 minxl:pl-24 minlg:-mr-24 ',
                      'minlg:translate-y-[18rem] transform-gpu'
                    )}>
                    NFT
                    <span className='inline-block rotate-[40deg]'>
                      <BlurImage
                        width={160}
                        height={200}
                        loader={contentfulLoader}
                        className={tw(
                          'anim-build-profile-ttl-icon-2 -translate-y-[120vw]',
                          'drop-shadow-md inline-block w-[0.8em] minxxl:w-[5.5rem]',
                          'minlg:-mt-7 mx-[.4em] rounded-xl',
                        )}
                        src={data_v2?.bynpTitleNfTsCollection.items[1].url}
                        alt="NFT image" />
                    </span>
                    Profile
                  </span>
                </h2>
                <div className="text-center minlg:text-right pb-8 leading-[0]">
                  <svg role='presentation' className={tw(
                    'hidden minlg:block mb-[.1em] w-[3.246em] minxxl:h-[.754em]',
                    '-translate-x-[16%] minxxl:-translate-x-[20%]'
                  )} viewBox="0 0 397 93" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M1.04904e-05 0.61084L341.924 0.610877C352.896 0.610883 361.792 9.47563 361.792 20.4109V59.0953L384.119 36.7397L396.636 49.1557L352.961 92.8851L309.287 49.1557L321.804 36.7397L344.131 59.0953V20.4109C344.131 19.1958 343.143 18.2109 341.924 18.2109L0 18.2108L1.04904e-05 0.61084Z" fill="black" />
                  </svg>

                  <div data-aos="fade-down" data-aos-delay="200">
                    <svg role='presentation' className='minlg:hidden block mb-[1.875rem] mx-auto' width="33" height="96" viewBox="0 0 33 96" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" clipRule="evenodd" d="M19.8361 0C19.8361 0 19.8361 62.9869 19.8361 67.315V82.6261L28.2712 73.7779L33 78.6921L16.5 96L0 78.6921L4.72878 73.7779L13.164 82.6261V67.315V0H19.8361Z" fill="black" />
                    </svg>
                  </div>

                  <a data-aos="zoom-out" data-aos-delay="300" href={data_v2?.bynpCta?.link} className={tw(
                    'bg-[#121212] hover:bg-[#414141] transition-colors drop-shadow-lg rounded-full',
                    'inline-flex items-center justify-center text-center h-[4rem] minxxl:h-[6rem] px-6 minxxl:px-9',
                    'text-xl minxxl:text-3xl text-white font-medium uppercase'
                  )}>{data_v2?.bynpCta?.title}</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      {preview && <DynamicPreviewBanner />}
    </>
  );
};

HomePageV2Layout.getLayout = function getLayout(page) {
  return (
    <HomeLayout>
      {page}
    </HomeLayout>
  );
};

export default HomePageV2Layout;
