import { ProfileTokenResults, useNftProfileTokens } from './useNftProfileTokens';

import { useAccount } from 'wagmi';

export function useMyNftProfileTokens(): ProfileTokenResults {
  const { address: currentAddress } = useAccount();
  
  const result = useNftProfileTokens(currentAddress);

  return result;
}
