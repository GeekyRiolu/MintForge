import { useAllContracts } from 'hooks/contracts/useAllContracts';
import { isNullOrEmpty } from 'utils/format';

import { Signer } from 'ethers';
import { useAccount, useSigner } from 'wagmi';
export declare type FetchSignerResult = Signer | null;

export function useProfileAuctionSigner() {
  const { address: currentAddress, connector } = useAccount();
  const { profileAuction } = useAllContracts();
  const { data: signer } = useSigner();
  // extra check to make TS happy.
  if (isNullOrEmpty(currentAddress) || currentAddress == null || connector == null || signer == null) {
    console.log('failed to connect signer to Profile Auction contract');
    return profileAuction;
  }

  return profileAuction.connect(signer);
}
