import { Doppler, getEnv } from 'utils/env';

import { Contract } from 'ethers/lib/ethers';
import useSWR from 'swr';
import { useNetwork, useProvider } from 'wagmi';

export function useERC20Symbol(contractAddress: string): string | null {
  const { chain } = useNetwork();
  const chainId = chain?.id ?? getEnv(Doppler.NEXT_PUBLIC_CHAIN_ID);
  const provider = useProvider({ chainId: Number(chainId) });

  const { data } = useSWR(
    `${contractAddress}_${chain?.id}_symbol`,
    async () => {
      if (!contractAddress) return null;

      if (contractAddress == '0x0000000000000000000000000000000000000000') {
        return 'ETH';
      }

      const contract = new Contract(
        contractAddress,
        [
          'function symbol() view returns (string)',
        ],
        provider,
      );

      return await contract.symbol();
    }
  );
  return data ?? null;
}