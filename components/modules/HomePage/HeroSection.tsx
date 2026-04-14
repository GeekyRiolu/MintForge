import BlurImage from 'components/elements/BlurImage';
import { HomePageV3Hero } from 'types/HomePage';
import { tw } from 'utils/tw';

import dynamic from 'next/dynamic';

const Player = dynamic(() =>
  import('@lottiefiles/react-lottie-player').then(mod => mod.Player)
);
import { Button, ButtonType } from 'components/elements/Button';

import { contentfulLoader } from 'lib/image/loader';
import { useRouter } from 'next/router';

export interface HomePageData {
  data: HomePageV3Hero;
}

export default function HeroSection({ data }: HomePageData) {
  const router = useRouter();

  return (
    <div id='anim-hero-trigger' className='minlg:h-screen'>
      <div className='bg-white relative flex flex-col-reverse minlg:block'>
        {/* Intro Text */}
        <div id='anim-hero-text' className={tw(
          'pt-14 pb-9 minlg:py-[4vh] px-[5vw] flex flex-col justify-center items-start',
          'minlg:w-[55%] minxl:w-[58.5%] minlg:h-screen'
        )}>
          <h2 data-aos="fade-up" data-aos-delay="100" className={tw(
            'text-[2.5rem] minmd:text-[5.2rem] minlg:text-[3.5rem] minxl:text-[6.25rem] minxxl:text-[6.8rem] leading-[1.5] minmd:leading-[1.15]',
            'text-black font-normal tracking-tight mb-8 minlg:mb-11'
          )}>
            {data?.heroTextData?.titleDrop?.firstPhrase}
            <span className='inline-block rotate-[40deg]'>
              <BlurImage
                className={tw(
                  'anim-profile-icon -translate-y-[120vw] transition transform duration-[2s]',
                  'drop-shadow-md inline-block w-[2.5rem] minmd:w-[4.825rem]',
                  'mx-[1.8rem] minxxl:mx-[2.2rem] -my-[.5rem] rounded-xl'
                )}
                width={120}
                height={120}
                loader={contentfulLoader}
                src={data?.heroImagesCollection?.items[0]?.url}
                alt='NFT image'
              />
            </span>
            <br />
            {data?.heroTextData?.titleDrop?.secondPhrase}
            <span className='inline-block rotate-[40deg]'>
              <BlurImage
                className={tw(
                  'anim-profile-icon -translate-y-[120vw] transition transform duration-[2s] delay-200',
                  'drop-shadow-md inline-block w-[2.5rem] minmd:w-[4.825rem]',
                  'mx-[1.8rem] minxxl:mx-[2.2rem] -my-[.5rem] rounded-xl',
                )}
                width={120}
                height={120}
                loader={contentfulLoader}
                src={data?.heroImagesCollection?.items[1]?.url}
                alt='NFT image'
              />
            </span>
            <span
              data-aos='fade-left'
              data-aos-delay='200'
              className='bg-gradient-to-r from-[#FBC214] to-[#FF9C38] bg-clip-text text-transparent'
            >
              {data?.heroTextData?.titleDrop?.thirdPhrase}
            </span>
          </h2>

          <p className='mb-9 text-xl'>{data?.heroTextData?.subTitle}</p>

          <div>
            <Button
              data-aos='zoom-out'
              data-aos-delay='300'
              type={ButtonType.WEB_SECONDARY}
              label={data?.heroTextData?.ctaButton}
              stretch
              onClick={() => router.push(`/${data?.heroTextData?.ctaLink}`)}
            />
          </div>
        </div>

        {/* Hero */}
        <div id='anim-hero' data-aos="fade-up" data-aos-delay="200" className={tw(
          'minlg:max-w-[45%] minxl:max-w-[41.5%] w-full minlg:h-[calc(100vh+5px)] bg-[#F9D54C]',
          'relative minlg:absolute z-[10] minlg:right-0 minlg:top-0 overflow-hidden',
          'before:block before:pb-[90%] minmd:before:pb-[80%] minlg:before:pb-[60%] minlg:before:hidden'
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
                src='/anim/cycle.json'
                style={{ height: '85vw', width: '85vw' }}
                // renderer={'canvas'}
              ></Player>
            </div>
          </div>

          <div
            className={tw(
              'absolute inset-0 px-4',
              'flex items-center justify-center'
            )}
          >
            <div
              id='anim-hero-caption'
              className={tw(
                'transform-gpu minlg:scale-[.57] minxxl:scale-[.58]',
                'h-[1.667em] bg-[#121212] px-[.375em] drop-shadow-lg',
                'relative z-20 minlg:px-7 minxxl:px-10',
                'text-[calc(42px+112*(100vw-375px)/1545)]',
                'rounded-full leading-none tracking-tight'
              )}
            >
              {/* Placeholder the broadest word */}
              <div className='flex text-transparent'>
                NFT.COM
                <div
                  role='presentation'
                  className={tw(
                    'mx-2 minlg:mx-4 minxxl:mx-8',
                    'h-[.68em] w-[.1081em] basis-[.1081em]'
                  )}
                ></div>
                PLANTS
              </div>

              <div
                className={tw(
                  'absolute inset-x-4 bottom-0 top-0 minlg:inset-x-7 minxxl:inset-x-10',
                  'flex text-white'
                )}
              >
                {data?.dynamicUrls?.map(word => (
                  <a
                    key={word}
                    href={'/app/mint-profiles'}
                    className='anim-profile-link flex items-center justify-center text-center'
                  >
                    <span className='text-white/40'>NFT.COM</span>
                    <span
                      role='presentation'
                      className={tw(
                        'mx-2 -mb-[.1em] skew-x-[-20deg] minlg:mx-4 minxxl:mx-8',
                        'bg-gradient-to-b from-[#FECB02] to-[#FF9E39]',
                        'h-[.68em] w-[.1081em] basis-[.1081em] rounded-[3px]'
                      )}
                    ></span>
                    {word.toUpperCase()}
                  </a>
                ))}
              </div>
            </div>

            <span
              role='presentation'
              id='anim-hero-shadow-light'
              className={tw(
                'opacity-1',
                'absolute bottom-0 left-0 z-10 bg-img-shadow-light',
                'pointer-events-none h-[41.25rem] w-full'
              )}
            ></span>
            <span
              role='presentation'
              id='anim-hero-shadow-dark'
              className={tw(
                'opacity-0',
                'absolute bottom-0 left-0 z-10 bg-img-shadow-dark',
                'pointer-events-none h-[28.75rem] w-full'
              )}
            ></span>
          </div>
        </div>
      </div>
    </div>
  );
}
