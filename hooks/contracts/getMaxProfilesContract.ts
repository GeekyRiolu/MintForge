import { MaxProfiles } from 'constants/typechain';
import { MaxProfiles__factory } from 'constants/typechain/factories/MaxProfiles__factory';

import { Provider } from '@ethersproject/providers';

export function getMaxProfilesContract(address: string, provider: Provider): MaxProfiles {
  return MaxProfiles__factory.connect(address, provider);
}
