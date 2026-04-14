import { StagedListing } from 'components/modules/Checkout/NFTListingsContext';
import { StagedPurchase } from 'components/modules/Checkout/NFTPurchaseContext';
import { useAllContracts } from 'hooks/contracts/useAllContracts';
import { ExternalProtocol } from 'types';

import { useCallback } from 'react';
import useSWR, { mutate } from 'swr';

export interface NftComRoyaltyData {
  data: number[];
  loading: boolean;
  mutate: () => void;
}

export function useNftComRoyalties(listNFT: StagedListing[] | StagedPurchase[], purchase = false): NftComRoyaltyData {
  const { marketplace } = useAllContracts();
  const keyString = 'NFTCOMRoyaltyFee' + JSON.stringify(listNFT.map(i => i?.nft?.contract + i?.nft?.tokenId));

  const mutateThis = useCallback(() => {
    mutate(keyString);
  }, [keyString]);

  const { data } = useSWR(
    keyString,
    async () => {
      return await Promise.all((listNFT).map(async (stagedNFT) => {
        if (purchase) {
          if (stagedNFT?.protocol === ExternalProtocol.NFTCOM) {
            return Number((await marketplace.royaltyInfo(stagedNFT.nft?.contract))?.[1]);
          } else {
            return 0;
          }
        } else {
          const targetProtocols = await stagedNFT.targets.map((target) => target.protocol);
          if (targetProtocols.includes(ExternalProtocol.NFTCOM)) {
            return Number((await marketplace.royaltyInfo(stagedNFT.nft?.contract))?.[1]);
          } else {
            return 0;
          }
        }
      },
      {
        refreshInterval: 0,
        revalidateOnFocus: false,
      }));
    }
  );

  return {
    data: data,
    loading: data == null,
    mutate: mutateThis,
  };
}
