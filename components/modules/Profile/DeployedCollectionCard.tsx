import { RoundedCornerAmount, RoundedCornerMedia, RoundedCornerVariant } from 'components/elements/RoundedCornerMedia';
import { Collection } from 'graphql/generated/types';
import { AlchemyNFTMetaDataResponse } from 'types/alchemy';
import { getNftsForCollection } from 'utils/alchemyNFT';
import { filterNulls } from 'utils/format';
import { tw } from 'utils/tw';

import { useRouter } from 'next/router';
import useSWR from 'swr';
import { PartialDeep } from 'type-fest';

export interface DeployedCollectionCardProps {
  collection: PartialDeep<Collection>;
}

export function DeployedCollectionCard(props: DeployedCollectionCardProps) {
  const router = useRouter();

  const { data } = useSWR('DeployedCollectionCard' + props.collection?.contract, async () => {
    const response = await getNftsForCollection(props.collection.contract, 3);
    return response?.['nfts'] as PartialDeep<AlchemyNFTMetaDataResponse>[];
  });

  return (
    <div
      className={tw(
        'rounded-[10px] flex flex-col',
        'w-full min-h-[inherit]',
        'cursor-pointer transform hover:scale-105',
        'overflow-hidden border-[#D5D5D5] border p-4',
      )}
      onClick={() => {
        router.push(`/app/collection/${props.collection?.contract}`);
      }}
    >
      <div className='flex justify-center w-full min-h-XL min-h-2XL'>
        {filterNulls(data ?? [])
          .map((nft: PartialDeep<AlchemyNFTMetaDataResponse>) => nft?.metadata?.image)
          .slice(0,3).map((image: string, index: number) => {
            const variants = [
              RoundedCornerVariant.Left,
              RoundedCornerVariant.None,
              RoundedCornerVariant.Right
            ];
            return <RoundedCornerMedia
              key={image + index}
              src={image}
              variant={variants[index]}
              amount={RoundedCornerAmount.Medium}
              containerClasses='w-1/3'
            />;
          })}
      </div>
      <div className="flex flex-col mt-3">
        <span className='text-secondary-txt text-sm font-noi-grotesk'>Collection</span>
        <span className={tw(
          'text-base font-semibold truncate font-noi-grotesk',
          'text-primary-txt'
        )}>
          {props.collection?.name ?? 'Unknown Name'}
        </span>
      </div>
    </div>
  );
}
