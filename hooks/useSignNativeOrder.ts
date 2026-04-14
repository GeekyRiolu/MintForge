import { useDefaultChainId } from 'hooks/useDefaultChainId';
import { getAddress } from 'utils/httpHooks';
import { getMarketAskSignatureData, UnsignedOrder } from 'utils/nativeMarketplaceHelpers';

import { splitSignature } from 'ethers/lib/utils';
import { useCallback } from 'react';
import { useNetwork, useSignTypedData } from 'wagmi';

export function useSignNativeOrder() {
  const { chain } = useNetwork();
  const { signTypedDataAsync } = useSignTypedData();
  const defaultChainId = useDefaultChainId();

  const signOrder = useCallback(async (
    unsignedOrder: UnsignedOrder
  ) => {
    const { domain, types, value } = getMarketAskSignatureData(
      defaultChainId,
      getAddress('marketplace', defaultChainId),
      unsignedOrder
    );
    const signature = await signTypedDataAsync({
      domain: {
        ...domain,
        chainId: chain?.id,
      },
      types: types,
      value
    }).then(splitSignature);
    
    return signature;
  }, [defaultChainId, signTypedDataAsync, chain?.id]);

  return signOrder;
}