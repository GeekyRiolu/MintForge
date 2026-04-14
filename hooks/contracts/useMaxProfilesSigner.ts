import { useAllContracts } from 'hooks/contracts/useAllContracts';
import { isNullOrEmpty } from 'utils/format';

import { Signer } from 'ethers';
import { useAccount, useSigner } from 'wagmi';
export declare type FetchSignerResult = Signer | null;

export async function useMaxProfilesSigner() {
  const { address: currentAddress, connector } = useAccount();
  const { maxProfiles } = useAllContracts();
  const { data: signer } = useSigner();
  // extra check to make TS happy.
  if (isNullOrEmpty(currentAddress) || currentAddress == null || connector == null || signer == null) {
    console.log('failed to connect signer to MaxProfiles contract');
    return maxProfiles;
  }

  return maxProfiles.connect(signer);
}
