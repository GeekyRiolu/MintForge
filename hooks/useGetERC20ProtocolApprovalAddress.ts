import { transferProxy } from 'constants/contracts';
import { CROSS_CHAIN_SEAPORT_ADDRESS, ExternalProtocol, X2Y2_EXCHANGE_CONTRACT } from 'types';

import { Addresses, addressesByNetwork } from '@looksrare/sdk';
import { useCallback } from 'react';
import { useNetwork } from 'wagmi';

/**
   * returns the protocol exchange contract address for ERC20 approvals
   */
export function useGetERC20ProtocolApprovalAddress() {
  const { chain } = useNetwork();
  const looksrareAddresses: Addresses = addressesByNetwork[chain?.id];

  const getERC20ProtocolApprovalAddress = useCallback(
    (protocol: ExternalProtocol) => {
      switch(protocol){
      case ExternalProtocol.Seaport:
        return CROSS_CHAIN_SEAPORT_ADDRESS;
      case ExternalProtocol.NFTCOM:
        return transferProxy.mainnet;
      case ExternalProtocol.LooksRare:
        return looksrareAddresses?.EXCHANGE;
      case ExternalProtocol.X2Y2:
        return X2Y2_EXCHANGE_CONTRACT;
      default:
        return null;
      }
    },
    [looksrareAddresses?.EXCHANGE]
  );

  return getERC20ProtocolApprovalAddress;
}
