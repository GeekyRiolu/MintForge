import { get721Contract } from 'hooks/contracts/get721Contract';
import { isNullOrEmpty } from 'utils/format';

import { TransferProxyTarget } from './useNftCollectionAllowance';

import { useCallback } from 'react';
import { useAccount, useProvider } from 'wagmi';

export function useFetchNftCollectionAllowance(
): {
  fetchAllowance: (address: string, target: TransferProxyTarget) => Promise<boolean>
} {
  const provider = useProvider();
  const { address: currentAddress } = useAccount();

  const fetchAllowance = useCallback(async (collectionAddress: string, target: TransferProxyTarget) => {
    if (isNullOrEmpty(collectionAddress)) {
      console.log('Failed to set approvals, please connect wallet');
      return;
    }
    const collection = get721Contract(collectionAddress, provider);
    try {
      const allowed = await collection.isApprovedForAll(currentAddress, target).catch(() => false);
      return allowed ?? false;
    } catch (e) {
      console.log(
        'Failed to call isApprovedForAll on NFT collection contract. ',
        collectionAddress,
        e
      );
      return false;
    }
  }, [provider, currentAddress]);

  return {
    fetchAllowance
  };
}
