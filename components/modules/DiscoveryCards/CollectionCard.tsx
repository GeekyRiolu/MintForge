import LikeCount from 'components/elements/LikeCount';
import { RoundedCornerMedia, RoundedCornerVariant } from 'components/elements/RoundedCornerMedia';
import { LikeableType, Nft, TxActivity } from 'graphql/generated/types';
import { useNftQuery } from 'graphql/hooks/useNFTQuery';
import { useDefaultChainId } from 'hooks/useDefaultChainId';
import { isNullOrEmpty } from 'utils/format';
import {
  getGenesisKeyThumbnail,
  sameAddress,
} from 'utils/helpers';
import { getAddress } from 'utils/httpHooks';

import VerifiedIcon from 'public/icons/verifiedIcon.svg?svgr';
import VolumeIcon from 'public/icons/volumeIcon.svg?svgr';
import { PartialDeep } from 'type-fest';

export type DetailedNft = Nft & { hidden?: boolean };

export interface LikeInfo {
  isLikedBy: boolean;
  likeCount: number
}
export interface CollectionCardProps {
  contractName: string;
  redirectTo: string;
  floorPrice: string | number;
  contractAddr: string;
  likeInfo: LikeInfo
  totalVolume?: number;
  listings?: PartialDeep<TxActivity>[]
  nft?: PartialDeep<DetailedNft>;
  tokenId?: string;
  images?: Array<string | null>,
  isOfficial?: boolean;
  collectionId?: string;
}

export function CollectionCard(props: CollectionCardProps) {
  const defaultChainId = useDefaultChainId();

  const { data: nft } = useNftQuery(props.contractAddr, (props?.listings || props?.nft) ? null : props.tokenId);

  const processedImageURLs = sameAddress(props.contractAddr, getAddress('genesisKey', defaultChainId)) && !isNullOrEmpty(props.tokenId) ?
    [getGenesisKeyThumbnail(props.tokenId)]
    : props?.images?.length > 0 ? props?.images : [nft?.metadata?.imageURL];

  const checkMinPrice = (price) => {
    if(!price){
      return '';
    }
    if(price < 0.01){
      return '< 0.1 ETH';
    }else {
      return `${ethFormatting(price)} ETH`;
    }
  };
  const ethFormatting = (value) => {
    if(!value) return;
    const convertedValue = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', currencyDisplay: 'narrowSymbol' }).format(value);
    return convertedValue.slice(1);
  };
  return (
    <a href={props.redirectTo} className="sm:mb-4 min-h-[100%] block transition-all cursor-pointer rounded-[16px] shadow-lg overflow-hidden bg-white min-w-[18.8rem]">
      <div className="h-44 relative ">
        <div className='absolute top-4 right-4 z-50'>
          <LikeCount
            count={props?.likeInfo?.likeCount}
            isLiked={props?.likeInfo?.isLikedBy}
            likeData={{
              id: props?.collectionId,
              type: LikeableType.Collection
            }}
          />
        </div>

        <RoundedCornerMedia
          variant={RoundedCornerVariant.None}
          width={600}
          height={600}
          sizes="(max-width: 768px) 300px, 500px"
          containerClasses='w-[100%] object-cover h-[100%]'
          src={processedImageURLs[0]}
          extraClasses="hover:scale-105 transition"
        />
      </div>
      <div className="pt-4 pr-[20px] pb-5 pl-[30px] min-h-51rem bg-white min-h-[143px]">
        <div className="border-b border-[#F2F2F2] pb-[11px] mb-[16px]">
          <div className="flex justify-between items-start">
            <span className="pr-[20px] text-xl leading-7 text-black font-semibold">
              {props?.contractName}
              {props.isOfficial && <VerifiedIcon className='inline ml-3'/>}
            </span>
          </div>
        </div>
        <div onClick={(event) => event.preventDefault()} className="flex flex-row leading-[23.2px] text-hero-gray font-[400 w-full]">
          {
            props.floorPrice && props.floorPrice !== 0
              ? (
                <div className='flex flex-col min-w-[45%] '>
                  <span className='flex items-center justify-start text-xl text-black font-medium mr-12 w-full'>
                    <VolumeIcon className='mr-2'/>
                    {checkMinPrice(props.floorPrice)}
                  </span>
                  <span>Floor Price</span>
                </div>
              )
              : null
          }
          {
            props.totalVolume && props.totalVolume !== 0
              ? (
                <div className='flex flex-col '>
                  <span className='text-xl text-black font-medium'>{checkMinPrice(props.totalVolume)}</span>
                  <span>Total Volume</span>
                </div>
              )
              : null
          }
        </div>
      </div>
    </a>
  );
}
