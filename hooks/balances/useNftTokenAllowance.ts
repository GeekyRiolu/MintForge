import { useAllContracts } from 'hooks/contracts/useAllContracts';

import useSWR from 'swr';
import { BalanceData } from 'types';
import { useNetwork } from 'wagmi';

export function useNftTokenAllowance(
  currentAddress: string,
  spender: string | null | undefined
): {allowance: BalanceData | null; mutate: () => void} {
  const { nftToken } = useAllContracts();
  const { chain } = useNetwork();
  const { data, mutate } = useSWR(`${chain?.id}_nft_allowance_${currentAddress}`, async () => {
    if (spender == null) {
      return null;
    }
    const balance = await nftToken.allowance(currentAddress, spender);
    const decimals = await nftToken.decimals();
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
