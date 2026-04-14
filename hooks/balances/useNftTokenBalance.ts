import { useAllContracts } from 'hooks/contracts/useAllContracts';
import { BalanceData } from 'types';
import { getAddress } from 'utils/httpHooks';

import useSWR from 'swr';
import { useNetwork } from 'wagmi';

export function useNftTokenBalance(currentAddress: string): BalanceData | null {
  const { nftToken } = useAllContracts();
  const { chain } = useNetwork();
  const { data } = useSWR(
    `${currentAddress}_${getAddress('nft', chain?.id)}_${chain?.id}_nft_balanceOf`,
    async () => {
      const balance = await nftToken.balanceOf(currentAddress);
      const decimals = await nftToken.decimals();
      return {
        balance: balance,
        decimals: decimals,
      };
    }
  );
  return data ?? null;
}
