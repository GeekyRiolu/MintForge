import { genesisKey, getAddressForChain } from 'constants/contracts';
import { Nft } from 'graphql/generated/types';
import { useAllContracts } from 'hooks/contracts/useAllContracts';
import { useDefaultChainId } from 'hooks/useDefaultChainId';
import { tw } from 'utils/tw';

import { NftDetailCard } from './NftDetailCard';

import useSWR from 'swr';
import { PartialDeep } from 'type-fest';

export interface PropertiesProps {
  nft: PartialDeep<Nft>
}

export const Properties = (props: PropertiesProps) => {
  const nftTraits = props?.nft?.metadata?.traits;
  const defaultChainId = useDefaultChainId();
  const { profileAuction } = useAllContracts();
  const isGkCollection = props?.nft?.contract === getAddressForChain(genesisKey, defaultChainId);

  const { data: claimableProfileCount } = useSWR('ContractMetadata' + props?.nft?.tokenId + isGkCollection, async () => {
    return await profileAuction.genesisKeyClaimNumber(Number(props?.nft?.tokenId));
  });

  return (
    <div className="flex flex-col w-full h-fit justify-between" id="NftPropertiesContainer">
      {
        !nftTraits || nftTraits.length === 0 ?
          <div className='text-secondary-txt'>
              No Properties Found
          </div> :
          <div className={tw(
            'traits-gap grid grid-cols-2 gap-3 rounded-[18px]',
            'grid-cols-2 minlg:grid-cols-3',
          )}>
            {
              isGkCollection &&
                <NftDetailCard
                  type='Remaining Mints'
                  value={`${4 - Number(claimableProfileCount) || 0}`}
                  copy={false}
                  highlighted
                />
            }
            {nftTraits?.map((item, index) => {
              return <NftDetailCard
                key={index}
                type={item?.type}
                value={item.value}
                copy
              />;
            })}
          </div>
      }
    </div>
  );
};
