import { Nft, ProfileQuery } from 'graphql/generated/types';
import { tw } from 'utils/tw';

import Loader from './Loader/Loader';
import { RoundedCornerMedia, RoundedCornerVariant } from './RoundedCornerMedia';

import { BigNumber } from 'ethers';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { PartialDeep } from 'type-fest';

interface FeaturedProfileProps {
  profileOwner: ProfileQuery;
  gkId: number;
  featuredNfts: PartialDeep<Nft>[];
}

export const FeaturedProfile = (props: FeaturedProfileProps) => {
  const router = useRouter();

  return (
    <div className='w-full h-full text-body text-[#6F6F6F] font-noi-grotesk leading-body font-header drop-shadow-2xl py-4 minlg:py-12'>
      <p className='minlg:mb-2 mb-4'>Featured Profile</p>
      <div className='flex flex-col bg-[#B0AFAF26]/20 rounded-md backdrop-blur-xl px-4 py-6 max-w-[578px] minmd:max-w-[478px]'>
        <div className='flex flex-row items-center cursor-pointer mb-5' onClick={() => router.push(`/${props.profileOwner.profile.url}`)}>
          <div className="h-10 w-10 mr-2 mt-0.5">
            {
              props.profileOwner ?
                <Link href={props.profileOwner.profile.url}>
                  <Image
                    src={props.profileOwner?.profile?.photoURL ?? 'https://cdn.nft.com/profile-image-default.svg'}
                    alt='featured profile main image'
                    className="rounded-full"
                    width="40"
                    height="40"
                  />
                </Link>
                :
                <Loader />
            }
          </div>
          <p className="text-[#6F6F6F] font-noi-grotesk text-xl">
            {props?.profileOwner?.profile?.url}
          </p>
        </div>
        <div className={tw(
          'grid minmd:grid-cols-2 grid-cols-none minmd:grid-rows-[49%_49%] grid-rows-1',
          'minmd:gap-2 gap-4 grid-flow-col minmd:grid-flow-row',
          'minmd:auto-cols-auto auto-cols-[90%]',
          'overflow-x-auto',
          'minmd:min-h-[250px] min-h-[410px] minmd:max-h-[400px] max-h-max',
          'minmd:overscroll-auto overscroll-x-contain'
        )}>
          <Link href={`/app/nft/${props.featuredNfts[0]?.contract}/${props.featuredNfts[0]?.tokenId}`} passHref legacyBehavior>
            <a className='flex flex-col w-full minmd:row-span-2 row-auto minmd:aspect-auto aspect-square minmd:h-auto h-full'>
              <RoundedCornerMedia priority={true} src={props.featuredNfts[0]?.previewLink || props.featuredNfts[0]?.metadata?.imageURL} variant={RoundedCornerVariant.None} extraClasses='relative rounded-t-md object-cover' containerClasses='h-full w-full' />
              {props.featuredNfts[0] && (
                <div className='bg-white rounded-b-md px-3 py-2'>
                  <p className='text-xxs2 text-[#727272] '>{props.featuredNfts[0]?.metadata?.name || '#' + BigNumber.from(props.featuredNfts[0]?.tokenId).toString()}</p>
                  <p className='text-black text-sm -mt-1'>{props.featuredNfts[0]?.metadata?.name || '#' + BigNumber.from(props.featuredNfts[0]?.tokenId).toString()}</p>
                </div>
              )}
            </a>
          </Link>
          <div className='h-full w-full row-span-1 col-span-1'>
            <Link href={`/app/nft/${props.featuredNfts[1]?.contract}/${props.featuredNfts[1]?.tokenId}`} passHref legacyBehavior>
              <a className='flex flex-col w-full row-auto minmd:aspect-auto aspect-square h-full justify-start'>
                <RoundedCornerMedia priority={true} src={props.featuredNfts[1]?.previewLink || props.featuredNfts[1]?.metadata?.imageURL} variant={RoundedCornerVariant.None} extraClasses='relative rounded-t-md object-cover' containerClasses='h-full max-h-[77%] sm:max-h-full sm:w-full' />
                {props.featuredNfts[1] && (
                  <div className='bg-white rounded-b-md minmd:px-3 minmd:py-1 px-3 py-2 max-h-[50%] h-max overflow-hidden truncate ...'>
                    <p className='minmd:text-xxs4 text-xxs2 text-[#727272] truncate'>{props.featuredNfts[1]?.metadata?.name || '#' + BigNumber.from(props.featuredNfts[1]?.tokenId).toString()}</p>
                    <p className='text-black text-sm minmd:text-xs -mt-1 truncate'>{props.featuredNfts[1]?.metadata?.name || '#' + BigNumber.from(props.featuredNfts[1]?.tokenId).toString()}</p>
                  </div>
                )}
              </a>
            </Link>
          </div>
          <div className='h-full w-full row-span-1 col-span-1'>
            <Link href={`/app/nft/${props.featuredNfts[2]?.contract}/${props.featuredNfts[2]?.tokenId}`} passHref legacyBehavior>
              <a className='flex flex-col w-full row-auto minmd:aspect-auto aspect-square h-full justify-end'>
                <RoundedCornerMedia priority={true} src={props.featuredNfts[2]?.previewLink || props.featuredNfts[2]?.metadata?.imageURL} variant={RoundedCornerVariant.None} extraClasses='relative rounded-t-md object-cover' containerClasses='h-full max-h-[77%] sm:max-h-full sm:w-full' />
                {props.featuredNfts[2] && (
                  <div className='bg-white rounded-b-md minmd:px-3 minmd:py-1 px-3 py-2 max-h-[50%] h-max truncate ...'>
                    <p className='minmd:text-xxs4 text-xxs2 text-[#727272] truncate'>{props.featuredNfts[2]?.metadata?.name || '#' + BigNumber.from(props.featuredNfts[2]?.tokenId).toString()}</p>
                    <p className='text-black text-sm minmd:text-xs -mt-1  truncate'>{props.featuredNfts[2]?.metadata?.name || '#' + BigNumber.from(props.featuredNfts[2]?.tokenId).toString()}</p>
                  </div>
                )}
              </a>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
