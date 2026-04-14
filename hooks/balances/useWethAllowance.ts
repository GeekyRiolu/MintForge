import { useAllContracts } from 'hooks/contracts/useAllContracts';
import { BalanceData } from 'types';

import useSWR from 'swr';
import { useNetwork } from 'wagmi';

export function useWethAllowance(
  currentAddress: string,
  spender: string | null | undefined
): {allowance: BalanceData | null; mutate: () => void} {
  const { weth } = useAllContracts();
  const { chain } = useNetwork();
  const { data, mutate } = useSWR(`${chain?.id}_weth_allowance_${currentAddress}_${spender}`, async () => {
    if (spender == null) {
      return null;
    }
    const balance = await weth.allowance(currentAddress, spender);
    const decimals = await weth.decimals();
    return {
      balance: balance,
      decimals: decimals,
    };
  });
  return {
    allowance: data ?? null,
    mutate: mutate,
  };
}
