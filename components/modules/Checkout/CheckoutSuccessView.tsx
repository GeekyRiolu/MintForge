/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Button, ButtonSize, ButtonType } from 'components/elements/Button';
import { RoundedCornerMedia, RoundedCornerVariant } from 'components/elements/RoundedCornerMedia';
import { useMyNftProfileTokens } from 'hooks/useMyNftProfileTokens';
import { tw } from 'utils/tw';

import { NFTListingsContext, StagedListing } from './NFTListingsContext';
import { NFTPurchasesContext } from './NFTPurchaseContext';
import { PartialErrorView } from './PartialErrorView';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { Check } from 'phosphor-react';
import NullProfile from 'public/icons/null_profile.svg?svgr';
import { useContext } from 'react';

const BlurImage = dynamic(import('components/elements/BlurImage'));

export enum SuccessType {
  Purchase = 'Purchase',
  Listing = 'Listing'
}
export interface CheckoutSuccessViewProps {
  userAddress: string;
  type: SuccessType;
  subtitle?: string;
  hasError?: boolean;
  onClose: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function CheckoutSuccessView(props: CheckoutSuccessViewProps) {
  const { profileTokens: myOwnedProfileTokens } = useMyNftProfileTokens();
  const router = useRouter();
  const {
    clear,
    closeCartSidebar,
    toList,
  } = useContext(NFTListingsContext);

  const {
    toBuy,
    toBuyNow,
    buyNowActive,
  } = useContext(NFTPurchasesContext);

  const list = props.type === SuccessType.Listing ? toList : buyNowActive ? toBuyNow : toBuy;

  const images = () => {
    if (list.length == 1) {
      return <div className='relative'>
        <RoundedCornerMedia
          containerClasses='w-[130px] h-[130px] mb-10 z-10'
          src={list[0]?.nft?.metadata?.imageURL}
          variant={RoundedCornerVariant.Success}
        />
        <Check className={'absolute top-[-12px] right-[-12px] z-20 h-7 w-7 p-1 text-white font-medium aspect-square shrink-0 rounded-full -ml-4 bg-[#26AA73]'} />
      </div>;
    } else if (list.length > 1) {
      return <div className='relative'>
        <div className='flex flex-row justify-center items-center ml-16 mb-5'>
          {/* @ts-ignore */}
          {list?.filter((_, index) => index < 3).map((item, i) =>
            <RoundedCornerMedia
              key={i}
              containerClasses={`w-[${130 - (i * 10)}px] h-[${130 - (i * 10)}px] z-${50 - i * 10} -ml-16 shadow-xl`}
              src={item?.nft?.metadata?.imageURL}
              variant={RoundedCornerVariant.Success}
            />
          )}
          {list.length > 3 &&
            <div className='flex items-center justify-end w-[90px] h-[90px] z-10 -ml-16 pr-2 bg-[#F9D54C] rounded-[18px]'>
              +{list.length - 3}
            </div>
          }
        </div>
        <Check className={`absolute ${list.length >= 3 ? 'top-0' : 'top-[-10px]'} right-[-13px] z-[100] h-7 w-7 p-1 text-white font-medium aspect-square shrink-0 rounded-full -ml-4 bg-[#26AA73]`} />
      </div>;
    }
  };

  const message = () => {
    const nfts = props.hasError ? (list as StagedListing[]).filter((item) => item.targets.some(target => !target.listingError)) : list;
    return nfts.length > 1 ?
      `You have successfully ${props.type == SuccessType.Listing ? 'listed' : 'purchased'} ${list.length} NFTs` :
      `You have successfully ${props.type == SuccessType.Listing ? 'listed your' : 'purchased a'} NFT`;
  };

  return myOwnedProfileTokens?.length > 0 ?
    <div className={tw(
      'flex md:flex-col items-center h-screen font-noi-grotesk overflow-auto',
      props?.hasError ? 'h-full minlg:max-h-[744px] min-h-[650px]' : 'h-[596px] md:h-screen'
    )}>
      <div onClick={() => router.push('/app/mint-profiles')} className='md:hidden absolute bottom-5 left-7 hover:cursor-pointer underline text-[16px] z-50 font-medium flex items-center'>
        <NullProfile className='mr-2' />Create a NFT Profile
      </div>
      <div className="relative bg-gradient-to-br from-[#FAC213] to-[#FF9B37] md:w-full h-full md:h-2/5 w-2/5 left-0">
        <div className='w-full flex items-center justify-center'>
          <BlurImage alt='desktop success profile background' src='/images/desktop_success_profile.webp' className="md:h-auto md:w-2/5 h-full w-full shrink-0 object-cover" fill />
        </div>
        <div className='hidden relative md:flex items-center justify-center'>
          <div onClick={() => router.push('/app/mint-profiles')} className='flex absolute bottom-2 hover:cursor-pointer underline text-[16px] z-50 font-medium items-center'>
            <NullProfile className='mr-2' />Create a NFT Profile
          </div>
        </div>
      </div>
      <div className="relative md:w-full h-full md:h-max w-3/5 right-0">
        <div className={tw(
          'flex flex-col items-center justify-center h-full w-full md:mt-5 px-10',
          props?.hasError && 'pt-14 pb-3'
        )}>
          {!props.hasError && images()}
          <div className='text-[34px] font-medium'>Congratulations!</div>
          <div className='text-[18px] font-medium mt-4'>{message()}</div>
          <div className='text-[16px] mt-10'>Let&apos;s continue your web3 journey</div>
          <Button
            size={ButtonSize.LARGE}
            type={ButtonType.PRIMARY}
            label='Share'
            onClick={() => {
              closeCartSidebar();
              props.onClose();
              router.push(`/app/nft/${list[0]?.nft?.contract}/${list[0]?.nft?.tokenId}`);
              window.open(
                'https://twitter.com/intent/tweet?' +
              'text=' +
              encodeURIComponent(
                `Check out my latest NFT ${props.type == SuccessType.Listing ? 'listing' : 'purchase'}: ` +
                'https://' + window.location.host + '/app/nft/' + list[0]?.nft?.contract + '/' + list[0]?.nft?.tokenId
              ),
                '_blank'
              );
            }}
          />
          <div onClick={() => {
            closeCartSidebar();
            props.onClose();
            props.type == SuccessType.Listing ?
              router.push('/app/assets') :
              router.push('/app/discover/nfts');
          }} className='text-[#E4BA18] font-medium underline text-[14px] cursor-pointer'>{props.type == SuccessType.Listing ? 'List' : 'Purchase'} another NFT</div>
          {props.hasError && (
            <div className='w-full flex flex-col space-y-[10px] p-[10px] rounded border border-[#ECECEC] overflow-auto mt-3 min-h-[200px]'>
              {list.map((item) => <PartialErrorView key={item.id} listing={item} />)}
            </div>
          )
          }
        </div>
      </div>
    </div> :
    <div className="flex flex-col items-center h-[646px] md:h-screen font-noi-grotesk">
      <div className="relative z-10 bg-gradient-to-br from-[#FAC213] to-[#FF9B37] w-full h-2/5 top-0">
        <div className='w-full flex items-center justify-center'>
          <BlurImage alt='desktop no profile background' src='/images/desktop_no_profile.webp' className='h-full w-full shrink-0 object-cover' />
        </div>
      </div>
      <div className="relative w-full h-3/5 bottom-0 z-20 bg-white">
        <div className='flex flex-col items-center justify-center md:justify-start md:pt-10 h-full w-full px-10'>
          <div className='text-[30px] font-medium text-center w-[380px] mt-10 md:mt-0 md:w-full md:text-[26px]'>
            Get access to lower fees by creating an NFT Profile
          </div>
          <div className='text-[18px] font-medium mt-4'>{message()}</div>
          <div className='w-[277px] flex flex-col text-[16px] mt-6 mb-8'>
            <div className='flex item-center py-3 justify-between'>
              <div className='text-[#6A6A6A]'>With an NFT Profile</div>
              <div className='font-medium text-transparent bg-clip-text bg-gradient-to-br from-[#FAC213] to-[#FF9B37]'>0% fee</div>
            </div>
            <div className='flex item-center py-3 justify-between border-t border-[#ECECEC]'>
              <div className='text-[#111010]'>Without an NFT Profile</div>
              <div className='font-medium line-through'>2.5% fee</div>
            </div>
          </div>
          <Button
            type={ButtonType.PRIMARY}
            size={ButtonSize.LARGE}
            label='Create a Profile'
            onClick={() => {
              props.onClose();
              clear();
              closeCartSidebar();
              router.push('/app/mint-profiles');
            }}
          />
        </div>
      </div>
    </div>;
}
