import { useAllContracts } from 'hooks/contracts/useAllContracts';
import { BalanceData } from 'types';
import { getAddress } from 'utils/httpHooks';

import useSWR from 'swr';
import { useNetwork } from 'wagmi';

export function useDaiBalance(currentAddress: string): BalanceData | null {
  const { dai } = useAllContracts();
  const { chain } = useNetwork();
  const { data } = useSWR(
    `${currentAddress}_${getAddress('dai', chain?.id)}_${chain?.id}_nft_balanceOf`,
    async () => {
      const balance = await dai.balanceOf(currentAddress);
      const decimals = await dai.decimals();
      return {
        balance: balance,
        decimals: decimals,
      };
    }
  );
  return data ?? null;
}
