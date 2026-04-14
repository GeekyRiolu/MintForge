
import { isNullOrEmpty } from 'utils/format';

import { useAccount } from 'wagmi';

export function useSignedIn(): boolean {
  const { address: currentAddress } = useAccount();

  return !isNullOrEmpty(currentAddress);
}
