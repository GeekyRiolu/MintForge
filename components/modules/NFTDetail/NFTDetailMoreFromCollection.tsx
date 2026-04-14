/* eslint-disable import/no-unresolved */
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';

import { NFTCard } from 'components/modules/NFTCard/NFTCard';
import { useFetchCollectionNFTs } from 'graphql/hooks/useFetchCollectionNFTs';
import useWindowDimensions from 'hooks/useWindowDimensions';
import { Doppler, getEnv } from 'utils/env';
import { isNullOrEmpty } from 'utils/format';
import { getChainIdString } from 'utils/helpers';
import { tw } from 'utils/tw';

import { BigNumber, BigNumberish } from 'ethers';
import RightSlider from 'public/icons/right-slider.svg?svgr';
import { useState } from 'react';
import { Autoplay, Swiper as SwiperClass } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import useSWR from 'swr';
import { useNetwork } from 'wagmi';

export interface NFTDetailMoreFromCollectionProps {
  contract: string;
  collectionName: string;
  hideTokenId: BigNumberish
}

export function NFTDetailMoreFromCollection(props: NFTDetailMoreFromCollectionProps) {
  const { width: screenWidth } = useWindowDimensions();
  const [my_swiper, set_my_swiper] = useState<SwiperClass>();
  const { fetchCollectionsNFTs } = useFetchCollectionNFTs();
  const { chain } = useNetwork();
  const { data } = useSWR(() => props.contract && props.hideTokenId ? ['NFTDetailMoreFromCollection', props.contract, props.hideTokenId]: null, async () => {
    const result = await fetchCollectionsNFTs({
      chainId: getChainIdString(chain?.id) ?? getEnv(Doppler.NEXT_PUBLIC_CHAIN_ID),
      collectionAddress: props.contract,
      pageInput: {
        first: 50
      }
    });
    return result?.collectionNFTs?.items?.filter(nft => !BigNumber.from(nft?.tokenId).eq(props.hideTokenId));
  });

  if (isNullOrEmpty(data)) {
    return null;
  }

  return <div className='bg-[#ECECEC] w-screen flex items-center justify-center'>
    <div className="w-full my-10 flex items-center -px-4 minxl:max-w-nftcom minlg:max-w-[650px]">
      <div className='flex flex-col w-full px-[16px]'>
        <span className="text-2xl font-bold font-noi-grotesk mb-2">More from collection</span>
        {screenWidth >= 1200 && data?.length < 5 ?
          <div className='flex py-2 h-full items-stretch mx-auto'>
            {data?.map((nft, index) => {
              return (
                <div className={tw(
                  'NftCollectionItem flex flex-col w-72 shrink-0 cursor-pointer self-stretch mr-4',
                )} key={nft?.id ?? index}>
                  <NFTCard
                    contractAddr={props.contract}
                    tokenId={nft.tokenId}
                    name={nft.metadata.name}
                    nft={nft}
                    images={[nft.metadata.imageURL]}
                    collectionName={props.collectionName}
                    redirectTo={`/app/nft/${props.contract}/${nft.tokenId}`}
                  />
                </div>
              );
            })}
          </div>
          :
          <div className='flex py-2 h-full items-stretch relative'>
            <div className='absolute right-[-1px] top-0 bottom-0 w-[150px] z-10 lg:hidden bg-gradient-to-r from-transparent to-[#ECECEC]' />
            <div className='absolute left-[-1px] top-0 bottom-0 w-[150px] z-10 lg:hidden bg-gradient-to-l from-transparent to-[#ECECEC]' />
            <RightSlider onClick={() => {
              my_swiper.slidePrev();
            }} className='rotate-180 cursor-pointer absolute left-[-50px] lg:hidden hover:scale-105 top-1/2 bottom-1/2 z-20' />
            <RightSlider onClick={() => {
              my_swiper.slideNext();
            }} className='cursor-pointer absolute right-[-50px] lg:hidden hover:scale-105 top-1/2 bottom-1/2 z-20' />
            <Swiper
              onInit={(ev) => {
                set_my_swiper(ev);
              }}
              slidesPerView={Math.min(data?.length ?? 5, screenWidth < 600
                ? 2
                : (screenWidth >= 600 && screenWidth < 950)
                  ? (data?.length >= 3)
                    ? 4
                    : data?.length
                  : (data?.length >= 4)
                    ? 5
                    : data?.length)}
              centeredSlides={screenWidth < 600 ? false : true}
              allowSlideNext={true}
              loop={data?.length > 4}
              autoplay={{
                'delay': 4500,
                'disableOnInteraction': false
              }}
              className={tw(
                'flex overflow-y-visible',
                'h-max'
              )}
              modules={[Autoplay]}
            >
              {data?.map((nft, index) => {
                return (
                  <SwiperSlide className={tw(
                    'NftCollectionItem flex flex-col w-72 shrink-0 cursor-pointer self-stretch mr-4',
                  )} key={nft?.id ?? index}>
                    <NFTCard
                      contractAddr={props.contract}
                      tokenId={nft.tokenId}
                      name={nft.metadata.name}
                      nft={nft}
                      isOwnedByMe={nft?.isOwnedByMe}
                      listings={nft?.listings?.items || []}
                      images={[nft.metadata.imageURL]}
                      collectionName={props.collectionName}
                      redirectTo={`/app/nft/${props.contract}/${nft.tokenId}`}
                    />
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </div>
        }
      </div>
    </div>
  </div>;
}
