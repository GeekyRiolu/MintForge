import { useAllContracts } from 'hooks/contracts/useAllContracts';
import { BalanceData } from 'types';

import useSWR from 'swr';
import { useNetwork } from 'wagmi';

export function useDaiAllowance(
  currentAddress: string,
  spender: string | null | undefined
): {allowance: BalanceData | null; mutate: () => void} {
  const { dai } = useAllContracts();
  const { chain } = useNetwork();
  const { data, mutate } = useSWR(`${chain?.id}_Dai_allowance_${currentAddress}`, async () => {
    if (spender == null) {
      return null;
    }
    const balance = await dai.allowance(currentAddress, spender);
    const decimals = await dai.decimals();
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
