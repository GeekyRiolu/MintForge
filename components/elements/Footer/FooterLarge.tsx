/* eslint-disable @next/next/no-img-element */
import Toast from 'components/elements/Toast';
import { useEmailSubscribe } from 'hooks/useEmailSubscribe';
import { useMyNftProfileTokens } from 'hooks/useMyNftProfileTokens';
import { useOwnedGenesisKeyTokens } from 'hooks/useOwnedGenesisKeyTokens';
import { Doppler, getEnvBool } from 'utils/env';
import { filterNulls, isNullOrEmpty } from 'utils/format';
import { cl,tw } from 'utils/tw';

import AOS from 'aos';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/router';
import DiscordLogo from 'public/icons/discord.svg?svgr';
import TwitterLogo from 'public/icons/twitter.svg?svgr';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useAccount } from 'wagmi';

const BlurImage = dynamic(import('components/elements/BlurImage'));

gsap.registerPlugin(ScrollTrigger);

export const FooterLarge = () => {
  const { subscribe } = useEmailSubscribe();
  const { address: currentAddress } = useAccount();
  const { data: ownedGKTokens } = useOwnedGenesisKeyTokens(currentAddress);
  const { profileTokens } = useMyNftProfileTokens();
  const [email, setEmail] = useState<string>('');
  const router = useRouter();
  const location = router && router?.pathname;
  const isValidEmail = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/g;

  useEffect(() => {
    AOS.init({
      disable: function() {
        const maxWidth = 900;
        return window.innerWidth >= maxWidth;
      },
      duration : 700
    });

    ScrollTrigger.saveStyles('#footer-content');
    const matchMedia = gsap.matchMedia();

    matchMedia.add('(min-width: 900px)', () => {
      gsap.timeline({
        scrollTrigger: {
          trigger: '.page-footer',
          start: '45% bottom',
          end: '+=30px',
          toggleActions: location === '/' ? 'play none reverse none' : 'none none none none',
        }
      })
        .to('#footer-content', {
          y: 0,
          duration: 2,
          ease: 'power2.out'
        });
    });
  });

  const footerData = [
    {
      title: 'Learn',
      links: filterNulls([
        !isNullOrEmpty(ownedGKTokens) || !isNullOrEmpty(profileTokens)
          ? {
            name: 'Vault',
            link: '/app/vault',
            newTab: false,
          }
          : null,
        {
          name: 'Docs',
          link: 'https://docs.nft.com',
          newTab: true,
        },
        {
          name: 'Blog',
          link: '/articles',
          newTab: false,
        },
        {
          name: 'What is an NFT?',
          link: '/articles/what-is-an-nft',
          newTab: false,
        },
      ])
    },
    {
      title: 'Resources',
      links: [
        {
          name: 'Support',
          link: 'https://support.nft.com',
          newTab: true,
        },
        {
          name: 'Careers',
          link: 'https://www.linkedin.com/jobs/search/?currentJobId=3361499885&f_C=71294367%2C79896685',
          newTab: true,
        },
        {
          name: 'Business Inquiries',
          link: 'mailto:info@nft.com',
          newTab: true,
        },
      ]
    },
    {
      title: 'Policies',
      links: [
        {
          name: 'Terms of Service',
          link: 'https://cdn.nft.com/nft_com_terms_of_service.pdf',
          newTab: true,
        },
        {
          name: 'Privacy Policy',
          link: 'https://cdn.nft.com/nft_com_privacy_policy.pdf',
          newTab: true,
        },
        {
          name: 'Bug Bounty',
          link: 'mailto:bugbounty@nft.com?subject=Bug Bounty for NFT.com ' + new Date().toLocaleDateString(),
          newTab: true,
        },
      ]
    },
    {
      title: 'Social',
      links: [
        {
          name: 'Discord',
          link: 'https://nft.com',
          newTab: true,
        },
        {
          name: 'Twitter',
          link: 'https://twitter.com/nftcomofficial',
          newTab: true,
        },
      ]
    },
  ];

  const fixFooter = [
    '/app/mint-profiles'
  ];

  if(getEnvBool(Doppler.NEXT_PUBLIC_HP_V3_ENABLED)) {
    return (
      <footer id="FooterContainer" className={cl('page-footer overflow-hidden bg-[#282828]', { '-mt-[4.3rem] z-50': fixFooter?.includes(location) && location !== '/' })}>
        <Toast />
        <div id='footer-content' className={tw(
          'font-noi-grotesk text-primary-txt-dk relative',
          'bg-black rounded-t-3xl minlg:rounded-none'
        )}>
          <div className={tw(
            'minlg:flex minlg:flex-row relative justify-between',
            'pt-14 pb-10 px-5 minlg:pl-0 minlg:pr-32'
          )}>
            <div className={tw(
              'minlg:max-w-[50%] minlg:flex-shrink-0 minlg:basis-2/4 flex flex-col',
              'items-start justify-between text-base minlg:pl-14 minlg:pt-[2.35rem]'
            )}>
              {/* Logo */}
              <div data-aos="fade-right" data-aos-delay="100" className='flex items-center mb-[2.625rem] minlg:mb-0'>
                <Link href='/' passHref>
                  <div className='w-[3.8rem] h-[3.8rem]'>
                    <BlurImage
                      src='/icons/LogoFooterWhite.svg'
                      alt='NFT.com white footer logo'
                      localImage
                      width={60}
                      height={60}
                      className='w-[3.8rem] h-[3.8rem] justify-start'
                    />
                  </div>
                </Link>

                <svg className='ml-3' width="87" height="23" viewBox="0 0 63 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16.3704 0.875H19.9551V17.1235H16.3704L3.51321 5.26179L3.58454 7.83843V17.1235H-6.10352e-05V0.875H3.58454L16.4418 12.7603L16.3704 10.1601V0.875Z" fill="white" />
                  <path d="M26.3558 10.393V17.125H22.7712V0.875H40.9113V4.12529H26.3574V7.14268H39.4787V10.393H26.3558Z" fill="white" />
                  <path d="M54.6126 4.12529V17.125H51.028V4.12529H43.1409V0.875H62.4996V4.12529H54.6126Z" fill="white" />
                </svg>
              </div>

              {/* Socials */}
              <div className='flex gap-4'>
                <a data-aos="fade-left" data-aos-delay="200" className={tw(
                  'transition-colors text-white hover:text-[#F9D54C]'
                )}
                target="_blank" href="https://twitter.com/NFTcomofficial" rel="noopener noreferrer">
                  <TwitterLogo className={tw(
                    'w-7 h-7 minxxl:w-9 minxxl:h-9'
                  )} viewBox="0 0 38 32" fill="currentColor" />
                </a>
                <a data-aos="fade-left" data-aos-delay="300" className={tw(
                  'transition-colors text-white hover:text-[#F9D54C]'
                )}
                target="_blank" href="https://nft.com" rel="noopener noreferrer">
                  <DiscordLogo className={tw(
                    'w-7 h-7 minxxl:w-9 minxxl:h-9'
                  )} viewBox="0 0 39 38" fill="currentColor" />
                </a>
              </div>
            </div>

            {/* Nav */}
            <div data-aos="fade-up" data-aos-delay="100" className="w-full minlg:w-1/2 grid minmd:grid-cols-3 grid-cols-2 minmd:pb-14">
              {filterNulls(footerData).slice(0, 3).map((item, index) => {
                return (
                  <div className={tw(
                    'text-base minxxl:text-xl mt-12 minlg:mt-0 minmd:pl-[35%] minlg:pl-0',
                    index === 3 && 'col-start-2 minlg:row-auto minlg:col-auto',
                  )} key={index}>
                    <span className="font-medium text-[0.9375rem] minxxl:text-[1.5rem]">
                      {item.title}
                    </span>
                    <div className='flex flex-col'>
                      {item.links?.map((item, index) => {
                        return (
                          <Link
                            href={item.link}
                            key={index}
                            legacyBehavior
                          >
                            {item.newTab ?
                              <a
                                target="_blank"
                                rel="noreferrer noopener"
                                className="mt-4 cursor-pointer text-[#8B8B8B] hover:text-white"
                              >
                                {item.name}
                              </a>
                              :
                              <a
                                className="mt-4 cursor-pointer text-[#8B8B8B] hover:text-white"
                              >
                                {item.name}
                              </a>
                            }
                          </Link>
                        );
                      })}
                    </div>
                  </div>);
              })}
            </div>
          </div>

          <div className={tw(
            'flex flex-col minlg:flex-row justify-between',
            'relative px-5 minlg:pl-0 minlg:pr-32'
          )}>
            <div data-aos="fade-right" data-aos-delay="200" className={tw(
              'w-full text-sm minxxl:text-lg text-[#8B8B8B] minlg:pl-14',
              'order-1 minlg:-order-1'
            )}>
              <p className='mb-6 minlg:mb-[6.8rem]'>© {new Date().getFullYear()} NFT.com. <br className='minlg:hidden' /> All rights reserved</p>
              <span className={tw(
                '-skew-x-[20deg] w-[115px] h-[110px] bg-[#F9D54C] block',
                'mr-5 ml-auto minlg:ml-24 minlg:mr-0'
              )}></span>
            </div>

            <div data-aos="fade-up" data-aos-delay="100" className='w-full minlg:max-w-[50%] minlg:pt-[4.5rem] flex-shrink-0 basis-2/4'>
              <h4 className='minlg:text-[.9375rem] minxxl:text-[1.5rem] mb-4 text-[#8B8B8B]'>Subscribe to our notifications</h4>

              <div className='flex border-b border-b-[#2A2A2A] pb-4'>
                <input type="email" placeholder='Enter your email' value={email} onChange={(e) => setEmail(e.target.value)} className={tw(
                  'minxxl:text-xl',
                  'text-key-gray placeholder:text-key-gray/80',
                  'focus:border-transparent focus:ring-0 focus:placeholder:text-key-gray/80',
                  'bg-transparent border-none px-0 w-full',
                  'shadow-none focus:border-transparent focus:ring-0'
                )} />
                <button
                  disabled={!email.match(isValidEmail)}
                  type="submit"
                  onClick={async () => {
                    await subscribe(email)
                      .then(() => {
                        setEmail('');
                        toast.success('Success! Please check your email to verify ownership.');
                      })
                      .catch(() => toast.error('Error while submitting email'));
                  }}
                  className={tw(
                    'text-sm minxxl:text-lg',
                    'rounded-full border-2 border-white',
                    'px-4 h-9 minxxl:px-6 minxxl:h-11 ml-6',
                    'transition-colors hover:bg-white hover:text-black'
                  )}>
                  Subscribe
                </button>
              </div>
              <span className='text-[.875rem] minlg:text-xs minxxl:text-sm text-key-gray/50 block pt-3 mb-[3.75rem] minlg:mb-0'>Subscribe to our notifications</span>
            </div>
          </div>
        </div>
      </footer>
    );
  } else {
    return (
      <footer id="FooterContainer" className={`page-footer overflow-hidden ${location === '/' ? '-mt-9 minlg:-mt-[20.8rem]' : fixFooter?.includes(location) ? '-mt-[4.3rem] z-50' : ''}`}>
        <Toast />
        <div id='footer-content' className={tw(
          'font-noi-grotesk text-primary-txt-dk relative',
          'bg-black rounded-t-[40px] minlg:rounded-t-[75px]',
          'transform-gpu',
          location === '/' && 'minlg:translate-y-1/3 minxl:translate-y-1/2'
        )}>
          <div className={tw(
            'minlg:flex minlg:flex-row relative justify-between',
            'pt-16 pb-10 px-5 minlg:pl-0 minlg:pr-32'
          )}>
            <div className={tw(
              'minlg:max-w-[50%] minlg:flex-shrink-0 minlg:basis-2/4 flex flex-col',
              'items-start justify-between text-base minlg:pl-14 minlg:pt-[2.35rem]'
            )}>
              {/* Logo */}
              <div data-aos="fade-right" data-aos-delay="100" className='flex items-center mb-[2.625rem] minlg:mb-0'>
                <Link href='/' passHref>
                  <div className='w-[3.8rem] h-[3.8rem]'>
                    <BlurImage
                      src='/icons/LogoFooterWhite.svg'
                      alt='NFT.com white footer logo'
                      localImage
                      width={60}
                      height={60}
                      className='w-[3.8rem] h-[3.8rem] justify-start'
                    />
                  </div>
                </Link>

                <svg className='ml-3' width="87" height="23" viewBox="0 0 63 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16.3704 0.875H19.9551V17.1235H16.3704L3.51321 5.26179L3.58454 7.83843V17.1235H-6.10352e-05V0.875H3.58454L16.4418 12.7603L16.3704 10.1601V0.875Z" fill="white" />
                  <path d="M26.3558 10.393V17.125H22.7712V0.875H40.9113V4.12529H26.3574V7.14268H39.4787V10.393H26.3558Z" fill="white" />
                  <path d="M54.6126 4.12529V17.125H51.028V4.12529H43.1409V0.875H62.4996V4.12529H54.6126Z" fill="white" />
                </svg>
              </div>

              {/* Socials */}
              <div className='flex gap-4'>
                <a data-aos="fade-left" data-aos-delay="200" className={tw(
                  'transition-colors text-white hover:text-[#F9D54C]'
                )}
                target="_blank" href="https://twitter.com/NFTcomofficial" rel="noopener noreferrer">
                  <TwitterLogo className={tw(
                    'w-7 h-7 minxxl:w-9 minxxl:h-9'
                  )} viewBox="0 0 38 32" fill="currentColor" />
                </a>
                <a data-aos="fade-left" data-aos-delay="300" className={tw(
                  'transition-colors text-white hover:text-[#F9D54C]'
                )}
                target="_blank" href="https://nft.com" rel="noopener noreferrer">
                  <DiscordLogo className={tw(
                    'w-7 h-7 minxxl:w-9 minxxl:h-9'
                  )} viewBox="0 0 39 38" fill="currentColor" />
                </a>
              </div>
            </div>

            {/* Nav */}
            <div data-aos="fade-up" data-aos-delay="100" className="w-full minlg:w-1/2 grid minmd:grid-cols-3 grid-cols-2 minmd:pb-14">
              {filterNulls(footerData).slice(0, 3).map((item, index) => {
                return (
                  <div className={tw(
                    'text-base minxxl:text-xl mt-12 minlg:mt-0 minmd:pl-[35%] minlg:pl-0',
                    index === 3 && 'col-start-2 minlg:row-auto minlg:col-auto',
                  )} key={index}>
                    <span className="font-medium text-[0.9375rem] minxxl:text-[1.5rem]">
                      {item.title}
                    </span>
                    <div className='flex flex-col'>
                      {item.links?.map((item, index) => {
                        return (
                          <Link
                            href={item.link}
                            key={index}
                            legacyBehavior
                          >
                            {item.newTab ?
                              <a
                                target="_blank"
                                rel="noreferrer noopener"
                                className="mt-4 cursor-pointer text-[#8B8B8B] hover:text-white"
                              >
                                {item.name}
                              </a>
                              :
                              <a
                                className="mt-4 cursor-pointer text-[#8B8B8B] hover:text-white"
                              >
                                {item.name}
                              </a>
                            }
                          </Link>
                        );
                      })}
                    </div>
                  </div>);
              })}
            </div>
          </div>

          <div className={tw(
            'flex flex-col minlg:flex-row justify-between',
            'relative px-5 minlg:pl-0 minlg:pr-32'
          )}>
            <div data-aos="fade-right" data-aos-delay="200" className={tw(
              'w-full text-sm minxxl:text-lg text-[#8B8B8B] minlg:pl-14',
              'order-1 minlg:-order-1'
            )}>
              <p className='mb-6 minlg:mb-[6.8rem]'>© {new Date().getFullYear()} NFT.com. <br className='minlg:hidden' /> All rights reserved</p>
              <span className={tw(
                '-skew-x-[20deg] w-[115px] h-[110px] bg-[#F9D54C] block',
                'mr-5 ml-auto minlg:ml-24 minlg:mr-0'
              )}></span>
            </div>

            <div data-aos="fade-up" data-aos-delay="100" className='w-full minlg:max-w-[50%] minlg:pt-[4.5rem] flex-shrink-0 basis-2/4'>
              <h4 className='minlg:text-[.9375rem] minxxl:text-[1.5rem] mb-4 text-[#8B8B8B]'>Subscribe to our notifications</h4>

              <div className='flex border-b border-b-[#2A2A2A] pb-4'>
                <input type="email" placeholder='Enter your email' value={email} onChange={(e) => setEmail(e.target.value)} className={tw(
                  'minxxl:text-xl',
                  'text-key-gray placeholder:text-key-gray/80',
                  'focus:border-transparent focus:ring-0 focus:placeholder:text-key-gray/80',
                  'bg-transparent border-none px-0 w-full',
                  'shadow-none focus:border-transparent focus:ring-0'
                )} />
                <button
                  disabled={!email.match(isValidEmail)}
                  type="submit"
                  onClick={async () => {
                    await subscribe(email)
                      .then(() => {
                        setEmail('');
                        toast.success('Success! Please check your email to verify ownership.');
                      })
                      .catch(() => toast.error('Error while submitting email'));
                  }}
                  className={tw(
                    'text-sm minxxl:text-lg',
                    'rounded-full border-2 border-white',
                    'px-4 h-9 minxxl:px-6 minxxl:h-11 ml-6',
                    'transition-colors hover:bg-white hover:text-black'
                  )}>
                  Subscribe
                </button>
              </div>
              <span className='text-[.875rem] minlg:text-xs minxxl:text-sm text-key-gray/50 block pt-3 mb-[3.75rem] minlg:mb-0'>Subscribe to our notifications</span>
            </div>
          </div>
        </div>
      </footer>
    );
  }
};
