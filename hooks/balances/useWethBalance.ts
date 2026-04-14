import { GraphQLContext } from 'graphql/client/GraphQLProvider';
import { useAllContracts } from 'hooks/contracts/useAllContracts';
import { BalanceData } from 'types';
import { getAddress } from 'utils/httpHooks';

import { useContext } from 'react';
import useSWR from 'swr';
import { useNetwork } from 'wagmi';

export function useWethBalance(currentAddress: string): BalanceData | null {
  const { weth } = useAllContracts();
  const { chain } = useNetwork();
  const { signed } = useContext(GraphQLContext);
  const { data } = useSWR(
    `${currentAddress}_${getAddress('weth', chain?.id)}_${chain?.id}_nft_balanceOf${signed}`,
    async () => {
      const balance = await weth.balanceOf(currentAddress);
      const decimals = await weth.decimals();
      return {
        balance: balance,
        decimals: decimals,
      };
    }
  );
  return data ?? null;
}
