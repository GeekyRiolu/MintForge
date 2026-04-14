import { RoundedCornerMedia, RoundedCornerVariant } from 'components/elements/RoundedCornerMedia';
import { Nft, TxActivity } from 'graphql/generated/types';
import { useEthPriceUSD } from 'hooks/useEthPriceUSD';
import {
  convertValue,
} from 'utils/format';

import VolumeIcon from 'public/icons/volumeIcon.svg?svgr';
import { PartialDeep } from 'type-fest';

export type DetailedNft = Nft & { hidden?: boolean };

export interface CollectionLeaderBoardCardProps {
  contract?: string
  title?: string;
  countOfElements?: number | string;
  contractAddress?: string;
  contractName?: string;
  description?: string;
  stats?: any;
  logoUrl?: any;
  timePeriod?: string;
  index?: number;
  userName?: string;
  userAvatar?: string;
  isVerified?: boolean;
  isLeaderBoard?: boolean;
  redirectTo?: string;
  maxSymbolsInString?: number;
  contractAddr?: string;
  listings?: PartialDeep<TxActivity>[]
  nft?: PartialDeep<DetailedNft>;
  tokenId?: string;
  images?: Array<string | null>,
}

export function CollectionLeaderBoardCard(props: CollectionLeaderBoardCardProps) {
  const ethPriceUSD = useEthPriceUSD();

  const checkDataByPeriod = () => {
    switch (props.timePeriod) {
    case 'all':
      return {
        volume: props.stats.total_volume,
        sales: props.stats.total_sales,
        supply: props.stats.total_supply,
        average_price: '',
        change: '',
        minted: props.stats.total_minted,
        floor_price: props.stats.floor_price
      };
    case '24h':
      return {
        volume: props.stats.one_day_volume,
        change: props.stats.one_day_change,
        sales: props.stats.one_day_sales,
        average_price: props.stats.one_day_average_price,
        minted: props.stats.total_minted,
        floor_price: props.stats.floor_price
      };
    case '7d':
      return {
        volume: props.stats.seven_day_volume,
        change: props.stats.seven_day_change,
        sales: props.stats.seven_day_sales,
        average_price: props.stats.seven_day_average_price,
        minted: props.stats.total_minted,
        floor_price: props.stats.floor_price

      };
    case '30d':
      return {
        volume: props.stats.thirty_day_volume,
        change: props.stats.thirty_day_change,
        sales: props.stats.thirty_day_sales,
        average_price: props.stats.thirty_day_average_price,
        minted: props.stats.total_minted,
        floor_price: props.stats.floor_price
      };
    }
  };
  const checkMinPrice = (price) => {
    if(!price){
      return '';
    }
    if(price < 0.01){
      return '< 0.1 ETH';
    }else {
      return `${ethFormatting(price)} ETH`;
      // return `${price.toFixed(3).replaceAll('.', ',')} ETH`;
    }
  };

  const checkSalesValue = (value) => {
    if(!value) return;
    const stringValue = value.toString().split('');
    const valueLength = stringValue.length;
    if(value > 1e9){
      return '> 1B';
    }
    if(valueLength >= 5 && valueLength < 6) {
      const string = convertValue(value,2,5);
      return `${string.start},${string.end}`;
    }
    if(valueLength >= 6) {
      if(valueLength >= 6 && valueLength < 7){
        const string = convertValue(value,3,5);
        return `${string.start}.${string.end}k`;
      }
      if(valueLength >= 7 && valueLength < 8){
        const string = convertValue(value,1,3);
        return `${string.start}.${string.end}M`;
      }

      if(valueLength >= 8 && valueLength < 9){
        const string = convertValue(value,2,4);
        return `${string.start}.${string.end}M`;
      }
      if(valueLength >= 9 && valueLength < 10){
        const string = convertValue(value,3,5);
        return `${string.start}.${string.end}M`;
      }
    }
    return value;
  };
  const convertCurrency = (value) => {
    if(!value) return;
    const convertedValue = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', currencyDisplay: 'narrowSymbol' }).format(ethPriceUSD * Number(value));
    if(Number(convertedValue.slice(1)) < 1){
      return `$${convertedValue.slice(2)}`;
    }
    return convertedValue;
  };
  const ethFormatting = (value) => {
    if(!value) return;
    const convertedValue = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', currencyDisplay: 'narrowSymbol' }).format(value);
    return convertedValue.slice(1);
  };
  const statsData = checkDataByPeriod();
  return (
    <>
      <a href={props.redirectTo} className="minlg:hidden flex flex-col rounded-[16px] shadow-lg overflow-hidden p-3 mb-3">
        <div className='text-2xl text-[#000000] font-[500] flex items-center flex-row justify-center mb-3'>
          #{props.index + 1}
          <div className="w-14 ml-2 rounded-[16px] overflow-hidden">
            <RoundedCornerMedia
              variant={RoundedCornerVariant.None}
              width={80}
              height={80}
              sizes='80px'
              containerClasses='w-[100%] object-cover h-[100%]'
              src={props?.logoUrl}
              extraClasses="hover:scale-105 transition"
            />
          </div>
        </div>
        <div className='flex flex-row justify-center text-[#000000] text-xl px-2 font-bold mb-3'>
          <span className='text-center'>{props.title}</span>
        </div>
        <div className='flex flex-row items-start justify-between flex-wrap mb-3'>
          <div className='minmd:w-[auto] mb-3 minmd:mb-0 w-[33.33%] flex flex-col justify-between'>
            <span className='text-[#B2B2B2] leading-6 font-[600]'>VOLUME</span>
            <div className="flex flex-row items-center">
              <div className="pr-3">
                <VolumeIcon/>
              </div>
              <div>
                <div className="text-lg text-[#000000] font-[600] -mb-1">{statsData?.volume?.toFixed(2).replaceAll('.', ',')}</div>
                <div className="text-base leading-[18px] text-[#747474] font-[400]">{checkMinPrice(statsData?.volume)}</div>
              </div>
            </div>
          </div>
          <div className='minmd:w-[auto] mb-3 minmd:mb-0 w-[33.33%] flex flex-col items-center justify-between'>
            <span className='text-[#B2B2B2] leading-6 font-[600]'>% CHANGE</span>
            <div className={`${Math.sign(statsData?.change) === -1 ? 'text-[#ff5454]' : 'text-[#26AA73]' } text-lg font-[500]`}>
              {statsData?.change ? `${(statsData?.change * 10)?.toFixed(2)}%` : null}
            </div>
          </div>
          <div className='minmd:w-[auto] mb-3 minmd:mb-0 w-[33.33%] flex flex-col items-end justify-between'>
            <span className='text-[#B2B2B2] leading-6 font-[600]'>FLOOR PRICE</span>
            <div className="flex flex-row items-center">
              <div className="pr-3">
                {statsData?.floor_price && <VolumeIcon/>}
              </div>
              <div>
                <div className="text-lg text-[#000000] font-[600] -mb-1">{checkMinPrice(statsData?.floor_price)}</div>
                <div className="text-base leading-[18px] text-[#747474] font-[400]">
                  {
                    statsData?.floor_price ? convertCurrency(statsData?.floor_price) : ''
                  }
                </div>
              </div>
            </div>
          </div>
          <div className='minmd:w-[auto] w-[50%] flex flex-col justify-between'>
            <div className='text-[#B2B2B2] leading-6 font-[600]'>ITEMS</div>
            <div className="text-[#B2B2B2] text-lg font-[500]">{statsData?.minted}</div>
          </div>
          <div className='minmd:w-[auto] w-[50%] flex flex-col items-end justify-between'>
            <div className='text-[#B2B2B2] leading-6 font-[600]'>SALES</div>
            <div className="text-[#000000] text-lg font-[500]">{checkSalesValue(statsData?.sales)}</div>
          </div>
        </div>
      </a>
      <a href={props.redirectTo} className="hidden minlg:flex px-6 font-noi-grotesk  w-full justify-start items-center hover:scale-[1.01] transition-all cursor-pointer rounded-[16px] h-[6.25rem] shadow-lg overflow-hidden">
        <div className="flex justify-start items-center w-[35%]">
          <div className="flex justify-start items-center">
            <div className="mr-4">
              #{props.index + 1}
            </div>
            <div className="w-20  rounded-[16px] overflow-hidden">
              <RoundedCornerMedia
                variant={RoundedCornerVariant.None}
                width={80}
                height={80}
                sizes="80px"
                containerClasses='w-[100%] object-cover h-[100%]'
                src={props?.logoUrl}
                extraClasses="hover:scale-105 transition"
              />
            </div>
          </div>
          <div className="pl-6 flex flex-row items-start justify-start">
            <span className="pr-5 text-lg text-[#000000] font-[500]">{props.title}</span>
            {/*<VerifiedIcon/>*/}
            {/*<span className="pr-[20px] text-xl leading-7 text-[#000000] font-[600] max-w-[60%]">{collectionName}</span>*/}
          </div>
        </div>
        <div className="flex flex-row items-center justify-center w-[15%] pl-1">
          <div className="pr-3">
            <VolumeIcon/>
          </div>
          <div>
            <div className="text-lg text-[#000000] font-[600] -mb-1">{checkMinPrice(statsData?.volume)}</div>
            <div>

            </div>
            <div className="text-base leading-[18px] text-[#747474] font-[400]">{convertCurrency(statsData?.volume)}</div>
          </div>
        </div>
        <div className={`${Math.sign(statsData?.change) === -1 ? 'text-[#ff5454]' : 'text-[#26AA73]' } text-lg font-[500] items-center text-center justify-center w-[15%]  pl-1`}>
          {statsData?.change ? `${(statsData?.change * 10)?.toFixed(2)}%` : null}
        </div>
        <div className="flex flex-row items-center justify-center  w-[15%]  pl-1">
          <div className="pr-3">
            {statsData?.floor_price && <VolumeIcon/>}
          </div>
          <div>
            <div className="text-lg text-[#000000] font-[600] -mb-1">{checkMinPrice(statsData?.floor_price)}</div>
            <div className="text-base leading-[18px] text-[#747474] font-[400]">
              {
                statsData?.floor_price ? convertCurrency(statsData?.floor_price) : ''
              }

            </div>
          </div>
        </div>
        <div className="text-[#B2B2B2] text-lg font-[500] flex items-center justify-center  w-[10%] pl-1">{statsData?.minted}</div>
        <div className="text-[#000000] text-lg font-[500] flex items-center justify-center w-[10%] pl-1">{checkSalesValue(statsData?.sales)}</div>
      </a>
    </>
  );
}
