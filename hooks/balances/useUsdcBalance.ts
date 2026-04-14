import { useAllContracts } from 'hooks/contracts/useAllContracts';
import { getAddress } from 'utils/httpHooks';

import useSWR from 'swr';
import { BalanceData } from 'types';
import { useNetwork } from 'wagmi';

export function useUsdcBalance(currentAddress: string): BalanceData | null {
  const { usdc } = useAllContracts();
  const { chain } = useNetwork();
  const { data } = useSWR(
    `${currentAddress}_${getAddress('usdc', chain?.id)}_${chain?.id}_nft_balanceOf`,
    async () => {
      const balance = await usdc.balanceOf(currentAddress);
      const decimals = await usdc.decimals();
      return {
        balance: balance,
        decimals: decimals,
      };
    }
  );
  return data ?? null;
}
