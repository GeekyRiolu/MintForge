import { EIP_712_ORDER_TYPE, SeaportOrderComponents, SeaportOrderParameters } from 'types';
import { getTypedDataDomain } from 'utils/seaportHelpers';

import { SignTypedDataArgs } from '@wagmi/core';
import { useCallback } from 'react';
import { useNetwork, useSigner, useSignTypedData } from 'wagmi';

export function useSignSeaportOrder() {
  const { chain } = useNetwork();
  const { signTypedDataAsync } = useSignTypedData();
  const signer = useSigner();
  
  const signOrder = useCallback(async (
    orderParameters: SeaportOrderParameters,
    counter: string,
  ) => {
    if (!signer) {
      console.log('No Signer connected');
      return '';
    }
    const data: SignTypedDataArgs = {
      domain: getTypedDataDomain(chain?.id ?? 1),
      types: EIP_712_ORDER_TYPE,
      value: {
        ...orderParameters,
        counter
      } as SeaportOrderComponents,
    };

    const signature: string = await signTypedDataAsync(data)
      .catch(() => {
        // user rejected signature request
        return null;
      });
    if (signature == null) {
      return '';
    }
    return signature;
  }, [chain?.id, signTypedDataAsync, signer]);

  return signOrder;
}