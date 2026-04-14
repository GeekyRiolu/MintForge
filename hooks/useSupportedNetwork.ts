import { CHAIN_ID_TO_NETWORK, CHAIN_ID_TO_NETWORK_TYPE } from 'constants/misc';
import { Doppler, getEnv } from 'utils/env';

import { useNetwork } from 'wagmi';

export interface SupportedNetworkResponse {
  isSupported: boolean,
  supportedNetworks: string[]
}

export function useSupportedNetwork(): SupportedNetworkResponse {
  const { chain } = useNetwork();

  const supportedNetworks: string[] = getEnv(Doppler.NEXT_PUBLIC_SUPPORTED_NETWORKS)?.split('::');
  const key = chain?.id as number;
  // TODO: support non-ethereum networks
  return {
    isSupported: CHAIN_ID_TO_NETWORK[key as keyof CHAIN_ID_TO_NETWORK_TYPE ?? 1] ?
      supportedNetworks?.includes(`ethereum:${chain?.id}:${CHAIN_ID_TO_NETWORK[key as keyof CHAIN_ID_TO_NETWORK_TYPE ?? 1].toLowerCase()}`) ?? false :
      false,
    supportedNetworks
  };
}