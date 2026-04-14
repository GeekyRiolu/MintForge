import { StagedListing } from 'components/modules/Checkout/NFTListingsContext';
import { ExternalProtocol } from 'types';

import { useCallback } from 'react';
import useSWR, { mutate } from 'swr';

export interface X2Y2RoyaltyData {
  data: number[];
  loading: boolean;
  mutate: () => void;
}

export function useX2Y2Royalties(toList: StagedListing[]): X2Y2RoyaltyData {
  const keyString = 'x2y2Fees' + JSON.stringify(toList.map(i => i?.nft?.contract + i?.nft?.tokenId));

  const mutateThis = useCallback(() => {
    mutate(keyString);
  }, [keyString]);

  const { data } = useSWR(
    keyString,
    async () => {
      return await Promise.all((toList).map(async (stagedListing) => {
        const targetProtocols = await stagedListing.targets.map((target) => target.protocol);
        if (targetProtocols.includes(ExternalProtocol.X2Y2)) {
          const x2y2 = 'https://api.thegraph.com/subgraphs/name/messari/x2y2-ethereum';
          const query = `{\n  collections(where: { id: "${stagedListing.nft?.contract?.toLowerCase()}" }) {\n    id\n    royaltyFee\n  }\n}`;
          // post request using fetch
          const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query })
          };
          
          const responseX2Y2 = await fetch(x2y2, requestOptions);
          const dataX2Y2 = await responseX2Y2.json();

          return dataX2Y2?.data?.collections[0]?.royaltyFee ?? 0;
        } else {
          return 0;
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
