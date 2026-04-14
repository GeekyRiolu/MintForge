import { generateMakerOrderTypedData, MakerOrder } from '@looksrare/sdk';
import { useCallback } from 'react';
import { useAccount, useNetwork, useSignTypedData } from 'wagmi';

export function useSignLooksrareOrder() {
  const { address: currentAddress } = useAccount();
  const { chain } = useNetwork();
  const { signTypedDataAsync } = useSignTypedData();

  const signOrder = useCallback(async (
    order: MakerOrder
  ) => {
    const { domain, value, type } = generateMakerOrderTypedData(currentAddress, chain?.id, order);
    const signature = await signTypedDataAsync({
      domain: {
        ...domain,
        chainId: chain?.id,
      } as { chainId: number; name?: string; version?: string; verifyingContract?: `0x${string}`; salt?: `0x${string}`; },
      types: type as { EIP712Domain: { name: string; type: string }[]; Order: { name: string; type: string }[]; },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      value: value as any
    });
    return signature;
  }, [currentAddress, chain?.id, signTypedDataAsync]);
  return signOrder;
}