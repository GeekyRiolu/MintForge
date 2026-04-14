import { ActivityType } from 'graphql/generated/types';
import { useDefaultChainId } from 'hooks/useDefaultChainId';
import { getNftMetadata } from 'utils/alchemyNFT';
import { isNullOrEmpty } from 'utils/format';
import { tw } from 'utils/tw';

import moment from 'moment';
import useSWR from 'swr';

type NotificationButtonProps = {
  buttonText: string;
  onClick: () => void;
  date: string;
  nft: {
    nftId: string;
    collection: string;
    price: number;
    currency: string;
    type: ActivityType;
  }
}

export const NotificationItem = ({ buttonText, onClick, date, nft }: NotificationButtonProps) => {
  const defaultChainId = useDefaultChainId();
  const { data: nftMetadata } = useSWR('NFTMetadata' + nft?.collection + nft?.nftId, async () => {
    if(isNullOrEmpty(nft?.collection) || isNullOrEmpty(nft?.nftId)) {
      return null;
    }
    return await getNftMetadata(nft?.collection, nft?.nftId, defaultChainId);
  });

  return (
    <div className='flex flex-row w-full font-noi-grotesk border-t border-[#EFEFEF]'>
      <button className={tw(
        'w-full h-full flex flex-col',
        'text-md text-black text-left',
        'leading-6',
        'bg-white font-semibold',
        'py-4'
      )}
      onClick={onClick}
      >
        {isNullOrEmpty(nft?.nftId) ?
          <p className='w-full'>{buttonText}</p> :
          nft?.type === ActivityType.Purchase ?
            <p className='w-full truncate'>You purchased {nftMetadata?.title} for {nft?.price} {nft?.currency}</p>
            :
            <p className='w-full truncate'>You sold {nftMetadata?.title} for {nft?.price} {nft?.currency}</p>
        }
        {!isNullOrEmpty(date) && <p className='text-[#6F6F6F] text-[10px] uppercase -mt-1'>{moment(date).fromNow()}</p>}
      </button>
    </div>
  );
};
