import { useAllContracts } from './contracts/useAllContracts';

import { BigNumber } from 'ethers';
import { useState } from 'react';
import useSWR from 'swr';

export interface GenesisKeyPublicSaleData {
  publicAuctionStartSeconds: BigNumber,
  publicAuctionDurationSeconds: BigNumber,
  currentPrice: BigNumber,
  loading: boolean
}

export function useGenesisKeyPublicSaleData(): GenesisKeyPublicSaleData {
  const [loading, setLoading] = useState(false);
  const { genesisKey } = useAllContracts();

  const keyString = 'GenesisKeyPublicSaleData';

  const { data } = useSWR(
    keyString,
    async () => {
      setLoading(true);
      const [
        publicAuctionStartSeconds,
        publicAuctionDurationSeconds,
        currentPrice
      ] = await Promise.all([
        genesisKey.publicSaleStartSecond().catch(() => Promise.resolve(BigNumber.from(0))),
        genesisKey.publicSaleDurationSeconds().catch(() => Promise.resolve(BigNumber.from(0))),
        genesisKey
          .getCurrentPrice()
          .catch(() => Promise.resolve(BigNumber.from(0)))
      ]);
  
      setLoading(false);
      return {
        publicAuctionStartSeconds,
        publicAuctionDurationSeconds,
        currentPrice
      };
    }
  );

  return {
    ...(data ?? {
      publicAuctionStartSeconds: BigNumber.from(0),
      publicAuctionDurationSeconds: BigNumber.from(0),
      currentPrice: BigNumber.from(0)
    }),
    loading
  };
}