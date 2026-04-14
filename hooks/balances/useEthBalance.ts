import { BalanceData } from 'types';

import { BigNumber } from 'ethers';
import useSWR from 'swr';
import { useNetwork, useProvider } from 'wagmi';

export function useEthBalance(
  currentAddress: string
): {balance: BalanceData; mutate: () => void} {
  const { chain } = useNetwork();
  const provider = useProvider({ chainId: chain?.id });
  const { data, mutate } = useSWR(
    `${chain?.id}_eth_balance_${currentAddress}`,
    async () => {
      const balance = await provider?.getBalance(currentAddress);
      return {
        balance: balance,
        decimals: 18,
      };
    });
  return {
    balance: data ?? {
      balance: BigNumber.from(0),
      decimals: 18
    },
    mutate: mutate,
  };
}
